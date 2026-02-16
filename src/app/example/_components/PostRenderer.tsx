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
            rendered = (
              <Table
                title={c.title}
                headers={c.headers || c.columns || []}
                rows={c.rows || []}
                text_before={c.text_before}
                text_after={c.text_after}
              />
            )
            break
          case 'list_paragraph':
            rendered = (
              <ListParagraph
                title={c.title}
                items={c.items || c.list_items || []}
                text_before_list={c.text_before_list}
                text_after_list={c.text_after_list}
              />
            )
            break
          case 'numbered_list_paragraph':
            rendered = <NumberedList title={c.title} items={c.items || c.list_items || []} />
            break
          case 'image':
            rendered = <ImageElement alt={c.alt} caption={c.caption} url={c.url} />
            break
          case 'quote':
            rendered = <Quote text={c.text || c.quote} attribution={c.attribution || c.person} description={c.description} />
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
            rendered = <Statistic value={c.value || `${c.percentage}%`} label={c.label || c.title} description={c.description} />
            break
          case 'bar_chart':
            rendered = <BarChart title={c.title} labels={c.labels || []} datasets={c.datasets || []} description={c.description} />
            break
          case 'pros_and_cons':
            rendered = <ProsAndCons title={c.title} pros={c.pros || []} cons={c.cons || []} text_before={c.text_before} text_after={c.text_after} />
            break
          case 'timeline':
            rendered = <Timeline title={c.title} items={c.items || c.events || []} />
            break
          case 'checklist':
            rendered = <Checklist title={c.title} introduction={c.introduction} items={c.items || []} />
            break
          case 'case_study':
            rendered = (
              <CaseStudy
                title={c.title}
                problem={c.problem || c.challenge}
                solution={c.solution}
                result={c.result || (Array.isArray(c.results) ? c.results.join('. ') : c.results)}
                clientName={c.clientName}
                industry={c.industry}
                headerColor={c.headerColor}
                results={Array.isArray(c.results) ? c.results : undefined}
                testimonial={c.testimonial}
              />
            )
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
          case 'versus': {
            // Map Aurora's competitors/criteria format to option_a/option_b
            let optA = c.option_a
            let optB = c.option_b
            if (!optA && c.competitors && c.criteria) {
              optA = { name: c.competitors[0], points: c.criteria.map((cr: any) => cr.details?.[0] || '') }
              optB = { name: c.competitors[1], points: c.criteria.map((cr: any) => cr.details?.[1] || '') }
            }
            rendered = (
              <Versus
                title={c.title}
                option_a={optA || { name: '', points: [] }}
                option_b={optB || { name: '', points: [] }}
                criteria={Array.isArray(c.criteria) ? c.criteria : []}
              />
            )
            break
          }
          case 'product_recommendations':
          case 'affiliate_recommendations':
            rendered = <ProductRecommendations title={c.title} introduction={c.introduction} products={c.products || []} />
            break
          case 'tool_recommendation':
            rendered = <ToolRecommendation name={c.name || c.title} description={c.description || c.productDescription} use_case={c.use_case || c.pricing} url={c.url || c.companyUrl} />
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
