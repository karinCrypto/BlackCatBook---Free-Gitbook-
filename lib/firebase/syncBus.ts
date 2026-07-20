// localStorage 계층 → 클라우드 동기화 계층으로의 단방향 알림 버스.
// (sync.ts가 localStorage 모듈을 import하므로, 순환 참조를 피하기 위해 분리)
let listener: (() => void) | null = null

export function setSyncListener(fn: (() => void) | null) {
  listener = fn
}

export function notifyDataChanged() {
  if (listener) listener()
}
