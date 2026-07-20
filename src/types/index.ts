/** EWT 作业 */
export interface Homework {
  homeworkId: number;
  title: string;
  startTime: number;
  endTime: number;
}

/** EWT 任务（作业下的一个条目） */
export interface Task {
  contentId: string;
  taskId: string;
  lessonId?: string;
  title: string;
  contentTypeName: string; // "试卷" | "课程讲" | "FM" | ...
  contentType: number;
  contentUrl: string;
  questionCount?: number;
  ratio?: number;
  finished?: boolean;
  subjectName?: string;
  homeworkId: number;
}

/** 独立试卷（展示用） */
export interface Paper {
  homeworkId: number;
  homeworkTitle: string;
  paperId: string;
  title: string;
  questionCount: number | string;
  ratio?: number;
  date?: string;
  subjectName?: string;
}

/** 题目接口 (来自 API_REFERENCE §7.1) */
export interface Question {
  id: string;
  questionNo: number;
  options: Option[];
  rightAnswer: string[];
  cate: number;
  score?: number;
  childQuestions?: Question[];
  myAnswer?: unknown[];
}

/** 选项接口 (API_REFERENCE §7.2) */
export interface Option {
  choice: string;
  index: number;
  option: string;
}

/** 后端返回的答案数据 */
export interface AnswerResponse {
  success: boolean;
  data?: Record<string, Question>;
  msg: string;
}

/** 答案提交 Payload (API_REFERENCE §7.3) */
export interface AnswerPayload {
  answers: (number | string)[];
  questionId: string;
  questionNo: number;
  totalSeconds: number;
  cateId: number;
  attachmentImages?: [];
  score?: number;
  revision?: boolean;
}
