/* ================================================
   BlackCatBook Docs — app.js
   Features: Multi-page routing, nested folders,
   rich text editor, image upload, search, themes
================================================ */

// ========== PAGE DATA ==========
const PAGES = [
  { id: 'home',         title: '홈',           group: '시작하기', prev: null,            next: 'introduction' },
  { id: 'introduction', title: '소개',          group: '시작하기', prev: 'home',           next: 'quickstart' },
  { id: 'quickstart',   title: '빠른 시작',     group: '시작하기', prev: 'introduction',   next: 'installation' },
  { id: 'installation', title: '설치',          group: '시작하기', prev: 'quickstart',     next: 'core-concepts' },
  { id: 'core-concepts',title: '핵심 개념',     group: '가이드',   prev: 'installation',   next: 'time-tracking' },
  { id: 'time-tracking',title: '시간 추적',     group: '가이드',   prev: 'core-concepts',  next: 'projects' },
  { id: 'projects',     title: '프로젝트 관리', group: '가이드',   prev: 'time-tracking',  next: 'reports' },
  { id: 'reports',      title: '보고서',        group: '가이드',   prev: 'projects',       next: 'configuration' },
  { id: 'configuration',title: '설정',          group: '가이드',   prev: 'reports',        next: 'integrations' },
  { id: 'integrations', title: '통합',          group: '가이드',   prev: 'configuration',  next: 'api-overview' },
  { id: 'api-overview', title: 'API 개요',      group: 'API',      prev: 'integrations',   next: 'authentication' },
  { id: 'authentication',title: '인증',         group: 'API',      prev: 'api-overview',   next: 'endpoints' },
  { id: 'endpoints',    title: '엔드포인트',    group: 'API',      prev: 'authentication',  next: 'webhooks' },
  { id: 'webhooks',     title: '웹훅',          group: 'API',      prev: 'endpoints',       next: 'changelog' },
  { id: 'changelog',    title: '변경 로그',     group: '리소스',   prev: 'webhooks',        next: 'faq' },
  { id: 'faq',          title: '자주 묻는 질문',group: '리소스',   prev: 'changelog',       next: null },
  { id: 'editor',       title: '문서 편집기',   group: null,        prev: null,              next: null },
];

