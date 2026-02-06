'use client'

export function DefaultComponent() {
  return (
    <div className="p-5 bg-red-50 text-red-800 border border-red-200 rounded text-center">
      <h3 className="font-semibold">Component Not Found</h3>
      <p className="text-sm mt-1">The specified component for this element type is not available.</p>
    </div>
  )
}

export function DefaultLoading() {
  return (
    <div className="flex flex-col items-center p-5">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  )
}

export function DefaultPreview() {
  return (
    <div className="p-5 bg-blue-50 text-blue-800 border border-dashed border-blue-300 text-center rounded">
      <p className="text-sm">Preview for this element is not available.</p>
    </div>
  )
}
