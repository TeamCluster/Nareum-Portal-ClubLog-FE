import { useEffect, useState } from 'react'
import { apiGet, apiDelete, apiDownload } from '../../api/client'
import AdminHeader from '../../components/AdminHeader'

/**
 * 활동 이력 관리 페이지.
 *   - 전체 활동 이력 (최신순) 표시
 *   - 각 행마다 삭제 버튼 (confirm 후 DELETE)
 *   - 상단에 엑셀 다운로드 버튼
 */
export default function ClubLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null) // { type: 'success'|'error', message }
  const [deletingId, setDeletingId] = useState(null) // 중복 클릭 방지

  useEffect(() => {
    apiGet('/admin/logs')
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(log) {
    const ok = window.confirm(
      `이 기록(${log.club_name}, ${log.created_at})을(를) 정말로 삭제하시겠습니까?`,
    )
    if (!ok) return

    setDeletingId(log.id)
    try {
      await apiDelete('/admin/logs', { id: log.id })
      // 서버에서 삭제됐으니 로컬 state 에서도 제거 (재요청보다 빠름)
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      setFlash({ type: 'success', message: '활동 이력이 삭제되었습니다.' })
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDownload() {
    try {
      await apiDownload('/logs/download')
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />

      <main className="px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">활동 이력 관리</h1>
            <p className="mt-2 text-sm text-stone-600">
              최신순으로 정렬됩니다. 각 행에서 삭제 가능합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800"
          >
            엑셀로 저장 💾
          </button>
        </div>

        {flash && (
          <FlashMessage
            type={flash.type}
            message={flash.message}
            onClose={() => setFlash(null)}
          />
        )}

        {error && (
          <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-stone-500">불러오는 중…</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left">
                <tr>
                  <Th>관리</Th>
                  <Th>기록일시</Th>
                  <Th>동아리</Th>
                  <Th>활동 일자</Th>
                  <Th>시간</Th>
                  <Th>활동 내용</Th>
                  <Th>작성자</Th>
                  <Th className="text-right">인원</Th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-stone-500">
                      아직 활동 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                    >
                      <Td>
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
                          disabled={deletingId === log.id}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === log.id ? '삭제 중…' : '삭제'}
                        </button>
                      </Td>
                      <Td className="whitespace-nowrap text-xs text-stone-500">
                        {log.created_at}
                      </Td>
                      <Td className="whitespace-nowrap">
                        <span className="text-stone-500">[{log.category}]</span>{' '}
                        {log.club_name}
                      </Td>
                      <Td className="whitespace-nowrap">{log.activity_date}</Td>
                      <Td className="whitespace-nowrap text-stone-600">
                        {log.start_time}~{log.end_time}
                      </Td>
                      <Td className="max-w-md">
                        <span className="line-clamp-2">{log.content}</span>
                      </Td>
                      <Td className="whitespace-nowrap">{log.author}</Td>
                      <Td className="whitespace-nowrap text-right">
                        {log.total_count}명
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

/* ---------- 보조 컴포넌트 ---------- */

function FlashMessage({ type, message, onClose }) {
  const styles =
    type === 'success'
      ? 'border-green-200 bg-green-50 text-green-700'
      : 'border-red-200 bg-red-50 text-red-700'
  return (
    <div
      className={`mt-6 flex items-center justify-between gap-3 rounded border px-4 py-3 text-sm ${styles}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="text-lg leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
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