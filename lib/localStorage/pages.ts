export type Page = {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  emoji?: string
  content: string
  type: 'page' | 'folder'
  order: number
  createdAt: string
  updatedAt: string
}

export type PageTreeNode = Page & { children: PageTreeNode[] }

function key(workspaceId: string) { return `bcb-pages-${workspaceId}` }

export function getPages(workspaceId: string): Page[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key(workspaceId)) || '[]')
  } catch { return [] }
}

export function getPage(workspaceId: string, pageId: string): Page | null {
  return getPages(workspaceId).find(p => p.id === pageId) ?? null
}

function save(workspaceId: string, pages: Page[]) {
  localStorage.setItem(key(workspaceId), JSON.stringify(pages))
}

export function createPage(data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Page {
  const pages = getPages(data.workspaceId)
  const page: Page = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  save(data.workspaceId, [...pages, page])
  return page
}

export function updatePage(workspaceId: string, id: string, data: Partial<Page>): Page {
  const pages = getPages(workspaceId).map(p =>
    p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
  )
  save(workspaceId, pages)
  return pages.find(p => p.id === id)!
}

export function deletePage(workspaceId: string, id: string, cascade = true): void {
  let pages = getPages(workspaceId)
  if (cascade) {
    const toDelete = new Set<string>()
    const collect = (pid: string) => {
      toDelete.add(pid)
      pages.filter(p => p.parentId === pid).forEach(p => collect(p.id))
    }
    collect(id)
    pages = pages.filter(p => !toDelete.has(p.id))
  } else {
    pages = pages.filter(p => p.id !== id)
  }
  save(workspaceId, pages)
}

export function duplicatePage(workspaceId: string, id: string): Page {
  const source = getPages(workspaceId).find(p => p.id === id)
  if (!source) throw new Error('Page not found')
  return createPage({
    workspaceId,
    parentId: source.parentId,
    type: source.type,
    order: source.order + 0.5,
    title: source.title + ' (복사본)',
    content: source.content,
  })
}

export function reorderPages(workspaceId: string, updated: Page[]): void {
  const pages = getPages(workspaceId)
  const map = new Map(updated.map(p => [p.id, p]))
  const merged = pages.map(p => map.get(p.id) ?? p)
  save(workspaceId, merged)
}

export function buildTree(pages: Page[]): PageTreeNode[] {
  const map = new Map<string, PageTreeNode>()
  pages.forEach(p => map.set(p.id, { ...p, children: [] }))
  const roots: PageTreeNode[] = []
  pages
    .sort((a, b) => a.order - b.order)
    .forEach(p => {
      const node = map.get(p.id)!
      if (p.parentId && map.has(p.parentId)) {
        map.get(p.parentId)!.children.push(node)
      } else {
        roots.push(node)
      }
    })
  return roots
}
