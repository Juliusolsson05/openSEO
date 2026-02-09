'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { QuizContent } from '@/types/content-elements'

interface QuizProps extends Omit<ElementComponentProps, 'content'> {
  content: QuizContent
}

export function Quiz({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: QuizProps) {
  const questions = Array.isArray(content?.questions) ? content.questions : []

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      <div className="rounded-lg border border-border p-5">
        {content?.title ? (
          <h2
            className="mb-5 text-2xl font-semibold text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
          />
        ) : null}

        <div className="space-y-6">
          {questions.map((question, index) => {
            const options = Array.isArray(question?.options) ? question.options : []
            return (
              <div key={index}>
                <p className="mb-2 font-medium text-foreground">
                  <span>{index + 1}. </span>
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(question?.text || '') }} />
                </p>

                <ul className="space-y-1">
                  {options.map((option, optIndex) => (
                    <li key={optIndex} className="text-muted-foreground">
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {content?.description ? (
          <p
            className="mt-6 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.description) }}
          />
        ) : null}
      </div>
    </BaseElement>
  )
}
