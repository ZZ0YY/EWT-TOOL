import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "升学e网通刷课助手（支持一键提交试卷并全对）",
        namespace: "ewt360-paper-helper",
        version: "1.0.0",
        description: "支持一键获取E网通试卷答案并自动填写提交，刷课功能避免滥用，需使用TG机器人免费提供 全部免费",
        author: "离",
        match: [
          "https://web.ewt360.com/*",
          "https://teacher.ewt360.com/*",
        ],
        "run-at": "document-end",
        grant: ["GM_xmlhttpRequest", "GM_notification", "GM_setValue", "GM_getValue", "GM_listValues"],
      },
      build: {
        fileName: "ewt-paper-helper.user.js",
      },
    }),
  ],
});
