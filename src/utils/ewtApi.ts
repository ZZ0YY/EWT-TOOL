/**
 * Promisified wrapper around GM_xmlhttpRequest for calling EWT APIs.
 * Handles CommonHeader / CourseHeader token injection automatically.
 */
import { getToken } from "../utils/token";

type HttpMethod = "GET" | "POST";
type HeaderSet = "common" | "course";

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  data?: unknown;
  headerSet?: HeaderSet;
}

const COMMON_HEADERS: Record<string, string> = {
  Origin: "https://web.ewt360.com",
  Referer: "https://web.ewt360.com/mystudy/",
  "Ewt-Requestsource": "web",
  "Ewt-Contentstyle": "CamelCase",
  accept: "application/json, text/plain, */*",
  "content-type": "application/json; charset=UTF-8",
};

const COURSE_HEADERS: Record<string, string> = {
  Origin: "https://teacher.ewt360.com",
  Referer: "https://teacher.ewt360.com/",
  "Ewt-Requestsource": "web",
  "Ewt-Contentstyle": "CamelCase",
  accept: "application/json, text/plain, */*",
  "content-type": "application/json; charset=UTF-8",
};

function buildHeaders(headerSet: HeaderSet): Record<string, string> {
  const base = headerSet === "course" ? { ...COURSE_HEADERS } : { ...COMMON_HEADERS };
  const token = getToken();
  if (token) base["token"] = token;
  return base;
}

export function request<T = unknown>(
  url: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", data, headerSet = "common" } = opts;
  const headers = { ...buildHeaders(headerSet), ...opts.headers };

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url,
      headers,
      data: data ? JSON.stringify(data) : undefined,
      responseType: "json",
      onload(res) {
        if (res.status >= 200 && res.status < 300) {
          const body = res.response as any;
          if (body && body.success === false) {
            reject(new Error(body.msg || "EWT API error"));
          } else {
            // 处理 EWT 常见的双层嵌套: { success: true, data: { data: [...] } }
            let result = body?.data ?? body;
            if (result && typeof result === "object" && !Array.isArray(result) && "data" in result) {
              result = result.data;
            }
            resolve(result);
          }
        } else {
          reject(new Error(`HTTP ${res.status}: ${res.responseText?.slice(0, 200)}`));
        }
      },
      onerror(err) {
        reject(new Error(String(err)));
      },
    });
  });
}

/** Convenience: GET with common headers */
export function get<T = unknown>(url: string, opts?: RequestOptions) {
  return request<T>(url, { ...opts, method: "GET" });
}

/** Convenience: POST with course headers (task/paper APIs) */
export function coursePost<T = unknown>(url: string, data: unknown) {
  return request<T>(url, { method: "POST", data, headerSet: "course" });
}

/** Convenience: POST with common headers */
export function commonPost<T = unknown>(url: string, data: unknown) {
  return request<T>(url, { method: "POST", data, headerSet: "common" });
}
