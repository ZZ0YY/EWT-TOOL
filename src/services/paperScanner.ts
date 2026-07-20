/**
 * EWT 作业 & 试卷列表服务
 * 直接调 EWT API 获取数据，带本地缓存（GM_setValue/GM_getValue）
 */
import { get, coursePost } from "../utils/ewtApi";
import type { Homework, Task, Paper } from "../types";

const BASE = "https://gateway.ewt360.com";

// ── 本地缓存（GM_setValue/GM_getValue，TTL 5分钟） ──────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = GM_getValue(`eph_cache_${key}`, "");
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    GM_setValue(`eph_cache_${key}`, JSON.stringify(entry));
  } catch {
    // GM_setValue has size limits, silently ignore overflow
  }
}

/** 刷卷完成后清除缓存，下次刷新时重新拉取 */
export function clearPapersCache(homeworkId?: number): void {
  if (homeworkId) {
    GM_setValue(`eph_cache_papers_${homeworkId}`, "");
  } else {
    const keys = GM_listValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith("eph_cache_papers_")) {
        GM_setValue(keys[i], "");
      }
    }
  }
}

// ── 用户信息 ──────────────────────────────────────────────────

interface UserInfo {
  userId: string;
  schoolId: string;
  realName: string;
}

/** 获取用户ID + 学校ID */
export async function getUserInfo(): Promise<UserInfo> {
  const [uinfo, sinfo] = await Promise.all([
    get<{ userId: string; realName: string }>(
      "https://web.ewt360.com/api/usercenter/user/baseinfo",
    ),
    get<{ schoolId: string }>(
      `${BASE}/api/eteacherproduct/school/getSchoolUserInfo`,
      { headerSet: "course" },
    ),
  ]);
  return {
    userId: uinfo.userId,
    schoolId: String(sinfo.schoolId),
    realName: uinfo.realName,
  };
}

// ── 作业列表 ──────────────────────────────────────────────────

/** 获取当前用户所有作业（去重 + 按 endTime 倒序） */
export async function getHomeworkList(schoolId: string): Promise<Homework[]> {
  const seen = new Set<number>();
  const all: Homework[] = [];

  for (const status of [1, 2, 3]) {
    try {
      const list = await coursePost<Homework[]>(
        `${BASE}/api/homeworkprod/homework/student/getStudentHomeworkInfo`,
        { schoolId: Number(schoolId), subject: null, type: null, status, pageIndex: 1, pageSize: 100, notClassSetting: 0 },
      );
      for (const hw of list) {
        if (!seen.has(hw.homeworkId)) {
          seen.add(hw.homeworkId);
          all.push(hw);
        }
      }
    } catch {
      // 某个状态失败不影响其他
    }
  }

  all.sort((a, b) => (b.endTime ?? a.startTime ?? 0) - (a.endTime ?? a.startTime ?? 0));
  return all;
}

// ── 扫描独立试卷（单个作业 + 全部） ──────────────────────────

/**
 * 只扫描单个作业的独立试卷（带缓存）
 * 用于当前在 task-overview?homeworkId=xxx 页面时
 */
export async function scanSingleHomework(
  schoolId: string,
  homeworkId: number,
): Promise<Paper[]> {
  const cacheKey = `papers_${homeworkId}`;
  const cached = cacheGet<Paper[]>(cacheKey);
  if (cached) return cached;

  const homework: Homework = { homeworkId, title: `作业 #${homeworkId}`, startTime: 0, endTime: 0 };
  const papers = await scanIndependentPapers(schoolId, homework);
  cacheSet(cacheKey, papers);
  return papers;
}

/** 扫描某作业下的所有独立试卷（带缓存 + 天级并发） */
export async function scanIndependentPapers(
  schoolId: string,
  homework: Homework,
): Promise<Paper[]> {
  const hid = homework.homeworkId;

  const cacheKey = `papers_${hid}`;
  const cached = cacheGet<Paper[]>(cacheKey);
  if (cached) return cached;

  const papers: Paper[] = [];

  // 1. 取天数分布
  let days: { day: number; dayId: string[] }[];
  try {
    const dist = await coursePost<{ days: typeof days }>(
      `${BASE}/api/homeworkprod/homework/student/studentHomeworkDistribution`,
      { homeworkIds: [hid], sceneId: 0, taskDistributionTypeEnum: 1, schoolId: Number(schoolId) },
    );
    days = dist?.days ?? [];
  } catch {
    return [];
  }

  // 2. 并发拉取每天的任务列表
  const dayPromises = days.map(async (day) => {
    const dayId = day.dayId[0];
    const dayTs = day.day;
    const dateStr = formatDate(dayTs);

    try {
      const tasks = await coursePost<Task[]>(
        `${BASE}/api/homeworkprod/homework/student/pageHomeworkTasks`,
        { homeworkIds: [hid], sceneId: 0, dayId: [dayId], day: dayTs, pageIndex: 1, pageSize: 1000, schoolId: Number(schoolId) },
      );

      const dayPapers: Paper[] = [];
      for (const t of tasks) {
        const typeName = t.contentTypeName ?? "";
        if (!typeName.includes("试卷")) continue;

        const paperId = extractPaperId(t);
        if (!paperId) continue;

        dayPapers.push({
          homeworkId: hid,
          homeworkTitle: homework.title,
          paperId,
          title: t.title || "未知试卷",
          questionCount: t.questionCount ?? "?",
          ratio: t.ratio,
          date: dateStr,
          subjectName: t.subjectName,
        });
      }
      return dayPapers;
    } catch {
      return [] as Paper[];
    }
  });

  const results = await Promise.all(dayPromises);
  for (const r of results) papers.push(...r);

  cacheSet(cacheKey, papers);
  return papers;
}

/** 从任务对象提取 paperId */
function extractPaperId(task: Task): string | null {
  const url = task.contentUrl ?? "";
  const m = url.match(/paperId=([^&]+)/);
  if (m) return m[1];
  if (task.contentId) return task.contentId;
  return null;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}
