// 노트 템플릿 갤러리 — 선택하면 해당 구조의 새 페이지가 즉시 생성된다.
export type NoteTemplate = {
  id: string
  emoji: string
  label: string
  desc: string
  title: string
  html: string
}

const days = ['월', '화', '수', '목', '금', '토', '일']

const studentTimetable = () => {
  const header = `<tr><th>교시</th>${days.slice(0, 5).map(d => `<th>${d}</th>`).join('')}</tr>`
  const rows = Array.from({ length: 7 }, (_, i) =>
    `<tr><td><strong>${i + 1}교시</strong></td>${days.slice(0, 5).map(() => '<td>&nbsp;</td>').join('')}</tr>`
  ).join('')
  return `<table>${header}${rows}</table>`
}

const weekRows = () => days.map(d => `<tr><td><strong>${d}</strong></td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'student',
    emoji: '🎒',
    label: '학생 스케줄러',
    desc: '주간 시간표 + 공부 기록 + 목표',
    title: '📅 이번 주 공부 플래너',
    html: [
      '<h1>📅 이번 주 공부 플래너</h1>',
      '<h2>🗓️ 주간 시간표</h2>',
      studentTimetable(),
      '<h2>⏱️ 오늘의 공부 기록</h2>',
      '<ul>',
      '<li>☐ 영어 — 목표 2시간 / 실제 __ 시간</li>',
      '<li>☐ 수학 — 목표 1시간 30분 / 실제 __ 시간</li>',
      '<li>☐ 국어 — 목표 1시간 / 실제 __ 시간</li>',
      '</ul>',
      '<h2>🎯 이번 주 목표</h2>',
      '<ol><li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li></ol>',
      '<h2>🌙 하루 회고</h2>',
      '<p>오늘 가장 집중이 잘 된 시간대는? 내일 고칠 한 가지는?</p>',
    ].join('\n'),
  },
  {
    id: 'worker',
    emoji: '💼',
    label: '직장인 데일리 플래너',
    desc: '시간블록 + 우선순위 3 + 회의 메모',
    title: '💼 오늘의 업무 플래너',
    html: [
      '<h1>💼 오늘의 업무 플래너</h1>',
      '<h2>🔥 오늘의 우선순위 TOP 3</h2>',
      '<ol><li><strong>1순위:</strong>&nbsp;</li><li><strong>2순위:</strong>&nbsp;</li><li><strong>3순위:</strong>&nbsp;</li></ol>',
      '<h2>⏰ 시간 블록</h2>',
      '<table><tr><th>시간</th><th>할 일</th><th>완료</th></tr>',
      ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => `<tr><td>${t}</td><td>&nbsp;</td><td>☐</td></tr>`).join(''),
      '</table>',
      '<h2>📝 회의 메모</h2>',
      '<p><strong>회의명:</strong> / <strong>참석:</strong> / <strong>결정사항:</strong></p>',
      '<h2>✅ 퇴근 전 체크</h2>',
      '<ul><li>☐ 내일 첫 업무 정하기</li><li>☐ 받은편지함 비우기</li><li>☐ 오늘 성과 한 줄 기록</li></ul>',
    ].join('\n'),
  },
  {
    id: 'kanban',
    emoji: '📋',
    label: '트렐로형 칸반 보드',
    desc: '할 일 / 진행 중 / 완료 3열 보드',
    title: '📋 칸반 보드',
    html: [
      '<h1>📋 칸반 보드</h1>',
      '<p>카드를 완료하면 오른쪽 열로 옮기세요. (행 복사 → 붙여넣기)</p>',
      '<table>',
      '<tr><th>🔴 할 일 (To Do)</th><th>🟡 진행 중 (Doing)</th><th>🟢 완료 (Done)</th></tr>',
      '<tr><td>• 새 카드 작성</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
      '<tr><td>• &nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
      '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
      '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
      '</table>',
      '<h2>🗒️ 백로그</h2>',
      '<ul><li>아이디어를 여기 쌓아두고 준비되면 보드로 올리세요</li></ul>',
    ].join('\n'),
  },
  {
    id: 'structured',
    emoji: '🗂️',
    label: '구조화 문서',
    desc: '목적-배경-핵심-액션 구조 뷰',
    title: '🗂️ 구조화 문서',
    html: [
      '<h1>🗂️ 제목을 입력하세요</h1>',
      '<h2>1. 목적 (Why)</h2><p>이 문서가 존재하는 이유 한 문장.</p>',
      '<h2>2. 배경 (Context)</h2><p>알아야 할 전후 맥락.</p>',
      '<h2>3. 핵심 내용 (What)</h2>',
      '<ul><li><strong>포인트 1:</strong>&nbsp;</li><li><strong>포인트 2:</strong>&nbsp;</li><li><strong>포인트 3:</strong>&nbsp;</li></ul>',
      '<h2>4. 액션 아이템 (Next)</h2>',
      '<table><tr><th>할 일</th><th>담당</th><th>기한</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>',
    ].join('\n'),
  },
  {
    id: 'weekly',
    emoji: '🗓️',
    label: '주간 리뷰',
    desc: '요일별 로그 + 주간 회고',
    title: '🗓️ 주간 리뷰',
    html: [
      '<h1>🗓️ 주간 리뷰</h1>',
      '<h2>이번 주 한 줄 목표</h2><p>&nbsp;</p>',
      '<h2>요일별 기록</h2>',
      `<table><tr><th>요일</th><th>한 일</th><th>메모</th></tr>${weekRows()}</table>`,
      '<h2>돌아보기</h2>',
      '<ul><li><strong>잘한 것:</strong>&nbsp;</li><li><strong>아쉬운 것:</strong>&nbsp;</li><li><strong>다음 주에 시도할 것:</strong>&nbsp;</li></ul>',
    ].join('\n'),
  },
  {
    id: 'study',
    emoji: '📚',
    label: '스터디 노트',
    desc: '개념-예시-질문-복습 체크',
    title: '📚 스터디 노트',
    html: [
      '<h1>📚 오늘 배운 것</h1>',
      '<h2>핵심 개념</h2><p>내 말로 다시 설명해보기 (설명 못 하면 모르는 것!)</p>',
      '<h2>예시 / 코드</h2><pre><code># 여기에 예시를 적어보세요</code></pre>',
      '<h2>❓ 아직 헷갈리는 것</h2><ul><li>&nbsp;</li></ul>',
      '<h2>🔁 복습 체크</h2>',
      '<ul><li>☐ 1일 후 복습</li><li>☐ 3일 후 복습</li><li>☐ 7일 후 복습</li></ul>',
    ].join('\n'),
  },
]
