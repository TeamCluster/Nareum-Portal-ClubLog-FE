import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { superApi } from '../../api/super'

/**
 * 슈퍼 관리자 로그인 페이지.
 *
 * URL: /super/setting
 *
 * 흐름:
 *   - 마운트 시 GET /api/super/session ->
 *     이미 로그인됐으면 /super/setting/main 으로 자동 이동
 *   - 비밀번호 제출 -> POST /api/super/login
 *   - 성공: /super/setting/main 으로, 실패: 에러 메시지
 *
 * 디자인 메모: 기관 로그인과 시각적으로 명확히 구분 (짙은 배경).
 * 운영자가 "지금 슈퍼 페이지에 있다"는 걸 한눈에 알 수 있도록.
 */
export default function SuperLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    superApi
      .getSession()
      .then((data) => {
        if (data.logged_in) {
          navigate('/super/setting/main', { replace: true })
        }
      })
      .catch(() => {
        // 무시 — 폼은 그대로 노출
      })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await superApi.login(password)
      navigate('/super/setting/main', { replace: true })
    } catch (err) {
      setError(err.message)
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-2xl">
        {/* 슈퍼 라벨 — 기관 로그인과 시각적 구분 */}
        <p className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
          super admin
        </p>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">
          슈퍼 관리자 로그인
        </h1>
        <p className="mb-6 text-sm text-stone-600">
          전 기관 총괄 관리 페이지로 들어갑니다.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            autoFocus
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-stone-900 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {submitting ? '확인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}