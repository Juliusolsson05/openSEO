import type { ReactNode } from 'react'

import type { ExampleElement } from '../_lib/types'
import { BarChart } from './elements/BarChart'
import { CallToAction } from './elements/CallToAction'
import { CaseStudy } from './elements/CaseStudy'
import { Checklist } from './elements/Checklist'
import { CodeBlock } from './elements/CodeBlock'
import { Conclusion } from './elements/Conclusion'
import { ContextBlock } from './elements/ContextBlock'
import { CtaBlock } from './elements/CtaBlock'
import { Fallback } from './elements/Fallback'
import { Faq } from './elements/Faq'
import { FeaturedSnippet } from './elements/FeaturedSnippet'
import { Glossary } from './elements/Glossary'
import { ImageElement } from './elements/Image'
import { Introduction } from './elements/Introduction'
import { ListParagraph } from './elements/ListParagraph'
import { NumberedList } from './elements/NumberedList'
import { Paragraph } from './elements/Paragraph'
import { ProductRecommendations } from './elements/ProductRecommendations'
import { ProsAndCons } from './elements/ProsAndCons'
import { Quote } from './elements/Quote'
import { SnippetBlock } from './elements/SnippetBlock'
import { Statistic } from './elements/Statistic'
import { Table } from './elements/Table'
import { Timeline } from './elements/Timeline'
import { ToolRecommendation } from './elements/ToolRecommendation'
import { Versus } from './elements/Versus'

type PostRendererProps = {
  elements: ExampleElement[]
}

export function PostRenderer({ elements }: PostRendererProps) {
  const ordered = [...elements].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-8">
      {ordered.map((element) => {
        const key = element.id
        const c = element.content as Record<string, any>
        const type = element.element_type.toLowerCase()

        let rendered: ReactNode

        switch (type) {
          case 'paragraph':
            rendered = <Paragraph title={c.title} text={c.text} />
            break
          case 'introduction':
            rendered = <Introduction title={c.title} text={c.text} />
            break
          case 'conclusion':
            rendered = <Conclusion title={c.title} text={c.text} />
            break
          case 'faq':
            rendered = <Faq title={c.title} items={c.items || []} />
            break
          case 'table':
            rendered = <Table title={c.title} headers={c.headers || []} rows={c.rows || []} />
            break
          case 'list_paragraph':
            rendered = <ListParagraph title={c.title} items={c.items || []} text_after_list={c.text_after_list} />
            break
          case 'numbered_list_paragraph':
            rendered = <NumberedList title={c.title} items={c.items || []} />
            break
          case 'image':
            rendered = <ImageElement alt={c.alt} caption={c.caption} url={c.url} />
            break
          case 'quote':
            rendered = <Quote text={c.text} attribution={c.attribution} />
            break
          case 'code_cluster':
            rendered = <CodeBlock title={c.title} code={c.code} language={c.language} />
            break
          case 'call_to_action':
            rendered = (
              <CallToAction
                title={c.title}
                text={c.text}
                button_label={c.button_label || c.button_text}
                button_href={c.button_href || c.button_url}
              />
            )
            break
          case 'cta':
            rendered = (
              <CtaBlock
                title={c.title}
                description={c.description}
                link={c.link}
                image_url={c.image_url}
                target_url={c.target_url}
              />
            )
            break
          case 'statistic':
            rendered = <Statistic value={c.value} label={c.label} description={c.description} />
            break
          case 'bar_chart':
            rendered = <BarChart title={c.title} labels={c.labels || []} datasets={c.datasets || []} description={c.description} />
            break
          case 'pros_and_cons':
            rendered = <ProsAndCons title={c.title} pros={c.pros || []} cons={c.cons || []} />
            break
          case 'timeline':
            rendered = <Timeline title={c.title} items={c.items || []} />
            break
          case 'checklist':
            rendered = <Checklist title={c.title} introduction={c.introduction} items={c.items || []} />
            break
          case 'case_study':
            rendered = <CaseStudy title={c.title} problem={c.problem} solution={c.solution} result={c.result} />
            break
          case 'snippet_block':
          case 'list_snippet_block':
            rendered = <SnippetBlock title={c.title} text={c.text} />
            break
          case 'featured_snippet_block':
            rendered = <FeaturedSnippet title={c.title} text={c.text} />
            break
          case 'context':
            rendered = <ContextBlock title={c.title} text={c.text} />
            break
          case 'versus':
            rendered = <Versus title={c.title} option_a={c.option_a} option_b={c.option_b} />
            break
          case 'product_recommendations':
          case 'affiliate_recommendations':
            rendered = <ProductRecommendations title={c.title} introduction={c.introduction} products={c.products || []} />
            break
          case 'tool_recommendation':
            rendered = <ToolRecommendation name={c.name} description={c.description} use_case={c.use_case} url={c.url} />
            break
          case 'glossary':
            rendered = <Glossary title={c.title} items={c.items || []} />
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
