    const TESTING_DIR = "testing";
    const MANIFEST_URL = `./${TESTING_DIR}/index.json`;

    const state = {
      records: [],
      filtered: [],
      activePath: null,
      query: "",
    };

    const recordList = document.getElementById("recordList");
    const recordTitle = document.getElementById("recordTitle");
    const recordMeta = document.getElementById("recordMeta");
    const recordContent = document.getElementById("recordContent");
    const globalStatus = document.getElementById("globalStatus");
    const recordSearch = document.getElementById("recordSearch");

    function setGlobalStatus(html) {
      globalStatus.innerHTML = html;
    }

    function formatDate(value) {
      if (!value) return "未知时间";
      try {
        return new Intl.DateTimeFormat("zh-CN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(value));
      } catch {
        return value;
      }
    }

    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    function sortRecords(a, b) {
      return a.path.localeCompare(b.path, "zh-Hans-CN");
    }

    async function loadManifest() {
      const response = await fetch(MANIFEST_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`无法读取清单文件：HTTP ${response.status}`);
      }

      return response.json();
    }

    function applyFilter() {
      const query = state.query.trim().toLowerCase();
      if (!query) {
        state.filtered = [...state.records];
      } else {
        state.filtered = state.records.filter((item) => {
          return [item.name, item.path].some((value) => value.toLowerCase().includes(query));
        });
      }
      renderList();
    }

    function renderList() {
      if (!state.filtered.length) {
        recordList.innerHTML = '<li class="empty">没有找到符合条件的记录。</li>';
        return;
      }

      recordList.replaceChildren(...state.filtered.map((item) => {
        const li = document.createElement("li");
        li.className = `record-item${item.path === state.activePath ? " active" : ""}`;
        li.dataset.path = item.path;

        const marker = document.createElement("span");
        marker.className = "record-marker";

        const copy = document.createElement("div");
        copy.className = "record-copy";

        const name = document.createElement("span");
        name.className = "record-name";
        name.textContent = item.name;

        const meta = document.createElement("span");
        meta.className = "record-meta";
        meta.textContent = `${item.path} · ${formatDate(item.updatedAt)}`;

        copy.append(name, meta);
        li.append(marker, copy);
        li.addEventListener("click", () => loadRecord(item));
        return li;
      }));
    }

    function setActiveRecord(item) {
      state.activePath = item.path;
      renderList();
      recordTitle.textContent = item.name;
      recordMeta.textContent = `${item.path} · 最后更新 ${formatDate(item.updatedAt)}`;
    }

    function renderMarkdown(markdown) {
      const raw = marked.parse(markdown, { breaks: true });
      recordContent.innerHTML = DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true },
      });
    }

    async function loadRecord(item) {
      setActiveRecord(item);
      recordContent.innerHTML = '<div class="empty">正在加载内容...</div>';

      try {
        const response = await fetch(item.path, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const markdown = await response.text();
        renderMarkdown(markdown);
      } catch (error) {
        recordContent.innerHTML = `
          <div class="error">
            无法加载该 Markdown 文件。<br />
            ${escapeHtml(String(error.message || error))}
          </div>
        `;
      }
    }

    async function loadRecords() {
      try {
        const manifest = await loadManifest();
        state.records = (manifest.records || []).sort(sortRecords);
        state.filtered = [...state.records];

        if (!state.records.length) {
          setGlobalStatus("未找到 Markdown 记录");
          renderList();
          return;
        }

        setGlobalStatus(`已加载 ${state.records.length} 条记录`);
        renderList();
        await loadRecord(state.records[0]);
      } catch (error) {
        setGlobalStatus("加载失败");
        recordList.innerHTML = `
          <li class="error">无法读取 <code>testing/index.json</code>。<br />${escapeHtml(String(error.message || error))}</li>
        `;
        recordContent.innerHTML = `
          <div class="error">
            目录读取失败。<br />
            请先生成 <code>testing/index.json</code>，然后再刷新页面。
          </div>
        `;
      }
    }

    recordSearch.addEventListener("input", () => {
      state.query = recordSearch.value;
      applyFilter();
    });

    loadRecords();
