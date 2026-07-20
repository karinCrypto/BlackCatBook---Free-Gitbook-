export type PdfBook = {
  id: string
  workspaceId: string
  title: string
  fileName: string
  dataUrl: string   // base64 data URL
  pageCount: number
  addedAt: string
}

function key(workspaceId: string) { return `bcb-pdfs-${workspaceId}` }

export function getPdfBooks(workspaceId: string): PdfBook[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key(workspaceId)) || '[]')
  } catch { return [] }
}

export function savePdfBook(book: Omit<PdfBook, 'id' | 'addedAt'>): PdfBook {
  const books = getPdfBooks(book.workspaceId)
  const newBook: PdfBook = {
    ...book,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  }
  localStorage.setItem(key(book.workspaceId), JSON.stringify([...books, newBook]))
  return newBook
}

export function deletePdfBook(workspaceId: string, id: string): void {
  const books = getPdfBooks(workspaceId).filter(b => b.id !== id)
  localStorage.setItem(key(workspaceId), JSON.stringify(books))
}

export function updatePdfBook(workspaceId: string, id: string, data: Partial<Pick<PdfBook, 'title' | 'pageCount'>>): void {
  const books = getPdfBooks(workspaceId).map(b => b.id === id ? { ...b, ...data } : b)
  localStorage.setItem(key(workspaceId), JSON.stringify(books))
}
