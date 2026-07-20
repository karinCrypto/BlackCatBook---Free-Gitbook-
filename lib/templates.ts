// 노트 템플릿 갤러리 — 선택하면 해당 구조의 새 페이지가 즉시 생성된다.
export type TemplateVariant = { id: string; label: string; title: string; html: string }

export type NoteTemplate = {
  id: string
  emoji: string
  label: string
  desc: string
  title: string
  html: string
  variants?: TemplateVariant[]   // 있으면 드롭다운으로 종류 선택
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

// 시험 대비 템플릿 생성기 — 과목 목록만 넣으면 진도표·회독·오답노트 구조를 만든다
function examHtml(examName: string, subjects: string[]): string {
  return [
    `<h2>🎯 목표</h2>`,
    `<p><strong>시험:</strong> ${examName} / <strong>시험일:</strong> ____년 __월 __일 (D-___) / <strong>목표 점수:</strong>&nbsp;</p>`,
    '<h2>📚 과목별 진도표</h2>',
    '<table><tr><th>과목</th><th>교재/강의</th><th>진도율</th><th>1회독</th><th>2회독</th><th>3회독</th></tr>',
    subjects.map(s => `<tr><td><strong>${s}</strong></td><td>&nbsp;</td><td>___%</td><td>☐</td><td>☐</td><td>☐</td></tr>`).join(''),
    '</table>',
    '<h2>🗓️ 이번 주 학습 계획</h2>',
    `<table><tr><th>요일</th><th>과목</th><th>범위</th><th>완료</th></tr>${days.map(d => `<tr><td>${d}</td><td>&nbsp;</td><td>&nbsp;</td><td>☐</td></tr>`).join('')}</table>`,
    '<h2>❌ 오답노트</h2>',
    '<table><tr><th>과목</th><th>문제/개념</th><th>왜 틀렸나</th><th>다시 풀 날짜</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>',
    '<h2>🧠 모의고사 기록</h2>',
    '<table><tr><th>날짜</th><th>회차</th><th>점수</th><th>메모</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>',
  ].join('\n')
}

const PRO_EXAMS: [string, string, string[]][] = [
  ['bar', '변호사시험', ['공법', '민사법', '형사법', '선택과목']],
  ['cpa', '공인회계사(CPA)', ['회계학', '세법', '경영학', '경제원론', '상법']],
  ['tax', '세무사', ['재정학', '세법학개론', '회계학개론', '상법']],
  ['labor', '공인노무사', ['노동법', '민법', '사회보험법', '경영학/경제학']],
  ['appraiser', '감정평가사', ['민법', '경제학원론', '부동산학원론', '감정평가이론']],
  ['patent', '변리사', ['산업재산권법', '민법개론', '자연과학개론', '특허법']],
  ['gosi5', '5급 공채(행정고시)', ['언어논리(PSAT)', '자료해석(PSAT)', '상황판단(PSAT)', '전공과목']],
  ['doctor', '의사 국가고시', ['의학총론', '의학각론', '보건의약관계법규', '실기']],
  ['nurse', '간호사 국가고시', ['성인간호학', '모성/아동간호학', '지역사회간호학', '정신간호학', '간호관리학', '기본간호학']],
]

const CERT_EXAMS: [string, string, string[]][] = [
  ['engineer-info', '정보처리기사', ['소프트웨어 설계', '소프트웨어 개발', '데이터베이스 구축', '프로그래밍 언어 활용', '정보시스템 구축관리']],
  ['computer', '컴퓨터활용능력', ['컴퓨터 일반', '스프레드시트 일반', '데이터베이스 일반(1급)']],
  ['history', '한국사능력검정시험', ['전근대사', '근현대사', '시대 통합 주제']],
  ['toeic', 'TOEIC', ['LC Part 1-2', 'LC Part 3-4', 'RC Part 5-6', 'RC Part 7']],
  ['electric', '전기기사', ['전기자기학', '전력공학', '전기기기', '회로이론/제어공학', '전기설비기술기준']],
  ['safety', '산업안전기사', ['안전관리론', '인간공학', '기계위험방지', '전기위험방지', '화학설비안전', '건설안전']],
  ['sqld', 'SQLD', ['데이터 모델링의 이해', 'SQL 기본 및 활용']],
  ['cook', '조리기능사', ['위생 및 안전관리', '재료관리', '조리이론', '실기 레시피']],
]

const toVariants = (list: [string, string, string[]][]): TemplateVariant[] =>
  list.map(([id, name, subjects]) => ({ id, label: name, title: `🏆 ${name} 합격 플래너`, html: examHtml(name, subjects) }))

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'student',
    emoji: '🎒',
    label: '학생 스케줄러',
    desc: '주간 시간표 + 공부 기록 + 목표',
    title: '📅 이번 주 공부 플래너',
    html: [
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
    label: '칸반 보드',
    desc: '할 일 / 진행 중 / 완료 3열 보드 (개발자용)',
    title: '📋 칸반 보드',
    html: [
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
      '<h2>핵심 개념</h2><p>내 말로 다시 설명해보기 (설명 못 하면 모르는 것!)</p>',
      '<h2>예시 / 코드</h2><pre><code># 여기에 예시를 적어보세요</code></pre>',
      '<h2>❓ 아직 헷갈리는 것</h2><ul><li>&nbsp;</li></ul>',
      '<h2>🔁 복습 체크</h2>',
      '<ul><li>☐ 1일 후 복습</li><li>☐ 3일 후 복습</li><li>☐ 7일 후 복습</li></ul>',
    ].join('\n'),
  },
  {
    id: 'timetable',
    emoji: '⏰',
    label: '시간표',
    desc: '7일 × 시간대 풀 시간표',
    title: '⏰ 나의 시간표',
    html: [
      '<p>칸을 채우고, 과목/일정별로 <strong>굵게</strong>나 색으로 구분해보세요.</p>',
      `<table><tr><th>시간</th>${days.map(d => `<th>${d}</th>`).join('')}</tr>`,
      ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
        .map(t => `<tr><td><strong>${t}</strong></td>${days.map(() => '<td>&nbsp;</td>').join('')}</tr>`).join(''),
      '</table>',
      '<h2>📌 고정 일정</h2>',
      '<ul><li>&nbsp;</li><li>&nbsp;</li></ul>',
    ].join('\n'),
  },
  {
    id: 'saving',
    emoji: '💸',
    label: '짠테크 계산기',
    desc: '푼돈 모으기 + 목표 저축 계산',
    title: '💸 짠테크 계산기',
    html: [
      '<h2>☕ 푼돈의 힘 — 하루 지출이 1년이면?</h2>',
      '<table><tr><th>항목</th><th>하루</th><th>한 달 (×30)</th><th>1년 (×365)</th></tr>',
      '<tr><td>커피 1잔</td><td>5,000원</td><td>150,000원</td><td><strong>1,825,000원</strong></td></tr>',
      '<tr><td>택시 대신 대중교통</td><td>8,000원</td><td>240,000원</td><td><strong>2,920,000원</strong></td></tr>',
      '<tr><td>배달 대신 집밥</td><td>15,000원</td><td>450,000원</td><td><strong>5,475,000원</strong></td></tr>',
      '<tr><td>내가 줄일 것: ______</td><td>____원</td><td>×30 = ____원</td><td>×365 = ____원</td></tr>',
      '</table>',
      '<h2>🎯 목표 저축 역산</h2>',
      '<table><tr><th>목표</th><th>금액</th><th>기간</th><th>월 저축액 (금액÷개월)</th></tr>',
      '<tr><td>예: 비상금</td><td>3,000,000원</td><td>12개월</td><td><strong>250,000원/월</strong></td></tr>',
      '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>',
      '</table>',
      '<h2>✂️ 이번 달 자르기 챌린지</h2>',
      '<ul><li>☐ 구독 서비스 점검 (안 쓰는 것 해지)</li><li>☐ 무지출 데이 주 2회</li><li>☐ 장보기 전 냉장고 파먹기</li></ul>',
    ].join('\n'),
  },
  {
    id: 'ledger',
    emoji: '📒',
    label: '가계부',
    desc: '월 수입/지출 + 카테고리 결산',
    title: '📒 월 가계부',
    html: [
      '<h2>💰 이번 달 수입</h2>',
      '<table><tr><th>항목</th><th>금액</th></tr><tr><td>월급</td><td>&nbsp;</td></tr><tr><td>부수입</td><td>&nbsp;</td></tr><tr><td><strong>합계</strong></td><td>&nbsp;</td></tr></table>',
      '<h2>🧾 지출 기록</h2>',
      '<table><tr><th>날짜</th><th>내용</th><th>카테고리</th><th>금액</th></tr>',
      Array.from({ length: 6 }, () => '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>').join(''),
      '</table>',
      '<h2>📊 카테고리 결산</h2>',
      '<table><tr><th>카테고리</th><th>예산</th><th>실제</th><th>차이</th></tr>',
      ['식비', '교통', '주거/통신', '쇼핑', '문화/여가', '저축'].map(c => `<tr><td>${c}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join(''),
      '</table>',
      '<h2>🌙 이번 달 소비 한 줄 회고</h2><p>&nbsp;</p>',
    ].join('\n'),
  },
  {
    id: 'blog',
    emoji: '✍️',
    label: '블로그 글쓰기',
    desc: '후킹 도입 - 본문 - CTA 구조',
    title: '✍️ 새 블로그 글',
    html: [
      '<h2>🪝 도입 (독자를 붙잡는 3줄)</h2>',
      '<p>질문이나 공감 포인트로 시작하세요. "혹시 이런 경험 있으신가요?"</p>',
      '<h2>📌 본문 1 — 핵심 주장</h2><p>&nbsp;</p>',
      '<h2>📌 본문 2 — 근거/예시</h2><p>사진이나 링크를 넣으면 체류시간이 올라가요.</p>',
      '<h2>📌 본문 3 — 실천 팁</h2><ul><li>&nbsp;</li><li>&nbsp;</li></ul>',
      '<h2>🎁 마무리 + CTA</h2>',
      '<p>요약 한 줄 + "댓글로 알려주세요 / 구독하기" 같은 행동 유도.</p>',
      '<h2>🔍 발행 전 체크</h2>',
      '<ul><li>☐ 제목에 키워드 포함</li><li>☐ 이미지 1장 이상</li><li>☐ AI 패널로 SEO 메타 생성</li></ul>',
    ].join('\n'),
  },
  {
    id: 'wedding',
    emoji: '💍',
    label: '예비 결혼 준비',
    desc: 'D-day 체크리스트 + 예산 관리',
    title: '💍 우리 결혼 준비',
    html: [
      '<h2>💕 기본 정보</h2>',
      '<p><strong>예식일:</strong> ____년 __월 __일 (D-___) / <strong>장소:</strong>&nbsp;</p>',
      '<h2>📅 시기별 체크리스트</h2>',
      '<h3>D-12개월~6개월</h3>',
      '<ul><li>☐ 상견례</li><li>☐ 예식장 예약</li><li>☐ 스드메(스튜디오·드레스·메이크업) 계약</li><li>☐ 신혼여행지 결정</li></ul>',
      '<h3>D-6개월~3개월</h3>',
      '<ul><li>☐ 청첩장 제작</li><li>☐ 신혼집 계약</li><li>☐ 혼수/가전 리스트업</li><li>☐ 웨딩촬영</li></ul>',
      '<h3>D-3개월~1개월</h3>',
      '<ul><li>☐ 청첩장 발송 · 모임</li><li>☐ 예물/예단 준비</li><li>☐ 사회자·축가 섭외</li><li>☐ 신혼여행 예약 확정</li></ul>',
      '<h3>D-1개월~당일</h3>',
      '<ul><li>☐ 최종 인원 확인</li><li>☐ 식순 리허설</li><li>☐ 축의대 담당 지정</li><li>☐ 여행 짐싸기</li></ul>',
      '<h2>💰 예산 관리</h2>',
      '<table><tr><th>항목</th><th>예산</th><th>실제 지출</th><th>비고</th></tr>',
      ['예식장', '스드메', '예물/예단', '신혼집', '혼수/가전', '신혼여행', '청첩장/기타'].map(c => `<tr><td>${c}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join(''),
      '</table>',
      '<h2>📇 연락처 메모</h2>',
      '<table><tr><th>업체/담당</th><th>연락처</th><th>메모</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>',
    ].join('\n'),
  },
  {
    id: 'pro-exam',
    emoji: '⚖️',
    label: '전문직 시험',
    desc: '시험 종류를 골라 맞춤 플래너 생성',
    title: '🏆 전문직 시험 합격 플래너',
    html: examHtml('전문직 시험', ['과목 1', '과목 2', '과목 3']),
    variants: toVariants(PRO_EXAMS),
  },
  {
    id: 'cert-exam',
    emoji: '📜',
    label: '자격증 시험',
    desc: '자격증 종류를 골라 맞춤 플래너 생성',
    title: '🏆 자격증 합격 플래너',
    html: examHtml('자격증 시험', ['과목 1', '과목 2']),
    variants: toVariants(CERT_EXAMS),
  },
]
