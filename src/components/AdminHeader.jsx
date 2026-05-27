import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { apiPost } from '../api/client'

/**
 * 관리자 전용 헤더 — 네비 + 로그아웃 버튼.
 * 대시보드/활동이력/동아리일람 페이지에서 공유.
 *
 * 현재 페이지는 NavLink 의 isActive 로 자동 강조됨.
 */
export default function AdminHeader() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await apiPost('/admin/logout')
    } catch {
      // 로그아웃 호출 실패해도 어차피 로그인 페이지로 보낼 거니까 무시
    }
    navigate('/setting', { replace: true })
  }

  return (
    <header className="border-b border-stone-300 bg-white px-6 py-3 sm:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="whitespace-nowrap text-lg font-bold">
          <NavLink
            to="/setting/main"
            className="text-stone-900 hover:text-stone-600"
          >
            나름 활동일지 — 관리자
          </NavLink>
        </h1>

        <button
          type="button"
          className="text-2xl lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
        >
          ☰
        </button>

        {/* 데스크톱 네비 */}
        <nav className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            <li>
              <a
                href="/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-stone-700 hover:text-orange-700"
              >
                일지 작성 페이지 ↗
              </a>
            </li>
            {ADMIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-stone-300 px-3 py-1 text-stone-600 hover:bg-stone-100"
              >
                로그아웃
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* 모바일 네비 */}
      {mobileOpen && (
        <nav className="mt-3 lg:hidden">
          <ul className="flex flex-col gap-1 text-sm">
            <li>
              <a
                href="/"
                target="_blank"
                rel="noreferrer noopener"
                className="block px-2 py-2 text-stone-700"
                onClick={() => setMobileOpen(false)}
              >
                일지 작성 페이지 ↗
              </a>
            </li>
            {ADMIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-2 py-2 ${
                      isActive ? 'font-semibold text-orange-700' : 'text-stone-700'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-left text-stone-600 hover:bg-stone-100"
              >
                로그아웃
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

// NavLink className 함수 — 현재 라우트면 굵게 + 오렌지
function navLinkClass({ isActive }) {
  return isActive
    ? 'font-semibold text-orange-700'
    : 'text-stone-700 hover:text-orange-700'
}

const ADMIN_NAV = [
  { to: '/setting/main', label: '대시보드' },
  { to: '/setting/club_log', label: '동아리 활동 이력' },
  { to: '/setting/club_list', label: '동아리 일람' },
]