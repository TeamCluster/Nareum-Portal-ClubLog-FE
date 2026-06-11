import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { placeApi } from '../../api/places'
import AdminHeader from '../../components/AdminHeader'

/**
 * 동아리 활동 이력 관리 페이지.
 *   - 전체 로그 목록 (최신순)
 *   - 일별/월별 기간 필터
 *   - 행 단위 삭제
 *   - 보고 있는 범위를 엑셀(.xlsx)로 다운로드 (브라우저에서 생성)
 */
export default function ClubLog() {
  const { slug } = useParams()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [downloading, setDownloading] = useState(false)

  // 필터 상태. mode: 'day'(일별) | 'month'(월별).
  // from/to 는 mode 에 맞춰 'YYYY-MM-DD' 또는 'YYYY-MM' 문자열.
  const [filterMode, setFilterMode] = useState('day')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

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

  // 보고 있는 범위(필터 적용 결과). 모든 로그는 이미 메모리에 있으므로 프론트에서 필터.
  const filteredLogs = useMemo(() => {
    if (!from && !to) return logs
    return logs.filter((log) => {
      const iso = toIsoDate(log.activity_date)
      if (!iso) return false
      const key = filterMode === 'month' ? iso.slice(0, 7) : iso
      if (from && key < from) return false
      if (to && key > to) return false
      return true
    })
  }, [logs, from, to, filterMode])

  function switchMode(mode) {
    if (mode === filterMode) return
    setFilterMode(mode)
    setFrom('')
    setTo('')
  }

  function resetFilter() {
    setFrom('')
    setTo('')
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

  // 보고 있는 범위(filteredLogs)를 그대로 엑셀로 — 브라우저에서 .xlsx 생성.
  // xlsx 는 용량이 커서 다운로드 시점에만 동적 import.
  async function handleDownload() {
    if (filteredLogs.length === 0) return
    setDownloading(true)
    try {
      const XLSX = await import('xlsx')
      const header = [
        '기록일시',
        '카테고리',
        '동아리',
        '활동일자',
        '시작시간',
        '종료시간',
        '활동내용',
        '참가자',
        '작성자',
        '인원',
      ]
      const rows = filteredLogs.map((log) => [
        log.created_at,
        log.category,
        log.club_name,
        log.activity_date,
        log.start_time,
        log.end_time,
        log.content,
        log.participants,
        log.author,
        log.total_count,
      ])

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
      ws['!cols'] = [
        { wch: 18 }, // 기록일시
        { wch: 10 }, // 카테고리
        { wch: 16 }, // 동아리
        { wch: 12 }, // 활동일자
        { wch: 8 }, // 시작시간
        { wch: 8 }, // 종료시간
        { wch: 40 }, // 활동내용
        { wch: 24 }, // 참가자
        { wch: 10 }, // 작성자
        { wch: 6 }, // 인원
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '활동이력')
      XLSX.writeFile(wb, buildFilename(filterMode, from, to))
    } catch (err) {
      setFlash({ type: 'error', message: err.message || '엑셀 생성에 실패했습니다.' })
    } finally {
      setDownloading(false)
    }
  }

  const hasFilter = Boolean(from || to)

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />

      <main className="px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">동아리 활동 전체이력</h1>
            <p className="mt-2 text-sm text-stone-600">
              기간을 지정해 조회/삭제하거나 보고 있는 범위를 엑셀로 내려받을 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || filteredLogs.length === 0}
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

        {/* 기간 필터 */}
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <div className="inline-flex overflow-hidden rounded-md border border-stone-300">
            <ModeButton
              active={filterMode === 'day'}
              onClick={() => switchMode('day')}
            >
              일별
            </ModeButton>
            <ModeButton
              active={filterMode === 'month'}
              onClick={() => switchMode('month')}
            >
              월별
            </ModeButton>
          </div>

          <DateField
            label="시작"
            mode={filterMode}
            value={from}
            onChange={setFrom}
          />
          <DateField label="종료" mode={filterMode} value={to} onChange={setTo} />

          {hasFilter && (
            <button
              type="button"
              onClick={resetFilter}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-600 transition hover:bg-stone-50"
            >
              전체
            </button>
          )}

          <span className="ml-auto text-sm text-stone-500">
            전체 {logs.length}건 중 <strong className="text-stone-800">{filteredLogs.length}</strong>건 표시
          </span>
        </div>

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
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-stone-500">
                      {logs.length === 0
                        ? '아직 활동 이력이 없습니다.'
                        : '해당 기간에 활동 이력이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
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

/* ---------- 보조 함수 ---------- */

/**
 * 백엔드가 보낸 활동일자 문자열을 'YYYY-MM-DD' 로 정규화.
 * 구분자(-, ., /, 년월일 등)와 무관하게 앞쪽 숫자 3개를 사용.
 * 비교(>=, <=)가 사전식으로 동작하도록 0 패딩.
 */
function toIsoDate(raw) {
  if (!raw) return ''
  const nums = String(raw).match(/\d+/g)
  if (!nums || nums.length < 3) return ''
  const [y, m, d] = nums
  return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

/** 다운로드 파일명 — 보고 있는 범위를 반영. */
function buildFilename(mode, from, to) {
  if (!from && !to) return '활동이력_전체.xlsx'
  const unit = mode === 'month' ? '월별' : '일별'
  const range = [from || '처음', to || '끝'].join('~')
  return `활동이력_${unit}_${range}.xlsx`
}

/* ---------- 보조 컴포넌트 ---------- */

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium transition ${
        active
          ? 'bg-orange-700 text-white'
          : 'bg-white text-stone-600 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  )
}

function DateField({ label, mode, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-stone-500">
      {label}
      <input
        type={mode === 'month' ? 'month' : 'date'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-800 focus:border-orange-500 focus:outline-none"
      />
    </label>
  )
}

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
