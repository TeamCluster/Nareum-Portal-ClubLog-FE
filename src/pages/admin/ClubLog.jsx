import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { placeApi } from '../../api/places'
import AdminHeader from '../../components/AdminHeader'

/**
 * 동아리 활동 이력 관리 페이지.
 *   - 전체 로그 목록 (최신순)
 *   - 행 단위 삭제
 *   - 엑셀 다운로드
 */
export default function ClubLog() {
  const { slug } = useParams()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function loadLogs() {
    setLoading(true)
    placeApi
      .getLogs(slug)
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  async function handleDelete(log) {
    const ok = window.confirm(
      `정말로 '${log.club_name}' (${log.activity_date}) 활동 이력을 삭제하시겠습니까?`
    )
    if (!ok) return

    setDeletingId(log.id)
    try {
      const result = await placeApi.deleteLog(slug, log.id)
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      setFlash({ type: 'success', message: result.message })
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      await placeApi.downloadLogs(slug)
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />

      <main className="px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">동아리 활동 전체이력</h1>
            <p className="mt-2 text-sm text-stone-600">
              전체 활동 이력을 조회/삭제하거나 엑셀로 내려받을 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || logs.length === 0}
            className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {downloading ? '다운로드 중…' : '엑셀로 저장'}
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
                  <Th>기록일시</Th>
                  <Th>동아리</Th>
                  <Th>활동 일자</Th>
                  <Th>시간</Th>
                  <Th>활동 내용</Th>
                  <Th>참가자</Th>
                  <Th>작성자</Th>
                  <Th className="text-right">인원</Th>
                  <Th className="text-center">관리</Th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-stone-500">
                      아직 활동 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
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
                      <Td className="whitespace-nowrap">
                        {log.start_time}~{log.end_time}
                      </Td>
                      <Td className="max-w-sm">
                        <span className="line-clamp-2 truncate">{log.content}</span>
                      </Td>
                      <Td className="max-w-xs truncate">{log.participants}</Td>
                      <Td className="whitespace-nowrap">{log.author}</Td>
                      <Td className="min-w-20 text-right whitespace-nowrap">
                        {log.total_count}명
                      </Td>
                      <Td className="min-w-20 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
                          disabled={deletingId === log.id}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === log.id ? '삭제 중…' : '삭제'}
                        </button>
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