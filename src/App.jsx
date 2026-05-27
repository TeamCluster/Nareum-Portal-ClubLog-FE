import { Routes, Route, Link } from 'react-router-dom'

/*
 * 라우터 뼈대 — 각 페이지는 다음 턴부터 하나씩 채워 넣을 예정.
 * 지금은 부팅·라우팅·Tailwind 가 정상 동작하는지만 보여줍니다.
 *
 * URL 구조는 기존 Flask 백엔드와 동일하게 유지:
 *   /                    일지 작성 (MainPage)
 *   /setting             관리자 로그인 (Login)
 *   /setting/main        대시보드 (Dashboard)
 *   /setting/club_log    활동 이력 관리 (ClubLog)
 *   /setting/club_list   동아리 일람 (ClubList)
 */
function Placeholder({ title }) {
  return (
    <div className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
        <p className="mt-3 text-stone-600">
          이 페이지는 곧 만들어집니다. 라우터·Tailwind 동작 확인용입니다.
        </p>
        <nav className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link to="/" className="text-orange-700 hover:underline">/ 일지 작성</Link>
          <Link to="/setting" className="text-orange-700 hover:underline">/setting 로그인</Link>
          <Link to="/setting/main" className="text-orange-700 hover:underline">/setting/main 대시보드</Link>
          <Link to="/setting/club_log" className="text-orange-700 hover:underline">/setting/club_log 활동이력</Link>
          <Link to="/setting/club_list" className="text-orange-700 hover:underline">/setting/club_list 동아리일람</Link>
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="동아리 활동일지" />} />
      <Route path="/setting" element={<Placeholder title="관리자 로그인" />} />
      <Route path="/setting/main" element={<Placeholder title="대시보드" />} />
      <Route path="/setting/club_log" element={<Placeholder title="활동 이력 관리" />} />
      <Route path="/setting/club_list" element={<Placeholder title="동아리 일람" />} />
      <Route path="*" element={<Placeholder title="404 — 페이지를 찾을 수 없습니다" />} />
    </Routes>
  )
}