// ========== PAGE CONTENT ==========
const PAGE_CONTENT = {
  home: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#">홈</a></nav>
      <h1>BlackCatBook 문서에 오신 것을 환영합니다 👋</h1>
      <p class="doc-subtitle">BlackCatBook은 팀과 개인을 위한 강력한 시간 추적 및 프로젝트 관리 플랫폼입니다. 이 문서에서 모든 기능과 API를 탐색해 보세요.</p>
      <div class="doc-meta">
        <span class="doc-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          최종 업데이트: 2026년 3월 31일
        </span>
        <span class="doc-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          읽기 약 5분
        </span>
      </div>

      <div class="cards">
        <a class="card" href="#" data-page="quickstart">
          <div class="card-icon">⚡</div>
          <div class="card-title">빠른 시작</div>
          <div class="card-desc">5분 안에 TimeBook을 시작하세요.</div>
        </a>
        <a class="card" href="#" data-page="api-overview">
          <div class="card-icon">🔌</div>
          <div class="card-title">API 레퍼런스</div>
          <div class="card-desc">REST API 완전 가이드.</div>
        </a>
        <a class="card" href="#" data-page="integrations">
          <div class="card-icon">🔗</div>
          <div class="card-title">통합</div>
          <div class="card-desc">Slack, Jira 등과 연결하세요.</div>
        </a>
        <a class="card" href="#" data-page="editor">
          <div class="card-icon">✏️</div>
          <div class="card-title">문서 편집기</div>
          <div class="card-desc">리치 텍스트 에디터로 문서를 작성하세요.</div>
        </a>
      </div>

      <h2>주요 기능</h2>
      <ul>
        <li><strong>스마트 시간 추적</strong> — 타이머, 수동 입력, 자동 감지 지원</li>
        <li><strong>프로젝트 대시보드</strong> — 실시간 진행 상황 및 예산 추적</li>
        <li><strong>팀 협업</strong> — 역할 기반 접근 제어 및 팀원 관리</li>
        <li><strong>상세한 보고서</strong> — PDF/CSV 내보내기 지원</li>
        <li><strong>REST API</strong> — 완전한 프로그래밍 접근 방식</li>
        <li><strong>웹훅</strong> — 실시간 이벤트 알림</li>
      </ul>

      <div class="callout callout-tip">
        <div class="callout-title">💡 팁</div>
        <p>처음이시라면 <a href="#" data-page="quickstart">빠른 시작 가이드</a>부터 시작하는 것을 추천합니다.</p>
      </div>

      <h2>지원되는 플랫폼</h2>
      <table>
        <thead><tr><th>플랫폼</th><th>버전</th><th>상태</th></tr></thead>
        <tbody>
          <tr><td>웹 (Chrome, Firefox, Safari)</td><td>최신 버전</td><td>✅ 지원</td></tr>
          <tr><td>iOS</td><td>15.0 이상</td><td>✅ 지원</td></tr>
          <tr><td>Android</td><td>9.0 이상</td><td>✅ 지원</td></tr>
          <tr><td>macOS 데스크톱</td><td>12.0 이상</td><td>✅ 지원</td></tr>
          <tr><td>Windows 데스크톱</td><td>Windows 10 이상</td><td>🔜 베타</td></tr>
        </tbody>
      </table>
    </div>
  `,

  introduction: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>소개</span></nav>
      <h1>TimeBook 소개</h1>
      <p class="doc-subtitle">TimeBook이 무엇인지, 왜 만들어졌는지, 어떻게 작동하는지 알아보세요.</p>
      <div class="doc-meta">
        <span class="doc-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 읽기 약 3분</span>
      </div>

      <h2>TimeBook이란?</h2>
      <p>BlackCatBook은 프리랜서, 스타트업, 엔터프라이즈 팀 모두를 위한 종합적인 시간 관리 솔루션입니다. 단순한 시간 추적을 넘어 프로젝트 생산성 분석, 팀 협업, 클라이언트 청구까지 한 곳에서 처리합니다.</p>

      <h2>왜 TimeBook인가?</h2>
      <p>기존 시간 추적 도구들은 지나치게 복잡하거나 너무 단순합니다. TimeBook은 그 사이를 채웁니다:</p>
      <ul>
        <li>직관적인 UI로 학습 곡선을 최소화</li>
        <li>강력한 API로 무한한 확장 가능성</li>
        <li>실시간 협업으로 팀 생산성 향상</li>
        <li>AI 기반 생산성 인사이트 (베타)</li>
      </ul>

      <div class="callout callout-info">
        <div class="callout-title">ℹ️ 정보</div>
        <p>TimeBook은 현재 <strong>v2.0</strong>을 제공하고 있습니다. 이전 버전에서 마이그레이션하는 경우 <a href="#" data-page="changelog">변경 로그</a>를 확인하세요.</p>
      </div>

      <h2>아키텍처 개요</h2>
      <p>TimeBook은 마이크로서비스 아키텍처를 기반으로 합니다:</p>
      <div class="code-header"><span>architecture</span></div>
      <pre><code>┌─────────────────────────────────────┐
│           클라이언트 레이어          │
│   (Web / iOS / Android / Desktop)   │
└──────────────┬──────────────────────┘
               │ HTTPS/WSS
┌──────────────▼──────────────────────┐
│            API Gateway              │
│         (인증 & 라우팅)              │
└─────┬─────────┬──────────┬──────────┘
      │         │          │
   추적 서비스  프로젝트   리포트 서비스
   (Tracking) (Projects) (Reports)</code></pre>
    </div>
  `,

  quickstart: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>빠른 시작</span></nav>
      <h1>빠른 시작 ⚡</h1>
      <p class="doc-subtitle">5분 안에 TimeBook을 설정하고 첫 번째 타이머를 시작하세요.</p>

      <div class="callout callout-tip">
        <div class="callout-title">💡 사전 요구 사항</div>
        <p>Node.js 18+, npm 또는 yarn이 설치되어 있어야 합니다.</p>
      </div>

      <h2>설치 및 설정</h2>
      <div class="steps">
        <div class="step">
          <div class="step-num"></div>
          <div class="step-body">
            <div class="step-title">패키지 설치</div>
            <div class="code-header"><span>bash</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
            <pre><code>npm install @timebook/sdk
# 또는
yarn add @timebook/sdk</code></pre>
          </div>
        </div>
        <div class="step">
          <div class="step-num"></div>
          <div class="step-body">
            <div class="step-title">API 키 발급</div>
            <p>대시보드 → 설정 → API 키에서 새 API 키를 생성하세요.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-num"></div>
          <div class="step-body">
            <div class="step-title">SDK 초기화</div>
            <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
            <pre><code>import { TimeBook } from '@timebook/sdk';

const client = new TimeBook({
  apiKey: process.env.TIMEBOOK_API_KEY,
  workspace: 'my-workspace',
});</code></pre>
          </div>
        </div>
        <div class="step">
          <div class="step-num"></div>
          <div class="step-body">
            <div class="step-title">첫 번째 타이머 시작</div>
            <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
            <pre><code>const timer = await client.timers.start({
  description: '홈페이지 디자인',
  projectId: 'proj_abc123',
  tags: ['design', 'frontend'],
});

console.log('타이머 시작:', timer.id);

// 나중에 타이머 정지
await client.timers.stop(timer.id);</code></pre>
          </div>
        </div>
      </div>

      <h2>다음 단계</h2>
      <div class="cards">
        <a class="card" href="#" data-page="core-concepts">
          <div class="card-icon">📚</div>
          <div class="card-title">핵심 개념</div>
          <div class="card-desc">TimeBook의 기본 구조 이해하기</div>
        </a>
        <a class="card" href="#" data-page="api-overview">
          <div class="card-icon">🔌</div>
          <div class="card-title">API 문서</div>
          <div class="card-desc">완전한 API 레퍼런스</div>
        </a>
      </div>
    </div>
  `,

  installation: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>설치</span></nav>
      <h1>설치</h1>
      <p class="doc-subtitle">다양한 환경에서 TimeBook을 설치하는 방법을 안내합니다.</p>

      <h2>패키지 매니저</h2>
      <div class="code-header"><span>npm</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>npm install @timebook/sdk</code></pre>
      <div class="code-header"><span>yarn</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>yarn add @timebook/sdk</code></pre>
      <div class="code-header"><span>pnpm</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>pnpm add @timebook/sdk</code></pre>

      <h2>CDN (브라우저)</h2>
      <div class="code-header"><span>html</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>&lt;script src="https://cdn.timebook.io/sdk/v2/timebook.min.js"&gt;&lt;/script&gt;</code></pre>

      <h2>시스템 요구 사항</h2>
      <table>
        <thead><tr><th>환경</th><th>최소 버전</th></tr></thead>
        <tbody>
          <tr><td>Node.js</td><td>18.0.0</td></tr>
          <tr><td>TypeScript</td><td>5.0</td></tr>
          <tr><td>Chrome / Edge</td><td>100+</td></tr>
          <tr><td>Firefox</td><td>100+</td></tr>
          <tr><td>Safari</td><td>15.4+</td></tr>
        </tbody>
      </table>

      <div class="callout callout-warn">
        <div class="callout-title">⚠️ 주의</div>
        <p>Node.js 16 이하 버전은 지원이 종료되었습니다. Node.js 18 이상으로 업그레이드하세요.</p>
      </div>
    </div>
  `,

  'core-concepts': () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><a href="#" data-page="core-concepts">핵심 개념</a></nav>
      <h1>핵심 개념</h1>
      <p class="doc-subtitle">TimeBook의 기본 구조와 작동 원리를 이해합니다.</p>

      <h2>워크스페이스</h2>
      <p>워크스페이스는 TimeBook의 최상위 조직 단위입니다. 모든 팀원, 프로젝트, 시간 기록은 워크스페이스 내에 존재합니다.</p>
      <div class="callout callout-info">
        <div class="callout-title">ℹ️ 정보</div>
        <p>하나의 계정으로 여러 워크스페이스를 만들고 관리할 수 있습니다.</p>
      </div>

      <h2>핵심 엔티티</h2>
      <table>
        <thead><tr><th>엔티티</th><th>설명</th><th>상위 엔티티</th></tr></thead>
        <tbody>
          <tr><td><code>Workspace</code></td><td>최상위 조직 단위</td><td>—</td></tr>
          <tr><td><code>Project</code></td><td>작업 묶음</td><td>Workspace</td></tr>
          <tr><td><code>Task</code></td><td>세부 작업 항목</td><td>Project</td></tr>
          <tr><td><code>Timer</code></td><td>시간 추적 세션</td><td>Task / Project</td></tr>
          <tr><td><code>Member</code></td><td>워크스페이스 구성원</td><td>Workspace</td></tr>
          <tr><td><code>Tag</code></td><td>분류 레이블</td><td>Workspace</td></tr>
        </tbody>
      </table>

      <h2>하위 섹션 탐색</h2>
      <div class="cards">
        <a class="card" href="#" data-page="time-tracking">
          <div class="card-icon">⏱️</div>
          <div class="card-title">시간 추적</div>
          <div class="card-desc">타이머 관리 심화 가이드</div>
        </a>
        <a class="card" href="#" data-page="projects">
          <div class="card-icon">📁</div>
          <div class="card-title">프로젝트 관리</div>
          <div class="card-desc">프로젝트 구성 및 팀 배정</div>
        </a>
        <a class="card" href="#" data-page="reports">
          <div class="card-icon">📊</div>
          <div class="card-title">보고서</div>
          <div class="card-desc">데이터 분석 및 내보내기</div>
        </a>
      </div>
    </div>
  `,

  'time-tracking': () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><a href="#" data-page="core-concepts">핵심 개념</a><span class="breadcrumb-sep">›</span><span>시간 추적</span></nav>
      <h1>시간 추적</h1>
      <p class="doc-subtitle">TimeBook의 강력한 시간 추적 기능을 활용하는 방법을 알아보세요.</p>

      <h2>타이머 시작/정지</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>// 타이머 시작
const timer = await client.timers.start({
  description: '기능 개발',
  projectId: 'proj_123',
  taskId: 'task_456',  // 선택 사항
  tags: ['dev', 'sprint-3'],
  billable: true,
});

// 타이머 현황 조회
const running = await client.timers.getCurrent();

// 타이머 정지
const entry = await client.timers.stop();</code></pre>

      <h2>수동 시간 입력</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>const entry = await client.timeEntries.create({
  description: '클라이언트 미팅',
  projectId: 'proj_123',
  startTime: '2026-03-31T09:00:00Z',
  endTime:   '2026-03-31T10:30:00Z',
  billable: true,
});</code></pre>

      <div class="callout callout-tip">
        <div class="callout-title">💡 팁</div>
        <p>시간은 항상 UTC 형식(<code>ISO 8601</code>)으로 입력하세요. 표시 시간대는 사용자 설정에 따라 자동 변환됩니다.</p>
      </div>
    </div>
  `,

  projects: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><a href="#" data-page="core-concepts">핵심 개념</a><span class="breadcrumb-sep">›</span><span>프로젝트 관리</span></nav>
      <h1>프로젝트 관리</h1>
      <p class="doc-subtitle">프로젝트를 생성하고 팀과 함께 관리하는 방법을 알아보세요.</p>

      <h2>프로젝트 생성</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>const project = await client.projects.create({
  name: '웹사이트 리뉴얼',
  color: '#3b82f6',
  budget: { type: 'hours', amount: 200 },
  visibility: 'team',  // 'private' | 'team' | 'public'
  members: ['user_111', 'user_222'],
});</code></pre>

      <h2>역할 및 권한</h2>
      <table>
        <thead><tr><th>역할</th><th>조회</th><th>편집</th><th>관리</th><th>삭제</th></tr></thead>
        <tbody>
          <tr><td>오너</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
          <tr><td>관리자</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
          <tr><td>편집자</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
          <tr><td>뷰어</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
        </tbody>
      </table>
    </div>
  `,

  reports: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><a href="#" data-page="core-concepts">핵심 개념</a><span class="breadcrumb-sep">›</span><span>보고서</span></nav>
      <h1>보고서</h1>
      <p class="doc-subtitle">시간 데이터를 분석하고 다양한 형식으로 내보내세요.</p>

      <h2>보고서 생성</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>const report = await client.reports.generate({
  type: 'detailed',  // 'summary' | 'detailed' | 'client'
  dateRange: {
    start: '2026-03-01',
    end:   '2026-03-31',
  },
  groupBy: 'project',
  filters: {
    projectIds: ['proj_123'],
    billable: true,
  },
});

// PDF로 내보내기
const pdf = await report.export('pdf');
</code></pre>

      <div class="callout callout-warn">
        <div class="callout-title">⚠️ 제한</div>
        <p>무료 플랜은 최근 30일 데이터만 조회 가능합니다. 전체 내역은 Pro 플랜 이상에서 제공됩니다.</p>
      </div>
    </div>
  `,

  configuration: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>설정</span></nav>
      <h1>설정</h1>
      <p class="doc-subtitle">TimeBook SDK와 앱의 동작을 커스터마이징하세요.</p>

      <h2>SDK 설정 옵션</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>const client = new TimeBook({
  apiKey: 'tb_live_xxxxx',    // 필수
  workspace: 'my-workspace',  // 필수
  baseURL: 'https://api.timebook.io/v2',  // 선택
  timeout: 30000,             // ms, 기본값: 30000
  retries: 3,                 // 재시도 횟수, 기본값: 3
  locale: 'ko-KR',            // 응답 언어
});</code></pre>

      <h2>환경 변수</h2>
      <div class="code-header"><span>.env</span></div>
      <pre><code>TIMEBOOK_API_KEY=tb_live_your_key_here
TIMEBOOK_WORKSPACE=your-workspace-slug
TIMEBOOK_TIMEOUT=30000</code></pre>
    </div>
  `,

  integrations: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>통합</span></nav>
      <h1>통합 <span class="badge badge-new">신규</span></h1>
      <p class="doc-subtitle">TimeBook을 즐겨 사용하는 도구와 연결하세요.</p>

      <div class="cards">
        <div class="card">
          <div class="card-icon">💬</div>
          <div class="card-title">Slack</div>
          <div class="card-desc">Slack에서 타이머 시작/정지 및 알림 수신</div>
        </div>
        <div class="card">
          <div class="card-icon">🎯</div>
          <div class="card-title">Jira</div>
          <div class="card-desc">Jira 이슈에서 직접 시간 추적</div>
        </div>
        <div class="card">
          <div class="card-icon">📋</div>
          <div class="card-title">Notion</div>
          <div class="card-desc">Notion 페이지에 시간 데이터 동기화</div>
        </div>
        <div class="card">
          <div class="card-icon">🐙</div>
          <div class="card-title">GitHub</div>
          <div class="card-desc">PR/이슈 활동과 시간 연동</div>
        </div>
      </div>

      <h2>Slack 연동 설정</h2>
      <div class="steps">
        <div class="step"><div class="step-num"></div><div class="step-body"><div class="step-title">앱 설치</div><p>Slack 워크스페이스에 TimeBook 앱을 설치합니다.</p></div></div>
        <div class="step"><div class="step-num"></div><div class="step-body"><div class="step-title">채널 연결</div><p>알림을 받을 Slack 채널을 선택합니다.</p></div></div>
        <div class="step"><div class="step-num"></div><div class="step-body"><div class="step-title">슬래시 명령어 사용</div><pre><code>/timebook start 홈페이지 작업 #proj_abc
/timebook stop
/timebook status</code></pre></div></div>
      </div>
    </div>
  `,

  'api-overview': () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>API 개요</span></nav>
      <h1>API 개요</h1>
      <p class="doc-subtitle">TimeBook REST API의 기본 구조와 공통 규칙을 설명합니다.</p>

      <h2>기본 URL</h2>
      <div class="code-header"><span>Base URL</span></div>
      <pre><code>https://api.timebook.io/v2</code></pre>

      <h2>요청 형식</h2>
      <p>모든 요청은 <code>Content-Type: application/json</code> 헤더를 포함해야 합니다.</p>
      <div class="code-header"><span>HTTP</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>POST /v2/timers/start
Authorization: Bearer tb_live_xxxxx
Content-Type: application/json

{
  "description": "API 개발",
  "projectId": "proj_abc123"
}</code></pre>

      <h2>응답 코드</h2>
      <table>
        <thead><tr><th>코드</th><th>의미</th></tr></thead>
        <tbody>
          <tr><td><code>200</code></td><td>성공</td></tr>
          <tr><td><code>201</code></td><td>생성 성공</td></tr>
          <tr><td><code>400</code></td><td>잘못된 요청</td></tr>
          <tr><td><code>401</code></td><td>인증 실패</td></tr>
          <tr><td><code>403</code></td><td>권한 없음</td></tr>
          <tr><td><code>404</code></td><td>리소스 없음</td></tr>
          <tr><td><code>429</code></td><td>요청 한도 초과</td></tr>
          <tr><td><code>500</code></td><td>서버 오류</td></tr>
        </tbody>
      </table>

      <h2>페이지네이션</h2>
      <div class="code-header"><span>HTTP</span></div>
      <pre><code>GET /v2/time-entries?page=2&per_page=50&sort=start_time&order=desc</code></pre>
    </div>
  `,

  authentication: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>인증</span></nav>
      <h1>인증</h1>
      <p class="doc-subtitle">API 키와 OAuth 2.0을 사용한 인증 방법을 설명합니다.</p>

      <h2>API 키 인증</h2>
      <p>가장 간단한 방법입니다. <code>Authorization</code> 헤더에 Bearer 토큰으로 전달합니다.</p>
      <div class="code-header"><span>HTTP</span></div>
      <pre><code>Authorization: Bearer tb_live_your_api_key</code></pre>

      <div class="callout callout-danger">
        <div class="callout-title">🚨 보안 주의</div>
        <p>API 키를 클라이언트 코드나 공개 저장소에 절대 커밋하지 마세요. 환경 변수를 사용하세요.</p>
      </div>

      <h2>OAuth 2.0</h2>
      <p>사용자 대신 API를 호출할 때는 OAuth 2.0 플로우를 사용합니다.</p>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>// 1. 인증 URL로 리디렉션
const authUrl = client.oauth.getAuthorizationUrl({
  scopes: ['timers:read', 'timers:write', 'projects:read'],
  redirectUri: 'https://your-app.com/callback',
  state: generateRandomState(),
});

// 2. 콜백에서 토큰 교환
const tokens = await client.oauth.exchangeCode({
  code: req.query.code,
  redirectUri: 'https://your-app.com/callback',
});</code></pre>
    </div>
  `,

  endpoints: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>엔드포인트</span></nav>
      <h1>API 엔드포인트</h1>
      <p class="doc-subtitle">모든 REST API 엔드포인트 레퍼런스입니다.</p>

      <h2>타이머 (Timers)</h2>
      <table>
        <thead><tr><th>메서드</th><th>엔드포인트</th><th>설명</th></tr></thead>
        <tbody>
          <tr><td><code>POST</code></td><td><code>/timers/start</code></td><td>타이머 시작</td></tr>
          <tr><td><code>PATCH</code></td><td><code>/timers/stop</code></td><td>현재 타이머 정지</td></tr>
          <tr><td><code>GET</code></td><td><code>/timers/current</code></td><td>현재 실행 중인 타이머</td></tr>
        </tbody>
      </table>

      <h2>시간 기록 (Time Entries)</h2>
      <table>
        <thead><tr><th>메서드</th><th>엔드포인트</th><th>설명</th></tr></thead>
        <tbody>
          <tr><td><code>GET</code></td><td><code>/time-entries</code></td><td>시간 기록 목록</td></tr>
          <tr><td><code>POST</code></td><td><code>/time-entries</code></td><td>새 시간 기록 추가</td></tr>
          <tr><td><code>GET</code></td><td><code>/time-entries/:id</code></td><td>특정 기록 조회</td></tr>
          <tr><td><code>PUT</code></td><td><code>/time-entries/:id</code></td><td>기록 업데이트</td></tr>
          <tr><td><code>DELETE</code></td><td><code>/time-entries/:id</code></td><td>기록 삭제</td></tr>
        </tbody>
      </table>

      <h2>프로젝트 (Projects)</h2>
      <table>
        <thead><tr><th>메서드</th><th>엔드포인트</th><th>설명</th></tr></thead>
        <tbody>
          <tr><td><code>GET</code></td><td><code>/projects</code></td><td>프로젝트 목록</td></tr>
          <tr><td><code>POST</code></td><td><code>/projects</code></td><td>프로젝트 생성</td></tr>
          <tr><td><code>GET</code></td><td><code>/projects/:id</code></td><td>프로젝트 조회</td></tr>
          <tr><td><code>PUT</code></td><td><code>/projects/:id</code></td><td>프로젝트 수정</td></tr>
          <tr><td><code>DELETE</code></td><td><code>/projects/:id</code></td><td>프로젝트 삭제</td></tr>
        </tbody>
      </table>
    </div>
  `,

  webhooks: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>웹훅</span></nav>
      <h1>웹훅</h1>
      <p class="doc-subtitle">TimeBook 이벤트를 실시간으로 수신하는 웹훅을 설정하세요.</p>

      <h2>지원되는 이벤트</h2>
      <table>
        <thead><tr><th>이벤트</th><th>설명</th></tr></thead>
        <tbody>
          <tr><td><code>timer.started</code></td><td>타이머가 시작됨</td></tr>
          <tr><td><code>timer.stopped</code></td><td>타이머가 정지됨</td></tr>
          <tr><td><code>entry.created</code></td><td>시간 기록이 생성됨</td></tr>
          <tr><td><code>entry.updated</code></td><td>시간 기록이 수정됨</td></tr>
          <tr><td><code>entry.deleted</code></td><td>시간 기록이 삭제됨</td></tr>
          <tr><td><code>project.created</code></td><td>프로젝트가 생성됨</td></tr>
          <tr><td><code>member.invited</code></td><td>새 팀원이 초대됨</td></tr>
        </tbody>
      </table>

      <h2>웹훅 페이로드 예시</h2>
      <div class="code-header"><span>json</span></div>
      <pre><code>{
  "event": "timer.stopped",
  "timestamp": "2026-03-31T10:30:00Z",
  "data": {
    "timerId": "timer_abc123",
    "duration": 5400,
    "description": "API 개발",
    "projectId": "proj_123"
  }
}</code></pre>

      <h2>서명 검증</h2>
      <div class="code-header"><span>javascript</span><button class="copy-btn" onclick="copyCode(this)">복사</button></div>
      <pre><code>import crypto from 'crypto';

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from('sha256=' + expected)
  );
}</code></pre>
    </div>
  `,

  changelog: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>변경 로그</span></nav>
      <h1>변경 로그</h1>
      <p class="doc-subtitle">TimeBook의 모든 버전 업데이트 내역입니다.</p>

      <h2>v2.0.0 <span class="badge badge-new">최신</span></h2>
      <p><strong>2026년 3월 31일 릴리스</strong></p>
      <ul>
        <li>🎉 완전히 새로운 리치 텍스트 에디터 추가</li>
        <li>🚀 AI 기반 생산성 인사이트 베타 출시</li>
        <li>🔗 Notion 통합 추가</li>
        <li>⚡ API 응답 속도 40% 개선</li>
        <li>🐛 타이머 동기화 버그 수정</li>
      </ul>

      <div class="callout callout-warn">
        <div class="callout-title">⚠️ 주요 변경 사항 (Breaking Changes)</div>
        <p>v2.0에서 <code>client.track()</code> 메서드가 <code>client.timers.start()</code>로 변경되었습니다.</p>
      </div>

      <h2>v1.9.5</h2>
      <p><strong>2026년 2월 15일</strong></p>
      <ul>
        <li>GitHub 통합 개선</li>
        <li>보고서 PDF 내보내기 성능 향상</li>
        <li>다크 모드 디자인 개선</li>
      </ul>

      <h2>v1.9.0</h2>
      <p><strong>2026년 1월 20일</strong></p>
      <ul>
        <li>팀 대시보드 신규 추가</li>
        <li>모바일 앱 오프라인 모드 지원</li>
        <li>API 요청 속도 제한 완화 (1000 req/min → 2000 req/min)</li>
      </ul>
    </div>
  `,

  faq: () => `
    <div class="doc-page">
      <nav class="breadcrumb"><a href="#" data-page="home">홈</a><span class="breadcrumb-sep">›</span><span>FAQ</span></nav>
      <h1>자주 묻는 질문</h1>
      <p class="doc-subtitle">가장 많이 묻는 질문들에 대한 답변입니다.</p>

      <h2>일반</h2>
      <h3>무료 플랜에서 몇 명까지 사용할 수 있나요?</h3>
      <p>무료 플랜에서는 최대 5명의 팀원과 3개의 프로젝트를 사용할 수 있습니다. 그 이상은 Pro 플랜(월 $12/인)을 이용하세요.</p>

      <h3>데이터는 어떻게 백업되나요?</h3>
      <p>TimeBook은 매일 자동 백업을 수행합니다. 설정 → 내보내기에서 전체 데이터를 JSON/CSV로 내보낼 수 있습니다.</p>

      <h2>기술적 질문</h2>
      <h3>API 요청 한도는 얼마인가요?</h3>
      <table>
        <thead><tr><th>플랜</th><th>분당 요청</th><th>일일 요청</th></tr></thead>
        <tbody>
          <tr><td>무료</td><td>60</td><td>10,000</td></tr>
          <tr><td>Pro</td><td>2,000</td><td>500,000</td></tr>
          <tr><td>Enterprise</td><td>무제한</td><td>무제한</td></tr>
        </tbody>
      </table>

      <h3>웹훅 재시도 정책은?</h3>
      <p>웹훅 엔드포인트가 응답하지 않는 경우, TimeBook은 지수 백오프(1분, 5분, 30분, 2시간, 8시간)로 최대 5회 재시도합니다.</p>

      <div class="callout callout-info">
        <div class="callout-title">💬 더 궁금한 점이 있으신가요?</div>
        <p>support@timebook.io 또는 Discord 커뮤니티에서 도움을 받으세요.</p>
      </div>
    </div>
  `,
};

// ========== SEARCH INDEX ==========
const SEARCH_INDEX = PAGES.filter(p => p.id !== 'editor').map(p => ({
  id: p.id,
  title: p.title,
  group: p.group,
  excerpt: getExcerpt(p.id),
}));

function getExcerpt(id) {
  const excerpts = {
    home: 'BlackCatBook은 팀과 개인을 위한 강력한 시간 추적 및 프로젝트 관리 플랫폼입니다.',
    introduction: 'TimeBook이 무엇인지, 왜 만들어졌는지, 어떻게 작동하는지 알아보세요.',
    quickstart: '5분 안에 TimeBook을 설정하고 첫 번째 타이머를 시작하세요.',
    installation: 'npm, yarn, pnpm, CDN을 통한 설치 방법 안내.',
    'core-concepts': '워크스페이스, 프로젝트, 타이머 등 핵심 엔티티를 이해하세요.',
    'time-tracking': '타이머 시작/정지 및 수동 시간 입력 방법.',
    projects: '프로젝트 생성, 팀원 배정, 역할 및 권한 관리.',
    reports: '시간 데이터 분석 및 PDF/CSV 내보내기.',
    configuration: 'SDK 옵션 및 환경 변수 설정.',
    integrations: 'Slack, Jira, Notion, GitHub과의 통합 방법.',
    'api-overview': 'REST API 기본 구조, 응답 코드, 페이지네이션.',
    authentication: 'API 키 및 OAuth 2.0 인증 방법.',
    endpoints: '모든 REST API 엔드포인트 레퍼런스.',
    webhooks: '실시간 이벤트 웹훅 설정 및 서명 검증.',
    changelog: '버전별 변경 사항 및 업데이트 내역.',
    faq: '자주 묻는 질문에 대한 답변 모음.',
  };
  return excerpts[id] || '';
}

// ========== STATE ==========
let currentPage = 'home';
let editorSavedContent = '';

// ========== DOM REFS ==========
const contentInner    = document.getElementById('contentInner');
const sidebar         = document.getElementById('sidebar');
const sidebarOverlay  = document.getElementById('sidebarOverlay');
const menuToggle      = document.getElementById('menuToggle');
const searchInput     = document.getElementById('searchInput');
const searchOverlay   = document.getElementById('searchOverlay');
const searchResults   = document.getElementById('searchResults');
const themePanel      = document.getElementById('themePanel');
const themePanelToggle= document.getElementById('themePanelToggle');
const themeOptions    = document.getElementById('themeOptions');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const prevTitle       = document.getElementById('prevTitle');
const nextTitle       = document.getElementById('nextTitle');
const tocList         = document.getElementById('tocList');

// ========== NAVIGATION ==========
function navigate(pageId) {
  currentPage = pageId;
  closeSidebar();

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // Open parent folder if child is active
  document.querySelectorAll('.has-children').forEach(li => {
    const subLinks = li.querySelectorAll('.sub-link');
    const isChildActive = Array.from(subLinks).some(l => l.dataset.page === pageId);
    if (isChildActive) li.classList.add('open');
  });

  // Render content
  if (pageId === 'editor') {
    renderEditor();
  } else {
    const html = PAGE_CONTENT[pageId] ? PAGE_CONTENT[pageId]() : `<div class="doc-page"><h1>준비 중</h1><p>이 페이지는 곧 공개됩니다.</p></div>`;
    contentInner.innerHTML = html;
    renderPageNav(pageId);
    renderTOC();
    bindContentLinks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function renderPageNav(pageId) {
  const page = PAGES.find(p => p.id === pageId);
  if (!page) return;

  if (page.prev) {
    const prevPage = PAGES.find(p => p.id === page.prev);
    prevBtn.style.display = 'flex';
    prevTitle.textContent = prevPage.title;
    prevBtn.onclick = (e) => { e.preventDefault(); navigate(page.prev); };
  } else {
    prevBtn.style.display = 'none';
  }

  if (page.next) {
    const nextPage = PAGES.find(p => p.id === page.next);
    nextBtn.style.display = 'flex';
    nextTitle.textContent = nextPage.title;
    nextBtn.onclick = (e) => { e.preventDefault(); navigate(page.next); };
  } else {
    nextBtn.style.display = 'none';
  }
}

function renderTOC() {
  const headings = contentInner.querySelectorAll('h2, h3');
  tocList.innerHTML = '';
  headings.forEach((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${id}" class="${h.tagName === 'H3' ? 'toc-h3' : ''}">${h.textContent}</a>`;
    li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocList.appendChild(li);
  });
}

