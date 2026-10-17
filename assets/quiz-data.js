/* 생산운영관리 퀴즈 문제 은행 (그림 포함).
   type: 'mc' 객관식(a=정답 번호, 0부터) · 'multi' 복수선택(a=[번호...]) · 'ox'(a=true/false) · 'num' 계산(a=숫자, tol=허용오차)
   fig: 문제 그림 · sec: 관련 섹션 */
(function () {
  const R = String.raw, F = window.QF;
  let uid = 0;
  const C = { ink: '#2b1a07', blue: '#ff6f1e', deep: '#ce500a', soft: '#fff0e6', mist: '#a8a29e', line: '#e8ddd3', red: '#d14343', green: '#3f9d6b', cream: '#f7efe9' };
  const svg = (w, h, body, maxw) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${maxw || w}px;height:auto" font-family="Geist, Gowun Dodum, sans-serif" font-size="12" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const arrowDef = (id, c) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c || C.ink}"/></marker></defs>`;

  /* 공정 흐름: stages = [{n:'접수', t:'5분', r:'1명'}] */
  const flowLine = (stages, demand) => {
    const id = 'fl' + (++uid), bw = 104, gap = 26, W = stages.length * (bw + gap) + 70, H = 110;
    let s = arrowDef(id);
    if (demand) s += `<text x="4" y="20" fill="${C.deep}" font-weight="600">수요 ${demand}</text>`;
    stages.forEach((st, i) => {
      const x = 40 + i * (bw + gap);
      s += `<rect x="${x}" y="30" width="${bw}" height="62" rx="12" fill="#fff" stroke="${C.blue}" stroke-width="1.5"/>`;
      s += `<text x="${x + bw / 2}" y="52" text-anchor="middle" font-weight="600" fill="${C.ink}" font-size="13">${st.n}</text>`;
      s += `<text x="${x + bw / 2}" y="70" text-anchor="middle" fill="${C.deep}">${st.t}</text>`;
      s += `<text x="${x + bw / 2}" y="85" text-anchor="middle" fill="${C.mist}" font-size="11">${st.r}</text>`;
      const xe = x + bw;
      s += `<line x1="${i ? x - gap + 2 : 8}" y1="61" x2="${x - 2}" y2="61" stroke="${C.ink}" marker-end="url(#${id})"/>`;
      if (i === stages.length - 1) s += `<line x1="${xe + 2}" y1="61" x2="${xe + 26}" y2="61" stroke="${C.ink}" marker-end="url(#${id})"/>`;
    });
    return svg(W, H, s, Math.min(W, 640));
  };

  /* 선행관계 그래프: nodes [{id,x,y,t}], edges [[f,t]] */
  const prec = (w, h, nodes, edges) => F.graph({ w, h, r: 22, nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y, l: n.id, sub: n.t + '초' })), edges: edges.map(([f, t]) => ({ f, t })) });

  /* 손익분기 그래프: sites [{n,F,v,c}], qmax */
  const bePlot = (sites, qmax, mark) => {
    const W = 460, H = 250, x0 = 60, y0 = 210, pw = 370, ph = 180;
    const ymax = Math.max(...sites.map(s => s.F + s.v * qmax)) * 1.05;
    const X = q => x0 + q / qmax * pw, Y = c => y0 - c / ymax * ph;
    let s = `<line x1="${x0}" y1="${y0}" x2="${x0 + pw + 10}" y2="${y0}" stroke="${C.ink}"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - ph - 10}" stroke="${C.ink}"/>`;
    s += `<text x="${x0 + pw + 8}" y="${y0 + 34}" text-anchor="end" fill="${C.mist}">Q (연간 생산량)</text><text x="${x0 - 6}" y="${y0 - ph - 14}" fill="${C.mist}">총비용</text>`;
    for (let k = 0; k <= 4; k++) { const q = qmax * k / 4; s += `<text x="${X(q)}" y="${y0 + 16}" text-anchor="middle" fill="${C.mist}" font-size="10.5">${q.toLocaleString()}</text>`; }
    sites.forEach(st => {
      s += `<line x1="${X(0)}" y1="${Y(st.F)}" x2="${X(qmax)}" y2="${Y(st.F + st.v * qmax)}" stroke="${st.c}" stroke-width="2.2"/>`;
      s += `<text x="${X(qmax) + 6}" y="${Y(st.F + st.v * qmax) + 4}" fill="${st.c}" font-weight="600">${st.n}</text>`;
    });
    if (mark != null) s += `<line x1="${X(mark)}" y1="${y0}" x2="${X(mark)}" y2="${y0 - ph}" stroke="${C.mist}" stroke-dasharray="4 3"/><text x="${X(mark)}" y="${y0 - ph - 2}" text-anchor="middle" fill="${C.deep}">Q = ${mark.toLocaleString()}</text>`;
    return svg(W, H, s, 460);
  };

  /* 좌표 평면: pts [{n,x,y,l}], cand [{n,x,y}] */
  const plane = (pts, cand = [], max = 10) => {
    const S = 26, o = 30, W = o + max * S + 95, H = o + max * S + 10;
    const X = x => o + x * S, Y = y => H - o + 6 - y * S;
    let s = '';
    for (let k = 0; k <= max; k++) {
      s += `<line x1="${X(k)}" y1="${Y(0)}" x2="${X(k)}" y2="${Y(max)}" stroke="${C.line}"/><line x1="${X(0)}" y1="${Y(k)}" x2="${X(max)}" y2="${Y(k)}" stroke="${C.line}"/>`;
      if (k % 2 === 0) s += `<text x="${X(k)}" y="${Y(0) + 15}" text-anchor="middle" fill="${C.mist}" font-size="10">${k}</text><text x="${X(0) - 8}" y="${Y(k) + 4}" text-anchor="end" fill="${C.mist}" font-size="10">${k}</text>`;
    }
    pts.forEach(p => { s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${6 + Math.sqrt(p.l) * 1.2}" fill="${C.soft}" stroke="${C.blue}" stroke-width="1.5"/><text x="${X(p.x)}" y="${Y(p.y) + 4}" text-anchor="middle" font-weight="600" fill="${C.deep}">${p.n}</text><text x="${X(p.x) + 12 + Math.sqrt(p.l)}" y="${Y(p.y) - 10}" fill="${C.ink}" font-size="11">${p.n}(${p.x},${p.y}) 부하 ${p.l}</text>`; });
    cand.forEach(c => { s += `<path d="M${X(c.x) - 7} ${Y(c.y) - 7}L${X(c.x) + 7} ${Y(c.y) + 7}M${X(c.x) + 7} ${Y(c.y) - 7}L${X(c.x) - 7} ${Y(c.y) + 7}" stroke="${C.red}" stroke-width="2.5"/><text x="${X(c.x) + 9}" y="${Y(c.y) + 16}" fill="${C.red}" font-size="11">${c.n}</text>`; });
    return svg(W, H, s, 400);
  };

  /* 신뢰성 블록: blocks = [0.95, [0.9, 0.9], 0.98] (배열 = 병렬) */
  const relDiag = blocks => {
    const bw = 64, gap = 40, W = blocks.length * (bw + gap) + 40, H = 130, cy = 65;
    let s = `<line x1="4" y1="${cy}" x2="24" y2="${cy}" stroke="${C.ink}"/>`;
    blocks.forEach((b, i) => {
      const x = 24 + i * (bw + gap);
      if (Array.isArray(b)) {
        const n = b.length, sp = 40, top = cy - (n - 1) * sp / 2;
        s += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + (n - 1) * sp}" stroke="${C.ink}"/><line x1="${x + bw + 20}" y1="${top}" x2="${x + bw + 20}" y2="${top + (n - 1) * sp}" stroke="${C.ink}"/>`;
        b.forEach((r, k) => { const y = top + k * sp; s += `<line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y}" stroke="${C.ink}"/><rect x="${x + 10}" y="${y - 14}" width="${bw - 10}" height="28" rx="6" fill="${k ? C.soft : '#fff'}" stroke="${k ? C.blue : C.ink}"/><text x="${x + 10 + (bw - 10) / 2}" y="${y + 4}" text-anchor="middle">${r}</text><line x1="${x + bw}" y1="${y}" x2="${x + bw + 20}" y2="${y}" stroke="${C.ink}"/>`; });
        s += `<line x1="${x + bw + 20}" y1="${cy}" x2="${x + bw + gap}" y2="${cy}" stroke="${C.ink}"/>`;
      } else {
        s += `<rect x="${x}" y="${cy - 16}" width="${bw}" height="32" rx="6" fill="#fff" stroke="${C.ink}"/><text x="${x + bw / 2}" y="${cy + 5}" text-anchor="middle">${b}</text><line x1="${x + bw}" y1="${cy}" x2="${x + bw + gap}" y2="${cy}" stroke="${C.ink}"/>`;
      }
    });
    return svg(W, H, s, Math.min(W, 520));
  };

  /* 공정도 기호 5개를 번호와 함께 (섞인 순서) */
  const SYM = {
    op: '<circle cx="20" cy="20" r="13" fill="none" stroke="#2b1a07" stroke-width="2"/>',
    in: '<rect x="7" y="7" width="26" height="26" fill="none" stroke="#2b1a07" stroke-width="2"/>',
    tr: '<path d="M4 13H22V6L36 20L22 34V27H4Z" fill="none" stroke="#2b1a07" stroke-width="2"/>',
    de: '<path d="M8 6H20A14 14 0 0 1 20 34H8Z" fill="none" stroke="#2b1a07" stroke-width="2"/>',
    st: '<path d="M5 7H35L20 33Z" fill="none" stroke="#2b1a07" stroke-width="2"/>'
  };
  const symbols = order => svg(order.length * 80 + 10, 80, order.map((k, i) => `<g transform="translate(${20 + i * 80},6)">${SYM[k]}<text x="20" y="62" text-anchor="middle" font-size="14" font-weight="600" fill="${C.deep}">${i + 1}</text></g>`).join(''), 420);

  /* 용량 증설 그림 */
  const capFig = early => {
    let s = `<line x1="30" y1="150" x2="330" y2="150" stroke="${C.ink}"/><line x1="30" y1="150" x2="30" y2="15" stroke="${C.ink}"/><text x="325" y="166" text-anchor="end" fill="${C.mist}">시간</text>`;
    s += early ? `<path d="M30 118H90V90H160V62H230V34H320" fill="none" stroke="${C.blue}" stroke-width="2.4"/>` : `<path d="M30 146H100V118H170V90H240V62H320" fill="none" stroke="${C.blue}" stroke-width="2.4"/>`;
    s += `<path d="M30 140L320 45" stroke="${C.red}" stroke-width="2"/><text x="300" y="40" fill="${C.red}">수요</text><text x="40" y="24" fill="${C.blue}">용량</text>`;
    return svg(340, 175, s, 360);
  };

  /* 다구찌 vs 전통 손실 */
  const lossFig = svg(380, 180, `<line x1="30" y1="150" x2="360" y2="150" stroke="${C.ink}"/><line x1="30" y1="150" x2="30" y2="10" stroke="${C.ink}"/><path d="M70 20 Q 195 280 320 20" fill="none" stroke="${C.blue}" stroke-width="2.4"/><path d="M30 60H110V150H280V60H360" fill="none" stroke="${C.mist}" stroke-width="2" stroke-dasharray="5 4"/><g text-anchor="middle"><text x="110" y="168">하한</text><text x="195" y="168">목표</text><text x="280" y="168">상한</text></g><text x="330" y="22" fill="${C.deep}">곡선 ①</text><text x="335" y="56" fill="${C.mist}">계단 ②</text><text x="36" y="18" fill="${C.mist}">손실</text>`, 380);

  /* 품질의 집 (일부 칸을 ? 로) */
  const hoq = svg(400, 230, `<path d="M120 60L210 10L300 60Z" fill="${C.cream}" stroke="${C.mist}"/><text x="210" y="48" text-anchor="middle" font-size="11">기술특성 간 관계</text><rect x="120" y="60" width="180" height="40" fill="#fff" stroke="${C.mist}"/><text x="210" y="85" text-anchor="middle">How (기술 특성)</text><rect x="10" y="100" width="110" height="90" fill="${C.soft}" stroke="${C.blue}" stroke-width="2"/><text x="65" y="150" text-anchor="middle" font-size="26" fill="${C.deep}">?</text><rect x="120" y="100" width="180" height="90" fill="#fff" stroke="${C.mist}"/><text x="210" y="148" text-anchor="middle">관계 행렬</text><rect x="300" y="100" width="90" height="90" fill="#fff" stroke="${C.mist}"/><text x="345" y="148" text-anchor="middle">경쟁수준</text><rect x="120" y="190" width="180" height="32" fill="#fff" stroke="${C.mist}"/><text x="210" y="211" text-anchor="middle">기술 특성값</text>`, 400);

  /* 차별화 지연 그림 */
  const ddFig = svg(460, 120, `${arrowDef('dd9', C.mist)}<rect x="10" y="40" width="80" height="34" rx="8" fill="#fff" stroke="${C.mist}"/><text x="50" y="62" text-anchor="middle">흰 실</text><line x1="92" y1="57" x2="140" y2="57" stroke="${C.mist}" marker-end="url(#dd9)"/><rect x="145" y="40" width="120" height="34" rx="8" fill="${C.soft}" stroke="${C.blue}"/><text x="205" y="62" text-anchor="middle" fill="${C.deep}">흰 티셔츠 재고</text><line x1="267" y1="57" x2="315" y2="57" stroke="${C.mist}" marker-end="url(#dd9)"/><text x="330" y="40" fill="${C.ink}">주문 확인 후</text><g><circle cx="340" cy="62" r="9" fill="${C.red}"/><circle cx="364" cy="62" r="9" fill="${C.green}"/><circle cx="388" cy="62" r="9" fill="${C.blue}"/><circle cx="412" cy="62" r="9" fill="#e3a02f"/></g><text x="330" y="94" fill="${C.ink}">염색</text>`, 460);

  /* 호텔 규모 그래프 */
  const hotelFig = svg(420, 190, `<line x1="40" y1="160" x2="400" y2="160" stroke="${C.ink}"/><line x1="40" y1="160" x2="40" y2="10" stroke="${C.ink}"/><text x="46" y="20" fill="${C.mist}">1인당 운영비용</text><text x="395" y="176" text-anchor="end" fill="${C.mist}">객실 수</text><path d="M60 50 Q 115 150 170 60" fill="none" stroke="${C.mist}" stroke-width="2"/><path d="M160 100 Q 220 180 280 100" fill="none" stroke="${C.blue}" stroke-width="2.4"/><path d="M270 70 Q 325 160 380 40" fill="none" stroke="${C.mist}" stroke-width="2"/><g text-anchor="middle"><text x="115" y="40">250실</text><text x="220" y="92" fill="${C.deep}">500실</text><text x="325" y="58">750실</text></g>`, 420);

  /* 제품-프로세스 행렬 */
  const ppmFig = svg(440, 250, `<rect x="90" y="30" width="340" height="210" fill="#fff" stroke="${C.line}"/><path d="M330 30H430V110Z" fill="${C.line}"/><path d="M90 160V240H190Z" fill="${C.line}"/><g text-anchor="end" font-size="11"><text x="84" y="55">프로젝트</text><text x="84" y="97">잡숍</text><text x="84" y="139">뱃치</text><text x="84" y="181">조립라인</text><text x="84" y="223">연속</text></g><g text-anchor="middle" font-size="10.5"><text x="124" y="22">유일</text><text x="192" y="22">소량</text><text x="260" y="22">다품종 소량</text><text x="328" y="22">소수 대량</text><text x="396" y="22">대량 표준</text></g><path d="M124 52L192 94L260 136L328 178L396 220" stroke="${C.mist}" stroke-dasharray="4 3" fill="none"/><g fill="${C.soft}" stroke="${C.blue}"><circle cx="124" cy="52" r="17"/><circle cx="192" cy="94" r="17"/><circle cx="260" cy="136" r="17"/><circle cx="328" cy="178" r="17"/><circle cx="396" cy="220" r="17"/></g><g text-anchor="middle" font-size="11" fill="${C.deep}"><text x="124" y="56">①</text><text x="192" y="98">②</text><text x="260" y="140">③</text><text x="328" y="182">④</text><text x="396" y="224">⑤</text></g>`, 440);

  /* 7점 거리 행렬 (06장 예제) */
  const MD = [[0, 4, 3, 3, 6, 5, 6], [4, 0, 2, 3, 4, 5, 5], [3, 2, 0, 1, 4, 3, 4], [3, 3, 1, 0, 3, 2, 3], [7, 4, 4, 3, 0, 1, 1], [5, 5, 3, 2, 1, 0, 1], [6, 5, 5, 3, 1, 1, 0]];
  const mdTable = F.table(['F \\ T', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'], [...MD.map((r, i) => ['P' + (i + 1), ...r]), ['<b>부하</b>', 1, 2, 2, 5, 3, 1, 2]]);

  window.RL_QUIZ = [
  /* ===================== 01 개념 ===================== */
  { id: '01-01', ch: '01', type: 'mc',
    q: R`다음 중 <b>시스템 설계 (전략적 의사결정)</b> 에 해당하지 <b>않는</b> 것은?`,
    c: ['설비 입지 선정', '공급 사슬 설계', '생산 스케줄링', '프로세스 설계'], a: 2,
    ex: R`생산 스케줄링은 단기적인 <b>시스템 운영</b> (전술적·운영적) 결정이에요. 나머지는 중장기, 변경 비용이 큰 설계 결정.`, sec: 'ch01-concept.html#dtype' },
  { id: '01-02', ch: '01', type: 'mc',
    q: R`커피전문점 창업에서 <b>“매장에 테이블을 20개 둔다”</b> 는 결정은 어느 주제(장)에 해당하나?`,
    c: ['입지선정 (6장)', '용량계획 (7장)', '수요예측', '제품 설계 (3장)'], a: 1,
    ex: R`얼마나 큰 규모로 만들지 = <b>용량계획</b>. 매장 위치는 입지, 메뉴는 제품 설계, 하루 200명 예상은 수요예측.`, sec: 'ch01-concept.html#coffee' },
  { id: '01-03', ch: '01', type: 'mc',
    fig: F.table(['', '제조업', '서비스업'], [['집약도', '자본 집약적', '①'], ['고객 관여도', '낮음', '②'], ['산출물', '유형', '③'], ['재고수준', '높음', '④']]),
    q: R`표의 빈칸에 들어갈 서비스업의 특성으로 <b>틀린</b> 것은?`,
    c: ['① 노동 집약적', '② 높음', '③ 무형', '④ 높음'], a: 3,
    ex: R`서비스는 무형이라 <b>저장할 수 없어서 재고수준이 낮아요</b>. 그래서 07장에서 서비스업은 피크용량이 중요하다고 나와요.`, sec: 'ch01-concept.html#ps' },
  { id: '01-04', ch: '01', type: 'ox',
    q: R`“각 부서가 독립적으로 구한 최적해를 합치면 전체 시스템의 최적해보다 더 좋을 수 있다.”`,
    a: false, ex: R`독립적인 최적해의 합은 전체 최적해보다 <b>좋을 수 없어요</b> → 그래서 하위 요소보다 전체를 최적화하는 <b>시스템적 접근</b>이 필요.`, sec: 'ch01-concept.html#consider' },
  { id: '01-05', ch: '01', type: 'mc',
    q: R`재고 품목을 중요도에 따라 A·B·C 등급으로 나누어 관리하는 ABC 분석의 근거가 되는 것은?`,
    c: ['파레토 법칙 (80/20)', '상쇄관계 분석', '테일러의 과학적 관리법', '간트 차트'], a: 0,
    ex: R`전체 성과의 대부분(80%)이 소수(20%)의 요소에 의존 = 파레토 법칙 → 관리 대상의 <b>우선순위</b> 결정.`, sec: 'ch01-concept.html#consider' },
  { id: '01-06', ch: '01', type: 'ox',
    q: R`“재고를 늘리면 품절은 줄지만 보관비는 늘어난다” 는 의사결정 고려사항 중 <b>상쇄관계 (trade-off)</b> 의 예이다.`,
    a: true, ex: R`두 목표를 동시에 만족할 수 없어 하나를 얻으려면 다른 하나를 희생 = 상쇄관계.`, sec: 'ch01-concept.html#consider' },
  { id: '01-07', ch: '01', type: 'multi',
    q: R`<b>과학적 관리법 시대 (1900년대 초~)</b> 와 관련된 인물을 모두 고르면?`,
    c: ['프레드릭 테일러 (시간연구)', '프랭크 길브레스 (동작연구)', '엘튼 메이요 (동기)', '헨리 간트 (간트 차트)', '단찌히 (심플렉스법)', '헨리 포드 (모델T)'], a: [0, 1, 3, 5],
    ex: R`메이요는 1930~60년대 <b>인간 관계론</b>, 단찌히(1947)는 2차 세계대전 이후 <b>OR·선형계획법</b>이에요.`, sec: 'ch01-concept.html#history' },
  { id: '01-08', ch: '01', type: 'mc',
    q: R`경제적 주문량 (EOQ) 모형을 제시한 사람과 연도는?`,
    c: ['테일러, 1911', '포드 해리스, 1913', '단찌히, 1947', '헨리 간트, 1917'], a: 1,
    ex: R`포드 해리스 (1913) 의 EOQ. 테일러 1911 은 과학적 관리법, 단찌히 1947 은 심플렉스법.`, sec: 'ch01-concept.html#history' },
  { id: '01-09', ch: '01', type: 'mc',
    q: R`변수 간 관계를 <b>기호화된 수식</b>으로 표현하고, 최적화·휴리스틱으로 푸는 모형은?`,
    c: ['문장 모형', '도식적 모형', '수리적 모형', '물리적 모형'], a: 2,
    ex: R`문장 모형 = 언어, 도식적 모형 = 도형·그래프, <b>수리적 모형 = 수식</b>.`, sec: 'ch01-concept.html#model' },
  { id: '01-10', ch: '01', type: 'mc',
    q: R`<b>병원</b>을 하나의 시스템으로 볼 때 <b>산출물</b>은?`,
    c: ['의사', '병실', '의료도구', '치료된 환자'], a: 3,
    ex: R`투입물 = 의사, 병실, 의료도구 → 산출물 = 치료된 환자. (공장: 원자재·노동력·설비 → 생산된 물품)`, sec: 'ch01-concept.html#pm' },
  { id: '01-11', ch: '01', type: 'mc',
    q: R`“빅데이터 없이 수학 공식을 이용해 최적의 답을 찾는다. 내비게이션 길 찾기, 공장 생산 계획에 쓰인다.” 이 설명에 해당하는 것은?`,
    c: ['수학적 최적화', '인공지능 (AI)', '시뮬레이션', '벤치마킹'], a: 0,
    ex: R`AI 는 과거의 <b>빅데이터</b>를 분석해 답을 도출. 수학적 최적화는 수식(모델)으로 답을 찾아 시간·비용이 상대적으로 적어요.`, sec: 'ch01-concept.html#case' },

  /* ===================== 02 전략 ===================== */
  { id: '02-01', ch: '02', type: 'num',
    q: R`어느 공장의 분기 생산품 총 가치가 180억원, 인건비 40억원, 원자재비 50억원, 기타 30억원이다. <b>종합 생산성</b>은?`,
    a: 1.5, tol: 0.001, ex: R`\(\dfrac{180}{40+50+30} = \dfrac{180}{120} = 1.5\)`, sec: 'ch02-strategy.html#ex' },
  { id: '02-02', ch: '02', type: 'num',
    q: R`작업자 4명이 하루 7.5시간씩 일하며 하루에 90대를 수리한다. <b>노동생산성</b> (대 / 명·시간) 은?`,
    a: 3, tol: 0.001, ex: R`\(\dfrac{90}{4 \times 7.5} = \dfrac{90}{30} = 3\) 대/(명·시간)`, sec: 'ch02-strategy.html#ex' },
  { id: '02-03', ch: '02', type: 'num',
    q: R`지난달 XYZ 수리점의 노동생산성은 2.5 대/(명·시간) 이었다. 이번 달은 작업자 3명, 일평균 8시간, 하루 66대를 수리했다. 생산성은 몇 % 증가했나?`,
    a: 10, tol: 0.05, ex: R`이번 달: \(66 / (3\times8) = 2.75\). 증가율 = \((2.75 - 2.5)/2.5 = 10\%\). 생산성은 <b>상대적</b> 지표 → 과거와 비교!`, sec: 'ch02-strategy.html#meaning' },
  { id: '02-04', ch: '02', type: 'num',
    q: R`어느 병원의 한 달 퇴원 환자가 1,200명이고 병상이 300개다. <b>병상회전율</b>은?`,
    a: 4, tol: 0.001, ex: R`병상회전율 = 퇴원실 인원수 / 병상수 = 1200 / 300 = 4. 서비스 산업은 전통적 생산성과 다른 지표가 필요해요.`, sec: 'ch02-strategy.html#service' },
  { id: '02-05', ch: '02', type: 'mc',
    q: R`Zara 는 빠르게 신상품을 내놓고, 다양한 디자인을 소량씩 생산한다. 주로 어떤 경쟁우선순위들인가?`,
    c: ['비용과 품질', '시간과 유연성', '비용과 시간', '품질과 유연성'], a: 1,
    ex: R`빠른 신상품 = <b>시간</b>, 다양한 디자인 소량 = <b>유연성</b>.`, sec: 'ch02-strategy.html#cp' },
  { id: '02-06', ch: '02', type: 'mc',
    q: R`월마트의 “Everyday Low Price ← Everyday Low Cost” 는 어떤 전략인가?`,
    c: ['비용기반 전략', '품질기반 전략', '시간기반 전략', '유연성기반 전략'], a: 0,
    ex: R`낮은 원가로 낮은 가격 = 비용기반. 낭비 제거, 자동화, 표준화 대량생산이 수단.`, sec: 'ch02-strategy.html#sm' },
  { id: '02-07', ch: '02', type: 'mc',
    q: R`다음 중 <b>목표 (Objective)</b> 에 해당하는 것은?`,
    c: ['“일하기 좋은 회사가 된다” (코카콜라)', '“2040년까지 전 세계 작업에서 탄소를 배출하지 않는다” (월마트)', '“지구상에서 가장 고객 중심적인 회사가 된다” (아마존)', '“인간의 정신에 영감을 불어넣고 풍요롭게 한다” (스타벅스)'], a: 1,
    ex: R`목표 = <b>평가 가능</b>하게 구체화된 계획 (연도·수치). ① 목적 ③ 비전 ④ 미션.`, sec: 'ch02-strategy.html#goal' },
  { id: '02-08', ch: '02', type: 'ox',
    q: R`일평균 수요가 100개인 제품의 생산량을 100개에서 200개로 늘렸다면 <b>효과성</b>이 높아진 것이다.`,
    a: false, ex: R`팔리지 않는 재고만 늘어요. 효율은 올랐을지 몰라도 <b>효과성 (올바른 일을 하는가)</b> 은 없음. 생산성 향상 = 효과성 + 효율성.`, sec: 'ch02-strategy.html#meaning' },
  { id: '02-09', ch: '02', type: 'mc',
    q: R`“노동, 설비, 에너지의 <b>조합</b>” 을 분모로 쓰는 생산성은?`,
    c: ['종합 생산성', '단일요소 생산성', '다요소 생산성', '노동생산성'], a: 2,
    ex: R`종합 = 전체 투입물, 단일요소 = 하나의 투입물, <b>다요소 = 복수 투입물의 조합</b>.`, sec: 'ch02-strategy.html#prod' },
  { id: '02-10', ch: '02', type: 'ox',
    q: R`경쟁우선순위 사이에는 상쇄관계가 있으므로, 한 가지를 선택하면 나머지는 무시해도 된다.`,
    a: false, ex: R`상쇄관계는 있지만 다른 우선순위를 <b>경시하지 않아요</b>. 품질이 좋아도 가격이 너무 비싸면 외면받음.`, sec: 'ch02-strategy.html#choose' },

  /* ===================== 03 설계 ===================== */
  { id: '03-01', ch: '03', type: 'num', fig: relDiag([0.95, [0.9, 0.9], 0.98]),
    q: R`위 시스템 (0.95 직렬 → 0.9 두 개 병렬 → 0.98 직렬) 의 신뢰성은? (소수 셋째 자리)`,
    a: 0.922, tol: 0.0015, ex: R`병렬부: \(0.9 + (1-0.9)\times0.9 = 0.99\). 전체 \(0.95 \times 0.99 \times 0.98 = 0.9217\)`, sec: 'ch03-design.html#rel' },
  { id: '03-02', ch: '03', type: 'num',
    q: R`신뢰성 0.95 인 부품 4개를 <b>직렬</b>로 연결한 제품의 신뢰성은? (소수 셋째 자리)`,
    a: 0.815, tol: 0.0015, ex: R`\(0.95^4 = 0.8145\). 부품이 많을수록 직렬 신뢰성은 빨리 떨어져요 → DFM 에서 <b>부품 수 감소</b>가 중요한 이유.`, sec: 'ch03-design.html#rel' },
  { id: '03-03', ch: '03', type: 'num',
    q: R`신뢰성 0.8 인 부품을 병렬로 연결해 그 부분의 신뢰성을 <b>0.99 이상</b>으로 만들려면 최소 몇 개가 필요한가?`,
    a: 3, tol: 0, ex: R`모두 고장날 확률 \(0.2^n \le 0.01\). n=2: 0.04 (신뢰성 0.96) ✕, n=3: 0.008 (0.992) ✓.`, sec: 'ch03-design.html#rel' },
  { id: '03-04', ch: '03', type: 'mc',
    q: R`가치공학에서 <b>가치를 높이는 방법이 아닌</b> 것은?`,
    c: ['동일한 기능을 수행하면서 비용을 절감', '동일한 비용에 기능 수준을 향상', '불필요한 기능을 제거해 비용을 낮춤', '기능은 그대로 두고 고급 소재로 비용을 높임'], a: 3,
    ex: R`가치 = 기능 / 비용. 기능 그대로 비용 ↑ 면 가치 ↓.`, sec: 'ch03-design.html#ve' },
  { id: '03-05', ch: '03', type: 'mc',
    q: R`카노 설문에서 긍정적 질문 (“동영상 수가 많다면?”) 에 <b>“마음에 든다”</b>, 부정적 질문 (“적다면?”) 에 <b>“하는 수 없다”</b> 고 답했다. 이 품질 요소는?`,
    c: ['매력적 품질', '일원적 품질', '당연적 품질', '무관심 품질', '역 품질'], a: 0,
    ex: R`있으면 좋고, 없어도 참을 만함 → <b>매력적</b>. (긍정 a 행에서 부정이 b, c, d 면 매력적, e 면 일원적)`, sec: 'ch03-design.html#kano' },
  { id: '03-06', ch: '03', type: 'mc',
    q: R`긍정 질문에 <b>“마음에 든다”</b>, 부정 질문에 <b>“마음에 안 든다”</b> 고 답했다면?`,
    c: ['매력적 품질', '일원적 품질', '당연적 품질', '역 품질'], a: 1,
    ex: R`있으면 만족, 없으면 불만 — 충족 정도에 비례 = <b>일원적</b> (예: 배터리 지속 시간).`, sec: 'ch03-design.html#kano' },
  { id: '03-07', ch: '03', type: 'mc',
    q: R`긍정 질문에 <b>“당연하다”</b>, 부정 질문에 <b>“마음에 안 든다”</b> 고 답했다면?`,
    c: ['매력적 품질', '일원적 품질', '당연적 품질', '무관심 품질'], a: 2,
    ex: R`있으면 당연, 없으면 불만 = <b>당연적</b> (예: 통화 기능, 깨끗한 침구, 브레이크).`, sec: 'ch03-design.html#kano' },
  { id: '03-08', ch: '03', type: 'mc',
    q: R`슬라이드 카노 예시에서 모바일 앱의 <b>“시도 때도 없는 푸시 알림”</b> 은?`,
    c: ['당연적', '일원적', '매력적', '무관심', '역'], a: 4,
    ex: R`있으면 오히려 불만 = <b>역 품질</b>. 무관심은 “화려하지만 앱 속도만 늦추는 애니메이션”.`, sec: 'ch03-design.html#kano' },
  { id: '03-09', ch: '03', type: 'mc', fig: ddFig,
    q: R`그림처럼 흰 티셔츠까지만 만들어 두고, 주문이 확인된 뒤 색을 입히는 설계 기법은?`,
    c: ['모듈화 설계', '차별화 지연', '표준화', '동시공학'], a: 1,
    ex: R`소비자 욕구가 알려질 때까지 제품을 서로 다르게 만드는 생산을 <b>지연</b> → 공통 재고로 수요 변화에 유연.`, sec: 'ch03-design.html#dd' },
  { id: '03-10', ch: '03', type: 'mc', fig: lossFig,
    q: R`그림에서 다구찌가 제안한 품질손실 개념과 그 의미로 옳은 것은?`,
    c: ['② — 규격 안이면 손실이 없다', '① — 규격 안이라도 목표값에서 벗어날수록 손실이 커진다', '① — 상한값을 넘을 때만 손실이 생긴다', '② — 목표값에서 손실이 가장 크다'], a: 1,
    ex: R`다구찌 품질손실함수 = 목표값 중심의 <b>2차 곡선</b>. 품질 = 출하 후 사회에 끼친 손실. ② 계단은 전통적 개념.`, sec: 'ch03-design.html#robust' },
  { id: '03-11', ch: '03', type: 'mc', fig: hoq,
    q: R`품질의 집 (House of Quality) 에서 “?” 칸 (What) 에 들어가는 것은?`,
    c: ['고객요구특성 (VOC)', '기술 특성값', '경쟁 수준', '기술특성 간 관계'], a: 0,
    ex: R`왼쪽 = 고객요구특성 (What), 위 = 디자인/기술 특성 (How), 가운데 = 둘의 관계, 오른쪽 = 경쟁수준, 지붕 = 기술특성 간 관계, 아래 = 기술 특성값.`, sec: 'ch03-design.html#qfd' },
  { id: '03-12', ch: '03', type: 'ox',
    q: R`설계 단계는 제품 생산비용의 약 70% 를 차지한다.`,
    a: false, ex: R`설계는 생산비용의 약 <b>5%</b> 지만, 제품 원가에 미치는 <b>영향</b>이 약 70% 예요.`, sec: 'ch03-design.html#meaning' },
  { id: '03-13', ch: '03', type: 'mc',
    q: R`경쟁사 제품을 분해·분석해서 아이디어를 얻는 방법은?`,
    c: ['벤치마킹', '역설계 (역공학)', '타당성 조사', '시제품'], a: 1,
    ex: R`벤치마킹은 우수 기업의 제품·프로세스와 <b>비교</b>, 역설계는 <b>분해·분석</b>.`, sec: 'ch03-design.html#process' },
  { id: '03-14', ch: '03', type: 'mc',
    q: R`부품 수를 24개에서 2개로 줄이고 공정을 단순화한 설계 사례는 어떤 기법인가?`,
    c: ['제조고려설계 (DFM)', '가치공학', '서비스 블루프린트', '카노 모델'], a: 0,
    ex: R`제조 상황을 고려한 설계 — 부품 수 감소, 작업 단순화, 표준화 = DFM.`, sec: 'ch03-design.html#dfm' },

  /* ===================== 04 프로세스 ===================== */
  { id: '04-01', ch: '04', type: 'num',
    fig: prec(520, 200, [{ id: 'A', x: 50, y: 100, t: 40 }, { id: 'B', x: 170, y: 45, t: 30 }, { id: 'C', x: 170, y: 155, t: 50 }, { id: 'D', x: 300, y: 45, t: 20 }, { id: 'E', x: 300, y: 155, t: 40 }, { id: 'F', x: 440, y: 100, t: 30 }],
      [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']]),
    q: R`위 조립 라인 (숫자 = 작업시간, 초) 의 목표 주기시간이 60초일 때 이론적으로 필요한 <b>최소 작업장 수</b>는?`,
    a: 4, tol: 0, ex: R`작업시간 합 = 40+30+50+20+40+30 = 210초. \(\lceil 210/60 \rceil = \lceil 3.5 \rceil = 4\)개.`, sec: 'ch04-process.html#linebal' },
  { id: '04-02', ch: '04', type: 'num',
    fig: prec(520, 200, [{ id: 'A', x: 50, y: 100, t: 40 }, { id: 'B', x: 170, y: 45, t: 30 }, { id: 'C', x: 170, y: 155, t: 50 }, { id: 'D', x: 300, y: 45, t: 20 }, { id: 'E', x: 300, y: 155, t: 40 }, { id: 'F', x: 440, y: 100, t: 30 }],
      [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F']]),
    q: R`같은 라인을 <b>A | B,D | C | E,F</b> 의 4개 작업장으로 배정했다. 주기시간은 몇 초인가?`,
    a: 70, tol: 0, ex: R`작업장 시간: A 40, B+D 50, C 50, E+F <b>70</b> → 가장 긴 작업장이 주기시간 = 70초. (60초 목표를 지키려면 E 와 F 를 나눠야 함)`, sec: 'ch04-process.html#linebal' },
  { id: '04-03', ch: '04', type: 'num',
    q: R`작업시간의 합이 210초인 라인을 작업장 4개, 주기시간 60초로 운영한다. <b>작업장 효율</b>(%) 은?`,
    a: 87.5, tol: 0.1, ex: R`\(\dfrac{210}{4\times60}\times100 = 87.5\%\). 유휴시간 = 240 − 210 = 30초.`, sec: 'ch04-process.html#linebal' },
  { id: '04-04', ch: '04', type: 'num',
    q: R`슬라이드 제품 Y (작업시간 합 650초) 를 작업장 5개, 주기시간 140초로 재배치할 수 있다면 효율(%) 은? (소수 첫째 자리)`,
    a: 92.9, tol: 0.06, ex: R`\(\dfrac{650}{5\times140} = \dfrac{650}{700} = 92.9\%\). 시간당 산출 3600/140 ≈ 25.7개.`, sec: 'ch04-process.html#linebal' },
  { id: '04-05', ch: '04', type: 'mc',
    fig: prec(520, 300, [{ id: 'A', x: 40, y: 140, t: 120 }, { id: 'B', x: 150, y: 30, t: 100 }, { id: 'C', x: 150, y: 100, t: 50 }, { id: 'D', x: 150, y: 170, t: 90 }, { id: 'E', x: 150, y: 240, t: 30 }, { id: 'F', x: 265, y: 30, t: 20 }, { id: 'G', x: 265, y: 100, t: 40 }, { id: 'H', x: 265, y: 170, t: 60 }, { id: 'I', x: 375, y: 65, t: 80 }, { id: 'J', x: 480, y: 150, t: 60 }],
      [['A', 'B'], ['A', 'C'], ['A', 'D'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H'], ['F', 'I'], ['G', 'I'], ['H', 'J'], ['I', 'J'], ['E', 'J']]),
    q: R`제품 Y 의 선행관계에서 작업장 순서대로 배정했을 때 <b>선행관계를 위반하는</b> 배정은?`,
    c: ['A | B,F | D,E | I,G | H,J | C', 'A | B,C | D,G | F,I | H,E,J', 'A | B,F | D,E | C,H | G,I | J', 'A | B,C | D,E | F,G | H,I | J'], a: 0,
    ex: R`①은 G 가 4번째 작업장에 있는데 G 의 선행작업 C 가 마지막 작업장에 있어요 (C → G 위반). 슬라이드 대안 1의 “다른 대안” 이 이 배정이에요.`, sec: 'ch04-process.html#linebal' },
  { id: '04-06', ch: '04', type: 'mc', fig: symbols(['op', 'tr', 'de', 'in', 'st']),
    q: R`ASME 공정도 기호 중 <b>지체 (Delay)</b> 는 몇 번인가?`,
    c: ['1', '2', '3', '4', '5'], a: 2,
    ex: R`1 ○ 작업, 2 ⇨ 운반, 3 D 지체, 4 □ 검사, 5 ▽ 저장.`, sec: 'ch04-process.html#doc' },
  { id: '04-07', ch: '04', type: 'multi',
    q: R`유통공정도로 찾아내어 제거·감소하기 좋은 <b>불필요한 잠복비용</b>과 관련된 활동을 모두 고르면? (슬라이드 기준)`,
    c: ['작업', '검사', '운반', '지체', '저장'], a: [2, 3, 4],
    ex: R`슬라이드: “운반, 지체, 저장과 관련된 불필요한 잠복비용”. 작업은 부가가치를 만드는 생산적 활동.`, sec: 'ch04-process.html#flowchart' },
  { id: '04-08', ch: '04', type: 'mc',
    q: R`유통선도가 유통공정도의 한계를 보완하는 점은?`,
    c: ['소요시간을 기재할 수 있다', '활동이 현장의 <b>어디서</b> 발생하는지 한눈에 보여 준다', '5가지 기호를 사용한다', '검사 횟수를 줄인다'], a: 1,
    ex: R`유통선도 = 설비 배치도 위에 이동 경로 → 위치, 혼잡 지역, 역류 확인.`, sec: 'ch04-process.html#flowchart' },
  { id: '04-09', ch: '04', type: 'num',
    q: R`어떤 주문이 공장에 들어와 나가기까지 총 50시간이 걸렸는데, 실제 가공된 시간은 6시간이었다. <b>처리비율</b>(%) 은?`,
    a: 12, tol: 0.05, ex: R`6/50 × 100 = 12%. 10~20% 대이니 잡숍·뱃치 프로세스일 가능성이 커요 (조립·연속은 90~100%).`, sec: 'ch04-process.html#select' },
  { id: '04-10', ch: '04', type: 'mc', fig: ppmFig,
    q: R`제품-프로세스 행렬에서 ⑤ 위치 (연속 프로세스 × 대량·높은 표준화) 의 대표 예는?`,
    c: ['빌딩', '인쇄업', '자동차 조립', '제당 (설탕)'], a: 3,
    ex: R`① 빌딩 ② 인쇄업 ③ 중장비 ④ 자동차 조립 ⑤ 제당.`, sec: 'ch04-process.html#ppm' },
  { id: '04-11', ch: '04', type: 'mc',
    q: R`같은 산업에서 제품-프로세스 행렬의 <b>왼쪽 위</b> 쪽에 위치하는 기업이 강조하는 것은?`,
    c: ['낮은 원가와 표준화', '유연성과 품질', '대량 생산', '공간이용률'], a: 1,
    ex: R`왼쪽 위 = 유연성과 품질 강조, 대각선 따라 아래 = 낮은 원가의 표준화 제품.`, sec: 'ch04-process.html#ppm' },
  { id: '04-12', ch: '04', type: 'mc',
    q: R`병원, 대학, 기계의 주문 제작에 적합한 설비배치는?`,
    c: ['공정별 배치', '제품별 배치', '고정위치 배치', '연속 흐름 배치'], a: 0,
    ex: R`유사한 기능을 한 부서에 모음 → 환자(제품)마다 거치는 경로가 다름 = 공정별 배치 (다품종 소량).`, sec: 'ch04-process.html#layout' },
  { id: '04-13', ch: '04', type: 'mc',
    q: R`공정별 배치를 셀룰러 배치로 바꾸는 3단계 중 <b>첫 단계</b>는?`,
    c: ['기계·공정을 물리적으로 셀로 그룹화', '부품군들의 주된 흐름 패턴 파악', 'GT 를 이용해 공통 가공 순서를 가진 부품군으로 그룹화', '다기능 숙련공 육성'], a: 2,
    ex: R`① 부품군 그룹화 (GT) → ② 주된 흐름 패턴 파악 → ③ 기계·공정을 셀로 물리적 그룹화.`, sec: 'ch04-process.html#cell' },
  { id: '04-14', ch: '04', type: 'ox',
    q: R`프로젝트 프로세스에서는 제품이 작업장을 따라 순차적으로 흘러간다.`,
    a: false, ex: R`제품 규모가 커서 <b>제품 흐름이 없고</b> 작업자·자재가 제품 위치로 이동 (고정위치 배치).`, sec: 'ch04-process.html#types' },
  { id: '04-15', ch: '04', type: 'mc',
    q: R`프로세스 분석 6단계 중 “담당 직원의 적극적인 참여가 가장 중요하다” 는 단계는?`,
    c: ['2단계 범위 설정', '4단계 성과 평가', '5단계 재설계', '6단계 재설계 프로세스의 적용'], a: 3,
    ex: R`적용 단계: 직원 참여 + 최고경영자의 집행 의지 + 적용 기간 일정 관리.`, sec: 'ch04-process.html#steps' },
  { id: '04-16', ch: '04', type: 'mc',
    q: R`표 4-1 에서 <b>재고가 “높음”</b> 이고 장비가 범용인 프로세스 유형은?`,
    c: ['연속 및 조립라인', '배치 및 잡숍', '프로젝트', '모두 해당'], a: 1,
    ex: R`연속·조립라인: 재고 낮음, 전용 장비 / 배치·잡숍: 재고 높음, 범용 / 프로젝트: 재고 거의 없음, 범용.`, sec: 'ch04-process.html#table41' },

  /* ===================== 05 변동성 ===================== */
  { id: '05-01', ch: '05', type: 'num',
    q: R`평균 서비스 시간 p = 6분, 평균 도착 간격 a = 8분인 단일 창구의 활용률 u (%) 는?`,
    a: 75, tol: 0.05, ex: R`\(u = p/a = 6/8 = 75\%\). (수요 7.5명/시간 ÷ 능력 10명/시간)`, sec: 'ch05-variability.html#kingman' },
  { id: '05-02', ch: '05', type: 'num',
    q: R`p = 6분, a = 8분, \(CV_a = 1\), \(CV_p = 0.5\) 일 때 평균 대기시간 \(T_q\) (분) 는?`,
    a: 11.25, tol: 0.01, ex: R`\(T_q = 6 \times \dfrac{0.75}{0.25} \times \dfrac{1 + 0.25}{2} = 6 \times 3 \times 0.625 = 11.25\)분`, sec: 'ch05-variability.html#kingman' },
  { id: '05-03', ch: '05', type: 'num',
    q: R`위 문제 (\(T_q = 11.25\)분, p = 6분, a = 8분) 에서 대기 중인 평균 고객 수 \(I_q\) 는? (소수 둘째 자리)`,
    a: 1.41, tol: 0.006, ex: R`리틀의 법칙 \(I_q = T_q / a = 11.25 / 8 = 1.406\). 전체 \(I = (11.25 + 6)/8 = 2.16\), \(I_p = u = 0.75\).`, sec: 'ch05-variability.html#little' },
  { id: '05-04', ch: '05', type: 'num',
    q: R`직원 3명이 <b>한 줄</b>로 손님을 받는다 (풀링). 전체 도착 간격 a = 2.5분, p = 6분, \(CV_a = CV_p = 1\). \(T_q\) (분) 는? (소수 둘째 자리)`,
    a: 6.65, tol: 0.03, ex: R`\(u = \dfrac{6}{2.5\times3} = 0.8\), 지수 \(\sqrt{2(3+1)} - 1 = 1.828\). \(T_q = \dfrac{6}{3}\times\dfrac{0.8^{1.828}}{0.2}\times1 = 2 \times \dfrac{0.665}{0.2} = 6.65\)분. (따로 3줄이면 \(6 \times 4 = 24\)분!)`, sec: 'ch05-variability.html#pooling' },
  { id: '05-05', ch: '05', type: 'num',
    q: R`다른 조건은 그대로 두고 활용률이 0.8 에서 0.9 로 오르면 대기시간 \(T_q\) 는 몇 배가 되나?`,
    a: 2.25, tol: 0.01, ex: R`\(\frac{u}{1-u}\): 0.8 → 4, 0.9 → 9. 9/4 = 2.25배. (p 가 같다고 볼 때) 활용률이 1 에 가까울수록 대기가 폭발해요.`, sec: 'ch05-variability.html#kingman' },
  { id: '05-06', ch: '05', type: 'num',
    q: R`도착 간격이 평균 a = 5분인 지수분포를 따른다. 다음 손님이 <b>10분 안에</b> 올 확률은? (소수 둘째 자리)`,
    a: 0.86, tol: 0.006, ex: R`\(P(T \le 10) = 1 - e^{-10/5} = 1 - e^{-2} = 0.865\)`, sec: 'ch05-variability.html#arrival' },
  { id: '05-07', ch: '05', type: 'mc',
    q: R`지수분포의 <b>무기억성</b>의 의미로 옳은 것은?`,
    c: ['도착 간격의 평균이 0 이다', '다음 시간 간격 동안의 도착 수는 최근 도착 시간과 상관이 없다', '도착 간격의 분산이 0 이다', '도착은 항상 일정한 간격으로 일어난다'], a: 1,
    ex: R`\(P(T > t+s \mid T > t) = P(T > s)\) — 이미 기다린 시간이 앞으로의 대기에 영향을 주지 않아요.`, sec: 'ch05-variability.html#arrival' },
  { id: '05-08', ch: '05', type: 'mc',
    q: R`버스 비유에서 <b>“버스가 고장이 나서”</b> 늦어지는 것은 변동성의 어떤 원인인가?`,
    c: ['입력 (도착) 으로 인한 변동성', '작업 시간의 변동성', '자원의 무작위적 가용성', '흐름 단위의 무작위적 경로 결정'], a: 2,
    ex: R`늦게 와서 = 입력, 도중에 막혀서 = 작업 시간, <b>고장 = 자원 가용성</b>, 다른 버스를 타서 = 경로.`, sec: 'ch05-variability.html#sources' },
  { id: '05-09', ch: '05', type: 'num',
    fig: F.table(['고객', '도착 순서', '서비스 시간'], [['갑', '1', '5분'], ['을', '2', '1분'], ['병', '3', '3분']]),
    q: R`세 고객이 동시에 대기 중이다. <b>최단 프로세싱 시간 (SPT)</b> 규칙으로 처리할 때 평균 체류시간 (분) 은? (소수 둘째 자리)`,
    a: 4.67, tol: 0.006, ex: R`SPT 순서 을(1) → 병(3) → 갑(5): 완료 1, 4, 9 → 평균 14/3 = 4.67분. 선착순이면 5, 6, 9 → 6.67분.`, sec: 'ch05-variability.html#staffing' },
  { id: '05-10', ch: '05', type: 'ox',
    q: R`영화관 조조할인, 호텔 비수기 할인은 도착 프로세스의 <b>변동성 자체를 없애는</b> 방법이다.`,
    a: false, ex: R`변동성을 줄이지는 않지만, 예측된 수요를 조정해 <b>주기성</b>을 줄여요.`, sec: 'ch05-variability.html#reduce' },
  { id: '05-11', ch: '05', type: 'num',
    q: R`병실 4개, 환자 1명당 평균 3시간이 걸린다. 버퍼가 없는 이 병원의 공급능력 (명/시간) 은? (소수 둘째 자리)`,
    a: 1.33, tol: 0.006, ex: R`공급능력 = 자원의 수 / 서비스 시간 = 4/3 = 1.33명/시간. 2시간에 1명씩 오면 함축된 활용률 = 0.5 / 1.33 = 0.375.`, sec: 'ch05-variability.html#loss' },
  { id: '05-12', ch: '05', type: 'mc',
    q: R`대기 포기 고객으로 인한 산출 손실을 줄이는 대책이 <b>아닌</b> 것은?`,
    c: ['공급능력 계획과 변동성 감소로 대기시간 단축', '버퍼(대기 공간) 용량 증가', '예상 대기시간 공개 등으로 포기 고객 감소', '활용률을 100% 이상으로 높여 운영'], a: 3,
    ex: R`활용률이 100% 이상이면 대기행렬이 계속 늘어나요. 나머지 셋이 슬라이드의 3가지 대책.`, sec: 'ch05-variability.html#loss' },
  { id: '05-13', ch: '05', type: 'mc',
    q: R`공장 조립 라인처럼 여러 서버가 연속된 시스템의 분석이 어려운 이유는?`,
    c: ['서버마다 CV 가 0 이라서', '앞 서버에서 떠나는 프로세스가 다음 서버의 도착 프로세스가 되어 변동성이 중첩되므로', '리틀의 법칙이 성립하지 않아서', '버퍼를 둘 수 없어서'], a: 1,
    ex: R`서버들이 독립적이지 않음 → 뒤로 갈수록 앞의 변동성이 쌓여요 → 버퍼를 적극 활용.`, sec: 'ch05-variability.html#complex' },
  { id: '05-14', ch: '05', type: 'ox',
    q: R`공급 능력이 수요보다 커서 활용률이 80% 라면, 평균적으로 대기는 발생하지 않는다.`,
    a: false, ex: R`콜센터 예 (p=4, a=5, u=80%): 전화가 일정하게 오지 않기 때문에 변동성으로 대기가 생겨요.`, sec: 'ch05-variability.html#callcenter' },

  /* ===================== 06 입지 ===================== */
  { id: '06-01', ch: '06', type: 'mc',
    fig: F.table(['입지요인', '가중치', 'A 점수', 'B 점수'], [['수송비용', '0.30', '4', '3'], ['노동력', '0.20', '3', '5'], ['세금', '0.25', '5', '3'], ['시장 근접성', '0.25', '2', '4']]),
    q: R`가중 점수 기법으로 A, B 두 후보지를 평가하면?`,
    c: ['A 3.55, B 3.65 → B 선택', 'A 3.65, B 3.55 → A 선택', 'A 3.50, B 3.50 → 동점', 'A 14, B 15 → B 선택'], a: 0,
    ex: R`A: 0.3×4 + 0.2×3 + 0.25×5 + 0.25×2 = 1.2+0.6+1.25+0.5 = 3.55. B: 0.9+1.0+0.75+1.0 = 3.65. 단순합(14, 15) 이 아니라 <b>가중합</b>!`, sec: 'ch06-location.html#weighted' },
  { id: '06-02', ch: '06', type: 'num', fig: plane([{ n: 'P', x: 2, y: 2, l: 10 }, { n: 'Q', x: 8, y: 2, l: 20 }, { n: 'R', x: 5, y: 8, l: 40 }]),
    q: R`세 수요지 P(2,2) 부하 10, Q(8,2) 부하 20, R(5,8) 부하 40 의 무게중심 \(x^*\) 는? (소수 둘째 자리)`,
    a: 5.43, tol: 0.006, ex: R`\(x^* = \dfrac{10\cdot2 + 20\cdot8 + 40\cdot5}{70} = \dfrac{380}{70} = 5.43\). \(y^*\) 도 \(\dfrac{20+40+320}{70} = 5.43\).`, sec: 'ch06-location.html#ld' },
  { id: '06-03', ch: '06', type: 'num', fig: plane([{ n: 'P', x: 2, y: 2, l: 10 }, { n: 'Q', x: 8, y: 2, l: 20 }, { n: 'R', x: 5, y: 8, l: 40 }], [{ n: '후보 (5,5)', x: 5, y: 5 }]),
    q: R`같은 수요지에서 후보지 (5, 5) 의 부하-거리 점수 ld 는? (직각거리)`,
    a: 300, tol: 0, ex: R`P: |2−5|+|2−5| = 6 → 60, Q: 3+3 = 6 → 120, R: 0+3 = 3 → 120. 합 300.`, sec: 'ch06-location.html#ld' },
  { id: '06-04', ch: '06', type: 'mc', fig: plane([{ n: 'P', x: 2, y: 2, l: 10 }, { n: 'Q', x: 8, y: 2, l: 20 }, { n: 'R', x: 5, y: 8, l: 40 }], [{ n: '①(5,5)', x: 5, y: 5 }, { n: '②(5,8)', x: 5, y: 8 }]),
    q: R`후보 ① (5,5) 와 ② (5,8) 중 부하-거리 점수가 더 작은 곳은?`,
    c: ['① (ld 300)', '② (ld 270)', '같다', '비교할 수 없다'], a: 1,
    ex: R`② (5,8): P 3+6 = 9 → 90, Q 3+6 = 9 → 180, R 0 → 0. 합 270 &lt; 300. 무게중심(5.43, 5.43) 이 직각거리 ld 를 꼭 최소로 만드는 건 아니에요 — 좋은 <b>출발점</b>.`, sec: 'ch06-location.html#ld' },
  { id: '06-05', ch: '06', type: 'num',
    q: R`입지 X 는 고정비 $300,000, 단위당 변동비 $60, 입지 Y 는 고정비 $500,000, 변동비 $35 다. 두 입지의 <b>손익분기점</b> Q 는?`,
    a: 8000, tol: 0.5, ex: R`\(300{,}000 + 60Q = 500{,}000 + 35Q \Rightarrow 25Q = 200{,}000 \Rightarrow Q = 8{,}000\). 8,000 보다 적으면 X, 많으면 Y.`, sec: 'ch06-location.html#be' },
  { id: '06-06', ch: '06', type: 'mc',
    fig: bePlot([{ n: 'A', F: 250000, v: 75, c: '#d14343' }, { n: 'B', F: 400000, v: 47, c: '#e3a02f' }, { n: 'C', F: 600000, v: 23, c: '#3b82f6' }, { n: 'D', F: 700000, v: 39, c: '#a8a29e' }], 16000, 4000),
    q: R`예제 6-3 (A 250,000 + 75Q, B 400,000 + 47Q, C 600,000 + 23Q, D 700,000 + 39Q) 에서 기대수요가 <b>4,000</b> 이면 최적 입지는?`,
    c: ['A', 'B', 'C', 'D'], a: 0,
    ex: R`4,000 &lt; 5,357 (A/B 손익분기점) → A. 총비용 A 550,000, B 588,000, C 692,000, D 856,000.`, sec: 'ch06-location.html#be' },
  { id: '06-07', ch: '06', type: 'num',
    q: R`예제 6-3 에서 Q = 10,000 일 때 최적 입지의 총비용 ($) 은?`,
    a: 830000, tol: 0.5, ex: R`Q &gt; 8,333 → C: 600,000 + 23 × 10,000 = 830,000. (B 는 870,000)`, sec: 'ch06-location.html#be' },
  { id: '06-08', ch: '06', type: 'num', fig: mdTable,
    q: R`거리 행렬과 부하가 위와 같다. 물류센터를 <b>P2 와 P6</b> 에 두고 각 수요지를 가까운 센터에 배정하면 \(T_{ld}\) 는? (행 = 시설, 열 = 수요지)`,
    a: 23, tol: 0, ex: R`P1→P2 4×1=4, P2 0, P3→P2 2×2=4, P4→P6 2×5=10, P5→P6 1×3=3, P6 0, P7→P6 1×2=2. 합 23 (최적 P4·P5 의 14 보다 큼).`, sec: 'ch06-location.html#multi' },
  { id: '06-09', ch: '06', type: 'mc', fig: mdTable,
    q: R`물류센터가 P4, P5 일 때 수요지 <b>P6</b> 은 어느 센터에 배정되나?`,
    c: ['P4 (거리 2)', 'P5 (거리 1)', '둘 다 거리 같음', 'P6 자신'], a: 1,
    ex: R`P4 행의 P6 열 = 2, P5 행의 P6 열 = 1 → 더 가까운 P5. 이렇게 배정하면 \(T_{ld} = 11 + 3 = 14\).`, sec: 'ch06-location.html#multi' },
  { id: '06-10', ch: '06', type: 'mc',
    q: R`네트워크 최적화 모델의 제약식 \(\sum_j x_{ij} \le K_i\,y_i\) 의 역할은?`,
    c: ['모든 수요를 충족시킨다', '폐쇄된 공장 (\(y_i = 0\)) 은 아무것도 보낼 수 없고, 가동 공장은 생산능력까지만 보낸다', '고정비를 최소화한다', '수송량을 정수로 만든다'], a: 1,
    ex: R`\(y_i = 0\) 이면 우변 0 → 수송량 0. 수요 충족은 \(\sum_i x_{ij} \ge D_j\) 가 담당.`, sec: 'ch06-location.html#network' },
  { id: '06-11', ch: '06', type: 'mc',
    q: R`예제 6-4 (서울전자 + 경기전자 합병) 의 최적해에서 <b>폐쇄</b>되는 공장은?`,
    c: ['A, D', 'B, E', 'C, D', 'A, C'], a: 0,
    ex: R`B (M 16, O 8), C (N 5, O 2, P 5), E (K 8, L 10) 가동, A·D 폐쇄. 총비용 (고정 10,700 + 수송 49,500) = 60,200.`, sec: 'ch06-location.html#network' },
  { id: '06-12', ch: '06', type: 'mc',
    q: R`다음 중 <b>서비스업</b>의 주요 입지요인이 <b>아닌</b> 것은?`,
    c: ['고객 근접성', '경쟁자의 입지', '공급자 및 자원의 근접성', '교통흐름, 가시성 등 입지 특유의 요인'], a: 2,
    ex: R`공급자·자원 근접성은 원자재가 무겁고 큰 <b>제조업</b> 요인.`, sec: 'ch06-location.html#mfg' },
  { id: '06-13', ch: '06', type: 'mc',
    q: R`“제한된 시간에서 근사 최적해 또는 최선해를 구하는 방법” 은?`,
    c: ['최적화', '휴리스틱', '시뮬레이션', '가중점수법'], a: 1,
    ex: R`최적화 = 단순화된 상황의 최적해, <b>휴리스틱 = 근사해</b>, 시뮬레이션 = 시스템 형태를 재생.`, sec: 'ch06-location.html#class' },
  { id: '06-14', ch: '06', type: 'mc',
    q: R`입지 대안을 개발하는 순서로 옳은 것은?`,
    c: ['부지 → 지역사회 → 지역 → 국가', '국가 → 지역·권역 → 지역사회 → 부지', '지역사회 → 국가 → 부지 → 지역', '국가 → 부지 → 지역 → 지역사회'], a: 1,
    ex: R`넓은 범위에서 좁혀 가요: 국가 → 국가 내 지역·권역 → 지역사회 → 구체적 부지.`, sec: 'ch06-location.html#need' },

  /* ===================== 07 용량 ===================== */
  { id: '07-01', ch: '07', type: 'num',
    fig: flowLine([{ n: '접수', t: '5분', r: '1명' }, { n: '조립', t: '15분', r: '3명' }, { n: '검사', t: '8분', r: '1명' }, { n: '포장', t: '6분', r: '1명' }], '6개/시간'),
    q: R`위 공정의 <b>프로세스 전체 용량</b> (개/시간) 은?`,
    a: 7.5, tol: 0.01, ex: R`접수 60/5 = 12, 조립 3×60/15 = 12, 검사 60/8 = <b>7.5</b>, 포장 60/6 = 10 → 병목 검사, 전체 용량 7.5.`, sec: 'ch07-capacity.html#flow' },
  { id: '07-02', ch: '07', type: 'mc',
    fig: flowLine([{ n: '접수', t: '5분', r: '1명' }, { n: '조립', t: '15분', r: '3명' }, { n: '검사', t: '8분', r: '1명' }, { n: '포장', t: '6분', r: '1명' }], '6개/시간'),
    q: R`수요가 시간당 6개일 때 흐름율과 흐름 제약의 종류는?`,
    c: ['7.5개, 공급량에 의한 제약', '6개, 수요량에 의한 제약', '6개, 공급량에 의한 제약', '7.5개, 수요량에 의한 제약'], a: 1,
    ex: R`흐름율 = min{수요 6, 용량 7.5} = 6 → 수요가 더 작으니 <b>수요 제약</b>.`, sec: 'ch07-capacity.html#constraint' },
  { id: '07-03', ch: '07', type: 'num',
    fig: flowLine([{ n: '접수', t: '5분', r: '1명' }, { n: '조립', t: '15분', r: '3명' }, { n: '검사', t: '8분', r: '1명' }, { n: '포장', t: '6분', r: '1명' }], '6개/시간'),
    q: R`같은 공정 (수요 6개/시간) 의 <b>여유용량</b>(%) 은?`,
    a: 20, tol: 0.05, ex: R`가동률 = 6 / 7.5 = 80% → 여유용량 = 100 − 80 = 20%.`, sec: 'ch07-capacity.html#cushion' },
  { id: '07-04', ch: '07', type: 'num',
    fig: flowLine([{ n: '접수', t: '5분', r: '1명' }, { n: '조립', t: '15분', r: '3명' }, { n: '검사', t: '8분', r: '1명' }, { n: '포장', t: '6분', r: '1명' }], '6개/시간'),
    q: R`같은 공정에서 <b>조립</b> 공정의 가동률(%) 은?`,
    a: 50, tol: 0.05, ex: R`공정별 가동률 = 흐름율 / 공정 용량 = 6 / 12 = 50%.`, sec: 'ch07-capacity.html#pizza1' },
  { id: '07-05', ch: '07', type: 'num',
    fig: flowLine([{ n: '접수', t: '5분', r: '1명' }, { n: '조립', t: '15분', r: '3명' }, { n: '검사', t: '8분', r: '1명' }, { n: '포장', t: '6분', r: '1명' }], '9개/시간'),
    q: R`수요가 시간당 <b>9개</b>로 늘면 흐름율 (개/시간) 은?`,
    a: 7.5, tol: 0.01, ex: R`min{9, 7.5} = 7.5 → 공급 제약, 가동률 100%. 수요가 아무리 커도 가동률은 100% 를 넘지 않아요.`, sec: 'ch07-capacity.html#constraint' },
  { id: '07-06', ch: '07', type: 'num',
    fig: flowLine([{ n: '주문접수', t: '6분', r: '영희' }, { n: '도우', t: '7.5분', r: '철수' }, { n: '토핑', t: '5분', r: '유진' }, { n: '굽기', t: '24분', r: '오븐 3대' }, { n: '포장', t: '5분', r: '길동' }, { n: '배달', t: '20분', r: '2명' }], '6개/시간'),
    q: R`A 피자점 예제 1 에서 오븐을 <b>1대만</b> 추가했다 (3대). 수요 6개/시간일 때 <b>굽기</b> 공정의 가동률(%) 은?`,
    a: 80, tol: 0.05, ex: R`굽기 용량 3×60/24 = 7.5. 병목은 배달 (2×60/20 = 6), 흐름율 = min{6, 6} = 6. 굽기 가동률 = 6 / 7.5 = 80%.`, sec: 'ch07-capacity.html#pizza1' },
  { id: '07-07', ch: '07', type: 'mc',
    fig: flowLine([{ n: '주문접수', t: '6분', r: '영희' }, { n: '도우', t: '7.5분', r: '철수' }, { n: '토핑', t: '5분', r: '유진' }, { n: '굽기', t: '24분', r: '오븐 4대' }, { n: '포장', t: '5분', r: '길동' }, { n: '배달', t: '20분', r: '3명' }], '6개/시간'),
    q: R`예제 2 (오븐 4대, 배달 3명) 의 병목 공정과 전체 가동률은?`,
    c: ['굽기, 100%', '배달, 66.7%', '도우 만들기, 75%', '주문접수, 60%'], a: 2,
    ex: R`용량: 10, <b>8</b>, 12, 10, 12, 9 → 병목 도우 (8). 흐름 = min{6, 8} = 6, 가동률 6/8 = 75%, 여유용량 25%.`, sec: 'ch07-capacity.html#pizza2' },
  { id: '07-08', ch: '07', type: 'mc',
    q: R`잔업이나 임시직을 포함하며, 단기적으로만 가능하고 장기적으로 유지할 수 없는 용량은?`,
    c: ['설계용량', '기대용량', '피크용량', '안정용량'], a: 2,
    ex: R`피크용량. 서비스업에서는 안정용량보다 피크생산능력이 더 중요.`, sec: 'ch07-capacity.html#kinds' },
  { id: '07-09', ch: '07', type: 'mc',
    q: R`다음 중 용량의 <b>투입지표</b>가 <b>아닌</b> 것은?`,
    c: ['병상 수', '호텔 객실 수', '일일 차량 생산 대수', '식당 테이블 개수'], a: 2,
    ex: R`일일 차량 생산 대수 = <b>산출지표</b>. 투입지표는 산출량을 결정하는 설비규모 (종업원 수, 라인 수, 병상, 테이블, 객실).`, sec: 'ch07-capacity.html#measure' },
  { id: '07-10', ch: '07', type: 'mc', fig: hotelFig,
    q: R`그림에서 500실 → 750실로 늘렸을 때 1인당 운영비용이 오히려 오르는 원인으로 슬라이드에 나온 것이 <b>아닌</b> 것은?`,
    c: ['복잡성 (의사소통비용 증가)', '관리 초점의 상실', '조직의 관료화', '원자재 대량 구매 할인'], a: 3,
    ex: R`대량 구매 할인은 <b>규모의 경제</b> 요인. 나머지 셋이 규모의 비경제 요인.`, sec: 'ch07-capacity.html#scale' },
  { id: '07-11', ch: '07', type: 'mc', fig: capFig(true),
    q: R`그림처럼 수요(빨강)보다 <b>먼저</b> 용량(파랑)을 늘리는 전략과 그 비용은?`,
    c: ['유보적 전략 — 단기대응비용', '확장적 전략 — 여유용량비용', '혼합 전략 — 비용 없음', '확장적 전략 — 단기대응비용'], a: 1,
    ex: R`확장적 (expansionist) = 미리 증설 → 놀리는 용량 = 여유용량비용. 유보적 (wait-and-see) = 나중에 증설 → 잔업·하청 등 단기대응비용.`, sec: 'ch07-capacity.html#cushion' },
  { id: '07-12', ch: '07', type: 'ox',
    q: R`수요가 용량을 크게 초과하면 가동률은 100% 를 넘을 수 있다.`,
    a: false, ex: R`가동률 = 흐름율 / 용량 이고 흐름율 ≤ 용량 → 최대 100%.`, sec: 'ch07-capacity.html#pizza1' },
  { id: '07-13', ch: '07', type: 'num',
    q: R`어느 공장의 평균 가동률이 85% 다. 여유용량(%) 은?`,
    a: 15, tol: 0.05, ex: R`여유용량 = 100% − 평균 가동률 = 15%. 여유용량은 비용을 야기해요!`, sec: 'ch07-capacity.html#cushion' }
  ];
})();
