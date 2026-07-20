/**
 * 侧边栏 UI 组件 — 萌系主题 ✨
 * 固定悬浮按钮 + 可滑动面板
 */

export interface UICallbacks {
  onRefresh: () => Promise<void>;
  onBrushPaper: (paperId: string, homeworkId: number, title: string) => Promise<void>;
}

const STYLE_ID = "ewt-paper-helper-style";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
/* ── 固定悬浮按钮 ── */
#eph-toggle {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 999999;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Microsoft YaHei", sans-serif;
}
#eph-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(167, 139, 250, 0.55);
}
#eph-toggle:active {
  transform: scale(0.95);
}

/* ── 萌系面板 ── */
#eph-panel {
  position: fixed;
  right: -400px;
  top: 0;
  width: 380px;
  height: 100vh;
  z-index: 999998;
  background: linear-gradient(180deg, #fef9ff 0%, #fff5f7 100%);
  box-shadow: -6px 0 30px rgba(167, 139, 250, 0.15);
  transition: right 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  font-size: 14px;
  color: #4a4a6a;
}
#eph-panel.open { right: 0; }

/* ── Views container (main / about) ── */
.eph-view {
  display: none;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.eph-view.active {
  display: flex;
}

/* ── Header ── */
#eph-panel .eph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, #f9a8d4 0%, #a78bfa 50%, #818cf8 100%);
  color: #fff;
  border-radius: 0 0 20px 20px;
  position: relative;
}
#eph-panel .eph-header::after {
  content: "🌸";
  position: absolute;
  right: 56px;
  top: 12px;
  font-size: 16px;
  opacity: 0.6;
}
#eph-panel .eph-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
#eph-panel .eph-close {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
#eph-panel .eph-close:hover {
  background: rgba(255,255,255,0.35);
  transform: rotate(90deg);
}

/* ── Toolbar ── */
#eph-panel .eph-toolbar {
  padding: 12px 16px 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}
#eph-panel .eph-toolbar button {
  padding: 7px 18px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  background: linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%);
  color: #fff;
  transition: all 0.25s;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.25);
}
#eph-panel .eph-toolbar button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(167, 139, 250, 0.4);
}
#eph-panel .eph-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ── Status bar ── */
#eph-panel .eph-status {
  padding: 8px 20px;
  font-size: 12px;
  color: #b8a9c9;
  min-height: 20px;
  border-bottom: 1px solid #f3e8ff;
}

/* ── List ── */
#eph-panel .eph-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 12px;
  scrollbar-width: thin;
  scrollbar-color: #e8dff5 #fef9ff;
}
#eph-panel .eph-list::-webkit-scrollbar { width: 4px; }
#eph-panel .eph-list::-webkit-scrollbar-track { background: #fef9ff; }
#eph-panel .eph-list::-webkit-scrollbar-thumb { background: #e8dff5; border-radius: 4px; }

/* ── Homework accordion ── */
.eph-hw-item {
  margin: 0 10px 6px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(167, 139, 250, 0.08);
  overflow: hidden;
  border: 1px solid #f3edff;
}
.eph-hw-item:first-child { margin-top: 8px; }

.eph-hw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  gap: 8px;
}
.eph-hw-header:hover { background: #fbf7ff; }
.eph-hw-header .eph-hw-title {
  flex: 1;
  font-weight: 600;
  font-size: 13px;
  color: #4a4a6a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eph-hw-header .eph-hw-count {
  font-size: 11px;
  background: #f3edff;
  color: #a78bfa;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.eph-hw-header .eph-arrow {
  font-size: 10px;
  color: #c4b5d9;
  transition: transform 0.25s;
}
.eph-hw-header.open .eph-arrow { transform: rotate(90deg); }

.eph-paper-list {
  display: none;
  padding: 0 10px 10px;
}
.eph-paper-list.open { display: block; }

/* ── Paper item ── */
.eph-paper-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  margin-bottom: 4px;
  border-radius: 12px;
  background: #faf8ff;
  transition: all 0.2s;
  gap: 8px;
}
.eph-paper-item:last-child { margin-bottom: 0; }
.eph-paper-item:hover {
  background: #f4efff;
  transform: translateX(2px);
}
.eph-paper-item .eph-paper-info {
  flex: 1;
  min-width: 0;
}
.eph-paper-item .eph-paper-title {
  font-size: 13px;
  font-weight: 500;
  color: #4a4a6a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.eph-paper-item .eph-paper-meta {
  font-size: 11px;
  color: #b8a9c9;
  margin-top: 2px;
}
.eph-paper-item .eph-brush-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #86efac 0%, #6ee7b7 100%);
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(110, 231, 183, 0.3);
}
.eph-paper-item .eph-brush-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(110, 231, 183, 0.45);
}
.eph-paper-item .eph-brush-btn:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
.eph-paper-item .eph-brush-btn.brushing {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.35);
  animation: pulse 1.2s ease-in-out infinite;
}
.eph-paper-item .eph-brush-btn.done {
  background: linear-gradient(135deg, #86efac 0%, #6ee7b7 100%);
  cursor: default;
  box-shadow: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.96); }
}

