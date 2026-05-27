import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { apiGet } from '../api/client'

/**
 * 관리자 라우트 가드.
 *
 * 사용:
 *   <Route element={<RequireAuth />}>
 *     <Route path="/setting/main" element={<Dashboard />} />
 *     ...
 *   </Route>
 *
 * 세션이 없으면 /setting 으로 리다이렉트. 자식 라우트는 <Outlet /> 으로 렌더.
 */
export default function RequireAuth() {
  // 'checking' (초기) -> 'ok' or 'unauthorized'
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    apiGet('/admin/session')
      .then((d) => setStatus(d.logged_in ? 'ok' : 'unauthorized'))
      .catch(() => setStatus('unauthorized'))
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-500">확인 중…</p>
      </div>
    )
  }
  if (status === 'unauthorized') {
    return <Navigate to="/setting" replace />
  }
  return <Outlet />
}