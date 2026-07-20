/**
 * 试卷填写服务
 * 调后端拿答案 → 在浏览器里用用户自己的 token 填答卷
 */
import type { AnswerResponse, Question, AnswerPayload } from "../types";

const BASE = "https://gateway.ewt360.com";

// ── 调后端拿答案 ──────────────────────────────────────────────

const API_BASE = "https://look.540601.xyz"; // 改成你的公网地址

/** 调 answer-backend 获取标准答案 */
export async function fetchAnswersFromBackend(
  paperId: string,
  homeworkId: number,
): Promise<AnswerResponse> {
  const ewtToken = getTokenFromCookie();
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: `${API_BASE}/api/get-answers`,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        paper_id: paperId,
        homework_id: homeworkId,
        ewt_token: ewtToken,
      }),
      responseType: "json",
      onload(res) {
        if (res.status >= 200 && res.status < 300) {
          resolve(res.response as AnswerResponse);
        } else {
          reject(new Error(`HTTP ${res.status}`));
        }
      },
      onerror(err) {
        reject(new Error(String(err)));
      },
    });
  });
}

// ── 在浏览器里执行刷卷流程 ────────────────────────────────────

/** 在浏览器里完整执行：init → 填答案 → 交卷 → 自批 */
export async function fillPaperInBrowser(
  paperId: string,
  homeworkId: number,
  answers: Record<string, Question>,
  onProgress?: (msg: string) => void,
): Promise<void> {
  const log = (msg: string) => {
    console.log(`[paper ${paperId}] ${msg}`);
    onProgress?.(msg);
  };

  // 1. Init report
  log("初始化答卷...");
  const reportId = await initReport(paperId, homeworkId);
  log(`reportId=${reportId}`);

  // 2. Submit answers
  log("填入答案...");
  await submitAnswers(paperId, reportId, homeworkId, answers);
  log("答案已提交");

  // 3. Submit paper
  log("交卷...");
  await submitPaper(paperId, reportId, homeworkId);

  // 4. Corrected
  log("自批...");
  await submitCorrected(paperId, reportId);

  log("✅ 完成！");
}


/** 初始化答卷 → reportId */
async function initReport(paperId: string, homeworkId: number): Promise<string> {
  const url = `${BASE}/api/answerprod/web/answer/report?paperId=${paperId}&platform=1&extId=${homeworkId}&bizCode=205&reportId=0&isRepeat=0&homeworkId=${homeworkId}`;
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      headers: {
        accept: "application/json, text/plain, */*",
        token: getTokenFromCookie() ?? "",
        origin: "https://web.ewt360.com",
        referer: "https://web.ewt360.com/",
        "ewt-requestsource": "web",
        "ewt-contentstyle": "CamelCase",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
      },
      responseType: "json",
      onload(res) {
        const body = res.response as any;
        if (!body?.success) {
          const msg = body?.msg ?? "";
          if (msg.includes("已做过") || msg.includes("已答")) {
            // retry with isRepeat=1
            const url2 = `${BASE}/api/answerprod/web/answer/report?paperId=${paperId}&platform=1&extId=${homeworkId}&bizCode=205&reportId=0&isRepeat=1&homeworkId=${homeworkId}`;
            GM_xmlhttpRequest({
              method: "GET", url: url2, headers: res.request?.headers ?? {},
              responseType: "json",
              onload(r2) {
                const d2 = (r2.response as any)?.data;
                resolve(String(d2?.reportId ?? d2?.report ?? d2?.id ?? ""));
              },
              onerror: () => reject(new Error("init repeat failed")),
            });
          } else {
            reject(new Error(msg || "init failed"));
          }
        } else {
          const d = body.data;
          resolve(String(d?.reportId ?? d?.report ?? d?.id ?? ""));
        }
      },
      onerror: () => reject(new Error("network error")),
    });
  });
}

/** 提交答案（选择题+非选择题分流，严格匹配 Python 版逻辑） */
async function submitAnswers(
  paperId: string,
  reportId: string,
  homeworkId: number,
  questions: Record<string, Question>,
): Promise<void> {
  const sel: AnswerPayload[] = [];
  const notSel: AnswerPayload[] = [];

  for (const [qid, q] of Object.entries(questions)) {
    const item: AnswerPayload = {
      questionId: qid,
      questionNo: q.questionNo,
      totalSeconds: 50,
      cateId: q.cate,
    };
    if (q.options?.length > 0) {
      // 选择题：直接抄答案
      item.answers = q.rightAnswer ?? [];
      sel.push(item);
    } else {
      // 非选择题：假答案 + 自批漏洞
      item.answers = [1];
      item.attachmentImages = [];
      item.score = q.score ?? 0;
      item.revision = true;
      notSel.push(item);
    }
  }

  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json; charset=UTF-8",
    token: getTokenFromCookie() ?? "",
    origin: "https://web.ewt360.com",
    referer: "https://web.ewt360.com/",
    "ewt-requestsource": "web",
    "ewt-contentstyle": "CamelCase",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  };

  const postUrl = `${BASE}/api/answerprod/web/answer/submitanswer`;

  if (sel.length) {
    console.log("[submitAnswers] 提交选择题:", sel.length, "道");
    await gmPost(postUrl, headers, {
      answers: sel, assignPoints: true, bizCode: "205",
      paperId, platform: "1", reportId, homeworkId,
    });
  }
  if (notSel.length) {
    console.log("[submitAnswers] 提交非选择题:", notSel.length, "道");
    await gmPost(postUrl, headers, {
      answers: notSel, assignPoints: true, bizCode: 205,
      paperId, platform: "1", reportId, homeworkId,
    });
  }
}

/** 交卷 */
async function submitPaper(paperId: string, reportId: string, homeworkId: number): Promise<void> {
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json; charset=UTF-8",
    token: getTokenFromCookie() ?? "",
    origin: "https://web.ewt360.com",
    referer: "https://web.ewt360.com/",
    "ewt-requestsource": "web",
    "ewt-contentstyle": "CamelCase",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  };
  await gmPost(`${BASE}/api/answerprod/web/answer/submitpaper`, headers, {
    paperId, platform: "1", reportId,
    totalSeconds: 60 + Math.random() * 120,
    bizCode: "205", homeworkId,
  });
}

/** 自批 */
async function submitCorrected(paperId: string, reportId: string): Promise<void> {
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json; charset=UTF-8",
    token: getTokenFromCookie() ?? "",
    origin: "https://web.ewt360.com",
    referer: "https://web.ewt360.com/",
    "ewt-requestsource": "web",
    "ewt-contentstyle": "CamelCase",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  };
  await gmPost(`${BASE}/api/answerprod/web/answer/submitCorrected`, headers, {
    reportId, paperId, platform: "1", bizCode: 205, paperPackageId: null,
  });
}

// ── Helpers ────────────────────────────────────────────────────

function getTokenFromCookie(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function gmPost(url: string, headers: Record<string, any>, data: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url,
      headers,
      data: JSON.stringify(data),
      responseType: "json",
      onload(res) {
        const body = res.response as any;
        if (body?.success === false) {
          reject(new Error(body.msg || "failed"));
        } else {
          resolve();
        }
      },
      onerror: () => reject(new Error("network error")),
    });
  });
}