function bindContentLinks() {
  contentInner.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });
}

// ========== SIDEBAR ==========
menuToggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open', open);
  menuToggle.classList.toggle('open', open);
});
sidebarOverlay.addEventListener('click', closeSidebar);
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  menuToggle.classList.remove('open');
}

// Nav link clicks
document.querySelectorAll('.nav-link[data-page]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(el.dataset.page);
  });
});

// Folder toggles
document.querySelectorAll('.nav-parent').forEach(el => {
  el.addEventListener('click', (e) => {
    if (!el.dataset.page) { e.preventDefault(); }
    const li = el.closest('.has-children');
    if (li) li.classList.toggle('open');
  });
});

// Site logo
document.querySelector('.site-logo').addEventListener('click', (e) => {
  e.preventDefault();
  navigate('home');
});

// ========== THEME SWITCHER ==========
themePanelToggle.addEventListener('click', () => {
  themeOptions.classList.toggle('open');
});

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    themeOptions.classList.remove('open');
    localStorage.setItem('blackcatbook-theme', theme);
  });
});

// Close theme panel on outside click
document.addEventListener('click', (e) => {
  if (!themePanel.contains(e.target)) {
    themeOptions.classList.remove('open');
  }
});

// Restore saved theme
const savedTheme = localStorage.getItem('blackcatbook-theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === savedTheme);
  });
}

