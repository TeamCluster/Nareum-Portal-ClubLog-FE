import { useEffect } from 'react'

const DEFAULT_TITLE = '동아리 활동일지'

/**
 * 페이지가 마운트된 동안 document.title 을 설정합니다.
 *
 * 사용 예:
 *   useDocumentTitle('활동일지 총괄관리 페이지')
 *   useDocumentTitle(info ? `${info.short_name} 동아리 활동일지` : null)
 *
 * title 이 falsy 면(아직 로드 중) 기본값 유지.
 * 컴포넌트가 언마운트되면 기본값으로 되돌림.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title
    }
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}