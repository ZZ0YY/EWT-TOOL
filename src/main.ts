/**
 * EWT 试卷助手 — 油猴脚本入口
 *
 * 功能：
 *   1. 页面加载后，在右侧浮出侧边栏按钮
 *   2. 自动检测当前页面 URL：
 *      - 如果在 student-task-overview?homeworkId=xxx 页面，只刷该作业的试卷
 *      - 否则刷所有作业
 *   3. 试卷列表本地缓存（TTL 5 分钟），提升重复访问速度
 *   4. 用户选择试卷 → 调后端拿答案 → 在浏览器中填卷、交卷、自批
 */
import { getToken } from "./utils/token";
import {
  getUserInfo,
  getHomeworkList,
  scanSingleHomework,
  scanIndependentPapers,
  PAPERS_CACHE,
} from "./services/paperScanner";
import {
  fetchAnswersFromBackend,
  fillPaperInBrowser,
} from "./services/paperFiller";
import {
  createPanel,
  renderPaperList,
  showProgress,
  hideProgress,
} from "./components/SidePanel";

import type { Paper, Homework } from "./types";

// ── State ───────────────────────────────────────────────────────

interface HomeworkGroup {
  homeworkId: number;
  title: string;
  papers: Paper[];
  isActive?: boolean;
}

let panel: ReturnType<typeof createPanel>;

// ── Boot ────────────────────────────────────────────────────────

(function () {
  const token = getToken();
  if (!token) {
    console.log("[EWT Paper Helper] No token found, skipping");
    return;
  }

  panel = createPanel({
    onRefresh: loadPapers,
    onBrushPaper: brushPaper,
  });

  // Check if user has read about page
  const accepted = GM_getValue("eph_about_accepted", "");
  if (accepted !== "1") {
    panel.show();
    panel.showAbout();
  } else {
    panel.show();
  }
})();

// ── URL 解析 ────────────────────────────────────────────────────

/**
 * 从当前 URL 提取 homeworkId（如果处于 task-overview 页面）
 */
function getCurrentHomeworkId(): number | null {
  const m = location.href.match(/homeworkId[=:](\d+)/);
  return m ? Number(m[1]) : null;
}

function getHomeworkTitleFromUrl(): string | null {
  // Try to extract a meaningful title from the page
  const el = document.querySelector(".homework-title, .task-title, h1, h2");
  if (el?.textContent?.trim()) return el.textContent.trim();
  return null;
}

// ── Load papers ─────────────────────────────────────────────────

async function loadPapers(): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("未登录");

  const user = await getUserInfo();
  const schoolId = user.schoolId;
  const currentHid = getCurrentHomeworkId();

  let groups: HomeworkGroup[] = [];
  let totalPapers = 0;

  if (currentHid) {
    // 只刷当前作业
    panel.statusBar.textContent = `正在扫描当前作业...`;
    const papers = await scanSingleHomework(schoolId, currentHid);
    groups = [{
      homeworkId: currentHid,
      title: getHomeworkTitleFromUrl() || `作业 #${currentHid}`,
      papers,
      isActive: true,
    }];
    totalPapers = papers.length;
  } else {
    // 刷全部（原有逻辑）
    panel.statusBar.textContent = `正在获取 ${user.realName} 的作业...`;
    const homeworks = await getHomeworkList(schoolId);
    if (homeworks.length === 0) {
      panel.statusBar.textContent = "没有找到作业";
      renderPaperList(panel.listContainer, [], () => {});
      return;
    }

    panel.statusBar.textContent = `扫描 ${homeworks.length} 个作业中的独立试卷...`;
    for (const hw of homeworks) {
      const papers = await scanIndependentPapers(schoolId, hw);
      if (papers.length) {
        groups.push({ homeworkId: hw.homeworkId, title: hw.title, papers });
        totalPapers += papers.length;
      }
    }
  }

  renderPaperList(panel.listContainer, groups, (paper) => {
    brushPaper(paper.paperId, paper.homeworkId, paper.title).catch((e) => {
      panel.statusBar.textContent = `❌ ${e.message?.slice(0, 40) ?? "刷卷失败"}`;
    });
  });

  const suffix = currentHid ? "（当前作业）" : "";
  panel.statusBar.textContent = `📄 共 ${totalPapers} 张独立试卷${suffix}`;
}

// ── Brush paper ─────────────────────────────────────────────────

async function brushPaper(
  paperId: string,
  homeworkId: number,
  title: string,
): Promise<void> {
  showProgress(panel.progress, `正在刷: ${title}`, "调后端获取答案...");
  panel.statusBar.textContent = `⏳ ${title}...`;

  try {
    const resp = await fetchAnswersFromBackend(paperId, homeworkId);
    if (!resp.success || !resp.data) {
      throw new Error(resp.msg || "获取答案失败");
    }

    const answers = resp.data;
    const count = Object.keys(answers).length;
    panel.statusBar.textContent = `📥 已获取 ${count} 道题答案，开始填写...`;

    await fillPaperInBrowser(paperId, homeworkId, answers, (msg) => {
      showProgress(panel.progress, `正在刷: ${title}`, msg);
    });

    showProgress(panel.progress, `✅ 完成`, `《${title}》已满分提交`);
    panel.statusBar.textContent = `✅ ${title} 完成`;

    setTimeout(() => hideProgress(panel.progress), 3000);
  } catch (e: any) {
    showProgress(panel.progress, `❌ 失败`, e.message ?? "未知错误");
    panel.statusBar.textContent = `❌ ${title} 失败`;
    setTimeout(() => hideProgress(panel.progress), 5000);
    throw e;
  }
}