// ========== SEARCH ==========
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(searchInput.value.trim()), 150);
});

searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) searchOverlay.classList.add('open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-box') && !e.target.closest('.search-overlay')) {
    searchOverlay.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    searchOverlay.classList.remove('open');
    searchInput.blur();
  }
});

function performSearch(query) {
  if (!query) { searchOverlay.classList.remove('open'); return; }

  const q = query.toLowerCase();
  const results = SEARCH_INDEX.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    (p.group && p.group.toLowerCase().includes(q))
  ).slice(0, 8);

  if (!results.length) {
    searchResults.innerHTML = `<div class="search-empty">결과 없음: "${query}"</div>`;
  } else {
    searchResults.innerHTML = results.map(r => `
      <div class="search-result-item" data-page="${r.id}">
        <svg class="result-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div>
          <div class="search-result-title">${highlight(r.title, q)}</div>
          <div class="search-result-excerpt">${highlight(r.excerpt, q)}</div>
        </div>
      </div>
    `).join('');
  }

  searchOverlay.classList.add('open');

  searchResults.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      navigate(el.dataset.page);
      searchOverlay.classList.remove('open');
      searchInput.value = '';
    });
  });
}

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

// ========== COPY CODE ==========
function copyCode(btn) {
  const pre = btn.closest('.code-header').nextElementSibling;
  const text = pre.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '복사됨!';
    setTimeout(() => btn.textContent = '복사', 1500);
  });
}
window.copyCode = copyCode;

