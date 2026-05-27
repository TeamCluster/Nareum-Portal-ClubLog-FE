/**
 * API 클라이언트 — 모든 fetch 호출이 거치는 단일 진입점.
 *
 * 책임:
 *   1. credentials: 'include' → 관리자 세션 쿠키 자동 전송
 *   2. JSON 직렬화/역직렬화 자동
 *   3. 에러를 일관된 Error 객체로 throw (.message 에 백엔드 메시지)
 *   4. 엑셀 등 파일 응답을 브라우저 다운로드로 트리거
 *
 * 사용 예:
 *   const { clubs } = await apiGet('/clubs')
 *   await apiPost('/admin/login', { password: '...' })
 *   await apiDelete('/admin/logs', { id: 123 })
 *   await apiDownload('/logs/download')
 *
 * 모든 경로 앞에 자동으로 '/api' 가 붙습니다.
 * (개발 중엔 Vite 프록시가 :5000 의 Flask 로 전달)
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api'

/**
 * 응답을 파싱하고 에러를 표준화하는 내부 헬퍼.
 * 성공 시 파싱된 JSON 반환, 실패 시 Error throw.
 */
async function parse(response) {
  // 응답이 빈 본문일 수도 있으니 content-type 확인 후 파싱
  let payload = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    payload = await response.json()
  }

  if (!response.ok) {
    // 백엔드가 {ok:false, message:"..."} 또는 {error:"..."} 형식으로 보냄
    const message =
      payload?.message ||
      payload?.error ||
      `요청 실패 (${response.status})`
    const err = new Error(message)
    err.status = response.status
    err.payload = payload
    throw err
  }

  return payload
}

/** GET 요청. */
export async function apiGet(path) {
  const r = await fetch(BASE + path, {
    method: 'GET',
    credentials: 'include',
  })
  return parse(r)
}

/** POST 요청. body 는 자동으로 JSON 직렬화. */
export async function apiPost(path, body = {}) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parse(r)
}

/** DELETE 요청. body 동반 가능 (식별자 등). */
export async function apiDelete(path, body = {}) {
  const r = await fetch(BASE + path, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parse(r)
}

/**
 * 파일 다운로드.
 * 백엔드가 보낸 Content-Disposition 의 filename 을 사용해
 * 브라우저에서 자동 다운로드를 트리거합니다.
 */
export async function apiDownload(path) {
  const r = await fetch(BASE + path, {
    method: 'GET',
    credentials: 'include',
  })
  if (!r.ok) {
    throw new Error(`다운로드 실패 (${r.status})`)
  }

  // Content-Disposition 헤더에서 파일명 추출.
  // 한글 파일명은 filename*=UTF-8''... 형태가 우선.
  const disposition = r.headers.get('content-disposition') || ''
  let filename = 'download.xlsx'
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  if (utf8Match) {
    filename = decodeURIComponent(utf8Match[1])
  } else if (plainMatch) {
    filename = plainMatch[1]
  }

  // Blob -> 임시 URL -> <a> 클릭 -> 정리. 표준 다운로드 패턴.
  const blob = await r.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}