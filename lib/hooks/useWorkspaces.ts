'use client'
import { useState, useEffect } from 'react'
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, type Workspace } from '@/lib/localStorage/workspaces'

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  useEffect(() => {
    setWorkspaces(getWorkspaces())
    const onStorage = () => setWorkspaces(getWorkspaces())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function refresh() { setWorkspaces(getWorkspaces()) }

  return {
    workspaces,
    createWorkspace: (data: Omit<Workspace, 'id' | 'createdAt'>) => {
      const ws = createWorkspace(data); refresh(); return ws
    },
    updateWorkspace: (id: string, data: Partial<Workspace>) => {
      const ws = updateWorkspace(id, data); refresh(); return ws
    },
    deleteWorkspace: (id: string) => { deleteWorkspace(id); refresh() },
  }
}