/* ── Empty state ── */
.eph-empty {
  padding: 50px 20px;
  text-align: center;
  color: #c4b5d9;
  font-size: 14px;
  line-height: 2;
}
.eph-empty::before {
  content: "📝";
  display: block;
  font-size: 32px;
  margin-bottom: 8px;
}

/* ── Progress toast ── */
#eph-progress {
  position: fixed;
  bottom: 24px;
  right: 400px;
  z-index: 999999;
  background: #fff;
  border-radius: 16px;
  padding: 14px 20px;
  box-shadow: 0 8px 32px rgba(167, 139, 250, 0.18);
  max-width: 280px;
  font-size: 13px;
  color: #4a4a6a;
  display: none;
  font-family: "Microsoft YaHei", sans-serif;
  border: 1px solid #f3edff;
}
#eph-progress.show { display: block; }
#eph-progress .eph-prog-title {
  font-weight: 700;
  margin-bottom: 4px;
  color: #7c3aed;
}
#eph-progress .eph-prog-msg {
  color: #a78bfa;
  font-size: 12px;
}

/* ── About view ── */
.eph-about {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  text-align: center;
  scrollbar-width: thin;
  scrollbar-color: #e8dff5 #fef9ff;
}
.eph-about::-webkit-scrollbar { width: 4px; }
.eph-about::-webkit-scrollbar-track { background: #fef9ff; }
.eph-about::-webkit-scrollbar-thumb { background: #e8dff5; border-radius: 4px; }

.eph-about .eph-about-avatar {
  font-size: 48px;
  margin-bottom: 8px;
}
.eph-about .eph-about-name {
  font-size: 18px;
  font-weight: 700;
  color: #4a4a6a;
  margin-bottom: 4px;
}
.eph-about .eph-about-desc {
  font-size: 13px;
  color: #b8a9c9;
  margin-bottom: 20px;
  line-height: 1.6;
}

.eph-about .eph-about-section {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #f3edff;
  text-align: left;
}
.eph-about .eph-about-section h3 {
  margin: 0 0 10px;
  font-size: 13px;
  color: #a78bfa;
  font-weight: 700;
}
.eph-about .eph-about-section a {
  color: #818cf8;
  text-decoration: none;
  font-weight: 600;
}
.eph-about .eph-about-section a:hover {
  text-decoration: underline;
}
.eph-about .eph-about-link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f8f4ff;
  font-size: 13px;
}
.eph-about .eph-about-link-item:last-child {
  border-bottom: none;
}
.eph-about .eph-about-badge {
  display: inline-block;
  font-size: 11px;
  background: #fef3c7;
  color: #d97706;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 600;
  margin-bottom: 10px;
}
.eph-about .eph-about-rate-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}
.eph-about .eph-about-rate-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  flex-shrink: 0;
}

.eph-about .eph-about-accept-btn {
  margin-top: 8px;
  padding: 10px 40px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  background: linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%);
  color: #fff;
  font-weight: 700;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(167, 139, 250, 0.3);
  letter-spacing: 1px;
}
.eph-about .eph-about-accept-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.45);
}

