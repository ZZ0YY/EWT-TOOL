# 升学e网通刷课助手

> 支持一键获取E网通试卷答案并自动填写提交，全部免费 🆓
> 
> 上学时间停止运营，寒暑假才可能继续运营，届时非常需要志愿者提供ewt账号让我研究，欢迎使用邮箱联系我：zz0yy0601@gmail.com
> 
> 使用TG Bot支持自动刷视频，快速刷视频[刷课机器人](https://t.me/ewtkillbot)

![userscript](https://img.shields.io/badge/Tampermonkey-油猴脚本-brightgreen)
![version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 📖 介绍

升学e网通刷课助手是一款 Tampermonkey 油猴脚本，在 E网通（ewt360.com）网站侧边栏添加一个浮动面板，帮助您快速扫描并提交独立试卷，自动获取标准答案并填写，实现满分完成。

**核心功能：**
- 📋 自动扫描并列出当前账号下的所有独立试卷
- 🎯 支持在作业详情页只扫描当前作业的试卷
- 🤖 一键获取标准答案并自动填写提交
- ✅ 提交后自动批改，满分完成
- 📦 试卷列表本地缓存，提升加载速度

---

## 📥 安装教程

### 第一步：安装 Tampermonkey 浏览器扩展

**Chrome / Edge / 360浏览器 / 搜狗浏览器等：**

1. 打开 [Tampermonkey 官网](https://www.tampermonkey.net/)
2. 点击「下载」按钮，选择你的浏览器
3. 点击「添加扩展程序」完成安装

> ⚠️ 如果无法访问官网，可以在浏览器的扩展商店搜索 "Tampermonkey" 安装。

安装完成后，浏览器右上角会出现 Tampermonkey 的图标 🧩

### 第二步：安装本脚本

- **方法一（推荐）：** 从 Greasy Fork 安装
  1. 访问直链安装页面：[[下载链接](https://photo1.540601.xyz/file/telegram/油猴脚本/1784515009838_ewt-paper-helper.user.js)]
  这是 Greasy Fork 页面：[[不需要点击](https://greasyfork.org/zh-CN/scripts/587786-%E5%8D%87%E5%AD%A6e%E7%BD%91%E9%80%9A%E5%88%B7%E8%AF%BE%E5%8A%A9%E6%89%8B-%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E6%8F%90%E4%BA%A4%E8%AF%95%E5%8D%B7%E5%B9%B6%E5%85%A8%E5%AF%B9-bot%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%88%B7%E8%AF%BE)]
  3. 点击「安装此脚本」按钮
  4. 在弹出的页面中点击「安装」


- **方法二：** 从 GitHub Release 安装
  1. 进入本仓库的 [Releases 页面](https://github.com/ZZ0YY/EWT-TOOL/releases)
  2. 下载最新的 `ewt-paper-helper.user.js` 文件
  3. 将文件拖拽到浏览器中，Tampermonkey 会自动识别并提示安装

### 第三步：授予权限

安装完成后，脚本会出现在 Tampermonkey 的管理面板中。默认情况下，本脚本需要以下权限：

| 权限 | 用途 |
|------|------|
| `GM_xmlhttpRequest` | 跨域请求 EWT API 和后端接口 |
| `GM_setValue / GM_getValue` | 本地缓存试卷列表和用户设置 |
| `GM_listValues` | 管理缓存数据 |
| `GM_notification` | 刷卷完成时桌面通知 |

这些权限在安装时会自动申请，无需手动配置。如果 Tampermonkey 弹窗询问是否允许跨域请求，请选择「允许」。

---

## 🚀 使用指南

### 基本使用

1. 登录 [web.ewt360.com](https://web.ewt360.com) 或 [teacher.ewt360.com](https://teacher.ewt360.com)
2. 页面右下角会出现一个粉紫色的悬浮按钮 📋
3. 点击按钮展开侧边栏面板

### 首次使用

第一次打开面板时，会显示「关于」页面，包含使用须知和每日限制说明。阅读后点击「我知道了 ✨」按钮开始使用。

### 刷新试卷列表

点击面板顶部的「🔄 刷新列表」按钮：

- **如果在作业详情页**（URL 包含 `homeworkId`）：只扫描当前作业的试卷
- **在其他页面**：扫描所有作业的试卷

刷新完成后，试卷会按照作业分组展示，展开即可看到具体试卷。

### 刷试卷

1. 在试卷列表中，点击目标试卷右侧的绿色「刷」按钮
2. 脚本会自动：
   - 调后端获取标准答案
   - 在浏览器中用您的账号初始化答卷
   - 填入答案（选择题直接填写正确答案，非选择题利用自批漏洞满分）
   - 提交试卷并自批
3. 完成后会显示「✅ 完成」提示

### 查看关于页面

面板底部有标签栏，点击「ℹ️ 关于」可以随时查看使用须知和链接信息。

---

## ⚠️ 注意事项

### 每日限制

为防止滥用，**每个 IP 每天最多刷 20 张试卷**。这是后端限制，无法通过修改脚本绕过。

### 仅支持独立试卷

本脚本仅识别 contentTypeName 包含「试卷」的任务（独立试卷）。课程讲、视频、FM 打卡等任务不支持。

### 刷课程（视频/FM）请使用 TG 机器人

如果需要刷课程视频或 FM 打卡任务，请使用我们的 TG 机器人：
[刷课机器人](https://t.me/ewtkillbot) — 免费提供刷课服务，支持视频、FM、试卷全自动完成。

### 隐私说明

- 您的 EWT token（登录凭证）会传递给后端用于验证身份
- 后端仅使用 token 调用 EWT 官方接口验证有效性，不会存储或用于其他用途
- 所有刷卷操作在您的浏览器中完成，答案获取由后端完成

### 免责声明

本脚本仅供学习交流使用，请勿用于违反学校规定的用途。使用本工具即代表同意合理使用，开发者不对因使用本工具造成的任何后果承担责任。

---

## 🔧 技术架构

```
油猴脚本（浏览器）                   后端（服务器）
     │                                   │
     ├─ 扫描试卷列表 ←── EWT API ────────┤
     │                                   │
     ├─ POST /api/get-answers ──────────→├─ 验证 EWT Token
     │  { paper_id, homework_id,         ├─ 后端拿答案
     │    ewt_token }                    ├─ 返回标准答案
     │  ←───────────────────────────────┤
     │                                   │
     ├─ 前端填卷 → 交卷 → 自批           │
     │  (EWT API，使用用户自己的 token)    │
```

---

## 📦 项目结构

```
answer-userscript/
├── src/
│   ├── main.ts                  # 脚本入口
│   ├── utils/
│   │   ├── token.ts             # 从 cookie 提取 EWT token
│   │   └── ewtApi.ts            # GM_xmlhttpRequest 封装
│   ├── services/
│   │   ├── paperScanner.ts      # EWT API 作业/试卷扫描
│   │   └── paperFiller.ts       # 答案获取 + 前端填卷流程
│   ├── components/
│   │   └── SidePanel.ts         # 萌系 UI 侧边栏
│   └── types/
│       └── index.ts             # 类型定义
├── dist/
│   └── ewt-paper-helper.user.js # 构建产物（安装此文件）
├── vite.config.ts
└── package.json
```

---

## 🛠️ 自行构建

如果您想自行修改并构建脚本：

```bash
git clone https://github.com/ZZ0YY/EWT-TOOL.git
cd EWT-TOOL
npm install
npm run build
```

构建产物在 `dist/ewt-paper-helper.user.js`。

---

## 📄 许可证

[MIT](LICENSE)

---

## 💬 联系方式

- TG 机器人：[TG机器人](https://t.me/ewtkillbot)
- GitHub Issues：[提交反馈](https://github.com/ZZ0YY/EWT-TOOL/issues)
