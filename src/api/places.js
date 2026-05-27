/**
 * 기관별 API — /api/<slug>/... 라우트 호출을 모은 모듈.
 *
 * 사용 예:
 *   import { placeApi } from '../api/places'
 *   const { clubs } = await placeApi.getClubs(slug)
 *   await placeApi.createLog(slug, formData)
 *
 * URL 조립은 여기서만 — 페이지 코드는 slug 와 데이터만 신경쓰면 됩니다.
 */
import { apiGet, apiPost, apiDelete, apiDownload } from './client'

export const placeApi = {
  // --- 공개 (로그인 불필요) ---
  /** 기관 공개 정보 — 풀네임/축약별칭. {slug, full_name, short_name} 반환. */
  getInfo: (slug) => apiGet(`/${slug}/info`),

  /** 일지 작성 폼의 동아리 셀렉트용. {clubs, club_dict} 반환. */
  getClubs: (slug) => apiGet(`/${slug}/clubs`),

  /** 활동일지 작성. */
  createLog: (slug, data) => apiPost(`/${slug}/logs`, data),

  /** 엑셀 다운로드. 브라우저 다운로드 트리거까지 자동. */
  downloadLogs: (slug) => apiDownload(`/${slug}/logs/download`),

  // --- 기관 관리자 인증 ---
  login: (slug, password) => apiPost(`/${slug}/admin/login`, { password }),
  logout: (slug) => apiPost(`/${slug}/admin/logout`),
  getSession: (slug) => apiGet(`/${slug}/admin/session`),

  // --- 기관 관리자 (보호된 라우트) ---
  /** 관리자 대시보드 통계. */
  getDashboard: (slug) => apiGet(`/${slug}/admin/dashboard`),

  /** 전체 활동일지 (최신순). */
  getLogs: (slug) => apiGet(`/${slug}/admin/logs`),

  /** 활동일지 한 건 삭제 (id 기준). */
  deleteLog: (slug, id) => apiDelete(`/${slug}/admin/logs`, { id }),

  /** 관리자용 동아리 목록 (공개의 getClubs 와 같은 데이터지만 인증 필요). */
  getAdminClubs: (slug) => apiGet(`/${slug}/admin/clubs`),

  /** 동아리 추가. */
  addClub: (slug, name, category) =>
    apiPost(`/${slug}/admin/clubs`, { name, category }),

  /** 동아리 삭제. */
  deleteClub: (slug, name) =>
    apiDelete(`/${slug}/admin/clubs`, { name }),
}