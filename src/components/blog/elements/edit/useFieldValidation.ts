import type { EditField } from '../types'

export function useFieldValidation(field: EditField, value: any) {
  const errors: string[] = []

  for (const rule of field.validation ?? []) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) errors.push(rule.message)
        break
      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value ?? 0)) errors.push(rule.message)
        break
      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value ?? 0)) errors.push(rule.message)
        break
      case 'min':
        if (typeof value === 'number' && value < (rule.value ?? 0)) errors.push(rule.message)
        break
      case 'max':
        if (typeof value === 'number' && value > (rule.value ?? 0)) errors.push(rule.message)
        break
      case 'url':
        if (typeof value === 'string' && value && !/^https?:\/\//.test(value)) errors.push(rule.message)
        break
      case 'hexColor':
        if (typeof value === 'string' && value && !/^#[0-9a-fA-F]{3,8}$/.test(value)) errors.push(rule.message)
        break
      default:
        break
    }
  }

  return errors
}
