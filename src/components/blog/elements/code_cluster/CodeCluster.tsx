'use client'

import { useMemo, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown } from '@/lib/markdown'

type CodeClusterContent = {
  title?: string
  description?: string
}

const createHyperlinkedText = (text: string, _keywords: any[]): string => {
  return text
}

const formatDescription = (value: string) => {
  let text = value
  text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return text
}

export function CodeCluster({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [showDetails, setShowDetails] = useState(false)
  const parsedContent = (content ?? {}) as CodeClusterContent

  const formattedTitle = useMemo(() => {
    return renderMarkdown(createHyperlinkedText(parsedContent.title ?? '', []))
  }, [parsedContent.title])

  const formattedDescription = useMemo(() => {
    const text = formatDescription(parsedContent.description ?? '')
    return renderMarkdown(createHyperlinkedText(text, []))
  }, [parsedContent.description])

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div
        className={`cursor-pointer transition-all duration-300 ease-in-out ${showDetails ? 'shadow-[0_4px_6px_rgba(0,0,0,0.1)]' : ''}`}
        onClick={() => setShowDetails((prev) => !prev)}
      >
        <div className="mb-[15px] rounded border-2 border-[#ef5350] bg-[#ffebee] p-[15px]">
          <h3 className="mb-3 text-xl font-semibold text-[#c62828]">Unfilled Code Cluster</h3>
          <p className="font-medium text-[#b71c1c]">Click to see future content</p>
        </div>

        {showDetails && (
          <div className="mt-[15px] rounded border border-[#e0e0e0] bg-[#f5f5f5] p-[15px]">
            <h4
              className="custom-content mb-2 text-xl font-medium text-[#213343]"
              dangerouslySetInnerHTML={{ __html: formattedTitle }}
            />
            <div
              className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-[#213343]"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
          </div>
        )}
      </div>
    </BaseElement>
  )
}
