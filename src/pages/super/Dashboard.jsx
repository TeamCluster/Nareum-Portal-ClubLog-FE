import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { superApi } from '../../api/super'
import SuperHeader from '../../components/SuperHeader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

/**
 * 슈퍼 관리자 대시보드.
 *   - 등록된 기관 수 (통계 카드)
 *   - 기관 관리 페이지 진입 카드
 *   - 슈퍼 본인 비밀번호 변경 폼
 */
export default function SuperDashboard() {
  useDocumentTitle('활동일지 총괄관리 페이지')
  const [places, setPlaces] = useState([])
  const [loadError, setLoadError] = useState('')

  // 비밀번호 변경 폼
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    superApi
      .getPlaces()
      .then((data) => setPlaces(data.places || []))
      .catch((err) => setLoadError(err.message))
  }, [])

  async function handleChangePassword(e) {
    e.preventDefault()
    setFlash(null)

    if (newPw.length < 6) {
      setFlash({ type: 'error', message: '비밀번호는 6자 이상이어야 합니다.' })
      return
    }
    if (newPw !== confirmPw) {
      setFlash({ type: 'error', message: '두 비밀번호가 일치하지 않습니다.' })
      return
    }

    setSubmitting(true)
    try {
      const result = await superApi.updatePassword(newPw)
      setFlash({ type: 'success', message: result.message })
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <SuperHeader />

      <main className="px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-bold text-stone-900">슈퍼 대시보드</h1>
        <p className="mt-2 text-sm text-stone-600">
          전 기관 총괄 관리 페이지입니다.
        </p>

        {loadError && (
          <div className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* 통계 + 진입 카드 */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard label="등록된 기관 수" value={places.length} />
          <ActionCard
            label="기관 관리"
            description="추가, 삭제, 비밀번호 변경"
            to="/super/setting/places"
          />
        </div>

        {/* 슈퍼 본인 비밀번호 변경 */}
        <section className="mt-12 max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">
            슈퍼 비밀번호 변경
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            6자 이상의 새 비밀번호를 입력하세요.
          </p>

          {flash && (
            <div
              className={`mt-4 rounded border px-3 py-2 text-sm ${
                flash.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {flash.message}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="새 비밀번호"
              required
              className={inputClass}
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="새 비밀번호 확인"
              required
              className={inputClass}
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {submitting ? '변경 중…' : '비밀번호 변경'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

/* ---------- 보조 컴포넌트 ---------- */

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

function ActionCard({ label, description, to }) {
  return (
    <Link
      to={to}
      className="group block rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm transition hover:border-orange-600 hover:shadow-md"
    >
      <h3 className="text-sm font-medium text-stone-600">{label}</h3>
      <p className="mt-2 text-xl font-bold text-stone-900 group-hover:text-orange-700">
        {description} →
      </p>
    </Link>
  )
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600'