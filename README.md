# Submit-testing

这是一个用于展示送检测试记录的静态页面。

## 使用方式

- 把每条测试记录写成 `.md` 文件，放到 [`testing/`](./testing) 目录下。
- 每次新增、删除或移动 Markdown 后，运行 `python3 scripts/make.py` 生成 [`testing/index.json`](./testing/index.json)。
- 首页 [`index.html`](./index.html) 会读取这个清单，并按清单里的相对路径加载内容。
- 页面会按文件名排序显示记录列表，点击某条记录即可查看正文。
- 页面样式在 [`assets/styles.css`](./assets/styles.css)，交互逻辑在 [`assets/app.js`](./assets/app.js)。

## Markdown 示例

你可以按下面这种格式写：

```md
# 标题1

## 标题2

**加粗文字**

- 项目名
- 测试人
- 结果
- 备注
```

只要文件后缀是 `.md`，并且重新生成了清单，页面就会自动识别。
