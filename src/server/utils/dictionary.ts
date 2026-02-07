export function toDjangoDictionaryStatus(status: string | null | undefined) {
  if (!status) return status
  return status.toLowerCase()
}
