import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { placeApi } from '../../api/places'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

/**
 * 기관 관리자 로그인 페이지.
 *
 * URL: /:slug/setting
 *
 * 흐름:
 *   - 마운트 시 GET /api/<slug>/admin/session 으로 로그인 상태 확인 ->
 *     이미 로그인됐으면 /:slug/setting/main 으로 자동 이동
 *   - 비밀번호 제출 -> POST /api/<slug>/admin/login
 *   - 성공: /:slug/setting/main 으로, 실패: 에러 메시지
 */
export default function Login() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 기관 정보 — title 에 short_name 사용. 폼 동작과 무관해서 실패해도 무시.
  const [info, setInfo] = useState(null)
  useEffect(() => {
    placeApi.getInfo(slug).then(setInfo).catch(() => {})
  }, [slug])
  useDocumentTitle(info ? `${info.short_name} 동아리 관리자페이지` : null)

  // 이미 로그인 상태면 대시보드로 자동 이동
  useEffect(() => {
    placeApi
      .getSession(slug)
      .then((data) => {
        if (data.logged_in) {
          navigate(`/${slug}/setting/main`, { replace: true })
        }
      })
      .catch(() => {
        // 세션 확인 실패(잘못된 slug 등) 시 폼은 그대로 노출.
        // 잘못된 slug 라면 로그인 시도에서 어차피 404 가 떨어짐.
      })
  }, [slug, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await placeApi.login(slug, password)
      navigate(`/${slug}/setting/main`, { replace: true })
    } catch (err) {
      setError(err.message)
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        {/* 어느 기관 로그인인지 작게 표시 */}
        <p className="mb-1 font-mono text-xs uppercase tracking-wider text-stone-500">
          {slug}
        </p>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">관리자 로그인</h1>
        <p className="mb-6 text-sm text-stone-600">비밀번호를 입력해주세요.</p>

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
            className="w-full rounded-md bg-orange-700 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {submitting ? '확인 중…' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}