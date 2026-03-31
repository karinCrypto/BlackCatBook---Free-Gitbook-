'use client'
import { useState, useEffect } from 'react'
import { getPages, createPage, updatePage, deletePage, reorderPages, duplicatePage, movePage, buildTree, type Page, type PageTreeNode } from '@/lib/localStorage/pages'

export function usePages(workspaceId: string) {
  const [pages, setPages] = useState<Page[]>([])
  const [tree, setTree] = useState<PageTreeNode[]>([])

  function refresh() {
    const p = getPages(workspaceId)
    setPages(p)
    setTree(buildTree(p))
  }

  useEffect(() => {
    refresh()
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [workspaceId])

  return {
    pages, tree,
    createPage: (data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
      const p = createPage(data); refresh(); return p
    },
    updatePage: (id: string, data: Partial<Page>) => {
      const p = updatePage(workspaceId, id, data); refresh(); return p
    },
    deletePage: (id: string) => { deletePage(workspaceId, id); refresh() },
    duplicatePage: (id: string) => { const p = duplicatePage(workspaceId, id); refresh(); return p },
    reorderPages: (updated: Page[]) => { reorderPages(workspaceId, updated); refresh() },
    movePage: (id: string, newParentId: string | null) => { movePage(workspaceId, id, newParentId); refresh() },
  }
}
