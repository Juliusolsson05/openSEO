'use client'

import { ArrayObjectFieldInput } from './ArrayObjectField'
import type { EditField } from '../../types'

interface Props {
  field: EditField
  value: any
  onChange: (value: any[]) => void
}

const faqArrayField: EditField = {
  type: 'array-object',
  label: 'FAQ',
  fields: {
    question: {
      type: 'text',
      label: 'Question',
      description: 'What is the FAQ question?',
      required: true,
    },
    answer: {
      type: 'rich-text',
      label: 'Answer',
      description: 'The answer to the FAQ question',
      required: true,
    },
  },
  minItems: 4,
  description: 'Common questions related to the post and their answers',
}

const transformToPlainObjects = (data: any): any[] => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.values(data).map((item: any) => {
      try {
        const rawItem = item?.$target || item
        return {
          question: rawItem?.question ?? '',
          answer: rawItem?.answer ?? '',
        }
      } catch {
        return { question: '', answer: '' }
      }
    })
  }

  if (Array.isArray(data)) {
    return data.map((item: any) => ({
      question: item?.question ?? '',
      answer: item?.answer ?? '',
    }))
  }

  return []
}

const transformToOriginalStructure = (data: any): any[] => {
  if (!Array.isArray(data)) return []
  return data.map((item: any) => ({
    question: item?.question ?? '',
    answer: item?.answer ?? '',
  }))
}

export function FaqFieldInput({ field, value, onChange }: Props) {
  const localValue = (() => {
    try {
      const transformed = transformToPlainObjects(value)
      return JSON.parse(JSON.stringify(transformed))
    } catch {
      return []
    }
  })()

  const faqFieldConfig: EditField = {
    ...faqArrayField,
    label: field.label,
    validation: field.validation,
    required: field.required,
  }

  const updateFAQ = (nextValue: any) => {
    onChange(transformToOriginalStructure(nextValue))
  }

  return <ArrayObjectFieldInput field={faqFieldConfig} value={localValue} onChange={updateFAQ} />
}
