const KEY = 'bcb-theme'

export function getTheme(): string {
  if (typeof window === 'undefined') return 'midnight'
  return localStorage.getItem(KEY) || 'midnight'
}

export function setTheme(theme: string): void {
  localStorage.setItem(KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}