/* ── Bottom tab bar ── */
.eph-tabs {
  display: flex;
  border-top: 1px solid #f3edff;
  background: #fff;
  border-radius: 0 0 0 0;
}
.eph-tabs button {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 12px;
  color: #b8a9c9;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.eph-tabs button:hover {
  color: #a78bfa;
  background: #faf8ff;
}
.eph-tabs button.active {
  color: #a78bfa;
  border-top: 2px solid #a78bfa;
}
`;
  document.head.appendChild(style);
}

export function createPanel(cbs: UICallbacks) {
  injectStyles();

  // ── Toggle button ──
  const toggle = document.createElement("button");
  toggle.id = "eph-toggle";
  toggle.textContent = "📋";

  // ── Panel ──
  const panel = document.createElement("div");
  panel.id = "eph-panel";

  // ── Header (shared) ──
  const header = document.createElement("div");
  header.className = "eph-header";
  header.innerHTML = `<h2>升学e网通刷课</h2>`;
  const closeBtn = document.createElement("button");
  closeBtn.className = "eph-close";
  closeBtn.textContent = "✕";
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // ═══════════════ Main view ═══════════════
  const mainView = document.createElement("div");
  mainView.className = "eph-view";
  mainView.id = "eph-view-main";

  // Toolbar
  const toolbar = document.createElement("div");
  toolbar.className = "eph-toolbar";
  const refreshBtn = document.createElement("button");
  refreshBtn.textContent = "🔄 刷新列表";
  toolbar.appendChild(refreshBtn);
  mainView.appendChild(toolbar);

  // Status bar
  const statusBar = document.createElement("div");
  statusBar.className = "eph-status";
  statusBar.textContent = "点击「刷新列表」获取独立试卷";
  mainView.appendChild(statusBar);

  // List container
  const listContainer = document.createElement("div");
  listContainer.className = "eph-list";
  mainView.appendChild(listContainer);

  panel.appendChild(mainView);

  // ═══════════════ About view ═══════════════
  const aboutView = document.createElement("div");
  aboutView.className = "eph-view";
  aboutView.id = "eph-view-about";

  const aboutContent = document.createElement("div");
  aboutContent.className = "eph-about";
  aboutContent.innerHTML = `
    <div class="eph-about-avatar">🌸</div>
    <div class="eph-about-name">升学e网通刷课助手</div>
    <div class="eph-about-desc">支持一键获取E网通试卷答案并自动填写提交<br/>刷课功能避免滥用，需使用TG机器人<br/>全部免费 🆓</div>

    <div class="eph-about-section">
      <h3>📢 使用须知</h3>
      <div class="eph-about-badge">每日限制</div>
      <div class="eph-about-rate-item"><span class="dot"></span> 每个 IP 每天最多刷 <strong>20</strong> 张试卷</div>
      <div class="eph-about-rate-item"><span class="dot"></span> 提交后自动批改，满分完成</div>
      <div class="eph-about-rate-item"><span class="dot"></span> 仅支持独立试卷，不支持课程任务</div>
      <div class="eph-about-rate-item"><span class="dot"></span> 使用本工具即代表同意合理使用</div>
    </div>

    <div class="eph-about-section">
      <h3>🔗 相关链接</h3>
      <div class="eph-about-link-item">
        <span>📦 源码仓库</span>
        <a href="https://github.com/ZZ0YY/EWT-TOOL" target="_blank">GitHub</a>
      </div>
      <div class="eph-about-link-item">
        <span>💬 TG 机器人</span>
        <a href="https://t.me/ewtkillbot" target="_blank">EWT刷课机器人</a>
      </div>
      <div class="eph-about-link-item">
        <span>📥 Greasy Fork</span>
        <a href="#" target="_blank">安装页面</a>
      </div>
    </div>

    <button class="eph-about-accept-btn">我知道了 ✨</button>
  `;
  aboutView.appendChild(aboutContent);
  panel.appendChild(aboutView);

  // ═══════════════ Bottom tabs ═══════════════
  const tabs = document.createElement("div");
  tabs.className = "eph-tabs";
  const tabMain = document.createElement("button");
  tabMain.textContent = "📋 试卷列表";
  tabMain.className = "active";
  const tabAbout = document.createElement("button");
  tabAbout.textContent = "ℹ️ 关于";
  tabs.appendChild(tabMain);
  tabs.appendChild(tabAbout);
  panel.appendChild(tabs);

  // ── Progress toast ──
  const progress = document.createElement("div");
  progress.id = "eph-progress";
  progress.innerHTML = `
    <div class="eph-prog-title"></div>
    <div class="eph-prog-msg"></div>
  `;
  document.body.appendChild(progress);

  // ── Tab switching ──
  function showView(viewId: string) {
    document.querySelectorAll(".eph-view").forEach((v) => v.classList.remove("active"));
    document.getElementById(viewId)?.classList.add("active");
    tabMain.classList.toggle("active", viewId === "eph-view-main");
    tabAbout.classList.toggle("active", viewId === "eph-view-about");
  }

  tabMain.onclick = () => showView("eph-view-main");
  tabAbout.onclick = () => showView("eph-view-about");

  // ── "我知道了" button ──
  const acceptBtn = aboutContent.querySelector(".eph-about-accept-btn") as HTMLButtonElement;
  acceptBtn.onclick = () => {
    GM_setValue("eph_about_accepted", "1");
    showView("eph-view-main");
  };

  // ── Events ──
  let isOpen = false;

  toggle.onclick = () => {
    isOpen = !isOpen;
    panel.classList.toggle("open", isOpen);
  };

  closeBtn.onclick = () => {
    isOpen = false;
    panel.classList.remove("open");
  };

  refreshBtn.onclick = async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "⏳ 加载中...";
    statusBar.textContent = "正在获取作业列表...";
    try {
      await cbs.onRefresh();
      statusBar.textContent = "✅ 已更新";
    } catch (e: any) {
      statusBar.textContent = `❌ ${e.message?.slice(0, 40) ?? "加载失败"}`;
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "🔄 刷新列表";
    }
  };

  // ── Append ──
  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  return {
    panel,
    show() {
      isOpen = true;
      panel.classList.add("open");
    },
    hide() {
      isOpen = false;
      panel.classList.remove("open");
    },
    showAbout() {
      showView("eph-view-about");
    },
    showMain() {
      showView("eph-view-main");
    },
    listContainer,
    statusBar,
    progress,
    refreshBtn,
    acceptBtn,
  };
}

// ── Render helpers ────────────────────────────────────────────────

interface PaperItem {
  homeworkId: number;
  homeworkTitle: string;
  paperId: string;
  title: string;
  questionCount: number | string;
  subjectName?: string;
  brushing?: boolean;
  done?: boolean;
}

interface HomeworkGroup {
  homeworkId: number;
  title: string;
  papers: PaperItem[];
}

export function renderPaperList(
  container: HTMLElement,
  groups: HomeworkGroup[],
  onBrush: (paper: PaperItem) => void,
) {
  container.innerHTML = "";

  if (groups.length === 0) {
    container.innerHTML = '<div class="eph-empty">暂无独立试卷<br/>试试点击上方刷新～</div>';
    return;
  }

  for (const group of groups) {
    const item = document.createElement("div");
    item.className = "eph-hw-item";

    const header = document.createElement("div");
    header.className = "eph-hw-header";
    header.innerHTML = `
      <span class="eph-hw-title">${escapeHtml(group.title)}</span>
      <span class="eph-hw-count">${group.papers.length}卷</span>
      <span class="eph-arrow">▶</span>
    `;

    const paperList = document.createElement("div");
    paperList.className = "eph-paper-list";

    for (const paper of group.papers) {
      const pItem = document.createElement("div");
      pItem.className = "eph-paper-item";

      const info = document.createElement("div");
      info.className = "eph-paper-info";
      info.innerHTML = `
        <div class="eph-paper-title">${escapeHtml(paper.title)}</div>
        <div class="eph-paper-meta">${paper.questionCount}题${paper.subjectName ? ` · ${escapeHtml(paper.subjectName)}` : ""}</div>
      `;
      pItem.appendChild(info);

      const btn = document.createElement("button");
      btn.className = "eph-brush-btn";
      btn.textContent = paper.done ? "✅" : paper.brushing ? "⏳" : "刷";
      btn.disabled = !!paper.brushing || !!paper.done;

      btn.onclick = () => {
        if (!paper.brushing && !paper.done) {
          paper.brushing = true;
          btn.className = "eph-brush-btn brushing";
          btn.textContent = "⏳";
          btn.disabled = true;
          onBrush(paper);
        }
      };

      pItem.appendChild(btn);
      paperList.appendChild(pItem);
    }

    header.onclick = () => {
      header.classList.toggle("open");
      paperList.classList.toggle("open");
    };

    item.appendChild(header);
    item.appendChild(paperList);
    container.appendChild(item);
  }
}

export function showProgress(
  el: HTMLElement,
  title: string,
  msg: string,
) {
  el.classList.add("show");
  el.querySelector(".eph-prog-title")!.textContent = title;
  el.querySelector(".eph-prog-msg")!.textContent = msg;
}

export function hideProgress(el: HTMLElement) {
  el.classList.remove("show");
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
