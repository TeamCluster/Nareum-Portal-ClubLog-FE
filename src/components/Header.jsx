import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * 공용 헤더 — 일반 사용자 화면(/ 등)에 사용.
 * 관리자 페이지용 헤더는 별도(AdminHeader) 로 만들 예정.
 *
 * 동작:
 *   - 데스크톱(lg 이상): 메뉴 항목에 hover 시 서브메뉴 펼침
 *   - 모바일(lg 미만): 햄버거 버튼으로 메뉴 토글.
 *     서브메뉴는 펼친 상태로 항상 표시.
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b border-stone-300 bg-white px-6 py-3 sm:px-10">
      <div className="flex items-center justify-between gap-8">
        {/* 로고 */}
        <h1 className="whitespace-nowrap text-xl font-bold">
          <Link to="/" className="text-stone-900 hover:text-stone-600">
            나름 동아리활동일지
          </Link>
        </h1>

        {/* 햄버거 — 모바일에서만 보임 */}
        <button
          type="button"
          className="text-2xl lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="메뉴 열기"
          aria-expanded={mobileOpen}
        >
          ☰
        </button>

        {/* 데스크톱 네비게이션 */}
        <nav className="ml-auto hidden lg:block">
          <ul className="flex gap-8">
            {MENU.map((group) => (
              <li key={group.label} className="group relative">
                <span className="cursor-default py-2 font-medium text-stone-700">
                  {group.label}
                </span>
                <ul className="absolute left-0 top-full z-10 hidden min-w-[160px] rounded border border-stone-200 bg-white py-2 shadow-md group-hover:block">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noreferrer noopener' : undefined}
                        className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 모바일 네비게이션 — 햄버거 토글로 표시 */}
      {mobileOpen && (
        <nav className="mt-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {MENU.map((group) => (
              <li key={group.label}>
                <div className="border-b border-stone-200 px-2 py-2 text-sm font-semibold text-stone-500">
                  {group.label}
                </div>
                <ul className="flex flex-col">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noreferrer noopener' : undefined}
                        className="block px-4 py-3 text-stone-800 hover:bg-stone-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

/**
 * 메뉴 구조 — 항목 추가/수정 시 여기만 손대면 됨.
 * external: 새 탭으로 열리는 외부 링크 여부.
 */
const MENU = [
  {
    label: '프로그램 및 대관신청',
    items: [
      { label: '대관신청', href: 'https://space.nareum.life', external: true },
    ],
  },
  {
    label: '센터소개',
    items: [
      {
        label: '이용안내',
        href: 'https://gmyouth.or.kr/nareum/contents.do?key=1264',
        external: true,
      },
      {
        label: '오시는 길',
        href: 'https://gmyouth.or.kr/nareum/contents.do?key=1269',
        external: true,
      },
      {
        label: '동아리 활동일지',
        href: 'https://clublog.nareum.life/',
        external: true,
      },
    ],
  },
]