'use client'

interface LinkedinPostProps {
  content: {
    elements?: Record<string, any>[]
  }
}

const getElementKey = (element: Record<string, any>) => Object.keys(element)[0]
const getElementType = (element: Record<string, any>) => getElementKey(element)?.split('_')[0]
const getHeadingLevel = (element: Record<string, any>) => {
  const lvl = Number(getElementKey(element)?.split('_')[1])
  return Number.isFinite(lvl) && lvl > 0 ? lvl : 1
}

export default function LinkedinPost({ content }: LinkedinPostProps) {
  const elements = content?.elements ?? []

  return (
    <div className="max-w-full overflow-x-hidden text-foreground" style={{ fontFamily: "-apple-system,system-ui,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue','Fira Sans',Ubuntu,Oxygen,'Oxygen Sans',Cantarell,'Droid Sans','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Lucida Grande',Helvetica,Arial,sans-serif", lineHeight: 1.5 }}>
      {elements.map((element, index) => {
        const key = getElementKey(element)
        const data = element?.[key]?.data ?? {}
        const type = getElementType(element)

        if (type === 'heading') {
          const level = getHeadingLevel(element)
          if (level === 1) return <h1 key={index} className="mb-4 text-[28px] font-semibold">{data.text}</h1>
          if (level === 2) return <h2 key={index} className="mb-3 mt-6 text-[24px] font-semibold">{data.text}</h2>
          return <h3 key={index} className="mb-2 mt-5 text-[20px] font-semibold">{data.text}</h3>
        }

        if (type === 'paragraph') {
          return <p key={index} className="mb-4 text-[13px]" dangerouslySetInnerHTML={{ __html: data.text || '' }} />
        }

        if (type === 'image') {
          return (
            <div key={index} className="mb-4">
              <img src={data.url} alt={data.alt || ''} className="h-auto max-w-full" />
              {data.caption ? <p className="mt-2 text-[12px] text-muted-foreground">{data.caption}</p> : null}
            </div>
          )
        }

        if (type === 'bullet') {
          return (
            <div key={index} className="mb-4">
              {data.title ? <h4 className="mb-2 text-[14px] font-semibold">{data.title}</h4> : null}
              {data.text_before_list ? <p className="mb-2 text-[13px]">{data.text_before_list}</p> : null}
              <ul className="mb-2 list-disc pl-6 text-[13px]">
                {(data.items ?? []).map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {data.text_after_list ? <p className="text-[13px]">{data.text_after_list}</p> : null}
            </div>
          )
        }

        if (type === 'link') {
          return (
            <a
              key={index}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-primary hover:underline"
            >
              {data.text}
            </a>
          )
        }

        return null
      })}
    </div>
  )
}
