import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client'
import Header from '../components/Header'

/**
 * 메인 페이지 — 동아리 활동일지 작성 폼.
 *
 * 흐름:
 *   1. 마운트 시 GET /api/clubs 로 동아리 목록 + 분야 매핑 로드
 *   2. 폼 입력 (controlled component)
 *   3. submit -> POST /api/logs
 *   4. 성공 시 모달 표시, 닫으면 폼 초기화
 */
export default function MainPage() {
  const [clubs, setClubs] = useState([])
  const [clubDict, setClubDict] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState(null)
  const [formData, setFormData] = useState(initialFormData())

  // 동아리 목록 로드 (마운트 시 1회)
  useEffect(() => {
    apiGet('/clubs')
      .then((data) => {
        setClubs(data.clubs || [])
        setClubDict(data.club_dict || {})
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // 동아리 선택 시 분야 자동 채움
  function handleClubChange(e) {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      club_name: name,
      category: clubDict[name] || '',
    }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // <input type="date"> / <input type="time"> 값을 백엔드가 기대하는
      // year/month/day, hour/minute 형식으로 분리.
      const [y, m, d] = formData.activity_date.split('-').map(Number)
      const [sh, sm] = formData.start_time.split(':').map(Number)
      const [eh, em] = formData.end_time.split(':').map(Number)

      const payload = {
        category: formData.category,
        club_name: formData.club_name,
        activity_year: y,
        activity_month: m,
        activity_day: d,
        start_hour: sh,
        start_minute: sm,
        end_hour: eh,
        end_minute: em,
        participants: formData.participants,
        author: formData.author,
        activity_content: formData.activity_content,
        element_man: Number(formData.element_man) || 0,
        element_woman: Number(formData.element_woman) || 0,
        middle_man: Number(formData.middle_man) || 0,
        middle_woman: Number(formData.middle_woman) || 0,
        high_man: Number(formData.high_man) || 0,
        high_woman: Number(formData.high_woman) || 0,
        univ_man: Number(formData.univ_man) || 0,
        univ_woman: Number(formData.univ_woman) || 0,
      }

      const data = await apiPost('/logs', payload)
      setSuccessData(data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function closeModal() {
    setSuccessData(null)
    setFormData(initialFormData())
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <h2 className="mb-8 text-2xl font-bold text-stone-900">
            나름청소년활동센터 동아리 활동일지
          </h2>

          {loading && (
            <p className="text-stone-500">동아리 목록을 불러오는 중…</p>
          )}

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 동아리 명 */}
              <Field label="⋆ 동아리 명">
                <select
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleClubChange}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>
                    동아리를 골라주세요
                  </option>
                  {clubs.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* 동아리 분야 (자동) */}
              <Field label="⋆ 동아리 분야">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  readOnly
                  placeholder="동아리 이름을 선택하면 자동으로 표시돼요"
                  className={`${inputClass} bg-stone-100 text-stone-600`}
                />
              </Field>

              {/* 활동 일자 */}
              <Field label="⋆ 활동 일자">
                <input
                  type="date"
                  name="activity_date"
                  value={formData.activity_date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>

              {/* 활동 시간 */}
              <Field label="⋆ 활동 시간">
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                  <span className="text-stone-500">~</span>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </Field>

              {/* 참여자 */}
              <Field label="⋆ 참여자 (쉼표로 구분)">
                <input
                  type="text"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  placeholder="디렉터 안, 치프 강, 매니저 규, 스태프 홍"
                  required
                  className={inputClass}
                />
              </Field>

              {/* 연령별 인원 — 2열 그리드 */}
              <Field label="⋆ 연령 별 참여자 수">
                <div className="grid grid-cols-2 gap-3">
                  {AGE_GROUPS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-stone-700"
                    >
                      <span className="w-16">{label}</span>
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        min={0}
                        className={`${inputClass} flex-1`}
                      />
                    </label>
                  ))}
                </div>
              </Field>

              {/* 작성자 */}
              <Field label="⋆ 작성자">
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="캡튼 안"
                  required
                  className={inputClass}
                />
              </Field>

              {/* 활동 내용 */}
              <Field label="⋆ 활동 내용">
                <textarea
                  name="activity_content"
                  value={formData.activity_content}
                  onChange={handleChange}
                  rows={6}
                  placeholder="다같이 모여서 작당모의를 야무지게 했다."
                  required
                  className={inputClass}
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-orange-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {submitting ? '저장 중…' : '저장하기'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* 저장 완료 모달 */}
      {successData && (
        <SuccessModal data={successData} onClose={closeModal} />
      )}
    </div>
  )
}

/* ---------- 보조 컴포넌트 ---------- */

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
    </div>
  )
}

function SuccessModal({ data, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-2xl font-bold text-stone-900">저장 완료 ✓</h3>
        <p className="text-stone-700">
          <strong>{data.date}</strong>에 진행된{' '}
          <strong>
            [{data.category}] {data.club}
          </strong>{' '}
          활동이
        </p>
        <p className="mt-1 text-stone-700">
          <strong>{data.people}명</strong>으로 성공적으로 저장되었습니다.
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-md bg-orange-700 px-6 py-2 font-semibold text-white hover:bg-orange-800"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

/* ---------- 상수 / 유틸 ---------- */

// 모든 input 에 공유되는 스타일
const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600'

const AGE_GROUPS = [
  { key: 'element_man', label: '초등 남' },
  { key: 'element_woman', label: '초등 여' },
  { key: 'middle_man', label: '중등 남' },
  { key: 'middle_woman', label: '중등 여' },
  { key: 'high_man', label: '고등 남' },
  { key: 'high_woman', label: '고등 여' },
  { key: 'univ_man', label: '후기 남' },
  { key: 'univ_woman', label: '후기 여' },
]

// 로컬 타임존 기준 오늘 'YYYY-MM-DD'.
// toISOString() 은 UTC 기반이라 새벽 시간대에 어제로 나올 수 있어 직접 조립.
function todayString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function initialFormData() {
  return {
    club_name: '',
    category: '',
    activity_date: todayString(),
    start_time: '',
    end_time: '',
    participants: '',
    author: '',
    activity_content: '',
    element_man: 0,
    element_woman: 0,
    middle_man: 0,
    middle_woman: 0,
    high_man: 0,
    high_woman: 0,
    univ_man: 0,
    univ_woman: 0,
  }
}