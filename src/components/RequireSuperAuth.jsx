import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { superApi } from '../api/super'

/**
 * 슈퍼 관리자 라우트 가드.
 *
 * 사용:
 *   <Route element={<RequireSuperAuth />}>
 *     <Route path="/super/setting/main" element={<SuperDashboard />} />
 *     ...
 *   </Route>
 *
 * 미로그인 시 /super/setting (슈퍼 로그인 페이지)로 리다이렉트.
 */
export default function RequireSuperAuth() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    superApi
      .getSession()
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
    return <Navigate to="/super/setting" replace />
  }
  return <Outlet />
}