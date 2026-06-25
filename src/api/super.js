/**
 * 슈퍼 관리자 API — /api/super/... 라우트 호출을 모은 모듈.
 *
 * 사용 예:
 *   import { superApi } from '../api/super'
 *   await superApi.login(password)
 *   const { places } = await superApi.getPlaces()
 *   await superApi.addPlace('nareum', '나름센터', 'password123')
 */
import { apiGet, apiPost, apiDelete } from './client'

export const superApi = {
  // --- 인증 ---
  login: (password) => apiPost('/super/login', { password }),
  logout: () => apiPost('/super/logout'),
  getSession: () => apiGet('/super/session'),

  /** 슈퍼 본인의 비밀번호 변경. */
  updatePassword: (newPassword) =>
    apiPost('/super/password', { new_password: newPassword }),

  // --- 기관 CRUD ---
  /** 기관 목록 (해시 제외). */
  getPlaces: () => apiGet('/super/places'),

  /** 기관 추가. 검증 통과 시 <slug>.sqlite3 도 자동 생성됨.
   *  foundationSyncUrl 은 선택값(빈값 = 재단 동기화 안 함). */
  addPlace: (slug, fullName, shortName, password, foundationSyncUrl = '') =>
    apiPost('/super/places', {
      slug,
      full_name: fullName,
      short_name: shortName,
      password,
      foundation_sync_url: foundationSyncUrl,
    }),

  /** 기관 삭제. 옵션 B — DB 파일은 보존, places 행만 삭제.
   *  같은 slug 로 재추가 시 이전 데이터 복구. */
  deletePlace: (slug) => apiDelete(`/super/places/${slug}`),

  /** 기관 관리자 비밀번호 변경 (슈퍼만 가능). */
  updatePlacePassword: (slug, newPassword) =>
    apiPost(`/super/places/${slug}/password`, { new_password: newPassword }),

  /** 기관의 재단 동기화 스크립트 URL 등록/수정/해제 (빈값 = 해제). */
  updatePlaceSyncUrl: (slug, url) =>
    apiPost(`/super/places/${slug}/sync-url`, { foundation_sync_url: url }),
}