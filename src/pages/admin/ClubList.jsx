import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { placeApi } from '../../api/places'
import AdminHeader from '../../components/AdminHeader'

/**
 * 동아리 일람 페이지.
 *   - 신규 동아리 추가 (이름 + 분야)
 *   - 동아리 목록 표 (행마다 삭제 버튼)
 *
 * 정렬은 서버에서 한글 우선 정렬되어 내려옵니다.
 * 추가 후엔 정렬 반영을 위해 서버에서 다시 가져옵니다.
 */
export default function ClubList() {
  const { slug } = useParams()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null)

  // 추가 폼 상태
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [adding, setAdding] = useState(false)

  // 삭제 중인 동아리 이름 (중복 클릭 방지)
  const [deletingName, setDeletingName] = useState(null)

  useEffect(() => {
    loadClubs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function loadClubs() {
    setLoading(true)
    placeApi
      .getAdminClubs(slug)
      .then((data) => setClubs(data.clubs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setAdding(true)
    try {
      const result = await placeApi.addClub(slug, newName, newCategory)
      setFlash({ type: 'success', message: result.message })
      setNewName('')
      setNewCategory('')
      // 정렬 반영을 위해 서버에서 다시 받기
      loadClubs()
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(club) {
    const ok = window.confirm(
      `정말로 '${club.name}' 동아리를 삭제하시겠습니까?`
    )
    if (!ok) return

    setDeletingName(club.name)
    try {
      const result = await placeApi.deleteClub(slug, club.name)
      setClubs((prev) => prev.filter((c) => c.name !== club.name))
      setFlash({ type: 'success', message: result.message })
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setDeletingName(null)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminHeader />

      <main className="px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-bold text-stone-900">동아리 일람</h1>
        <p className="mt-2 text-sm text-stone-600">
          동아리를 추가하거나 삭제할 수 있습니다. 한글 우선 순으로 자동 정렬됩니다.
        </p>

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

        {/* 신규 동아리 추가 폼 */}
        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">신규 동아리 추가</h2>
          <form
            onSubmit={handleAdd}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="동아리 명"
              required
              className={`${inputClass} flex-1`}
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="동아리 분야"
              required
              className={`${inputClass} flex-1`}
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-md bg-orange-700 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {adding ? '추가 중…' : '추가하기'}
            </button>
          </form>
        </section>

        {/* 동아리 목록 표 */}
        <h2 className="mt-12 text-xl font-bold text-stone-900">동아리 목록</h2>
        {loading ? (
          <p className="mt-4 text-stone-500">불러오는 중…</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left">
                <tr>
                  <Th>동아리 명</Th>
                  <Th>동아리 분야</Th>
                  <Th className="w-32 text-center">관리</Th>
                </tr>
              </thead>
              <tbody>
                {clubs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-12 text-center text-stone-500"
                    >
                      아직 등록된 동아리가 없습니다.
                    </td>
                  </tr>
                ) : (
                  clubs.map((club) => (
                    <tr
                      key={club.name}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                    >
                      <Td className="font-medium">{club.name}</Td>
                      <Td>{club.category}</Td>
                      <Td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(club)}
                          disabled={deletingName === club.name}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingName === club.name ? '삭제 중…' : '삭제'}
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

const inputClass =
  'rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600'

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