// ========== RICH TEXT EDITOR ==========
function renderEditor() {
  prevBtn.style.display = 'none';
  nextBtn.style.display = 'none';
  tocList.innerHTML = '';

  contentInner.innerHTML = `
    <div class="editor-page">
      <div class="editor-header">
        <input class="editor-title-input" id="editorTitle" type="text" placeholder="문서 제목을 입력하세요..." value="${editorSavedContent ? '' : '새 문서'}" />
        <input class="editor-subtitle-input" id="editorSubtitle" type="text" placeholder="부제목 또는 설명을 추가하세요..." />
      </div>

      <!-- TOOLBAR -->
      <div class="editor-toolbar" id="editorToolbar">
        <!-- Heading -->
        <div class="toolbar-group">
          <select class="tb-select" id="headingSelect" title="제목 스타일">
            <option value="p">본문</option>
            <option value="h1">제목 1</option>
            <option value="h2">제목 2</option>
            <option value="h3">제목 3</option>
            <option value="h4">제목 4</option>
          </select>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Text style -->
        <div class="toolbar-group">
          <button class="tb-btn" id="btnBold"      title="굵게 (Ctrl+B)"       onclick="execCmd('bold')"><b>B</b></button>
          <button class="tb-btn" id="btnItalic"    title="기울임 (Ctrl+I)"     onclick="execCmd('italic')"><i>I</i></button>
          <button class="tb-btn" id="btnUnderline" title="밑줄 (Ctrl+U)"       onclick="execCmd('underline')"><u>U</u></button>
          <button class="tb-btn" id="btnStrike"    title="취소선"               onclick="execCmd('strikeThrough')"><s>S</s></button>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Color -->
        <div class="toolbar-group">
          <div class="color-picker-wrap" title="글자 색상">
            <input type="color" id="textColor" value="#3b82f6" onchange="execCmd('foreColor', this.value)" />
          </div>
          <div class="color-picker-wrap" title="배경 색상">
            <input type="color" id="bgColor" value="#fef9c3" onchange="execCmd('hiliteColor', this.value)" />
          </div>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Align -->
        <div class="toolbar-group">
          <button class="tb-btn" title="왼쪽 정렬" onclick="execCmd('justifyLeft')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button class="tb-btn" title="가운데 정렬" onclick="execCmd('justifyCenter')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button class="tb-btn" title="오른쪽 정렬" onclick="execCmd('justifyRight')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Lists -->
        <div class="toolbar-group">
          <button class="tb-btn" title="순서 없는 목록" onclick="execCmd('insertUnorderedList')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
          </button>
          <button class="tb-btn" title="순서 목록" onclick="execCmd('insertOrderedList')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </button>
          <button class="tb-btn" title="들여쓰기" onclick="execCmd('indent')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/><polyline points="7 8 11 12 7 16"/></svg>
          </button>
          <button class="tb-btn" title="내어쓰기" onclick="execCmd('outdent')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/><polyline points="11 8 7 12 11 16"/></svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Insert -->
        <div class="toolbar-group">
          <button class="tb-btn" title="링크 삽입" onclick="openLinkModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <button class="tb-btn" title="이미지 삽입" onclick="triggerImageUpload()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button class="tb-btn" title="코드 블록" onclick="insertCodeBlock()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <button class="tb-btn" title="인용구" onclick="execCmd('formatBlock', 'blockquote')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </button>
          <button class="tb-btn" title="수평선" onclick="execCmd('insertHorizontalRule')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="tb-btn" title="표 삽입" onclick="insertTable()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Undo/Redo -->
        <div class="toolbar-group">
          <button class="tb-btn" title="실행 취소 (Ctrl+Z)" onclick="execCmd('undo')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button class="tb-btn" title="다시 실행 (Ctrl+Y)" onclick="execCmd('redo')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
          </button>
        </div>
        <div class="toolbar-divider"></div>

        <!-- Save actions -->
        <div class="toolbar-group" style="margin-left:auto">
          <button class="tb-btn tb-btn-wide btn btn-secondary" onclick="saveDocument()" style="height:32px;padding:0 12px;font-size:.8rem">
            저장
          </button>
          <button class="tb-btn tb-btn-wide" style="background:var(--accent);color:white;height:32px;padding:0 12px;font-size:.8rem;border-radius:6px;border:none;cursor:pointer;font-weight:600" onclick="publishDocument()">
            게시
          </button>
        </div>
      </div>

      <!-- Hidden file input -->
      <input type="file" id="imageFileInput" accept="image/*" style="display:none" multiple />

      <!-- Content editable area -->
      <div class="editor-content" id="editorContent" contenteditable="true" spellcheck="false">
        <p>여기에 문서 내용을 작성하세요. 위의 도구 모음을 사용하여 텍스트를 꾸미고, 이미지와 링크를 삽입할 수 있습니다.</p>
        <p>이미지를 추가하려면 위의 이미지 버튼을 클릭하거나 여기에 <strong>드래그 앤 드롭</strong>하세요.</p>
      </div>

      <!-- Word count -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding:0 2px;">
        <span id="wordCount" style="font-size:.78rem;color:var(--text-faint)">단어 수: 0</span>
        <a class="edit-link" href="#" onclick="return false" style="font-size:.78rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          마지막 저장: 방금
        </a>
      </div>
    </div>

    <!-- Link Modal -->
    <div class="modal-overlay" id="linkModal">
      <div class="modal">
        <h3>링크 삽입</h3>
        <label>링크 텍스트</label>
        <input type="text" id="linkText" placeholder="링크에 표시될 텍스트" />
        <label>URL</label>
        <input type="text" id="linkURL" placeholder="https://..." />
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="closeLinkModal()">취소</button>
          <button class="btn btn-primary" onclick="insertLink()">삽입</button>
        </div>
      </div>
    </div>
  `;

  initEditor();
}

