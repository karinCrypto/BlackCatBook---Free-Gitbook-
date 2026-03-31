export type Workspace = {
  id: string
  name: string
  type: 'tech_docs' | 'blog' | 'portfolio'
  theme: string
  description?: string
  emoji?: string
  createdAt: string
}

const KEY = 'bcb-workspaces'

export function getWorkspaces(): Workspace[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function getWorkspace(id: string): Workspace | null {
  return getWorkspaces().find(w => w.id === id) ?? null
}

export function createWorkspace(data: Omit<Workspace, 'id' | 'createdAt'>): Workspace {
  const ws: Workspace = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  const all = getWorkspaces()
  localStorage.setItem(KEY, JSON.stringify([ws, ...all]))
  return ws
}

export function updateWorkspace(id: string, data: Partial<Workspace>): Workspace {
  const all = getWorkspaces().map(w => w.id === id ? { ...w, ...data } : w)
  localStorage.setItem(KEY, JSON.stringify(all))
  return all.find(w => w.id === id)!
}

export function deleteWorkspace(id: string): void {
  const all = getWorkspaces().filter(w => w.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
  localStorage.removeItem(`bcb-pages-${id}`)
}
