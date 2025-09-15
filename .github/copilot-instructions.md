# Copilot Instructions for atc Project

## 项目架构概览
- 本项目为测试平台，后端基于 FastAPI，前端为静态页面（HTML/CSS/JS），数据以 XML 文件存储于 `data/` 目录。
- 主要目录结构：
  - `app.py`：FastAPI 主应用，提供 API、静态资源服务、脚本上传与执行、用例/任务/脚本管理等。
  - `static/`：前端静态资源，含主要页面和交互脚本（如 `main.js`）。
  - `data/`：存放 XML 数据（如 `testcase.xml`, `jobs.xml`, `testscript.xml`）和上传的测试脚本（`scripts/` 子目录）。

## 关键开发模式与约定
- **数据流**：所有用例、任务、脚本信息均以 XML 文件为中心，API 通过解析/更新 XML 实现数据持久化。
- **脚本上传与执行**：
  - 上传接口 `/upload_script` 支持多种脚本类型，文件存储于 `data/scripts/`，并自动更新 `testscript.xml`。
  - 执行接口 `/run_test_script` 根据脚本类型自动选择执行命令（如 Python/Node/Java），并更新脚本状态。
- **前后端交互**：前端通过统一的 `fetchAPI` 方法与后端 RESTful API 通信，所有接口均以 `/` 根路径暴露。
- **静态资源**：`/static` 路径下所有资源可直接访问，首页为 `static/index.html`。
- **报告管理**：测试脚本执行报告以 `test_script_report_*.txt` 命名，保存在根目录，通过 `/get_report_files` 和 `/get_report_content` 访问。

## 项目特有约定
- **XML 结构为单一数据源**，无数据库依赖，所有增删改查均直接操作 XML。
- **脚本唯一标识**为 `SCRIPT-` 前缀加 8 位大写十六进制字符串。
- **API 错误处理**：统一抛出 HTTPException，前端捕获后弹窗提示。
- **脚本类型自动推断**，并在 XML 中记录类型、状态、作者、标签等元数据。
- **前端管理页面**（如用例、任务、脚本）均通过 JS 动态渲染，核心逻辑集中在 `static/main.js`。

## 常用开发命令
- 启动后端服务：
  ```cmd
  python app.py
  ```
- 访问前端页面：
  打开浏览器访问 `http://localhost:8000/`。

## 重要文件/目录参考
- `app.py`：后端所有 API 路由、数据流、业务逻辑核心。
- `static/main.js`：前端页面交互、API 调用、数据渲染主入口。
- `data/testcase.xml`、`data/jobs.xml`、`data/testscript.xml`：核心数据文件。
- `data/scripts/`：所有上传的测试脚本存放目录。

## 其他说明
- 本项目无数据库，所有数据均为 XML 文件，注意并发写入风险。
- 若需扩展 API 或前端页面，建议遵循现有 RESTful 风格和数据结构。

---
如需补充说明或有疑问，请在此文档下方添加。