function initEditor() {
  const editorContent = document.getElementById('editorContent');
  const imageFileInput = document.getElementById('imageFileInput');
  const headingSelect = document.getElementById('headingSelect');
  const wordCount = document.getElementById('wordCount');

  // Heading select
  headingSelect.addEventListener('change', () => {
    execCmd('formatBlock', headingSelect.value);
  });

  // Word count
  editorContent.addEventListener('input', () => {
    const text = editorContent.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCount.textContent = `단어 수: ${words}`;
  });

  // Drag & drop images
  editorContent.addEventListener('dragover', (e) => { e.preventDefault(); editorContent.style.outline = '2px dashed var(--accent)'; });
  editorContent.addEventListener('dragleave', () => { editorContent.style.outline = ''; });
  editorContent.addEventListener('drop', (e) => {
    e.preventDefault();
    editorContent.style.outline = '';
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    files.forEach(insertImageFile);
  });

  // Paste image
  editorContent.addEventListener('paste', (e) => {
    const items = [...(e.clipboardData?.items || [])];
    const imgItem = items.find(i => i.type.startsWith('image/'));
    if (imgItem) {
      e.preventDefault();
      insertImageFile(imgItem.getAsFile());
    }
  });

  // File input
  imageFileInput.addEventListener('change', () => {
    [...imageFileInput.files].forEach(insertImageFile);
    imageFileInput.value = '';
  });

  // Toolbar state updates
  editorContent.addEventListener('keyup', updateToolbarState);
  editorContent.addEventListener('mouseup', updateToolbarState);
}

