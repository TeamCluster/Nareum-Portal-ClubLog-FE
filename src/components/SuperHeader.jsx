import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { superApi } from '../api/super'

/**
 * 슈퍼 관리자 전용 헤더.
 *
 * 디자인 메모: 기관 헤더(밝은 배경)와 짙은 stone-900 배경으로 명확히 구분.
 * 슈퍼 페이지에 있다는 걸 운영자가 한눈에 알 수 있도록.
 */
export default function SuperHeader() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { to: '/super/setting/main', label: '대시보드' },
    { to: '/super/setting/places', label: '기관 관리' },
  ]

  async function handleLogout() {
    try {
      await superApi.logout()
    } catch {
      // 무시 — 어차피 로그인 페이지로 보냄
    }
    navigate('/super/setting', { replace: true })
  }

  return (
    <header className="border-b border-stone-700 bg-stone-900 px-6 py-3 text-stone-100 sm:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="whitespace-nowrap text-lg font-bold">
          <NavLink
            to="/super/setting/main"
            className="text-stone-100 hover:text-orange-400"
          >
            동아리 활동일지{' '}
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-orange-400">
              super
            </span>
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
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-stone-600 px-3 py-1 text-stone-200 hover:bg-stone-800"
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
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `block px-2 py-2 ${
                      isActive
                        ? 'font-semibold text-orange-400'
                        : 'text-stone-200'
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
                className="mt-1 w-full rounded border border-stone-600 px-3 py-2 text-left text-stone-200 hover:bg-stone-800"
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

function navLinkClass({ isActive }) {
  return isActive
    ? 'font-semibold text-orange-400'
    : 'text-stone-200 hover:text-orange-400'
}