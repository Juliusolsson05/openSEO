import type { ReactNode } from 'react'

import type { ExampleElement } from '../_lib/types'
import { CallToAction } from './elements/CallToAction'
import { CodeBlock } from './elements/CodeBlock'
import { Conclusion } from './elements/Conclusion'
import { Fallback } from './elements/Fallback'
import { Faq } from './elements/Faq'
import { ImageElement } from './elements/Image'
import { Introduction } from './elements/Introduction'
import { ListParagraph } from './elements/ListParagraph'
import { Paragraph } from './elements/Paragraph'
import { Quote } from './elements/Quote'
import { Table } from './elements/Table'

type PostRendererProps = {
  elements: ExampleElement[]
}

export function PostRenderer({ elements }: PostRendererProps) {
  const ordered = [...elements].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-8">
      {ordered.map((element) => {
        const key = element.id
        const content = element.content

        let rendered: ReactNode

        switch (element.element_type) {
          case 'paragraph':
            rendered = <Paragraph title={content.title} text={content.text} />
            break
          case 'introduction':
            rendered = <Introduction title={content.title} text={content.text} />
            break
          case 'conclusion':
            rendered = <Conclusion title={content.title} text={content.text} />
            break
          case 'faq':
            rendered = <Faq title={content.title} items={content.items || []} />
            break
          case 'table':
            rendered = <Table title={content.title} headers={content.headers || []} rows={content.rows || []} />
            break
          case 'list_paragraph':
            rendered = <ListParagraph title={content.title} items={content.items || []} />
            break
          case 'image':
            rendered = <ImageElement alt={content.alt} caption={content.caption} />
            break
          case 'quote':
            rendered = <Quote text={content.text} attribution={content.attribution} />
            break
          case 'code_cluster':
            rendered = <CodeBlock title={content.title} code={content.code} language={content.language} />
            break
          case 'call_to_action':
            rendered = (
              <CallToAction
                title={content.title}
                text={content.text}
                button_label={content.button_label}
                button_href={content.button_href}
              />
            )
            break
          default:
            rendered = <Fallback elementType={element.element_type} />
        }

        return (
          <div key={key} id={key}>
            {rendered}
          </div>
        )
      })}
    </div>
  )
}