function execCmd(cmd, value = null) {
  const editor = document.getElementById('editorContent');
  if (!editor) return;
  editor.focus();
  document.execCommand(cmd, false, value);
  updateToolbarState();
}
window.execCmd = execCmd;

function updateToolbarState() {
  const cmds = ['bold', 'italic', 'underline', 'strikeThrough'];
  const ids = ['btnBold', 'btnItalic', 'btnUnderline', 'btnStrike'];
  cmds.forEach((cmd, i) => {
    const btn = document.getElementById(ids[i]);
    if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
  });
}

function triggerImageUpload() {
  document.getElementById('imageFileInput')?.click();
}
window.triggerImageUpload = triggerImageUpload;

function insertImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = file.name.replace(/\.[^.]+$/, '');
    img.style.maxWidth = '100%';

    img.addEventListener('click', () => {
      document.querySelectorAll('.editor-content img').forEach(i => i.classList.remove('img-selected'));
      img.classList.toggle('img-selected');
    });

    const editor = document.getElementById('editorContent');
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.appendChild(img);
    }
  };
  reader.readAsDataURL(file);
}

function insertCodeBlock() {
  const editor = document.getElementById('editorContent');
  if (!editor) return;
  editor.focus();
  const pre = document.createElement('pre');
  pre.innerHTML = '<code>// 코드를 여기에 작성하세요</code>';
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(pre);
    const textNode = pre.querySelector('code');
    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    editor.appendChild(pre);
  }
}
window.insertCodeBlock = insertCodeBlock;

