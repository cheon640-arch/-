/* 생산운영관리 실습 도구 모음. <div data-widget="이름"></div> 위치에 그려짐.
   + 학생용 자료의 빈칸(.blank) 누르면 정답 보이기 */
(function () {
  const W = {};
  const $ = (r, s) => r.querySelector(s);
  const num = (r, s) => parseFloat(String($(r, s).value).replace(/,/g, '')) || 0;
  const f = (x, d = 2) => (Number.isFinite(x) ? x : 0).toLocaleString('ko-KR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const C = { ink: '#2b1a07', mist: '#a8a29e', line: '#e8ddd3', blue: '#ff6f1e', violet: '#ce500a', cream: '#f7efe9', green: '#3f9d6b', red: '#d14343', ash: '#6b5d4f' };
  const COLS = ['#ff6f1e', '#3b82f6', '#3f9d6b', '#d14343', '#8e5bd6', '#2aa6b8', '#d16fa6'];

  /* ---------- 빈칸 ---------- */
  function initBlanks() {
    const bl = [...document.querySelectorAll('.blank')];
    if (!bl.length) return;
    bl.forEach(b => { b.title = '눌러서 정답 보기'; b.addEventListener('click', () => b.classList.toggle('show')); });
    const hero = document.querySelector('.hero');
    if (hero) {
      const bar = document.createElement('div');
      bar.className = 'blank-bar';
      bar.innerHTML = `<span>📝 강의자료 빈칸 ${bl.length}개 — 누르면 정답이 보여요</span><button type="button" class="pill small" data-b="show">모두 보기</button><button type="button" class="pill small" data-b="hide">모두 가리기</button>`;
      bar.onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; bl.forEach(x => x.classList.toggle('show', b.dataset.b === 'show')); };
      hero.appendChild(bar);
    }
  }

  /* ---------- 02. 생산성 ---------- */
  W.productivity = root => {
    root.innerHTML = `<div class="w-title">직접 해보기: 생산성 계산기</div>
      <div class="cols"><div>
        <h4 style="margin:4px 0">종합 생산성 = 전체 산출물 / 전체 투입물</h4>
        <div class="calc-grid">
          <label>산출물 가치 (억원)<input type="number" class="o" value="100"></label>
          <label>인건비 (억원)<input type="number" class="l" value="30"></label>
          <label>원자재비 (억원)<input type="number" class="m" value="30"></label>
          <label>설비 외 기타 (억원)<input type="number" class="e" value="20"></label>
        </div><div class="readout r1"></div>
      </div><div>
        <h4 style="margin:4px 0">노동 생산성 = 산출물 / 노동 투입 (명·시간)</h4>
        <div class="calc-grid">
          <label>산출량 (대)<input type="number" class="u" value="60"></label>
          <label>작업자 수 (명)<input type="number" class="w" value="3"></label>
          <label>1인 근무시간 (시간)<input type="number" class="h" value="8"></label>
        </div><div class="readout r2"></div>
      </div></div>`;
    const upd = () => {
      const o = num(root, '.o'), l = num(root, '.l'), m = num(root, '.m'), e = num(root, '.e');
      $(root, '.r1').textContent = `종합 생산성 = ${f(o)} / (${f(l)} + ${f(m)} + ${f(e)}) = ${f(o / (l + m + e), 3)}\n` +
        `단일요소(노동) 생산성 = ${f(o)} / ${f(l)} = ${f(o / l, 3)}\n다요소(노동+원자재) 생산성 = ${f(o)} / ${f(l + m)} = ${f(o / (l + m), 3)}`;
      const u = num(root, '.u'), w = num(root, '.w'), h = num(root, '.h');
      $(root, '.r2').textContent = `노동 생산성 = ${f(u)}대 / (${f(w)}명 × ${f(h)}시간) = ${f(u / (w * h), 3)} 대/(명·시간)`;
    };
    root.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  };

  /* ---------- 03. 신뢰성 ---------- */
  W.reliability = root => {
    root.innerHTML = `<div class="w-title">직접 해보기: 직렬 · 병렬 신뢰성</div>
      <p style="font-size:14px;margin:0 0 6px">부품(단계)을 일렬로 연결하고, 각 단계에 같은 부품을 몇 개 <b>병렬</b>로 둘지(예비 부품) 정해 보세요.</p>
      <div class="controls"><button type="button" class="pill small" data-p="s">예시 1: 0.9 → 0.8 직렬</button><button type="button" class="pill small" data-p="p">예시 2: 0.8 에 예비 1개</button><button type="button" class="pill small add">+ 단계 추가</button></div>
      <div class="stages" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0"></div>
      <div class="result-big"></div><div class="readout"></div>`;
    let st = [{ r: 0.9, n: 1 }, { r: 0.8, n: 1 }];
    const draw = () => {
      const box = $(root, '.stages');
      box.innerHTML = st.map((s, i) => `<div class="box" style="padding:8px 10px;font-size:13px;font-family:var(--font-ui)"><b>단계 ${i + 1}</b><br>
        R <input type="number" step="0.01" min="0" max="1" value="${s.r}" data-i="${i}" data-k="r" style="width:70px"><br>
        병렬 개수 <input type="number" min="1" max="5" value="${s.n}" data-i="${i}" data-k="n" style="width:56px">
        ${st.length > 1 ? `<button type="button" class="linkbtn" data-del="${i}">삭제</button>` : ''}</div>${i < st.length - 1 ? '<span style="color:var(--mist)">→</span>' : ''}`).join('');
      box.querySelectorAll('input').forEach(inp => inp.oninput = () => { const s = st[+inp.dataset.i]; s[inp.dataset.k] = inp.dataset.k === 'n' ? Math.max(1, Math.round(+inp.value || 1)) : Math.min(1, Math.max(0, +inp.value || 0)); calc(); });
      box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { st.splice(+b.dataset.del, 1); draw(); });
      calc();
    };
    const calc = () => {
      const stageR = st.map(s => 1 - Math.pow(1 - s.r, s.n));
      const sys = stageR.reduce((a, b) => a * b, 1);
      $(root, '.result-big').innerHTML = `${f(sys, 4)}<small>시스템 신뢰성</small>`;
      $(root, '.readout').textContent = st.map((s, i) => s.n === 1 ? `단계 ${i + 1}: ${s.r}` : `단계 ${i + 1}: 1 − (1 − ${s.r})^${s.n} = ${f(stageR[i], 4)}  (= ${s.r} + (1 − ${s.r}) × ${s.r}${s.n > 2 ? ' …' : ''})`).join('\n') +
        `\n시스템 = ${stageR.map(x => f(x, 4)).join(' × ')} = ${f(sys, 4)}\n→ 직렬은 곱할수록 낮아지고, 병렬(예비)은 그 단계를 튼튼하게 해요.`;
    };
    root.querySelector('[data-p="s"]').onclick = () => { st = [{ r: 0.9, n: 1 }, { r: 0.8, n: 1 }]; draw(); };
    root.querySelector('[data-p="p"]').onclick = () => { st = [{ r: 0.9, n: 1 }, { r: 0.8, n: 2 }]; draw(); };
    root.querySelector('.add').onclick = () => { st.push({ r: 0.95, n: 1 }); draw(); };
    draw();
  };

  /* ---------- 03. 카노 모델 판정표 (슬라이드 p.25) ---------- */
  const KANO = { // [긍정 답][부정 답]
    a: ['–', '매력적', '매력적', '매력적', '일원적'],
    b: ['역', '일원적', '일원적', '일원적', '당연적'],
    c: ['역', '일원적', '일원적', '일원적', '당연적'],
    d: ['역', '일원적', '일원적', '일원적', '당연적'],
    e: ['역', '역', '역', '역', '–'],
  };
  W.kano = root => {
    const opts = [['a', '마음에 든다'], ['b', '당연하다'], ['c', '아무 느낌이 없다'], ['d', '하는 수 없다'], ['e', '마음에 안 든다']];
    const sel = cls => `<select class="${cls}">${opts.map(([k, t]) => `<option value="${k}">(${k}) ${t}</option>`).join('')}</select>`;
    root.innerHTML = `<div class="w-title">직접 해보기: 카노 설문 → 품질 유형 판정</div>
      <div class="controls"><label>긍정적 질문 (있으면?) ${sel('pos')}</label><label>부정적 질문 (없으면?) ${sel('neg')}</label></div>
      <div class="result-big"></div>
      <div class="tbl-wrap"><table class="t kt" style="font-size:14px"></table></div>
      <div class="readout"></div>`;
    $(root, '.neg').value = 'e';
    const desc = { '매력적': '없어도 불만은 없지만, 있으면 크게 만족 (예: 무료 룸 업그레이드)', '일원적': '많을수록 만족, 적을수록 불만 — 비례 (예: 배터리 지속 시간)', '당연적': '있어도 당연, 없으면 큰 불만 (예: 브레이크 작동)', '역': '있으면 오히려 불만 (예: 시도 때도 없는 푸시 알림)', '–': '모순된 응답 (질문을 잘못 이해했을 가능성)' };
    const upd = () => {
      const p = $(root, '.pos').value, n = $(root, '.neg').value, ni = 'abcde'.indexOf(n);
      const r = KANO[p][ni];
      $(root, '.result-big').innerHTML = `${r === '–' ? '판정 불가' : r + ' 품질'}<small>${desc[r]}</small>`;
      $(root, '.kt').innerHTML = `<thead><tr><th>긍정 \\ 부정</th>${'abcde'.split('').map(k => `<th>(${k})</th>`).join('')}</tr></thead><tbody>` +
        'abcde'.split('').map(k => `<tr><th>(${k})</th>${KANO[k].map((v, j) => `<td style="${k === p && j === ni ? 'background:#ffe2cf;font-weight:700' : ''}">${v}</td>`).join('')}</tr>`).join('') + '</tbody>';
      $(root, '.readout').textContent = '표는 슬라이드 p.25 그대로예요. (참고: 교과서의 표준 카노 표에서는 가운데 9칸이 “무관심 품질”이에요. 시험은 강의 표 기준!)';
    };
    root.querySelectorAll('select').forEach(s => s.onchange = upd); upd();
  };

  /* ---------- 04. 라인 밸런싱 (제품 Y) ---------- */
  const TASKS = { A: [120, []], B: [100, ['A']], C: [50, ['A']], D: [90, ['A']], E: [30, ['A']], F: [20, ['B']], G: [40, ['C']], H: [60, ['D']], I: [80, ['F', 'G']], J: [60, ['H', 'I', 'E']] };
  const POS = { A: [40, 110], B: [130, 30], C: [130, 85], D: [130, 140], E: [130, 195], F: [220, 30], G: [220, 85], H: [220, 140], I: [310, 70], J: [380, 150] };
  const PRESET = {
    now: ['A', 'B,C', 'D,E', 'F,G', 'H,I', 'J'],
    alt1: ['A', 'B,F', 'D,E', 'C,H', 'G,I', 'J'],
    alt2: ['A', 'B,C', 'D,G', 'F,I', 'H,E,J'],
  };
  W.linebal = root => {
    root.innerHTML = `<div class="w-title">직접 해보기: 제품 Y 조립 라인 작업장 배치</div>
      <div class="controls"><button type="button" class="pill small" data-p="now">현재 배치</button><button type="button" class="pill small" data-p="alt1">대안 1 (최장 작업시간)</button><button type="button" class="pill small" data-p="alt2">대안 2 (최대 후행 작업수)</button></div>
      <div class="cols"><div class="chart g"></div><div><div class="stations"></div><button type="button" class="linkbtn addst">+ 작업장 추가</button></div></div>
      <div class="calc-grid res" style="margin-top:10px"></div><div class="readout"></div>`;
    let st = PRESET.now.slice();
    const parse = () => st.map(s => s.split(/[ ,]+/).map(x => x.trim().toUpperCase()).filter(x => TASKS[x]));
    const draw = () => {
      const S = parse(), where = {};
      S.forEach((ts, i) => ts.forEach(t => { where[t] = i; }));
      // 그래프
      let svg = `<svg viewBox="0 0 420 230"><defs><marker id="lbA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${C.mist}"/></marker></defs>`;
      for (const [t, [, pre]] of Object.entries(TASKS)) for (const p of pre) {
        const [x1, y1] = POS[p], [x2, y2] = POS[t], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
        svg += `<line x1="${x1 + ux * 17}" y1="${y1 + uy * 17}" x2="${x2 - ux * 19}" y2="${y2 - uy * 19}" stroke="${C.mist}" stroke-width="1.4" marker-end="url(#lbA)"/>`;
      }
      for (const [t, [time]] of Object.entries(TASKS)) {
        const [x, y] = POS[t], s = where[t], col = s === undefined ? '#fff' : COLS[s % COLS.length];
        svg += `<circle cx="${x}" cy="${y}" r="16" fill="${col}" fill-opacity="${s === undefined ? 1 : .25}" stroke="${s === undefined ? C.red : col}" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-family="Inter" font-weight="600" fill="${C.ink}">${t}</text><text x="${x}" y="${y + 31}" text-anchor="middle" font-size="11" font-family="Inter" fill="${C.ash}">${time}</text>`;
      }
      $(root, '.g').innerHTML = svg + '</svg>';
      // 작업장 입력
      $(root, '.stations').innerHTML = `<div class="tbl-wrap"><table class="t"><thead><tr><th>작업장</th><th>작업 (쉼표로)</th><th class="num">시간(초)</th></tr></thead><tbody>${S.map((ts, i) =>
        `<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COLS[i % COLS.length]};margin-right:6px"></span>${i + 1}</td><td><input type="text" value="${st[i]}" data-i="${i}" style="width:110px"></td><td class="num">${ts.reduce((a, t) => a + TASKS[t][0], 0)}</td></tr>`).join('')}</tbody></table></div>`;
      $(root, '.stations').querySelectorAll('input').forEach(inp => inp.onchange = () => { st[+inp.dataset.i] = inp.value; draw(); });
      // 계산 & 검사
      const times = S.map(ts => ts.reduce((a, t) => a + TASKS[t][0], 0)), n = S.filter(x => x.length).length, c = Math.max(...times);
      const missing = Object.keys(TASKS).filter(t => where[t] === undefined), dup = Object.keys(TASKS).filter(t => S.flat().filter(x => x === t).length > 1);
      const bad = [];
      for (const [t, [, pre]] of Object.entries(TASKS)) for (const p of pre) if (where[t] !== undefined && where[p] !== undefined && where[p] > where[t]) bad.push(`${p} → ${t}`);
      const total = 650;
      $(root, '.res').innerHTML = `<div><div class="result-big">${c}<small>초/개 주기시간</small></div></div><div><div class="result-big">${f(3600 / c, 1)}<small>개/시간</small></div></div><div><div class="result-big">${n * c - total}<small>초 유휴</small></div></div><div><div class="result-big">${f(total / (n * c) * 100, 1)}%<small>효율</small></div></div>`;
      $(root, '.readout').textContent = `작업시간 합 = 650초, 작업장 수 n = ${n}, 주기시간 c = max(작업장 시간) = ${c}초/개\n최대 산출률 = 3600 / ${c} = ${f(3600 / c, 1)}개/시간\n유휴시간 = n×c − 650 = ${n}×${c} − 650 = ${n * c - total}초,  효율 = 650 / (${n}×${c}) = ${f(total / (n * c) * 100, 1)}%\n이론적 최소 주기시간 (6개 작업장) = 650/6 = 108.3초` +
        (missing.length ? `\n⚠ 배정 안 된 작업: ${missing.join(', ')}` : '') + (dup.length ? `\n⚠ 두 번 배정된 작업: ${dup.join(', ')}` : '') + (bad.length ? `\n⚠ 선행관계 위반: ${bad.join(', ')} (앞 작업이 뒤 작업장에 있음)` : (missing.length || dup.length ? '' : '\n✔ 선행관계 OK'));
    };
    root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { st = PRESET[b.dataset.p].slice(); draw(); });
    root.querySelector('.addst').onclick = () => { st.push(''); draw(); };
    draw();
  };

  /* ---------- 05. 대기행렬 (킹맨 공식 · 풀링) ---------- */
  function kingman(a, p, m, cva, cvp) {
    const u = p / (a * m);
    if (u >= 1) return { u, Tq: Infinity };
    const Tq = (p / m) * (Math.pow(u, Math.sqrt(2 * (m + 1)) - 1) / (1 - u)) * ((cva * cva + cvp * cvp) / 2);
    return { u, Tq };
  }
  W.queue = root => {
    root.innerHTML = `<div class="w-title">직접 해보기: 평균 대기시간 예측 (킹맨 공식)</div>
      <div class="controls"><button type="button" class="pill small" data-p="call">콜센터 (a=5, p=4)</button><button type="button" class="pill small" data-p="bank1">은행: 창구별 줄 (m=1)</button><button type="button" class="pill small" data-p="bank2">은행: 한 줄 풀링 (m=2)</button></div>
      <div class="calc-grid">
        <label>평균 도착 간격 a (분)<input type="number" step="0.1" class="a" value="5"></label>
        <label>평균 서비스 시간 p (분)<input type="number" step="0.1" class="p" value="4"></label>
        <label>서버 수 m<input type="number" min="1" class="m" value="1"></label>
        <label>CVa (도착)<input type="number" step="0.1" class="cva" value="1"></label>
        <label>CVp (서비스)<input type="number" step="0.1" class="cvp" value="1"></label>
      </div>
      <div class="calc-grid res"></div>
      <div class="chart"></div><div class="readout"></div>`;
    const P = { call: [5, 4, 1, 1, 1], bank1: [4, 3, 1, 1, 1], bank2: [2, 3, 2, 1, 1] };
    const upd = () => {
      const a = num(root, '.a'), p = num(root, '.p'), m = Math.max(1, Math.round(num(root, '.m'))), cva = num(root, '.cva'), cvp = num(root, '.cvp');
      const { u, Tq } = kingman(a, p, m, cva, cvp);
      const T = Tq + p, R = 1 / a, I = R * T, Iq = R * Tq;
      $(root, '.res').innerHTML = u >= 1 ? `<div class="result-big" style="color:${C.red}">u = ${f(u * 100, 1)}% ≥ 100%<small>대기열이 끝없이 길어져요</small></div>` :
        `<div><div class="result-big">${f(u * 100, 1)}%<small>활용률 u</small></div></div><div><div class="result-big">${f(Tq)}분<small>평균 대기 Tq</small></div></div><div><div class="result-big">${f(T)}분<small>체류 T = Tq + p</small></div></div><div><div class="result-big">${f(I)}명<small>평균 재고 I = R·T</small></div></div>`;
      // u 를 바꿔 가며 Tq 곡선
      const W0 = 520, H0 = 200, x0 = 46, y0 = 170, us = [];
      for (let k = 1; k <= 96; k++) { const uu = k / 100; const t = kingman(p / (uu * m), p, m, cva, cvp).Tq; us.push([uu, t]); }
      const ymax = Math.min(Math.max(...us.map(z => z[1])), Math.max(Tq * 2.5, p * 6, 10));
      const X = uu => x0 + uu * (W0 - x0 - 14), Y = t => y0 - Math.min(t, ymax) / ymax * (y0 - 16);
      let s = `<svg viewBox="0 0 ${W0} ${H0}"><line x1="${x0}" y1="${y0}" x2="${W0 - 10}" y2="${y0}" stroke="${C.ink}"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="10" stroke="${C.ink}"/>`;
      for (const v of [0.25, 0.5, 0.75, 1]) s += `<text x="${X(v)}" y="${y0 + 15}" text-anchor="middle" font-size="11" fill="${C.ash}" font-family="Inter">${v * 100}%</text>`;
      s += `<text x="${W0 - 12}" y="${y0 - 6}" text-anchor="end" font-size="11" fill="${C.ash}" font-family="Inter">활용률 u →</text><text x="${x0 + 6}" y="20" font-size="11" fill="${C.ash}" font-family="Inter">Tq (분)</text><text x="${x0 - 6}" y="${Y(ymax) + 4}" text-anchor="end" font-size="10" fill="${C.ash}">${f(ymax, 0)}</text>`;
      s += `<polyline points="${us.map(([uu, t]) => `${X(uu)},${Y(t)}`).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="2.4"/>`;
      if (u < 1) s += `<circle cx="${X(u)}" cy="${Y(Tq)}" r="6" fill="${C.violet}" stroke="#fff" stroke-width="2"/><text x="${X(u) - 8}" y="${Y(Tq) - 10}" text-anchor="end" font-size="12" fill="${C.violet}" font-family="Inter">현재</text>`;
      $(root, '.chart').innerHTML = s + '</svg>';
      $(root, '.readout').textContent = `u = p / (a·m) = ${p} / (${a}×${m}) = ${f(u, 3)}\n` +
        (m === 1 ? `Tq = p × u/(1−u) × (CVa² + CVp²)/2 = ${p} × ${f(u, 3)}/${f(1 - u, 3)} × ${f((cva * cva + cvp * cvp) / 2, 2)} = ${u < 1 ? f(Tq, 2) : '∞'}분`
          : `Tq ≈ (p/m) × u^(√(2(m+1))−1)/(1−u) × (CVa² + CVp²)/2 = (${p}/${m}) × ${f(u, 2)}^${f(Math.sqrt(2 * (m + 1)) - 1, 3)}/${f(1 - u, 2)} × ${f((cva * cva + cvp * cvp) / 2, 2)} = ${u < 1 ? f(Tq, 2) : '∞'}분`) +
        `\nLittle 의 법칙: I = R × T = (1/${a}) × ${u < 1 ? f(T, 2) : '∞'} = ${u < 1 ? f(I, 2) : '∞'},  Iq = R × Tq = ${u < 1 ? f(Iq, 2) : '∞'},  서비스 중 Ip = ${f(m * u, 2)}\n→ 곡선: u 가 100%에 가까워질수록 대기시간이 폭발적으로 늘어나요 (활용률 100% 미만이어도 대기 발생!)`;
    };
    root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { const v = P[b.dataset.p];['.a', '.p', '.m', '.cva', '.cvp'].forEach((s, i) => { $(root, s).value = v[i]; }); upd(); });
    root.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  };

  /* ---------- 05. 대기행렬 시뮬레이션 (움직이는 그림) ---------- */
  W.queuesim = root => {
    root.innerHTML = `<div class="w-title">움직이는 그림: 변동성이 있으면 활용률 80% 에서도 줄이 생겨요</div>
      <div class="controls"><label>도착 <select class="arr"><option value="1">무작위 (CVa = 1)</option><option value="0">일정 간격 (CVa = 0)</option></select></label>
      <label>서비스 <select class="srv"><option value="1">무작위 (CVp = 1)</option><option value="0">일정 시간 (CVp = 0)</option></select></label>
      <label>활용률 <select class="u"><option>0.6</option><option selected>0.8</option><option>0.9</option><option>0.95</option></select></label>
      <button type="button" class="pill small go">▶ 재생</button><button type="button" class="pill small rs">처음부터</button></div>
      <div class="chart stage"></div><div class="readout"></div>`;
    let timer = null, t, nextA, busyUntil, queue, waits, hist, served;
    const p = 4;
    const exp = mean => -mean * Math.log(1 - Math.random());
    const reset = () => {
      if (timer) { clearInterval(timer); timer = null; $(root, '.go').textContent = '▶ 재생'; }
      t = 0; nextA = 0; busyUntil = Infinity; queue = []; waits = []; hist = []; served = false; draw();
    };
    // 사건 기반 시뮬레이션: 도착(arrival) 과 서비스 종료(departure) 두 사건만 있음
    const tick = () => {
      const u = +$(root, '.u').value, a = p / u, ra = $(root, '.arr').value === '1', rs = $(root, '.srv').value === '1';
      const svc = () => (rs ? exp(p) : p);
      const end = t + 0.5;
      while (Math.min(nextA, busyUntil) <= end) {
        if (nextA <= busyUntil) {                // 도착
          const now = nextA;
          if (!served) { served = true; waits.push(0); busyUntil = now + svc(); }
          else queue.push(now);
          nextA = now + (ra ? exp(a) : a);
        } else {                                 // 서비스 종료
          const now = busyUntil;
          if (queue.length) { const arr = queue.shift(); waits.push(now - arr); busyUntil = now + svc(); }
          else { served = false; busyUntil = Infinity; }
        }
      }
      t = end;
      hist.push(queue.length);
      if (hist.length > 240) hist.shift();
      draw();
    };
    const draw = () => {
      const W0 = 560, H0 = 200;
      let s = `<svg viewBox="0 0 ${W0} ${H0}">`;
      // 서버
      s += `<rect x="440" y="30" width="90" height="56" rx="12" fill="${served ? '#ffe2cf' : '#fff'}" stroke="${C.ink}"/><text x="485" y="52" text-anchor="middle" font-size="13" font-family="Inter" fill="${C.ink}">서버</text><text x="485" y="72" text-anchor="middle" font-size="12" font-family="Inter" fill="${C.ash}">p = ${p}분</text>`;
      if (served) s += `<circle cx="485" cy="100" r="9" fill="${C.blue}"/>`;
      // 줄
      const n = queue.length;
      for (let i = 0; i < Math.min(n, 22); i++) s += `<circle cx="${420 - i * 18}" cy="58" r="7" fill="${C.violet}" fill-opacity=".75"/>`;
      if (n > 22) s += `<text x="20" y="62" font-size="12" font-family="Inter" fill="${C.violet}">+${n - 22}</text>`;
      s += `<text x="20" y="22" font-size="12" font-family="Inter" fill="${C.ink}">대기 중 ${n}명</text>`;
      // 그래프
      const gx = 20, gy = 185, gw = 520, gh = 70, mx = Math.max(5, ...hist);
      s += `<line x1="${gx}" y1="${gy}" x2="${gx + gw}" y2="${gy}" stroke="${C.line}"/><text x="${gx}" y="${gy - gh - 4}" font-size="11" fill="${C.ash}" font-family="Inter">줄 길이 기록 (최대 ${mx})</text>`;
      if (hist.length > 1) s += `<polyline points="${hist.map((v, i) => `${gx + i / 239 * gw},${gy - v / mx * gh}`).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="1.8"/>`;
      $(root, '.stage').innerHTML = s + '</svg>';
      const avgW = waits.length ? waits.reduce((x, y) => x + y, 0) / waits.length : 0;
      const u = +$(root, '.u').value, cva = +$(root, '.arr').value, cvp = +$(root, '.srv').value;
      const pred = kingman(p / u, p, 1, cva, cvp).Tq;
      $(root, '.readout').textContent = `시간 ${f(t, 0)}분 · 서비스 시작한 고객 ${waits.length}명 · 실제 평균 대기 ${f(avgW, 2)}분 · 킹맨 예측 Tq = ${f(pred, 2)}분\n` +
        (cva === 0 && cvp === 0 ? '→ 변동성이 0 이면 활용률이 높아도 줄이 거의 안 생겨요.' : '→ 평균적으로는 처리 능력이 남는데도, 몰려서 오는 순간·오래 걸리는 고객 때문에 줄이 생겨요. 오래 돌리면 실제 평균이 예측값에 가까워져요.');
    };
    root.querySelector('.go').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $(root, '.go').textContent = '▶ 재생'; }
      else { timer = setInterval(tick, 60); $(root, '.go').textContent = '⏸ 일시정지'; }
    };
    root.querySelector('.rs').onclick = reset;
    root.querySelectorAll('select').forEach(s => s.onchange = reset);
    reset();
  };

  /* ---------- 06. 선호도 행렬 가중 점수 ---------- */
  W.weighted = root => {
    const rows = [['연간 환자 수', 0.20, 5, 3], ['토지 및 건설비용', 0.25, 4, 5], ['연간 이용률', 0.20, 4, 4], ['고속도로 근접성', 0.10, 5, 3], ['응급차의 평균이동거리', 0.15, 2, 4], ['직원 선호도', 0.10, 4, 3]];
    root.innerHTML = `<div class="w-title">직접 해보기: 선호도 행렬 (가중 점수)</div>
      <p style="font-size:14px;margin:0">후보지 1 은 슬라이드 예시 점수, 후보지 2 는 비교용 임의 점수예요. 숫자를 바꿔 보세요.</p>
      <div class="tbl-wrap"><table class="t"><thead><tr><th>입지요인</th><th class="num">가중치</th><th class="num">후보지 1 점수</th><th class="num">후보지 2 점수</th></tr></thead><tbody>${rows.map((r, i) =>
        `<tr><td>${r[0]}</td><td class="num"><input type="number" step="0.05" value="${r[1]}" data-i="${i}" data-k="1" style="width:70px"></td><td class="num"><input type="number" value="${r[2]}" data-i="${i}" data-k="2" style="width:60px"></td><td class="num"><input type="number" value="${r[3]}" data-i="${i}" data-k="3" style="width:60px"></td></tr>`).join('')}</tbody></table></div>
      <div class="calc-grid res"></div><div class="readout"></div>`;
    const upd = () => {
      root.querySelectorAll('input').forEach(inp => { rows[+inp.dataset.i][+inp.dataset.k] = +inp.value || 0; });
      const ws = rows.reduce((a, r) => a + r[1], 0), s1 = rows.reduce((a, r) => a + r[1] * r[2], 0), s2 = rows.reduce((a, r) => a + r[1] * r[3], 0);
      $(root, '.res').innerHTML = `<div><div class="result-big">${f(s1, 2)}<small>후보지 1</small></div></div><div><div class="result-big">${f(s2, 2)}<small>후보지 2</small></div></div>`;
      $(root, '.readout').textContent = `후보지 1 = ${rows.map(r => `${r[1]}×${r[2]}`).join(' + ')} = ${f(s1, 2)}\n후보지 2 = ${rows.map(r => `${r[1]}×${r[3]}`).join(' + ')} = ${f(s2, 2)}\n가중치 합 = ${f(ws, 2)}${Math.abs(ws - 1) > 1e-9 ? '  ⚠ 가중치 합이 1 이 아니에요' : ''}\n→ 가중 점수가 더 높은 ${s1 >= s2 ? '후보지 1' : '후보지 2'} 를 선택`;
    };
    root.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  };

  /* ---------- 06. 무게중심법 ---------- */
  W.cog = root => {
    const D = [['아틀란타', 14, 4, 6000], ['인디애나폴리스', 9, 13, 83000], ['클리브랜드', 12, 11, 81000], ['루이빌', 12, 8, 36000], ['(식에만 있는 수요지)', 13, 5, 10000], ['영스톤', 14, 12, 228000], ['찰스톤', 15, 11, 17000], ['리치몬드', 16, 6, 154000]];
    root.innerHTML = `<div class="w-title">직접 해보기: 무게중심 (예제 6-2)</div>
      <p style="font-size:14px;margin:0">그래프를 클릭하면 그 위치의 부하-거리(ld) 점수도 계산해 줘요.</p>
      <div class="cols"><div class="chart"></div><div class="tbl-wrap"><table class="t" style="font-size:13px"><thead><tr><th>수요지</th><th class="num">x</th><th class="num">y</th><th class="num">납품량</th></tr></thead><tbody>${D.map((d, i) =>
        `<tr><td>${d[0]}</td>${[1, 2, 3].map(k => `<td class="num"><input type="number" value="${d[k]}" data-i="${i}" data-k="${k}" style="width:${k === 3 ? 76 : 46}px"></td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
      <div class="readout"></div>`;
    let pick = null;
    const ld = (x, y) => D.reduce((a, d) => a + (d[3] / 1000) * (Math.abs(d[1] - x) + Math.abs(d[2] - y)), 0);
    const upd = () => {
      root.querySelectorAll('input').forEach(inp => { D[+inp.dataset.i][+inp.dataset.k] = +inp.value || 0; });
      const L = D.reduce((a, d) => a + d[3], 0), xs = D.reduce((a, d) => a + d[3] * d[1], 0) / L, ys = D.reduce((a, d) => a + d[3] * d[2], 0) / L;
      const X = x => 30 + (x - 6) / 12 * 280, Y = y => 260 - (y - 2) / 13 * 240;
      let s = `<svg viewBox="0 0 330 280" style="cursor:crosshair">`;
      for (let g = 6; g <= 18; g += 2) s += `<line x1="${X(g)}" y1="${Y(2)}" x2="${X(g)}" y2="${Y(15)}" stroke="${C.line}"/><text x="${X(g)}" y="${Y(2) + 14}" text-anchor="middle" font-size="10" fill="${C.ash}">${g}</text>`;
      for (let g = 2; g <= 15; g += 2) s += `<line x1="${X(6)}" y1="${Y(g)}" x2="${X(18)}" y2="${Y(g)}" stroke="${C.line}"/><text x="${X(6) - 6}" y="${Y(g) + 3}" text-anchor="end" font-size="10" fill="${C.ash}">${g}</text>`;
      D.forEach(d => { const r = 4 + Math.sqrt(d[3] / 1000) * 1.3; s += `<circle cx="${X(d[1])}" cy="${Y(d[2])}" r="${r}" fill="${C.blue}" fill-opacity=".22" stroke="${C.blue}"/>`; });
      s += `<text x="${X(xs)}" y="${Y(ys) + 7}" text-anchor="middle" font-size="22" fill="${C.violet}">★</text>`;
      if (pick) s += `<circle cx="${X(pick[0])}" cy="${Y(pick[1])}" r="6" fill="none" stroke="${C.red}" stroke-width="2"/>`;
      s += '</svg>';
      const ch = $(root, '.chart'); ch.innerHTML = s;
      ch.querySelector('svg').onclick = e => { const r = e.currentTarget.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * 330, sy = (e.clientY - r.top) / r.height * 280; pick = [Math.round((6 + (sx - 30) / 280 * 12) * 10) / 10, Math.round((2 + (260 - sy) / 240 * 13) * 10) / 10]; upd(); };
      $(root, '.readout').textContent = `x* = Σ lᵢxᵢ / Σ lᵢ = ${f(xs * L / 1000, 0)} / ${f(L / 1000, 0)} = ${f(xs, 2)}\ny* = Σ lᵢyᵢ / Σ lᵢ = ${f(ys * L / 1000, 0)} / ${f(L / 1000, 0)} = ${f(ys, 2)}   (★, 납품량은 천 단위)\n` +
        `무게중심의 ld = Σ lᵢ(|xᵢ − x*| + |yᵢ − y*|) = ${f(ld(xs, ys), 1)}` + (pick ? `\n클릭한 위치 (${pick[0]}, ${pick[1]}) 의 ld = ${f(ld(pick[0], pick[1]), 1)}  ${ld(pick[0], pick[1]) < ld(xs, ys) ? '← 무게중심보다 작아요! (무게중심은 출발점일 뿐, 직각거리 최적은 아닐 수 있음)' : ''}` : '');
    };
    root.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  };

  /* ---------- 06. 손익분기점 ---------- */
  W.breakeven = root => {
    const D = [['A', 250000, 75], ['B', 400000, 47], ['C', 600000, 23], ['D', 700000, 39]];
    root.innerHTML = `<div class="w-title">직접 해보기: 입지 손익분기점 (예제 6-3)</div>
      <div class="tbl-wrap"><table class="t"><thead><tr><th>지역</th><th class="num">연간 고정비 ($)</th><th class="num">단위당 변동비 ($)</th></tr></thead><tbody>${D.map((d, i) =>
        `<tr><td><span style="color:${COLS[i]};font-weight:700">●</span> ${d[0]}</td><td class="num"><input type="number" value="${d[1]}" data-i="${i}" data-k="1" style="width:110px"></td><td class="num"><input type="number" value="${d[2]}" data-i="${i}" data-k="2" style="width:70px"></td></tr>`).join('')}</tbody></table></div>
      <div class="controls"><label>연간 수요 Q <input type="range" class="q" min="0" max="20000" step="100" value="15000"> <b class="qv"></b></label></div>
      <div class="chart"></div><div class="readout"></div>`;
    const upd = () => {
      root.querySelectorAll('input[data-i]').forEach(inp => { D[+inp.dataset.i][+inp.dataset.k] = +inp.value || 0; });
      const Q = +$(root, '.q').value, Qm = 20000; $(root, '.qv').textContent = Q.toLocaleString();
      const tc = (d, q) => d[1] + d[2] * q, ymax = Math.max(...D.map(d => tc(d, Qm)));
      const X = q => 60 + q / Qm * 470, Y = c => 210 - c / ymax * 195;
      let s = `<svg viewBox="0 0 560 240"><line x1="60" y1="210" x2="535" y2="210" stroke="${C.ink}"/><line x1="60" y1="210" x2="60" y2="10" stroke="${C.ink}"/>`;
      for (let q = 0; q <= Qm; q += 5000) s += `<text x="${X(q)}" y="226" text-anchor="middle" font-size="11" fill="${C.ash}" font-family="Inter">${q.toLocaleString()}</text>`;
      for (let k = 0; k <= 4; k++) { const c = ymax * k / 4; s += `<text x="55" y="${Y(c) + 4}" text-anchor="end" font-size="10" fill="${C.ash}" font-family="Inter">${(c / 1e6).toFixed(1)}M</text>`; }
      // 하한선 (최저 비용)
      let env = []; for (let q = 0; q <= Qm; q += 100) env.push([q, Math.min(...D.map(d => tc(d, q)))]);
      s += `<polyline points="${env.map(([q, c]) => `${X(q)},${Y(c)}`).join(' ')}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-opacity=".08"/>`;
      D.forEach((d, i) => { s += `<line x1="${X(0)}" y1="${Y(tc(d, 0))}" x2="${X(Qm)}" y2="${Y(tc(d, Qm))}" stroke="${COLS[i]}" stroke-width="2.2"/><text x="${X(Qm) + 4}" y="${Y(tc(d, Qm)) + 4}" font-size="12" fill="${COLS[i]}" font-family="Inter" font-weight="700">${d[0]}</text>`; });
      s += `<line x1="${X(Q)}" y1="10" x2="${X(Q)}" y2="210" stroke="${C.violet}" stroke-dasharray="4 3"/>`;
      // 손익분기점: 하한선에서 최적 대안이 바뀌는 지점
      const best = q => D.reduce((b, d, i) => tc(d, q) < tc(D[b], q) ? i : b, 0);
      const bes = []; let cur = best(0);
      for (let q = 1; q <= Qm; q++) { const b = best(q); if (b !== cur) { const d1 = D[cur], d2 = D[b], qq = (d2[1] - d1[1]) / (d1[2] - d2[2]); bes.push([d1[0], d2[0], qq]); s += `<circle cx="${X(qq)}" cy="${Y(tc(d1, qq))}" r="5" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`; cur = b; } }
      $(root, '.chart').innerHTML = s + '</svg>';
      const bq = best(Q);
      $(root, '.readout').textContent = `Q = ${Q.toLocaleString()} 일 때 총비용: ${D.map(d => `${d[0]} $${tc(d, Q).toLocaleString()}`).join(' · ')}\n→ 최선의 입지: ${D[bq][0]}\n` +
        `손익분기점 (최저 비용 대안이 바뀌는 곳, ○): ${bes.map(([a, b, q]) => { const d1 = D.find(d => d[0] === a), d2 = D.find(d => d[0] === b); return `${a}↔${b}: ${d1[1].toLocaleString()} + ${d1[2]}Q = ${d2[1].toLocaleString()} + ${d2[2]}Q → Q = ${f(q, 0)}`; }).join('  /  ')}\n` +
        `구간: ${(() => { const out = []; let start = 0, c0 = best(0); bes.forEach(([, b, q]) => { out.push(`${D[c0][0]} (${f(start, 0)} ~ ${f(q, 0)})`); start = q; c0 = D.findIndex(d => d[0] === b); }); out.push(`${D[c0][0]} (${f(start, 0)} 이상)`); return out.join(', '); })()}` +
        `${D.some((d, i) => !bes.some(x => x[0] === d[0] || x[1] === d[0]) && best(0) !== i) ? `\n(${D.filter((d, i) => !bes.some(x => x[0] === d[0] || x[1] === d[0]) && best(0) !== i).map(d => d[0]).join(', ')} 는 어떤 수요에서도 최저가 아님)` : ''}`;
    };
    root.querySelectorAll('input').forEach(i => i.oninput = upd); upd();
  };

  /* ---------- 06. 복수시설 (2개 물류센터) ---------- */
  const MD = [[0, 4, 3, 3, 6, 5, 6], [4, 0, 2, 3, 4, 5, 5], [3, 2, 0, 1, 4, 3, 4], [3, 3, 1, 0, 3, 2, 3], [6, 4, 4, 3, 0, 1, 1], [5, 5, 3, 2, 1, 0, 1], [6, 5, 5, 3, 1, 1, 0]];
  const ML = [1, 2, 2, 5, 3, 1, 2];
  const MP = [[60, 95], [175, 30], [150, 115], [80, 185], [260, 110], [210, 190], [330, 160]];
  const ME = [[0, 1, 4], [0, 2, 3], [0, 3, 3], [1, 2, 2], [1, 4, 4], [2, 4, 4], [2, 3, 1], [2, 5, 4], [3, 5, 2], [4, 5, 1], [4, 6, 1], [5, 6, 1]];
  W.multifac = root => {
    root.innerHTML = `<div class="w-title">직접 해보기: 물류센터 2곳 고르기 (복수시설 부하-거리)</div>
      <p style="font-size:14px;margin:0">지점 두 개를 눌러 물류센터로 지정하면, 각 수요지는 더 가까운 센터에 배정되고 총 부하-거리(Tld)가 계산돼요. 동그라미 숫자 = 수송량(부하).</p>
      <div class="controls"><button type="button" class="pill small best">모든 조합 중 최소 찾기</button><button type="button" class="pill small" data-s="2,3">슬라이드 a: P3, P4</button><button type="button" class="pill small" data-s="2,5">b: P3, P6</button><button type="button" class="pill small" data-s="3,4">c: P4, P5</button></div>
      <div class="cols"><div class="chart"></div><div class="tbl"></div></div><div class="readout"></div>`;
    let S = [2, 3];
    const tld = S2 => { let tot = 0; const asg = []; for (let j = 0; j < 7; j++) { const [a, b] = S2; const k = MD[a][j] <= MD[b][j] ? a : b; asg.push(k); tot += ML[j] * MD[k][j]; } return { tot, asg }; };
    const upd = () => {
      const { tot, asg } = tld(S);
      let s = `<svg viewBox="0 0 370 220">`;
      ME.forEach(([a, b, d]) => { const [x1, y1] = MP[a], [x2, y2] = MP[b]; s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="2"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}" text-anchor="middle" font-size="10" fill="${C.ash}" font-family="Inter">${d}km</text>`; });
      MP.forEach(([x, y], j) => {
        const isF = S.includes(j), col = COLS[S.indexOf(asg[j])];
        s += `<g data-j="${j}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="${isF ? 17 : 14}" fill="${isF ? col : '#fff'}" fill-opacity="${isF ? .9 : 1}" stroke="${col}" stroke-width="${isF ? 3 : 2.2}"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="700" font-family="Inter" fill="${isF ? '#fff' : C.ink}">P${j + 1}</text><text x="${x + 19}" y="${y - 12}" font-size="11" fill="${C.violet}" font-family="Inter">(${ML[j]})</text></g>`;
      });
      const ch = $(root, '.chart'); ch.innerHTML = s + '</svg>';
      ch.querySelectorAll('[data-j]').forEach(g => g.onclick = () => { const j = +g.dataset.j; if (S.includes(j)) return; S = [S[1], j]; upd(); });
      $(root, '.tbl').innerHTML = `<div class="tbl-wrap"><table class="t" style="font-size:13px"><thead><tr><th>수요지</th><th class="num">부하</th><th>배정</th><th class="num">거리</th><th class="num">ld</th></tr></thead><tbody>${ML.map((l, j) => `<tr><td>P${j + 1}</td><td class="num">${l}</td><td style="color:${COLS[S.indexOf(asg[j])]};font-weight:600">P${asg[j] + 1}</td><td class="num">${MD[asg[j]][j]}</td><td class="num">${l * MD[asg[j]][j]}</td></tr>`).join('')}</tbody></table></div>`;
      $(root, '.readout').textContent = `물류센터 = P${S[0] + 1}, P${S[1] + 1}\nTld = Σ (부하 × 가까운 센터까지 거리) = ${ML.map((l, j) => `${l}×${MD[asg[j]][j]}`).join(' + ')} = ${tot}`;
    };
    root.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { S = b.dataset.s.split(',').map(Number); upd(); });
    root.querySelector('.best').onclick = () => {
      let best = null, all = [];
      for (let a = 0; a < 7; a++) for (let b = a + 1; b < 7; b++) { const t = tld([a, b]).tot; all.push([t, a, b]); if (!best || t < best[0]) best = [t, a, b]; }
      S = [best[1], best[2]]; upd();
      all.sort((x, y) => x[0] - y[0]);
      $(root, '.readout').textContent += `\n\n모든 21개 조합 중 최소: P${best[1] + 1}, P${best[2] + 1} (Tld = ${best[0]})\n작은 순서: ${all.slice(0, 6).map(([t, a, b]) => `P${a + 1}·P${b + 1}=${t}`).join(', ')} …`;
    };
    upd();
  };

  /* ---------- 07. 용량 · 병목 (피자집) ---------- */
  W.pizza = root => {
    const EX = {
      1: [['주문접수', 6, 1, '영희'], ['도우 만들기', 7.5, 1, '철수'], ['토핑', 5, 1, '유진'], ['굽기', 24, 2, '오븐 2대'], ['자르기 및 포장', 5, 1, '길동'], ['배달', 20, 2, '민수, 준호']],
      2: [['주문접수', 6, 1, '영희'], ['도우 만들기', 7.5, 1, '철수'], ['토핑', 5, 1, '유진'], ['굽기', 24, 4, '오븐 4대'], ['자르기 및 포장', 5, 1, '길동'], ['배달', 20, 3, '3명']],
    };
    let D = EX[1].map(r => r.slice());
    root.innerHTML = `<div class="w-title">직접 해보기: A피자점 용량 · 병목 · 가동률</div>
      <div class="controls"><button type="button" class="pill small" data-e="1">예제 1</button><button type="button" class="pill small" data-e="2">예제 2 (오븐 +2, 배달 +1)</button><label>수요 (개/시간) <input type="number" class="dem" value="6" style="width:70px"></label></div>
      <div class="tb"></div><div class="chart"></div><div class="calc-grid res"></div><div class="readout"></div>`;
    const upd = () => {
      const dem = num(root, '.dem');
      const caps = D.map(([, t, n]) => n * 60 / t), cap = Math.min(...caps), bi = caps.indexOf(cap), flow = Math.min(cap, dem);
      $(root, '.tb').innerHTML = `<div class="tbl-wrap"><table class="t" style="font-size:14px"><thead><tr><th>공정</th><th class="num">소요시간(분)</th><th class="num">인력/설비 수</th><th class="num">용량 (개/시간)</th><th class="num">가동률</th></tr></thead><tbody>${D.map(([nm, t, n, who], i) =>
        `<tr class="${i === bi ? 'hl' : ''}"><td>${nm} <span style="color:var(--muted);font-size:12px">${who}</span>${i === bi ? ' <b style="color:var(--sienna)">← 병목</b>' : ''}</td><td class="num"><input type="number" step="0.5" value="${t}" data-i="${i}" data-k="1" style="width:64px"></td><td class="num"><input type="number" value="${n}" data-i="${i}" data-k="2" style="width:54px"></td><td class="num">${f(caps[i], 2)} <span style="color:var(--muted);font-size:12px">(=${n}×60/${t})</span></td><td class="num">${f(flow / caps[i] * 100, 1)}%</td></tr>`).join('')}</tbody></table></div>`;
      $(root, '.tb').querySelectorAll('input').forEach(inp => inp.onchange = () => { D[+inp.dataset.i][+inp.dataset.k] = +inp.value || 1; upd(); });
      const mx = Math.max(...caps, dem) * 1.15;
      let s = `<svg viewBox="0 0 560 ${D.length * 30 + 30}">`;
      D.forEach(([nm], i) => { const w = caps[i] / mx * 400; s += `<text x="120" y="${i * 30 + 24}" text-anchor="end" font-size="12" font-family="Inter" fill="${C.ink}">${nm}</text><rect x="128" y="${i * 30 + 10}" width="${w}" height="20" rx="6" fill="${i === bi ? C.violet : C.blue}" fill-opacity="${i === bi ? .85 : .35}"/><rect x="128" y="${i * 30 + 10}" width="${flow / mx * 400}" height="20" rx="6" fill="none" stroke="${C.ink}" stroke-dasharray="3 2"/>`; });
      s += `<line x1="${128 + dem / mx * 400}" y1="4" x2="${128 + dem / mx * 400}" y2="${D.length * 30 + 12}" stroke="${C.red}" stroke-width="2"/><text x="${128 + dem / mx * 400 + 4}" y="${D.length * 30 + 26}" font-size="11" fill="${C.red}" font-family="Inter">수요 ${dem}</text>`;
      $(root, '.chart').innerHTML = s + '</svg>';
      $(root, '.res').innerHTML = `<div><div class="result-big">${f(cap, 2)}<small>개/시간 전체 용량</small></div></div><div><div class="result-big">${f(flow, 2)}<small>개/시간 흐름율</small></div></div><div><div class="result-big">${f(flow / cap * 100, 1)}%<small>가동률</small></div></div><div><div class="result-big">${f(100 - flow / cap * 100, 1)}%<small>여유용량</small></div></div>`;
      $(root, '.readout').textContent = `병목 = 용량이 가장 작은 공정 = ${D[bi][0]} (${f(cap, 2)}개/시간) → 전체 용량 = ${f(cap, 2)}\n흐름율 = Min{수요 ${dem}, 용량 ${f(cap, 2)}} = ${f(flow, 2)}  → ${dem > cap ? '공급량(용량)에 의한 흐름 제약' : '수요량에 의한 흐름 제약'}\n가동률 = 흐름율/용량 = ${f(flow / cap * 100, 1)}%  (수요가 아무리 커도 100%를 넘지 못함), 여유용량 = 100% − 가동률`;
    };
    root.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { D = EX[b.dataset.e].map(r => r.slice()); upd(); });
    $(root, '.dem').oninput = upd; upd();
  };

  document.addEventListener('DOMContentLoaded', () => {
    initBlanks();
    document.querySelectorAll('[data-widget]').forEach(node => { node.classList.add('widget'); const fn = W[node.dataset.widget]; if (fn) fn(node); });
  });
})();
