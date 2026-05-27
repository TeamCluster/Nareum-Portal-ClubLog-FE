import { useEffect, useState } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { placeApi } from '../api/places'

/**
 * 기관 관리자 라우트 가드.
 *
 * URL 의 :slug 파라미터를 읽어 해당 기관에 로그인됐는지 확인.
 * 로그인 안 됐으면 /:slug/setting (해당 기관의 로그인 페이지)로 리다이렉트.
 *
 * 사용:
 *   <Route element={<RequireAuth />}>
 *     <Route path="/:slug/setting/main" element={<Dashboard />} />
 *     ...
 *   </Route>
 */
export default function RequireAuth() {
  const { slug } = useParams()
  // 'checking' (초기) -> 'ok' or 'unauthorized'
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    placeApi
      .getSession(slug)
      .then((d) => setStatus(d.logged_in ? 'ok' : 'unauthorized'))
      .catch(() => setStatus('unauthorized'))
  }, [slug])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-500">확인 중…</p>
      </div>
    )
  }
  if (status === 'unauthorized') {
    return <Navigate to={`/${slug}/setting`} replace />
  }
  return <Outlet />
}