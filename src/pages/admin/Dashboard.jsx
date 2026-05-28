import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { placeApi } from '../../api/places'
import AdminHeader from '../../components/AdminHeader'

/**
 * 기관 관리자 대시보드.
 *   - 오늘의 활동 건수 / 총 동아리 수 (통계 카드)
 *   - 최근 활동 이력 5건 (테이블)
 */
export default function Dashboard() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    placeApi
      .getDashboard(slug)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [slug])

  // 기관 정보 — 페이지 title 에 short_name 사용. 헤더 표시는 그대로 slug.
  const [info, setInfo] = useState(null)
  useEffect(() => {
    placeApi
      .getInfo(slug)
      .then(setInfo)
      .catch(() => {
        // 잘못된 slug 라면 RequireAuth 가 어차피 튕겨낼 거니까 무시
      })
  }, [slug])

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />

      <main className="px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-bold text-stone-900">{info?.full_name || '(불러오는 중)'} 대시보드</h1>
        <p className="mt-2 text-sm text-stone-600">
          {info?.full_name || '(불러오는 중)'} 동아리 활동 현황입니다.
        </p>

        {error && (
          <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!data ? (
          <p className="mt-8 text-stone-500">불러오는 중…</p>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <StatCard label="오늘의 동아리 활동 실적 건수" value={data.today_activity_count} />
              <StatCard label="총 등록된 동아리 수" value={data.total_club_count} />
            </div>

            {/* 최근 활동 이력 */}
            <h2 className="mt-12 text-xl font-bold text-stone-900">
              최근 활동 이력 5건 (최신순)
            </h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-left">
                  <tr>
                    <Th>기록일시</Th>
                    <Th>동아리</Th>
                    <Th>활동 일자</Th>
                    <Th>활동 내용</Th>
                    <Th>작성자</Th>
                    <Th className="text-right">인원</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                        아직 활동 이력이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    data.recent_logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                      >
                        <Td className="whitespace-nowrap">{log.created_at}</Td>
                        <Td className="whitespace-nowrap">
                          <span className="text-stone-500">[{log.category}]</span>{' '}
                          {log.club_name}
                        </Td>
                        <Td className="whitespace-nowrap">{log.activity_date}</Td>
                        <Td className="max-w-xs truncate">{log.content}</Td>
                        <Td className="whitespace-nowrap">{log.author}</Td>
                        <Td className="text-right whitespace-nowrap">{log.total_count}명</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
      <h3 className="text-sm font-medium text-stone-600">{label}</h3>
      <p className="mt-2 text-4xl font-bold text-orange-700">
        {value}
        <span className="ml-1 text-xl text-stone-500">개</span>
      </p>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 font-medium text-stone-700 ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-stone-700 ${className}`}>{children}</td>
}