function insertTable() {
  const editor = document.getElementById('editorContent');
  if (!editor) return;
  editor.focus();
  const html = `
    <table>
      <thead><tr><th>제목 1</th><th>제목 2</th><th>제목 3</th></tr></thead>
      <tbody>
        <tr><td>내용</td><td>내용</td><td>내용</td></tr>
        <tr><td>내용</td><td>내용</td><td>내용</td></tr>
      </tbody>
    </table>
    <p></p>
  `;
  document.execCommand('insertHTML', false, html);
}
window.insertTable = insertTable;

let savedRange = null;

function openLinkModal() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) savedRange = sel.getRangeAt(0).cloneRange();
  const modal = document.getElementById('linkModal');
  if (modal) {
    modal.classList.add('open');
    const text = sel ? sel.toString() : '';
    document.getElementById('linkText').value = text;
    document.getElementById('linkURL').focus();
  }
}
window.openLinkModal = openLinkModal;

function closeLinkModal() {
  const modal = document.getElementById('linkModal');
  if (modal) modal.classList.remove('open');
}
window.closeLinkModal = closeLinkModal;

function insertLink() {
  const text = document.getElementById('linkText').value.trim();
  const url  = document.getElementById('linkURL').value.trim();
  if (!url) { closeLinkModal(); return; }

  const editor = document.getElementById('editorContent');
  editor.focus();

  if (savedRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  const displayText = text || url;
  document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener">${displayText}</a>`);
  closeLinkModal();
}
window.insertLink = insertLink;

function saveDocument() {
  const title   = document.getElementById('editorTitle')?.value || '새 문서';
  const content = document.getElementById('editorContent')?.innerHTML || '';
  editorSavedContent = content;

  // Save to localStorage
  const docs = JSON.parse(localStorage.getItem('blackcatbook-docs') || '{}');
  const id = 'doc_' + Date.now();
  docs[id] = { title, content, savedAt: new Date().toISOString() };
  localStorage.setItem('blackcatbook-docs', JSON.stringify(docs));

  // Visual feedback
  const editLink = document.querySelector('.edit-link');
  if (editLink) editLink.textContent = '✓ 저장됨';
  setTimeout(() => { if (editLink) editLink.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> 방금 저장됨`; }, 1500);
}
window.saveDocument = saveDocument;

function publishDocument() {
  saveDocument();
  alert('✅ 문서가 게시되었습니다!');
}
window.publishDocument = publishDocument;

// Modal overlay click to close
document.addEventListener('click', (e) => {
  const modal = document.getElementById('linkModal');
  if (modal && e.target === modal) closeLinkModal();
});

// ========== INIT ==========
navigate('home');

// Open first folder by default
const firstFolder = document.querySelector('.has-children');
if (firstFolder) firstFolder.classList.add('open');
