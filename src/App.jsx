import { Routes, Route } from 'react-router-dom'
import RequireAuth from './components/RequireAuth'
import MainPage from './pages/MainPage'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ClubLog from './pages/admin/ClubLog'
import ClubList from './pages/admin/ClubList'

/*
 * 라우터 — 모든 페이지 완성.
 *   /                    일지 작성 (공개)
 *   /setting             관리자 로그인 (공개)
 *
 *   <RequireAuth /> 로 보호되는 라우트 (세션 없으면 /setting 으로 튕김):
 *     /setting/main        대시보드
 *     /setting/club_log    활동 이력 관리
 *     /setting/club_list   동아리 일람
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/setting" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/setting/main" element={<Dashboard />} />
        <Route path="/setting/club_log" element={<ClubLog />} />
        <Route path="/setting/club_list" element={<ClubList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <p className="text-stone-500">페이지를 찾을 수 없습니다.</p>
    </div>
  )
}