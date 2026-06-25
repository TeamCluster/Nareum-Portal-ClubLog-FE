import { useEffect, useState } from 'react'
import { superApi } from '../../api/super'
import SuperHeader from '../../components/SuperHeader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

/**
 * 슈퍼 관리자 — 기관 관리 페이지.
 *   - 신규 기관 추가 (slug + 풀네임 + 축약 + 비밀번호)
 *   - 기관 목록 표 (관리페이지 진입, 비번 변경, 삭제)
 *   - 비번 변경은 인라인 펼침 — 모달보다 가볍고 표 흐름 안 깨짐
 *
 * 삭제는 옵션 B — DB 파일은 보존됨을 확인 안내에 명시.
 */
export default function Places() {
  useDocumentTitle('활동일지 총괄관리 페이지')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null)

  // 추가 폼
  const [newSlug, setNewSlug] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newShortName, setNewShortName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newSyncUrl, setNewSyncUrl] = useState('')
  const [adding, setAdding] = useState(false)

  // 어느 행의 비번 변경 폼이 펼쳐졌나
  const [editingSlug, setEditingSlug] = useState(null)
  // 어느 행의 동기화 URL 폼이 펼쳐졌나
  const [syncSlug, setSyncSlug] = useState(null)
  // 삭제 중인 행
  const [deletingSlug, setDeletingSlug] = useState(null)

  useEffect(() => {
    loadPlaces()
  }, [])

  function loadPlaces() {
    setLoading(true)
    superApi
      .getPlaces()
      .then((data) => setPlaces(data.places || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  async function handleAdd(e) {
    e.preventDefault()
    setAdding(true)
    try {
      const result = await superApi.addPlace(
        newSlug,
        newFullName,
        newShortName,
        newPassword,
        newSyncUrl
      )
      setFlash({ type: 'success', message: result.message })
      setNewSlug('')
      setNewFullName('')
      setNewShortName('')
      setNewPassword('')
      setNewSyncUrl('')
      loadPlaces()
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(place) {
    const ok = window.confirm(
      `정말로 기관 '${place.full_name}' (슬러그: ${place.slug}) 을(를) 삭제하시겠습니까?\n\n` +
        `※ DB 파일은 보존됩니다. 같은 슬러그로 재추가하면 이전 데이터가 복구됩니다.`
    )
    if (!ok) return

    setDeletingSlug(place.slug)
    try {
      const result = await superApi.deletePlace(place.slug)
      setPlaces((prev) => prev.filter((p) => p.slug !== place.slug))
      setFlash({ type: 'success', message: result.message })
    } catch (err) {
      setFlash({ type: 'error', message: err.message })
    } finally {
      setDeletingSlug(null)
    }
  }

  async function handlePasswordUpdate(slug, newPw) {
    const result = await superApi.updatePlacePassword(slug, newPw)
    setFlash({ type: 'success', message: result.message })
    setEditingSlug(null)
  }

  async function handleSyncUrlUpdate(slug, url) {
    const result = await superApi.updatePlaceSyncUrl(slug, url)
    setFlash({ type: 'success', message: result.message })
    setSyncSlug(null)
    loadPlaces() // 동기화 상태 컬럼 갱신
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <SuperHeader />

      <main className="px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-bold text-stone-900">기관 관리</h1>
        <p className="mt-2 text-sm text-stone-600">
          기관을 추가, 삭제하거나 비밀번호·재단 동기화 URL을 변경할 수 있습니다.
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

        {/* 신규 기관 추가 폼 */}
        <section className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">신규 기관 추가</h2>
          <p className="mt-1 text-xs text-stone-500">
            슬러그(영문이름)는 URL과 DB 파일명에 사용됩니다. 한 번 정하면 바꿀 수 없으니 신중히.
          </p>
          <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="슬러그 (영문이름)" required>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                placeholder="nareum"
                required
                pattern="^[a-z][a-z0-9_-]{1,29}$"
                title="영문 소문자로 시작하는 2~30자 (a-z, 0-9, -, _)"
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="비밀번호" required>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6자 이상"
                required
                minLength={6}
                className={inputClass}
              />
            </Field>
            <Field label="풀네임" required>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="나름청소년활동센터"
                required
                className={inputClass}
              />
            </Field>
            <Field label="축약별칭" required>
              <input
                type="text"
                value={newShortName}
                onChange={(e) => setNewShortName(e.target.value)}
                placeholder="나름"
                required
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="재단 동기화 스크립트 URL (선택)">
                <input
                  type="url"
                  value={newSyncUrl}
                  onChange={(e) => setNewSyncUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec  (비워두면 동기화 안 함)"
                  className={`${inputClass} font-mono text-xs`}
                />
              </Field>
              <p className="mt-1 text-xs text-stone-500">
                동아리 활동일지 저장 시 재단 구글시트로 자동 전송할 Apps Script 웹앱 주소입니다.
                나중에 기관 목록에서 등록·수정할 수도 있습니다.
              </p>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="rounded-md bg-stone-900 px-6 py-2 font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {adding ? '추가 중…' : '추가하기'}
              </button>
            </div>
          </form>
        </section>

        {/* 기관 목록 표 */}
        <h2 className="mt-12 text-xl font-bold text-stone-900">기관 목록</h2>
        {loading ? (
          <p className="mt-4 text-stone-500">불러오는 중…</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-left">
                <tr>
                  <Th>슬러그</Th>
                  <Th>풀네임</Th>
                  <Th>축약별칭</Th>
                  <Th className="text-center">실적링크</Th>
                  <Th>생성일시</Th>
                  <Th className="w-72 text-center">관리</Th>
                </tr>
              </thead>
              <tbody>
                {places.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                      아직 등록된 기관이 없습니다.
                    </td>
                  </tr>
                ) : (
                  places.map((place) => (
                    <PlaceRow
                      key={place.slug}
                      place={place}
                      editing={editingSlug === place.slug}
                      syncEditing={syncSlug === place.slug}
                      deleting={deletingSlug === place.slug}
                      onStartEdit={() => {
                        setSyncSlug(null)
                        setEditingSlug(place.slug)
                      }}
                      onCancelEdit={() => setEditingSlug(null)}
                      onStartSyncEdit={() => {
                        setEditingSlug(null)
                        setSyncSlug(place.slug)
                      }}
                      onCancelSyncEdit={() => setSyncSlug(null)}
                      onPasswordUpdate={(pw) =>
                        handlePasswordUpdate(place.slug, pw)
                      }
                      onSyncUrlUpdate={(url) =>
                        handleSyncUrlUpdate(place.slug, url)
                      }
                      onDelete={() => handleDelete(place)}
                      onFlashError={(msg) =>
                        setFlash({ type: 'error', message: msg })
                      }
                    />
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

/* ---------- 한 행 컴포넌트 ---------- */

function PlaceRow({
  place,
  editing,
  syncEditing,
  deleting,
  onStartEdit,
  onCancelEdit,
  onStartSyncEdit,
  onCancelSyncEdit,
  onPasswordUpdate,
  onSyncUrlUpdate,
  onDelete,
  onFlashError,
}) {
  const synced = !!(place.foundation_sync_url || '').trim()
  return (
    <>
      <tr className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
        <Td className="font-mono">{place.slug}</Td>
        <Td className="font-medium">{place.full_name}</Td>
        <Td>{place.short_name}</Td>
        <Td className="text-center">
          {synced ? (
            <span
              title={place.foundation_sync_url}
              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
            >
              ● 입력함
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
              ○ 미설정
            </span>
          )}
        </Td>
        <Td className="whitespace-nowrap text-stone-500">{place.created_at}</Td>
        <Td>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={`/${place.slug}/setting`}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100"
            >
              관리 페이지 ↗
            </a>
            <button
              type="button"
              onClick={syncEditing ? onCancelSyncEdit : onStartSyncEdit}
              className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100"
            >
              {syncEditing ? '취소' : '동기화 URL'}
            </button>
            <button
              type="button"
              onClick={editing ? onCancelEdit : onStartEdit}
              className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100"
            >
              {editing ? '취소' : '비번 변경'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>
        </Td>
      </tr>
      {/* 펼침 폼은 해당 상태일 때만 mount -> 입력값 자동 청소 */}
      {syncEditing && (
        <SyncUrlEditForm
          slug={place.slug}
          currentUrl={place.foundation_sync_url || ''}
          onCancel={onCancelSyncEdit}
          onSubmit={onSyncUrlUpdate}
          onError={onFlashError}
        />
      )}
      {editing && (
        <PasswordEditForm
          slug={place.slug}
          onCancel={onCancelEdit}
          onSubmit={onPasswordUpdate}
          onError={onFlashError}
        />
      )}
    </>
  )
}

function SyncUrlEditForm({ slug, currentUrl, onCancel, onSubmit, onError }) {
  const [url, setUrl] = useState(currentUrl)
  const [submitting, setSubmitting] = useState(false)

  function isValid(u) {
    const s = (u || '').trim()
    if (!s) return true // 빈값 = 동기화 해제 허용
    return (
      s.startsWith('https://') &&
      s.includes('script.google.com/macros/') &&
      s.endsWith('/exec')
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid(url)) {
      onError(
        'Apps Script 웹앱 주소 형식이어야 합니다. (https://script.google.com/macros/s/.../exec)'
      )
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(url.trim())
    } catch (err) {
      onError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <tr className="bg-stone-50">
      <td colSpan={6} className="px-4 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="whitespace-nowrap font-mono text-sm text-stone-700">
              <span className="text-stone-500">slug:</span> {slug}
            </span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className={`${inputClass} flex-1 font-mono text-xs`}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {submitting ? '저장 중…' : '저장'}
              </button>
              {currentUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="rounded border border-amber-300 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                >
                  비우기(해제)
                </button>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100"
              >
                취소
              </button>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            동아리 활동일지 저장 시 재단 구글시트로 자동 전송할 Apps Script /exec 주소입니다.
            빈칸으로 저장하면 이 기관의 재단 동기화가 꺼집니다.
          </p>
        </form>
      </td>
    </tr>
  )
}

function PasswordEditForm({ slug, onCancel, onSubmit, onError }) {
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPw.length < 6) {
      onError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (newPw !== confirmPw) {
      onError('두 비밀번호가 일치하지 않습니다.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(newPw)
    } catch (err) {
      onError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <tr className="bg-stone-50">
      <td colSpan={6} className="px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <span className="font-mono text-sm text-stone-700">
            <span className="text-stone-500">slug:</span> {slug}
          </span>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="새 비밀번호 (6자 이상)"
            required
            minLength={6}
            className={`${inputClass} flex-1`}
          />
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="확인"
            required
            minLength={6}
            className={`${inputClass} flex-1`}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {submitting ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100"
            >
              취소
            </button>
          </div>
        </form>
      </td>
    </tr>
  )
}

/* ---------- 보조 컴포넌트 ---------- */

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
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

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600'