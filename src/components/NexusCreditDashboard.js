/**
 * NexusCredit — Panel de Control Gerencial C-Suite / Inversores
 * v2.0 — Vanilla JavaScript (ES6) · Chart.js via CDN
 *
 * ── CHANGELOG v2.0 ──────────────────────────────────────────────
 * [1] ARQUITECTURA DE INTEGRACIÓN
 *     - window.initNexusCreditDashboard(containerEl, options)
 *     - options.isModal  {boolean}  — layout fixed full-screen
 *     - options.onClose  {function} — callback para cerrar modal
 *     - options.repoUrl  {string}   — URL repositorio GitHub
 *
 * [2] KPIs EJECUTIVOS EXPANDIDOS
 *     - Cobertura de Provisiones NIIF 9 (PCR): 112.5%
 *     - Margen Financiero Neto (NIM): 14.2%
 *     - Mora Primer Pago Defectuoso (FPD): 1.8%
 *     - KPIs en dos filas: operativos (row 1) + riesgo/capital (row 2)
 *
 * [3] TAB TESORERÍA & CAPITAL
 *     - Estructura de Fondeo Institucional (Warehouse Lines)
 *     - Gráfico Capital Disponible vs Demanda de Colocación
 *     - Alerta de liquidez en proyección Ago–Sep
 *
 * [4] LÍNEA DE TOLERANCIA DE MORA
 *     - Annotation en 6.5% (apetito de riesgo Comité)
 *     - Visual: línea roja punteada con label "Límite Comité 6.5%"
 *
 * ── PALETA — styles.css portafolio ──────────────────────────────
 *     --accent: #0A1F44  Gold: #B8963E  Blue: #3B82F6
 *     Fonts: Newsreader · DM Sans · JetBrains Mono
 *
 * ── CDN DEPENDENCIAS ────────────────────────────────────────────
 *     Chart.js 4.4  +  chartjs-plugin-annotation 3.x
 *     (cargados dinámicamente la primera vez)
 */

window.initNexusCreditDashboard = (function () {

  // ── DESIGN TOKENS ────────────────────────────────────────────
  const C = {
    bg:"#060d1a",  sf:"#091526",   sf2:"#0d1d35",
    bd:"#162440",  bdl:"#1e3357",
    navy:"#0A1F44", cream:"#F6F4EF",
    c2:"#d4cfc6",  c3:"#8a9ab5",  c4:"#4a5a72",
    gold:"#B8963E", goldl:"#d4aa50",
    blue:"#3B82F6",
    up:"#4a9e6b",  dn:"#b05050",  warn:"#8a6d2a",
    alert:"#c0392b",
  };
  const ramp  = ["#1a3560","#1e4d8c","#2463ae","#B8963E","#9a7a32"];
  const mono  = "'JetBrains Mono', monospace";
  const serif = "'Newsreader', serif";
  const sans  = "'DM Sans', sans-serif";

  // ── DATA ─────────────────────────────────────────────────────
  const kpisOperativo = [
    { label:"Operaciones del mes",  value:"4,837",  delta:+8.3,  pos:true,  ac:C.gold  },
    { label:"Ticket promedio",       value:"$2,341", delta:+3.1,  pos:true,  ac:C.blue  },
    { label:"Tasa de conversión",    value:"26.4%",  delta:+1.8,  pos:true,  ac:C.gold  },
    { label:"Recuperación cartera",  value:"71.3%",  delta:-2.4,  pos:false, ac:C.warn  },
    { label:"ROI adquisición",       value:"3.8x",   delta:+0.4,  pos:true,  ac:C.gold  },
  ];
  const kpisRiesgo = [
    { label:"Índice de mora",                        value:"6.7%",   delta:+0.9, pos:false, ac:C.dn,    note:"NIIF 9 · Stage 2+3"            },
    { label:"Cobertura de provisiones (PCR NIIF 9)", value:"112.5%", delta:+4.1, pos:true,  ac:C.up,    note:"Requerido mínimo: 100%"        },
    { label:"Margen financiero neto (NIM)",           value:"14.2%",  delta:-0.6, pos:false, ac:C.gold,  note:"Spread cartera activa"         },
    { label:"Mora primer pago defectuoso (FPD)",      value:"1.8%",   delta:+0.3, pos:false, ac:C.alert, note:"Ventana 30 días · Vintage Jun" },
  ];
  const canalesData = [
    { canal:"Digital Paid", ops:1842, conv:31.2, cac:48 },
    { canal:"Orgánico SEO", ops:934,  conv:28.7, cac:12 },
    { canal:"Referidos",    ops:581,  conv:34.1, cac:9  },
    { canal:"Alianzas B2B", ops:763,  conv:22.4, cac:61 },
    { canal:"Outbound",     ops:717,  conv:18.6, cac:73 },
  ];
  const productosData = [
    { producto:"Créd. Personal",    aprobados:1283, rechazados:547,  ticket:2100 },
    { producto:"Créd. Empresarial", aprobados:621,  rechazados:834,  ticket:4180 },
    { producto:"Nómina",            aprobados:1047, rechazados:312,  ticket:890  },
    { producto:"BNPL",              aprobados:873,  rechazados:291,  ticket:430  },
    { producto:"Microcrédito",      aprobados:513,  rechazados:189,  ticket:680  },
  ];
  const segmentosRechazo = [
    { segmento:"Independientes sin formal", tasa:67.3 },
    { segmento:"Nuevos empresariales",      tasa:57.1 },
    { segmento:"Historial < 6 meses",       tasa:51.8 },
    { segmento:"Deuda > 80% ingreso",       tasa:48.2 },
    { segmento:"Comercio informal",         tasa:41.9 },
  ];
  const politicasData = [
    { politica:"Flexibilización garantías PYME", impacto:"+14.3%", col:C.up   },
    { politica:"Score alternativo (datos open)", impacto:"+9.7%",  col:C.up   },
    { politica:"Tasa diferencial nómina",         impacto:"+7.2%",  col:C.up   },
    { politica:"Límite LTV sector informal",      impacto:"-11.4%", col:C.dn   },
    { politica:"Requisito historial 12 meses",    impacto:"-8.1%",  col:C.warn },
  ];
  const recuperacionCanal = [
    { canal:"WhatsApp Bot",   tasa:78.4, ticket:312 },
    { canal:"Llamada humana", tasa:71.2, ticket:489 },
    { canal:"Email auto.",    tasa:63.7, ticket:198 },
    { canal:"SMS",            tasa:58.9, ticket:143 },
    { canal:"Carta física",   tasa:44.1, ticket:621 },
  ];
  const recuperacionProducto = [
    { producto:"Créd. Personal",    recuperado:73.2, pendiente:26.8 },
    { producto:"Créd. Empresarial", recuperado:61.4, pendiente:38.6 },
    { producto:"Nómina",            recuperado:81.7, pendiente:18.3 },
    { producto:"BNPL",              recuperado:69.3, pendiente:30.7 },
    { producto:"Microcrédito",      recuperado:77.1, pendiente:22.9 },
  ];
  const historico = [
    { mes:"Ene", ops:3241, ingreso:7.8,  mora:5.9 },
    { mes:"Feb", ops:3587, ingreso:8.4,  mora:6.1 },
    { mes:"Mar", ops:3812, ingreso:9.1,  mora:6.4 },
    { mes:"Abr", ops:4103, ingreso:9.7,  mora:6.8 },
    { mes:"May", ops:4491, ingreso:10.3, mora:6.5 },
    { mes:"Jun", ops:4837, ingreso:11.1, mora:6.7 },
    { mes:"Jul", ops:5124, ingreso:11.8, mora:6.9, proj:true },
    { mes:"Ago", ops:5463, ingreso:12.6, mora:7.1, proj:true },
    { mes:"Sep", ops:5891, ingreso:13.4, mora:7.3, proj:true },
  ];
  const marketingData = [
    { canal:"Digital Paid", cac:48, ltv:412, roi:187 },
    { canal:"Orgánico",     cac:12, ltv:389, roi:441 },
    { canal:"Referidos",    cac:9,  ltv:431, roi:513 },
    { canal:"Alianzas",     cac:61, ltv:398, roi:152 },
    { canal:"Outbound",     cac:73, ltv:361, roi:128 },
  ];
  const warehouseLines = [
    { nombre:"Línea A — Banca Comercial",  cupo:12.0, dispuesto:8.4, tasa:"6.5%",  vencimiento:"Mar 2027", col:C.blue },
    { nombre:"Notas Comerciales Serie B",  cupo:6.0,  dispuesto:4.9, tasa:"8.5%",  vencimiento:"Jun 2027", col:C.gold },
    { nombre:"Venture Debt — Fondo Tech",  cupo:4.0,  dispuesto:2.1, tasa:"10.2%", vencimiento:"Dic 2026", col:C.warn },
  ];
  const capitalDemanda = [
    { mes:"Ene", demanda:6.2,  capital:14.8 },
    { mes:"Feb", demanda:6.9,  capital:14.1 },
    { mes:"Mar", demanda:7.4,  capital:13.6 },
    { mes:"Abr", demanda:8.1,  capital:13.0 },
    { mes:"May", demanda:8.8,  capital:12.4 },
    { mes:"Jun", demanda:9.3,  capital:11.6 },
    { mes:"Jul", demanda:10.1, capital:10.9, proj:true },
    { mes:"Ago", demanda:11.4, capital:10.2, proj:true, alerta:true },
    { mes:"Sep", demanda:13.1, capital:9.4,  proj:true, alerta:true },
  ];
  const fuentes = [
    { m:"KPIs operativos",         f:"Data Warehouse · ERP financiero",              ac:C.gold    },
    { m:"KPIs riesgo / capital",   f:"NIIF 9 Engine · ALM · Comité de Riesgos",      ac:C.dn      },
    { m:"Canales de adquisición",  f:"CRM · Marketing Platform · UTMs",              ac:C.blue    },
    { m:"Productos / Conversión",  f:"Motor de originación · Core crediticio",        ac:"#1e4d8c" },
    { m:"Segmentos / Políticas",   f:"Scorecard · Policy Engine · Underwriting",     ac:C.warn    },
    { m:"Recuperación de cartera", f:"Sistema cobranza · Contact Center · WhatsApp", ac:C.up      },
    { m:"Predicción / Proyección", f:"Modelo ML · Series temporales · Pipeline CRM", ac:C.c3      },
    { m:"Tesorería & Fondeo",      f:"Treasury Management System · Cap Table · ALM", ac:C.gold    },
  ];

  // ── CDN LOADER ────────────────────────────────────────────────
  let _chartJSReady = false;
  async function loadChartJS() {
    if (_chartJSReady || window.Chart) { _chartJSReady = true; return; }
    const load = (src) => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    await load('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
    await load('https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js');
    _chartJSReady = true;
  }

  // ── DOM HELPERS ───────────────────────────────────────────────
  function mk(tag, styles = {}, attrs = {}) {
    const e = document.createElement(tag);
    Object.assign(e.style, styles);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }
  function ap(parent, ...children) {
    children.forEach(c => c && parent.appendChild(c));
    return parent;
  }
  function txt(content, styles = {}) {
    const e = mk('div', styles);
    e.textContent = content;
    return e;
  }
  function grid(cols, gap = '10px') {
    const el = mk('div', { display:'grid', gridTemplateColumns:cols, gap });
    el.classList.add('ncrd-grid');
    return el;
  }
  function progressBar(pct, color, height = 2) {
    const track = mk('div', { height:height+'px', background:C.sf2, borderRadius:'1px' });
    const fill  = mk('div', { width:Math.min(pct,100)+'%', height:'100%', background:color, borderRadius:'1px' });
    track.appendChild(fill);
    return track;
  }
  function mkCanvas(height = 200) {
    const wrap   = mk('div', { position:'relative', height:height+'px', marginTop:'10px' });
    wrap.classList.add('ncrd-chart-wrap');
    const canvas = document.createElement('canvas');
    wrap.appendChild(canvas);
    return { wrap, canvas };
  }

  // ── PRIMITIVE COMPONENTS ──────────────────────────────────────
  function card(style = {}) {
    return mk('div', { background:C.sf, border:`1px solid ${C.bd}`, borderRadius:'3px', padding:'14px 18px', ...style });
  }
  function slabel(text) {
    return txt(text, {
      fontFamily:mono, fontSize:'8.5px', letterSpacing:'.12em',
      textTransform:'uppercase', color:C.c4,
      marginBottom:'10px', paddingBottom:'7px', borderBottom:`1px solid ${C.bd}`,
    });
  }
  function src(text) {
    return txt('↳ ' + text, { fontFamily:mono, fontSize:'8.5px', color:C.c4, marginBottom:'7px', letterSpacing:'.03em' });
  }
  function ins(text, color = C.gold) {
    return txt(text, {
      fontFamily:sans, fontSize:'11px', color,
      marginBottom:'9px', paddingLeft:'8px',
      borderLeft:`1.5px solid ${color}`, lineHeight:'1.5',
    });
  }
  function alertBox(text) {
    return txt('⚠ ' + text, {
      fontFamily:sans, fontSize:'11px', color:C.alert,
      marginBottom:'9px', padding:'7px 10px',
      background:C.alert+'18', border:`1px solid ${C.alert}44`,
      borderRadius:'3px', lineHeight:'1.5',
    });
  }
  function dlt(v, pos) {
    const e = mk('span', { fontFamily:mono, fontSize:'10px', fontWeight:'500', color:pos ? C.up : C.dn });
    e.textContent = (pos ? '▲ +' : '▼ ') + Math.abs(v) + '%';
    return e;
  }
  function kpiCard(k, minW = '150px') {
    const c = card({ padding:'12px 14px', borderLeft:`1.5px solid ${k.ac}`, minWidth:minW });
    ap(c,
      txt(k.label, { fontFamily:mono, fontSize:'8px', letterSpacing:'.09em', textTransform:'uppercase', color:C.c4, marginBottom:'7px' }),
      txt(k.value, { fontFamily:mono, fontSize:'21px', fontWeight:'500', color:C.cream, letterSpacing:'-.02em', marginBottom:'5px' }),
      dlt(k.delta, k.pos)
    );
    return c;
  }
  function kpiCardWithNote(k) {
    const c = card({ padding:'12px 14px', borderLeft:`1.5px solid ${k.ac}` });
    const row = mk('div', { display:'flex', justifyContent:'space-between', alignItems:'center' });
    ap(row, dlt(k.delta, k.pos), txt(k.note, { fontFamily:mono, fontSize:'8px', color:C.c4 }));
    ap(c,
      txt(k.label, { fontFamily:mono, fontSize:'8px', letterSpacing:'.09em', textTransform:'uppercase', color:C.c4, marginBottom:'5px' }),
      txt(k.value, { fontFamily:mono, fontSize:'21px', fontWeight:'500', color:C.cream, letterSpacing:'-.02em', marginBottom:'4px' }),
      row
    );
    return c;
  }

  // ── CHART REGISTRY ────────────────────────────────────────────
  let _activeCharts = [];
  function destroyCharts() { _activeCharts.forEach(c => c.destroy()); _activeCharts = []; }
  function mkChart(canvas, config) {
    const ch = new Chart(canvas, config);
    _activeCharts.push(ch);
    return ch;
  }

  // ── CHART DEFAULTS ────────────────────────────────────────────
  function tooltip() {
    return {
      backgroundColor:C.sf2, borderColor:C.bdl, borderWidth:1,
      titleColor:C.c3, bodyColor:C.cream,
      titleFont:{ family:mono, size:8.5 },
      bodyFont:{ family:sans, size:11 },
      padding:10,
    };
  }
  function scaleX(rotate = 0) {
    return { ticks:{ color:C.c3, font:{ family:mono, size:8 }, maxRotation:rotate }, grid:{ display:false }, border:{ display:false } };
  }
  function scaleY(unit = '') {
    return {
      ticks:{ color:C.c4, font:{ family:mono, size:8 }, callback: unit ? v => v + unit : undefined },
      grid:{ color:C.bd }, border:{ display:false },
    };
  }
  function scaleYH() { // for horizontal bar Y-axis (labels)
    return { ticks:{ color:C.c3, font:{ family:mono, size:8 } }, grid:{ display:false }, border:{ display:false } };
  }

  // ══════════════════════════════════════════════════════════════
  // TAB RENDERERS
  // ══════════════════════════════════════════════════════════════

  function renderOverview(ct) {
    // Row 1 — KPIs Operativos
    ap(ct, txt('KPIs Operativos', { fontFamily:mono, fontSize:'8.5px', letterSpacing:'.1em', textTransform:'uppercase', color:C.c4, marginBottom:'6px' }));
    const g1 = grid('repeat(auto-fit,minmax(150px,1fr))', '7px');
    g1.style.marginBottom = '10px';
    kpisOperativo.forEach(k => g1.appendChild(kpiCard(k)));
    ct.appendChild(g1);

    // Row 2 — KPIs Riesgo
    ap(ct, txt('Riesgo, Provisiones & Capital — NIIF 9', { fontFamily:mono, fontSize:'8.5px', letterSpacing:'.1em', textTransform:'uppercase', color:C.c4, marginBottom:'6px' }));
    const g2 = grid('repeat(auto-fit,minmax(200px,1fr))', '7px');
    g2.style.marginBottom = '16px';
    kpisRiesgo.forEach(k => g2.appendChild(kpiCardWithNote(k)));
    ct.appendChild(g2);

    // Charts row: Canales (horizontal bar) + Productos (stacked bar)
    const row1 = grid('1fr 1.35fr', '10px');
    row1.style.marginBottom = '10px';

    const cCanales = card();
    const { wrap:wCn, canvas:cvCn } = mkCanvas(175);
    ap(cCanales, slabel('Canales de adquisición'), src('CRM · Marketing Platform · UTMs'),
      ins('Referidos: menor CAC ($9) con mayor conversión (34.1%) — canal estructuralmente eficiente'), wCn);

    const cProd = card();
    const { wrap:wPr, canvas:cvPr } = mkCanvas(175);
    ap(cProd, slabel('Conversión por producto'), src('Motor de originación · Core crediticio'),
      ins('Crédito Empresarial: mayor rechazo (57.3%) — presión en política de garantías PYME', C.warn), wPr);
    ap(row1, cCanales, cProd);
    ct.appendChild(row1);

    // Segmentos + Políticas
    const row2 = grid('1fr 1fr', '10px');

    const cSeg = card();
    ap(cSeg, slabel('Segmentos con mayor rechazo crediticio'), src('Scorecard · Underwriting Engine'),
      ins('Informales (67.3%) — mayor oportunidad de inclusión financiera no atendida', C.dn));
    segmentosRechazo.forEach(r => {
      const item = mk('div', { marginBottom:'9px' });
      const labels = mk('div', { display:'flex', justifyContent:'space-between', marginBottom:'3px' });
      ap(labels,
        txt(r.segmento, { fontFamily:sans, fontSize:'11px', color:C.c3 }),
        txt(r.tasa+'%', { fontFamily:mono, fontSize:'10px', color:r.tasa>60?C.dn:r.tasa>50?C.warn:C.c3 })
      );
      ap(item, labels, progressBar(r.tasa, r.tasa>60?C.dn:r.tasa>50?C.warn:C.blue));
      cSeg.appendChild(item);
    });

    const cPol = card();
    ap(cPol, slabel('Políticas que impulsan / frenan colocación'), src('Policy Engine · Comité de Crédito'),
      ins('3 políticas activas generan +31.2% de colocación neta incremental', C.up));
    const polList = mk('div', { display:'flex', flexDirection:'column', gap:'6px' });
    politicasData.forEach(p => {
      const row = mk('div', { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 11px', background:C.sf2, borderRadius:'2px', borderLeft:`1.5px solid ${p.col}` });
      ap(row, txt(p.politica, { fontFamily:sans, fontSize:'11px', color:C.c3 }), txt(p.impacto, { fontFamily:mono, fontSize:'11px', fontWeight:'500', color:p.col }));
      polList.appendChild(row);
    });
    cPol.appendChild(polList);
    ap(row2, cSeg, cPol);
    ct.appendChild(row2);

    // Charts
    mkChart(cvCn, {
      type:'bar',
      data:{ labels:canalesData.map(d=>d.canal), datasets:[{ data:canalesData.map(d=>d.ops), backgroundColor:ramp, borderRadius:2, label:'Operaciones' }] },
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleY(), y:scaleYH() } },
    });
    mkChart(cvPr, {
      type:'bar',
      data:{ labels:productosData.map(d=>d.producto), datasets:[
        { label:'Aprobados',  data:productosData.map(d=>d.aprobados),  backgroundColor:C.navy,      stack:'a' },
        { label:'Rechazados', data:productosData.map(d=>d.rechazados), backgroundColor:C.dn+'55',   stack:'a', borderRadius:{ topLeft:2, topRight:2 } },
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:{ ...scaleX(25), stacked:true }, y:{ ...scaleY(), stacked:true } } },
    });
  }

  function renderAdquisicion(ct) {
    const total = canalesData.reduce((a,b)=>a+b.ops, 0);
    const cg = grid('repeat(auto-fit,minmax(138px,1fr))', '7px');
    cg.style.marginBottom = '14px';
    canalesData.forEach((c,i) => {
      const pct = ((c.ops/total)*100).toFixed(1);
      const cd = card({ padding:'11px 13px', borderTop:`1.5px solid ${ramp[i]}` });
      ap(cd,
        txt(c.canal, { fontFamily:mono, fontSize:'8px', letterSpacing:'.07em', textTransform:'uppercase', color:C.c4, marginBottom:'5px' }),
        txt(c.ops.toLocaleString(), { fontFamily:mono, fontSize:'19px', fontWeight:'500', color:C.cream }),
        txt(pct+'% del volumen', { fontFamily:mono, fontSize:'8px', color:ramp[i], marginTop:'3px' }),
        txt('Conv '+c.conv+'% · CAC $'+c.cac, { fontFamily:mono, fontSize:'8px', color:C.c4, marginTop:'1px' })
      );
      cg.appendChild(cd);
    });
    ct.appendChild(cg);

    const row = grid('1fr 1fr', '10px');

    const cCac = card();
    const { wrap:wCc, canvas:cvCc } = mkCanvas(230);
    ap(cCac, slabel('CAC vs tasa de conversión'), src('CRM · Attribution model · Marketing Platform'),
      ins('Referidos: $9 CAC · 34.1% conversión — canal líder en eficiencia estructural'), wCc);

    const cTick = card();
    const { wrap:wTk, canvas:cvTk } = mkCanvas(230);
    ap(cTick, slabel('Ticket promedio por producto'), src('Motor de originación · Core crediticio'),
      ins('Crédito Empresarial: $4,180 ticket — mayor valor, mayor riesgo estructural'), wTk);

    ap(row, cCac, cTick);
    ct.appendChild(row);

    // Mixed: bar (CAC) + line (Conv)
    mkChart(cvCc, {
      type:'bar',
      data:{ labels:canalesData.map(d=>d.canal), datasets:[
        { type:'bar',  label:'CAC ($)',    data:canalesData.map(d=>d.cac),  backgroundColor:C.sf2, borderColor:C.bdl, borderWidth:1, borderRadius:2, yAxisID:'y'  },
        { type:'line', label:'Conv. (%)',  data:canalesData.map(d=>d.conv), borderColor:C.gold, borderWidth:1.5, pointBackgroundColor:C.gold, pointRadius:3, pointBorderWidth:0, tension:0, yAxisID:'y2' },
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleX(20), y:scaleY(), y2:{ position:'right', ticks:{ color:C.c4, font:{ family:mono, size:8 } }, grid:{ display:false }, border:{ display:false } } } },
    });
    mkChart(cvTk, {
      type:'bar',
      data:{ labels:productosData.map(d=>d.producto), datasets:[{ label:'Ticket ($)', data:productosData.map(d=>d.ticket), backgroundColor:ramp, borderRadius:2 }] },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleX(25), y:scaleY() } },
    });
  }

  function renderCobranza(ct) {
    const row1 = grid('1.2fr 1fr', '10px');
    row1.style.marginBottom = '10px';

    const cRC = card();
    const { wrap:wRC, canvas:cvRC } = mkCanvas(192);
    ap(cRC, slabel('Recuperación por canal de cobranza'), src('Sistema cobranza · WhatsApp API · Contact Center'),
      ins('WhatsApp Bot: 78.4% recuperación al menor costo — canal digital dominante del portafolio'), wRC);

    const cTK = card();
    ap(cTK, slabel('Ticket promedio por canal'), src('Ledger de pagos · Core crediticio'),
      ins('Carta física: $621 ticket, solo 44.1% efectividad — alto valor en riesgo', C.warn));
    const tkList = mk('div', { display:'flex', flexDirection:'column', gap:'6px' });
    recuperacionCanal.forEach(c => {
      const row = mk('div', { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 11px', background:C.sf2, borderRadius:'2px' });
      const right = mk('div', { display:'flex', gap:'12px', alignItems:'center' });
      ap(right, txt('$'+c.ticket, { fontFamily:mono, fontSize:'9px', color:C.c4 }), txt(c.tasa+'%', { fontFamily:mono, fontSize:'11px', fontWeight:'500', color:c.tasa>70?C.gold:C.warn }));
      ap(row, txt(c.canal, { fontFamily:sans, fontSize:'11px', color:C.c3 }), right);
      tkList.appendChild(row);
    });
    cTK.appendChild(tkList);
    ap(row1, cRC, cTK);
    ct.appendChild(row1);

    const row2 = grid('1fr 1fr', '10px');

    const cRP = card();
    const { wrap:wRP, canvas:cvRP } = mkCanvas(185);
    ap(cRP, slabel('Recuperación por producto'), src('Core crediticio · Scorecard'),
      ins('Nómina lidera (81.7%) — garantía implícita de descuento automático de nómina'), wRP);

    const cRS = card();
    ap(cRS, slabel('Recuperación por segmento de cliente'), src('Segmentación · Modelo de scoring'),
      ins('Sector informal: 41.6% — requiere estrategia diferenciada de gestión de campo', C.dn));
    [
      { seg:"Asalariado formal",       rec:79.4, c:C.gold    },
      { seg:"PYME establecida",         rec:68.2, c:"#1e4d8c" },
      { seg:"Freelance / Profesional",  rec:64.7, c:C.blue    },
      { seg:"Comercio minorista",        rec:58.3, c:C.warn    },
      { seg:"Sector informal",           rec:41.6, c:C.dn      },
    ].forEach(s => {
      const item = mk('div', { marginBottom:'9px' });
      const labels = mk('div', { display:'flex', justifyContent:'space-between', marginBottom:'3px' });
      ap(labels, txt(s.seg, { fontFamily:sans, fontSize:'11px', color:C.c3 }), txt(s.rec+'%', { fontFamily:mono, fontSize:'10px', color:s.c }));
      ap(item, labels, progressBar(s.rec, s.c));
      cRS.appendChild(item);
    });

    ap(row2, cRP, cRS);
    ct.appendChild(row2);

    mkChart(cvRC, {
      type:'bar',
      data:{ labels:recuperacionCanal.map(d=>d.canal), datasets:[{
        label:'Tasa recup. (%)',
        data:recuperacionCanal.map(d=>d.tasa),
        backgroundColor:recuperacionCanal.map(d=>d.tasa>75?C.gold:d.tasa>65?'#1e4d8c':d.tasa>55?C.warn:C.dn),
        borderRadius:2,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleX(16), y:scaleY() } },
    });
    mkChart(cvRP, {
      type:'bar',
      data:{ labels:recuperacionProducto.map(d=>d.producto), datasets:[
        { label:'Recuperado (%)', data:recuperacionProducto.map(d=>d.recuperado), backgroundColor:C.navy,    stack:'a' },
        { label:'Pendiente (%)',  data:recuperacionProducto.map(d=>d.pendiente),  backgroundColor:C.dn+'44', stack:'a', borderRadius:{ topRight:2, bottomRight:2 } },
      ]},
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:{ ...scaleY(), stacked:true, min:0, max:100 }, y:{ ...scaleYH(), stacked:true } } },
    });
  }

  function renderPrediccion(ct) {
    const kpis = [
      { label:"Operaciones proyectadas (Sep)", value:"5,891",  delta:+21.8, pos:true,  ac:C.gold    },
      { label:"Ingreso proyectado Sep (MM$)",  value:"$13.4M", delta:+20.7, pos:true,  ac:"#1e4d8c" },
      { label:"Mora proyectada (Sep)",          value:"7.3%",   delta:+0.6,  pos:false, ac:C.warn    },
    ];
    const kg = grid('repeat(3,1fr)', '7px');
    kg.style.marginBottom = '14px';
    kpis.forEach(k => {
      const c = card({ padding:'13px 15px', borderLeft:`1.5px solid ${k.ac}` });
      ap(c,
        txt(k.label, { fontFamily:mono, fontSize:'8px', letterSpacing:'.09em', textTransform:'uppercase', color:C.c4, marginBottom:'7px' }),
        txt(k.value, { fontFamily:mono, fontSize:'23px', fontWeight:'500', color:C.cream, marginBottom:'5px' }),
        dlt(k.delta, k.pos)
      );
      kg.appendChild(c);
    });
    ct.appendChild(kg);

    // Historico ComposedChart: Area (ops) + Line (mora) + ReferenceLine 6.5%
    const cHist = card({ marginBottom:'10px' });
    const { wrap:wH, canvas:cvH } = mkCanvas(240);
    ap(cHist,
      slabel('Evolución histórica y proyección — operaciones e índice de mora'),
      src('Modelo ML · Series temporales · Pipeline CRM · NIIF 9 Stage Analysis'),
      alertBox('La mora histórica cruzó el límite del Comité de Riesgos (6.5%) en Abr 2026 y la proyección escala hasta 7.3% en Sep — requiere acción correctiva en política de originación.'),
      ins('Línea roja punteada = Límite máximo de tolerancia fijado por Comité de Riesgos (6.5%)', C.dn),
      wH
    );
    // Manual legend
    const leg = mk('div', { display:'flex', gap:'18px', marginTop:'7px', flexWrap:'wrap' });
    [
      { c:C.blue,  l:'Operaciones (vol.)' },
      { c:C.warn,  l:'Mora % · punteado = proyección', dash:true },
      { c:C.alert, l:'Límite tolerancia Comité 6.5%', dash:true },
    ].forEach(l => {
      const item = mk('div', { display:'flex', alignItems:'center', gap:'5px' });
      const line = mk('div', { width:'18px', height:'1.5px', background: l.dash ? 'transparent' : l.c, borderRadius:'1px' });
      if (l.dash) line.style.backgroundImage = `repeating-linear-gradient(to right, ${l.c} 0, ${l.c} 5px, transparent 5px, transparent 8px)`;
      ap(item, line, txt(l.l, { fontFamily:mono, fontSize:'8px', color:C.c4 }));
      leg.appendChild(item);
    });
    cHist.appendChild(leg);
    ct.appendChild(cHist);

    // Ingreso bar
    const cIng = card();
    const { wrap:wI, canvas:cvI } = mkCanvas(150);
    ap(cIng,
      slabel('Ingreso proyectado mensual (MM USD)'),
      src('Pipeline CRM · Modelo de scoring · Forecast financiero'),
      ins('$13.4M proyectado Sep 2026 · +71.8% vs Ene 2026 · semitransparente = proyección'),
      wI
    );
    ct.appendChild(cIng);

    // Chart: dual-axis area+line with annotation at 6.5%
    mkChart(cvH, {
      type:'line',
      data:{ labels:historico.map(d=>d.mes), datasets:[
        {
          label:'Operaciones',
          data:historico.map(d=>d.ops),
          borderColor:C.blue, borderWidth:1.5,
          backgroundColor(context) {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0.05, C.navy+'b3');
            g.addColorStop(0.95, C.navy+'00');
            return g;
          },
          fill:true, tension:0,
          pointBackgroundColor:C.blue, pointRadius:3, pointBorderWidth:0,
          yAxisID:'y',
        },
        {
          label:'Mora (%)',
          data:historico.map(d=>d.mora),
          borderColor:C.warn, borderWidth:1.5,
          borderDash:[5,3],
          backgroundColor:'transparent', fill:false, tension:0,
          pointBackgroundColor:C.warn, pointRadius:3, pointBorderWidth:0,
          yAxisID:'y2',
        },
      ]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{ display:false },
          tooltip:tooltip(),
          annotation:{
            annotations:{
              moraLimit:{
                type:'line', scaleID:'y2', value:6.5,
                borderColor:C.alert, borderWidth:1.5, borderDash:[6,3],
                label:{ display:true, content:'Límite Comité 6.5%', position:'end', backgroundColor:'transparent', color:C.alert, font:{ family:mono, size:9 }, padding:4 },
              },
            },
          },
        },
        scales:{
          x:scaleX(),
          y:{ ...scaleY(), title:{ display:false } },
          y2:{ position:'right', min:5, max:8, ticks:{ color:C.c4, font:{ family:mono, size:8 } }, grid:{ display:false }, border:{ display:false } },
        },
      },
    });

    mkChart(cvI, {
      type:'bar',
      data:{ labels:historico.map(d=>d.mes), datasets:[{
        label:'Ingreso (MM$)',
        data:historico.map(d=>d.ingreso),
        backgroundColor:historico.map(d=>d.proj?C.gold+'55':C.gold),
        borderRadius:2,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleX(), y:scaleY('M') } },
    });
  }

  function renderMarketing(ct) {
    const mkpis = [
      { label:"CAC promedio global",  value:"$40.6", delta:-4.2, pos:true,  ac:C.up   },
      { label:"LTV promedio cliente",  value:"$398",  delta:+3.1, pos:true,  ac:C.gold },
      { label:"Ratio LTV:CAC global",  value:"9.8x",  delta:+0.7, pos:true,  ac:C.blue },
    ];
    const kg = grid('repeat(3,1fr)', '7px');
    kg.style.marginBottom = '14px';
    mkpis.forEach(k => {
      const c = card({ padding:'13px 15px', borderLeft:`1.5px solid ${k.ac}` });
      ap(c,
        txt(k.label, { fontFamily:mono, fontSize:'8px', letterSpacing:'.09em', textTransform:'uppercase', color:C.c4, marginBottom:'7px' }),
        txt(k.value, { fontFamily:mono, fontSize:'23px', fontWeight:'500', color:C.cream, marginBottom:'5px' }),
        dlt(k.delta, k.pos)
      );
      kg.appendChild(c);
    });
    ct.appendChild(kg);

    const row = grid('1fr 1fr', '10px');
    row.style.marginBottom = '10px';

    const cROI = card();
    const { wrap:wR, canvas:cvR } = mkCanvas(210);
    ap(cROI, slabel('ROI por canal de marketing'), src('Google Ads · Meta · CRM · Attribution model'),
      ins('Referidos: 513% ROI · supera Digital Paid por 174pp con fracción del presupuesto'), wR);

    const cLTV = card();
    ap(cLTV, slabel('Ratio LTV:CAC por canal'), src('CRM · Attribution model · Lifecycle data'),
      ins('Todos los canales superan umbral mínimo 3x · Referidos lidera con 47.9x'));
    marketingData.forEach(d => {
      const ratio = (d.ltv/d.cac).toFixed(1);
      const col   = ratio>30?C.gold:ratio>10?'#1e4d8c':C.warn;
      const item  = mk('div', { marginBottom:'9px' });
      const labels = mk('div', { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3px' });
      const right  = mk('div', { display:'flex', gap:'12px' });
      ap(right, txt('CAC $'+d.cac+' · LTV $'+d.ltv, { fontFamily:mono, fontSize:'8px', color:C.c4 }), txt(ratio+'x', { fontFamily:mono, fontSize:'11px', fontWeight:'500', color:col }));
      ap(labels, txt(d.canal, { fontFamily:sans, fontSize:'11px', color:C.c3 }), right);
      ap(item, labels, progressBar(Math.min((d.ltv/450)*100,100), col));
      cLTV.appendChild(item);
    });

    ap(row, cROI, cLTV);
    ct.appendChild(row);

    // Fuentes grid
    const cF = card();
    ap(cF, slabel('Arquitectura de fuentes de datos — mapa de consumo'));
    const fGrid = mk('div', { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'6px' });
    fuentes.forEach(f => {
      const item = mk('div', { display:'flex', gap:'10px', padding:'9px 12px', background:C.sf2, borderRadius:'2px', borderLeft:`1.5px solid ${f.ac}` });
      const inner = mk('div');
      ap(inner, txt(f.m, { fontFamily:mono, fontSize:'9px', fontWeight:'500', color:C.cream, marginBottom:'2px' }), txt(f.f, { fontFamily:mono, fontSize:'8px', color:C.c4 }));
      item.appendChild(inner);
      fGrid.appendChild(item);
    });
    cF.appendChild(fGrid);
    ct.appendChild(cF);

    mkChart(cvR, {
      type:'bar',
      data:{ labels:marketingData.map(d=>d.canal), datasets:[{
        label:'ROI (%)', data:marketingData.map(d=>d.roi),
        backgroundColor:marketingData.map(d=>d.roi>400?C.gold:d.roi>200?'#1e4d8c':C.sf2),
        borderRadius:2,
      }]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:tooltip() },
        scales:{ x:scaleX(18), y:scaleY('%') } },
    });
  }

  function renderTesoreria(ct) {
    const tkpis = [
      { label:"Capital total disponible",  value:"$14.8M",  delta:-12.1, pos:false, ac:C.warn,  note:"vs $16.8M Ene 2026"    },
      { label:"Utilización de líneas",      value:"67.4%",   delta:+8.3,  pos:false, ac:C.dn,    note:"Cupo total: $22M"      },
      { label:"Costo promedio de fondeo",   value:"7.9%",    delta:+0.4,  pos:false, ac:C.gold,  note:"Ponderado Warehouse"   },
      { label:"Runway de liquidez",         value:"4.2 mes", delta:-1.1,  pos:false, ac:C.alert, note:"A tasa de burn actual" },
    ];
    const kg = grid('repeat(auto-fit,minmax(170px,1fr))', '7px');
    kg.style.marginBottom = '16px';
    tkpis.forEach(k => kg.appendChild(kpiCardWithNote(k)));
    ct.appendChild(kg);

    const cols = grid('1fr 1.4fr', '12px');

    // Warehouse Lines
    const cWH = card();
    ap(cWH,
      slabel('Estructura de fondeo institucional — Warehouse Lines'),
      src('Treasury Management System · ALM · Cap Table'),
      ins('Cupo total comprometido: $22M · Disponible agregado: $6.6M · Costo ponderado: 7.9% TNA')
    );
    warehouseLines.forEach(w => {
      const block = mk('div', { marginBottom:'16px', padding:'12px 14px', background:C.sf2, borderRadius:'3px', borderTop:`1.5px solid ${w.col}` });
      const head  = mk('div', { display:'flex', justifyContent:'space-between', marginBottom:'2px' });
      ap(head, txt(w.nombre, { fontFamily:sans, fontSize:'12px', fontWeight:'500', color:C.cream }), txt('Vto. '+w.vencimiento, { fontFamily:mono, fontSize:'8px', color:C.c4 }));
      block.appendChild(head);
      block.appendChild(txt('Tasa: '+w.tasa+' TNA', { fontFamily:mono, fontSize:'9px', color:w.col, marginBottom:'6px' }));
      const pct   = Math.min((w.dispuesto/w.cupo)*100, 100);
      const libre = w.cupo - w.dispuesto;
      const barHead = mk('div', { display:'flex', justifyContent:'space-between', marginBottom:'3px' });
      ap(barHead, txt(`Dispuesto $${w.dispuesto.toFixed(1)}M / Cupo $${w.cupo.toFixed(1)}M`, { fontFamily:mono, fontSize:'9px', color:C.c4 }), txt(pct.toFixed(0)+'% utilizado', { fontFamily:mono, fontSize:'9px', color:w.col }));
      block.appendChild(barHead);
      block.appendChild(progressBar(pct, w.col, 5));
      block.appendChild(txt(`Disponible: $${libre.toFixed(1)}M`, { fontFamily:mono, fontSize:'8.5px', color:C.c4, marginTop:'3px' }));
      cWH.appendChild(block);
    });
    const summary = mk('div', { padding:'10px 12px', background:C.bg, borderRadius:'2px', border:`1px solid ${C.bd}`, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' });
    summary.classList.add('ncrd-summary-grid');
    [{ l:'Cupo total', v:'$22.0M' }, { l:'Dispuesto', v:'$15.4M' }, { l:'Disponible', v:'$6.6M' }].forEach(s => {
      const item = mk('div');
      ap(item, txt(s.l, { fontFamily:mono, fontSize:'8px', color:C.c4, marginBottom:'2px' }), txt(s.v, { fontFamily:mono, fontSize:'13px', fontWeight:'500', color:C.cream }));
      summary.appendChild(item);
    });
    cWH.appendChild(summary);
    cols.appendChild(cWH);

    // Capital vs Demanda: bar (demanda) + line (capital) + vertical annotation at "Ago"
    const cCD = card();
    const { wrap:wCD, canvas:cvCD } = mkCanvas(260);
    ap(cCD,
      slabel('Disponibilidad de capital vs demanda de colocación (MM USD)'),
      src('Pipeline CRM · ALM · Treasury forecast · Modelo de crecimiento'),
      alertBox('Cruce proyectado en Ago 2026: la demanda de crédito ($11.4M) supera el capital disponible ($10.2M). Se requiere activar nueva ronda de fondeo o ajustar el ritmo de colocación antes del Q3.'),
      ins('Barra = Demanda comercial · Línea dorada = Capital disponible · Zonas semitransparentes = proyección'),
      wCD
    );
    const leg = mk('div', { display:'flex', gap:'16px', marginTop:'8px', flexWrap:'wrap' });
    [{ c:'#1e4d8c', l:'Demanda de crédito' }, { c:C.gold, l:'Capital disponible' }, { c:C.alert, l:'Zona de alerta liquidez' }].forEach(l => {
      const item = mk('div', { display:'flex', alignItems:'center', gap:'5px' });
      ap(item, mk('div', { width:'10px', height:'10px', borderRadius:'2px', background:l.c }), txt(l.l, { fontFamily:mono, fontSize:'8px', color:C.c4 }));
      leg.appendChild(item);
    });
    cCD.appendChild(leg);
    cols.appendChild(cCD);
    ct.appendChild(cols);

    mkChart(cvCD, {
      type:'bar',
      data:{ labels:capitalDemanda.map(d=>d.mes), datasets:[
        {
          type:'bar',
          label:'Demanda de crédito (MM$)',
          data:capitalDemanda.map(d=>d.demanda),
          backgroundColor:capitalDemanda.map(d=>d.alerta?C.alert+'99':d.proj?'#1e4d8c66':'#1e4d8c'),
          borderRadius:2, yAxisID:'y',
        },
        {
          type:'line',
          label:'Capital disponible (MM$)',
          data:capitalDemanda.map(d=>d.capital),
          borderColor:C.gold, borderWidth:2, tension:0,
          pointBackgroundColor:capitalDemanda.map(d=>d.alerta?C.alert:C.gold),
          pointRadius:capitalDemanda.map(d=>d.alerta?5:3),
          pointBorderWidth:0,
          yAxisID:'y',
        },
      ]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{ display:false },
          tooltip:tooltip(),
          annotation:{
            annotations:{
              cruceLinea:{
                type:'line', scaleID:'x', value:'Ago',
                borderColor:C.alert, borderWidth:1, borderDash:[4,3],
                label:{ display:true, content:'Cruce liquidez', position:'start', backgroundColor:'transparent', color:C.alert, font:{ size:8, family:mono }, padding:4 },
              },
            },
          },
        },
        scales:{ x:scaleX(), y:scaleY('M') },
      },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TAB — ARQUITECTURA DE DATOS
  // ══════════════════════════════════════════════════════════════
  function renderArquitecturaDatos(ct) {

    // ── Local helper: section title ────────────────────────────
    function secTitle(num, title) {
      const wrap = mk('div', { marginBottom:'16px', paddingBottom:'10px', borderBottom:`1px solid ${C.bd}` });
      ap(wrap,
        txt(num, { fontFamily:mono, fontSize:'8px', color:C.c4, letterSpacing:'.15em', textTransform:'uppercase', marginBottom:'3px' }),
        txt(title, { fontFamily:sans, fontSize:'14px', color:C.cream, letterSpacing:'.01em' })
      );
      return wrap;
    }

    // ── SECCIÓN 1 — Diagnóstico (Anti-patrones) ────────────────
    ct.appendChild(secTitle('01 · Diagnóstico', 'Arquitectura Inicial — Hallazgos Críticos'));

    const antipatrones = [
      {
        letra:'A', subtag:'Granularidad',
        titulo:'Contaminación Analítica en Capas Transaccionales',
        problema:'Queries analíticas OLAP ejecutadas sobre tablas OLTP de originación y cobranza, compartiendo conexiones y bloqueos con la capa operacional.',
        impacto:'Degradación de latencia >40% en hora pico. Lock contention en tablas core. Riesgo de indisponibilidad operacional.',
      },
      {
        letra:'B', subtag:'Silos',
        titulo:'Inexistencia de un Modelo Dimensional Conformado',
        problema:'Ausencia de DWH con dimensiones conformadas. Cada área construye sus propias vistas sobre tablas fuente, generando métricas incompatibles.',
        impacto:'Mora reportada difiere entre Cobranza y Riesgo (+2.3pp). Imposibilidad de drill-down cross-funcional. Comité recibe reportes contradictorios.',
      },
      {
        letra:'C', subtag:'Historización',
        titulo:'Ausencia de Soporte para Variaciones Temporales',
        problema:'Las tablas dimensionales no implementan SCD (Slowly Changing Dimensions). Los cambios sobreescriben el estado anterior sin registro histórico.',
        impacto:'Imposibilidad de auditoría temporal. Backtesting de modelos ML inválido. Incumplimiento de trazabilidad de staging NIIF 9.',
      },
      {
        letra:'D', subtag:'Brecha Regulatoria',
        titulo:'Subdesarrollo de Métricas de Riesgo Crediticio y Fondeo',
        problema:'El modelo transaccional carece de tablas dedicadas para ECL, snapshots de cartera o utilización de líneas de fondeo institucional.',
        impacto:'Cálculo manual de PCR, NIM y LGD en Excel. Demora de 3–5 días hábiles en cierre mensual. Exposición regulatoria ante supervisión NIIF 9.',
      },
    ];

    const apGrid = grid('1fr 1fr', '12px');
    apGrid.style.marginBottom = '28px';
    antipatrones.forEach(d => {
      const c = card({ padding:'14px 16px' });
      c.style.background = C.sf2;
      const badge = mk('span', {
        display:'inline-flex', alignItems:'center',
        background:'#3a0f0f', border:'1px solid #7a2020',
        borderRadius:'2px', padding:'2px 8px', marginBottom:'10px',
        fontFamily:mono, fontSize:'7px', letterSpacing:'.1em',
        textTransform:'uppercase', color:'#e07070',
      });
      badge.textContent = '⚠ Anti-patrón · ' + d.letra;
      ap(c,
        badge,
        txt(d.subtag,  { fontFamily:mono, fontSize:'7px',    color:C.c3,    letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'4px' }),
        txt(d.titulo,  { fontFamily:mono, fontSize:'10px',   color:C.cream, lineHeight:'1.4',  marginBottom:'10px' }),
        txt('Problema',{ fontFamily:mono, fontSize:'7px',    color:C.c4,    letterSpacing:'.1em',  textTransform:'uppercase', marginBottom:'4px' }),
        txt(d.problema,{ fontFamily:sans, fontSize:'11.5px', color:C.c2,    lineHeight:'1.55', marginBottom:'10px' })
      );
      const impactBox = mk('div', {
        background:'#1a0f0f', borderLeft:`2px solid ${C.alert}`,
        padding:'8px 10px', borderRadius:'0 2px 2px 0',
      });
      ap(impactBox,
        txt('Impacto', { fontFamily:mono, fontSize:'7px', color:C.alert, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'4px' }),
        txt(d.impacto, { fontFamily:sans, fontSize:'11px', color:'#d4a0a0', lineHeight:'1.5' })
      );
      c.appendChild(impactBox);
      apGrid.appendChild(c);
    });
    ct.appendChild(apGrid);

    // ── SECCIÓN 2 — Diccionario de Datos ──────────────────────
    ct.appendChild(secTitle('02 · Modelo Corregido', 'Diccionario de Datos — Gold Layer'));

    const AREAS = [
      {
        key:'dimensiones', label:'Dimensiones Core',
        tables:[
          {
            name:'dim_cliente_golden', desc:'Registro Golden — SCD Tipo 2',
            fields:[
              { n:'cliente_id_golden',          t:'VARCHAR(36)',  pk:1,fk:0,m:0, d:'ID unificado del cliente vía Identity Resolution' },
              { n:'fecha_alta_golden',           t:'DATE',         pk:0,fk:0,m:0, d:'Fecha de incorporación al Golden Record' },
              { n:'segmento_riesgo',             t:'ENUM',         pk:0,fk:0,m:0, d:'[BAJO / MEDIO / ALTO / MUY_ALTO]' },
              { n:'score_credito_interno',       t:'DECIMAL(5,2)', pk:0,fk:0,m:1, d:'Score propietario 0–100, recalculado mensual' },
              { n:'canal_adquisicion_principal', t:'VARCHAR',      pk:0,fk:1,m:0, d:'→ dim_canal_adquisicion' },
              { n:'scd_version',                 t:'INTEGER',      pk:0,fk:0,m:0, d:'Versión SCD Tipo 2 del registro' },
              { n:'scd_fecha_inicio',            t:'DATE',         pk:0,fk:0,m:0, d:'Inicio de vigencia del estado' },
              { n:'scd_fecha_fin',               t:'DATE',         pk:0,fk:0,m:0, d:'Fin de vigencia (NULL = activo)' },
              { n:'scd_es_actual',               t:'BOOLEAN',      pk:0,fk:0,m:0, d:'Flag de registro vigente' },
            ],
          },
          {
            name:'dim_producto_credito', desc:'Catálogo de productos crediticios',
            fields:[
              { n:'producto_id',            t:'INTEGER',      pk:1,fk:0,m:0, d:'Identificador único del producto' },
              { n:'nombre_producto',        t:'VARCHAR(100)', pk:0,fk:0,m:0, d:'Nombre comercial del producto' },
              { n:'tipo_credito',           t:'ENUM',         pk:0,fk:0,m:0, d:'[PERSONAL / NÓMINA / EMPRESARIAL / MICRO]' },
              { n:'plazo_maximo_meses',     t:'INTEGER',      pk:0,fk:0,m:0, d:'Plazo máximo de originación (meses)' },
              { n:'tasa_interes_base_ea',   t:'DECIMAL(6,4)', pk:0,fk:0,m:1, d:'Tasa efectiva anual base del producto' },
              { n:'tasa_mora_penalizacion', t:'DECIMAL(6,4)', pk:0,fk:0,m:1, d:'Tasa de penalización por mora' },
              { n:'politica_garantia',      t:'VARCHAR',      pk:0,fk:0,m:0, d:'Descripción política de garantías' },
              { n:'requiere_colateral',     t:'BOOLEAN',      pk:0,fk:0,m:0, d:'Indicador de colateral obligatorio' },
            ],
          },
        ],
      },
      {
        key:'operaciones', label:'Operaciones',
        tables:[
          {
            name:'fct_originacion_ventas', desc:'Fact de originaciones — grain: operación',
            fields:[
              { n:'originacion_id',     t:'BIGINT',        pk:1,fk:0,m:0, d:'Surrogate key de la transacción' },
              { n:'cliente_id_golden',  t:'VARCHAR(36)',   pk:0,fk:1,m:0, d:'→ dim_cliente_golden' },
              { n:'producto_id',        t:'INTEGER',       pk:0,fk:1,m:0, d:'→ dim_producto_credito' },
              { n:'fecha_desembolso',   t:'DATE',          pk:0,fk:0,m:0, d:'Fecha efectiva de desembolso' },
              { n:'monto_desembolsado', t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Monto bruto desembolsado en USD' },
              { n:'tasa_interes_ea',    t:'DECIMAL(6,4)',  pk:0,fk:0,m:1, d:'Tasa pactada efectiva anual' },
              { n:'canal_venta',        t:'VARCHAR',       pk:0,fk:1,m:0, d:'→ dim_canal_adquisicion' },
              { n:'cac_asignado',       t:'DECIMAL(10,2)', pk:0,fk:0,m:1, d:'Costo de adquisición asignado al cliente' },
              { n:'score_aprobacion',   t:'DECIMAL(5,2)',  pk:0,fk:0,m:1, d:'Score en el momento de aprobación' },
              { n:'estado_operacion',   t:'ENUM',          pk:0,fk:0,m:0, d:'[VIGENTE / CANCELADO / CASTIGADO / REESTRUCTURADO]' },
            ],
          },
        ],
      },
      {
        key:'riesgo', label:'Riesgo & Fondeo',
        tables:[
          {
            name:'fct_cartera_snapshot_diario', desc:'Snapshot diario de cartera — grain: operación × día',
            fields:[
              { n:'snapshot_id',   t:'BIGINT',        pk:1,fk:0,m:0, d:'Surrogate key del snapshot' },
              { n:'fecha_snapshot',t:'DATE',          pk:0,fk:0,m:0, d:'Fecha de corte del snapshot' },
              { n:'originacion_id',t:'BIGINT',        pk:0,fk:1,m:0, d:'→ fct_originacion_ventas' },
              { n:'saldo_capital', t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Saldo de capital vigente' },
              { n:'dias_mora',     t:'INTEGER',       pk:0,fk:0,m:1, d:'Días de atraso a fecha de corte' },
              { n:'bucket_mora',   t:'ENUM',          pk:0,fk:0,m:0, d:'[AL_DÍA / 1-30 / 31-60 / 61-90 / 90+]' },
              { n:'stage_niif9',   t:'INTEGER',       pk:0,fk:0,m:1, d:'Stage NIIF 9 [1 / 2 / 3]' },
              { n:'pcr_cobertura', t:'DECIMAL(6,4)',  pk:0,fk:0,m:1, d:'Porcentaje Provisión / Saldo capital' },
            ],
          },
          {
            name:'fct_provisiones_niif9', desc:'Pérdida esperada — grain: operación × mes',
            fields:[
              { n:'provision_id',  t:'BIGINT',        pk:1,fk:0,m:0, d:'Surrogate key de la provisión' },
              { n:'originacion_id',t:'BIGINT',        pk:0,fk:1,m:0, d:'→ fct_originacion_ventas' },
              { n:'fecha_calculo', t:'DATE',          pk:0,fk:0,m:0, d:'Fecha de cálculo de la provisión' },
              { n:'pd_estimada',   t:'DECIMAL(8,6)',  pk:0,fk:0,m:1, d:'Probability of Default (modelo ML)' },
              { n:'lgd_estimada',  t:'DECIMAL(6,4)',  pk:0,fk:0,m:1, d:'Loss Given Default (histórico por segmento)' },
              { n:'ead_saldo',     t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Exposure at Default = saldo capital' },
              { n:'ecl_calculado', t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'ECL = PD × LGD × EAD' },
              { n:'stage_asignado',t:'INTEGER',       pk:0,fk:0,m:0, d:'Stage NIIF 9 resultante [1 / 2 / 3]' },
            ],
          },
          {
            name:'fct_lineas_fondeo_utilizacion', desc:'Utilización de líneas institucionales — grain: línea × día',
            fields:[
              { n:'fondeo_id',                t:'BIGINT',        pk:1,fk:0,m:0, d:'Surrogate key del registro' },
              { n:'linea_id',                 t:'INTEGER',       pk:0,fk:1,m:0, d:'→ dim_linea_fondeo_institucional' },
              { n:'fecha_registro',           t:'DATE',          pk:0,fk:0,m:0, d:'Fecha del registro de utilización' },
              { n:'monto_linea_total',        t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Cupo total de la línea (USD)' },
              { n:'monto_utilizado',          t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Monto dispuesto a fecha' },
              { n:'costo_fondeo_tasa_pct',    t:'DECIMAL(6,4)',  pk:0,fk:0,m:1, d:'Tasa de costo del fondeo (EA)' },
              { n:'ingreso_interes_generado', t:'DECIMAL(15,2)', pk:0,fk:0,m:1, d:'Ingreso financiero generado' },
              { n:'nim_linea',                t:'DECIMAL(8,6)',  pk:0,fk:0,m:1, d:'NIM = ingreso − (utilizado × costo_fondeo)' },
            ],
          },
        ],
      },
    ];

    const dictWrap = mk('div', { marginBottom:'28px' });

    // Sub-tab nav
    const subNav = mk('div', { display:'flex', gap:'2px', borderBottom:`1px solid ${C.bd}`, marginBottom:'12px' });
    const subBtns = {}, areaConts = {};
    let activeArea = AREAS[0].key;
    AREAS.forEach((area, idx) => {
      const btn = mk('button', {
        background:'none', border:'none', cursor:'pointer',
        fontFamily:mono, fontSize:'8px', letterSpacing:'.1em', textTransform:'uppercase',
        color: idx===0 ? C.gold : C.c4, padding:'8px 14px',
        borderBottom:`1px solid ${idx===0 ? C.gold : 'transparent'}`,
        transition:'color .15s', whiteSpace:'nowrap',
      });
      btn.textContent = area.label;
      subBtns[area.key] = btn;
      subNav.appendChild(btn);
    });
    dictWrap.appendChild(subNav);

    // Search input
    const searchWrap = mk('div', {
      display:'flex', alignItems:'center',
      background:C.sf2, border:`1px solid ${C.bd}`,
      borderRadius:'3px', padding:'6px 10px', marginBottom:'12px',
    });
    const inp = document.createElement('input');
    Object.assign(inp.style, {
      background:'none', border:'none', outline:'none',
      fontFamily:mono, fontSize:'10.5px', color:C.c2, width:'100%',
    });
    inp.placeholder = '🔍  Buscar campo o descripción...';
    inp.setAttribute('autocomplete', 'off');
    const phStyle = document.createElement('style');
    phStyle.textContent = '.ncrd-arch-search::placeholder{color:' + C.c4 + '}';
    inp.classList.add('ncrd-arch-search');
    searchWrap.appendChild(inp);
    dictWrap.appendChild(phStyle);
    dictWrap.appendChild(searchWrap);

    // th helper
    function thCell(h) {
      const th = document.createElement('th');
      th.textContent = h;
      Object.assign(th.style, {
        textAlign:'left', padding:'5px 8px', fontSize:'7.5px',
        letterSpacing:'.08em', textTransform:'uppercase',
        color:C.c4, borderBottom:`1px solid ${C.bd}`,
        fontWeight:'500', background:C.sf, whiteSpace:'nowrap',
      });
      return th;
    }

    // Build area containers
    AREAS.forEach((area, ai) => {
      const aWrap = mk('div');
      areaConts[area.key] = aWrap;

      area.tables.forEach(tbl => {
        const tblHead = mk('div', { display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'6px', marginTop: ai===0 ? '2px' : '16px' });
        ap(tblHead,
          txt(tbl.name, { fontFamily:mono, fontSize:'11px', color:C.gold }),
          txt(tbl.desc, { fontFamily:mono, fontSize:'8px',  color:C.c4  })
        );
        aWrap.appendChild(tblHead);

        const tblEl = document.createElement('table');
        Object.assign(tblEl.style, { width:'100%', borderCollapse:'collapse', fontFamily:mono, fontSize:'10.5px', marginBottom:'8px' });

        const thead = document.createElement('thead');
        const hRow  = document.createElement('tr');
        ['Campo','Tipo','Clave','Descripción'].forEach(h => hRow.appendChild(thCell(h)));
        thead.appendChild(hRow);
        tblEl.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbl.fields.forEach((f, ri) => {
          const tr = document.createElement('tr');
          tr.dataset.f = f.n.toLowerCase() + ' ' + f.d.toLowerCase();
          tr.style.background = ri%2===0 ? 'transparent' : C.sf+'80';

          const nameColor = f.pk ? '#7b9fff' : f.fk ? '#a78bfa' : f.m ? '#4ade80' : C.c2;
          const tdN = document.createElement('td');
          tdN.textContent = f.n;
          Object.assign(tdN.style, { padding:'5px 8px', color:nameColor, fontWeight:f.pk?'500':'400', borderBottom:`1px solid ${C.bd}22`, whiteSpace:'nowrap' });

          const tdT = document.createElement('td');
          tdT.textContent = f.t;
          Object.assign(tdT.style, { padding:'5px 8px', color:C.c4, fontSize:'9px', borderBottom:`1px solid ${C.bd}22`, whiteSpace:'nowrap' });

          const tdK = document.createElement('td');
          if (f.pk || f.fk || f.m) {
            const bg = f.pk ? '#7b9fff22' : f.fk ? '#a78bfa22' : '#4ade8022';
            const cl = f.pk ? '#7b9fff'   : f.fk ? '#a78bfa'   : '#4ade80';
            const br = f.pk ? '#7b9fff44' : f.fk ? '#a78bfa44' : '#4ade8044';
            const bdg = mk('span', { display:'inline-flex', alignItems:'center', padding:'1px 5px', borderRadius:'2px', fontSize:'7px', fontFamily:mono, letterSpacing:'.06em', background:bg, color:cl, border:`1px solid ${br}` });
            bdg.textContent = f.pk ? '🔑 PK' : f.fk ? '🔗 FK' : '📊 MTR';
            tdK.appendChild(bdg);
          }
          Object.assign(tdK.style, { padding:'5px 8px', borderBottom:`1px solid ${C.bd}22`, whiteSpace:'nowrap' });

          const tdD = document.createElement('td');
          tdD.textContent = f.d;
          Object.assign(tdD.style, { padding:'5px 8px', color:C.c3, fontSize:'10px', lineHeight:'1.4', borderBottom:`1px solid ${C.bd}22` });

          ap(tr, tdN, tdT, tdK, tdD);
          tbody.appendChild(tr);
        });
        tblEl.appendChild(tbody);
        aWrap.appendChild(tblEl);
      });

      // Fórmulas callout — solo en Riesgo & Fondeo
      if (area.key === 'riesgo') {
        const fWrap = mk('div', { marginTop:'18px', display:'flex', flexDirection:'column', gap:'10px' });
        [
          { label:'ECL — Expected Credit Loss (NIIF 9)', formula:'ECL  =  PD  ×  LGD  ×  EAD', note:'PD: Probability of Default · LGD: Loss Given Default · EAD: Exposure at Default (= saldo capital)' },
          { label:'NIM — Margen de Interés Neto por Línea', formula:'NIM_Línea  =  ingreso_interes_generado  −  ( monto_utilizado  ×  costo_fondeo_tasa_pct )', note:'Calculado por línea de fondeo; agrupado al portafolio para NIM consolidado del período' },
        ].forEach(fx => {
          const box = mk('div', { background:C.sf2, border:`1px solid ${C.bd}`, borderLeft:`3px solid ${C.gold}`, padding:'12px 16px', borderRadius:'0 3px 3px 0' });
          ap(box,
            txt(fx.label,   { fontFamily:mono, fontSize:'7.5px', color:C.gold,  letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'8px' }),
            txt(fx.formula, { fontFamily:mono, fontSize:'13px',  color:C.cream, letterSpacing:'.04em', marginBottom:'6px' }),
            txt(fx.note,    { fontFamily:mono, fontSize:'8px',   color:C.c4 })
          );
          fWrap.appendChild(box);
        });
        aWrap.appendChild(fWrap);
      }

      if (ai > 0) aWrap.style.display = 'none';
      dictWrap.appendChild(aWrap);
    });

    // Sub-tab switching
    function switchArea(key) {
      activeArea = key;
      AREAS.forEach(a => {
        const on = a.key === key;
        subBtns[a.key].style.color = on ? C.gold : C.c4;
        subBtns[a.key].style.borderBottom = `1px solid ${on ? C.gold : 'transparent'}`;
        areaConts[a.key].style.display = on ? 'block' : 'none';
      });
      inp.value = '';
      filterRows('');
    }
    AREAS.forEach(a => subBtns[a.key].addEventListener('click', () => switchArea(a.key)));

    // Live search
    function filterRows(q) {
      const ql = q.toLowerCase().trim();
      areaConts[activeArea].querySelectorAll('tbody tr').forEach(tr => {
        tr.style.display = !ql || tr.dataset.f.includes(ql) ? '' : 'none';
      });
    }
    inp.addEventListener('input', e => filterRows(e.target.value));

    ct.appendChild(dictWrap);

    // ── SECCIÓN 3 — Data Lineage ───────────────────────────────
    ct.appendChild(secTitle('03 · Conectividad', 'Matriz de Data Lineage'));

    const lineage = [
      { e:'dim_cliente_golden',            o:'CRM + KYC API',             i:'ELT batch (noche)',      c:'Scoring, Segmentación, Cobranza' },
      { e:'dim_producto_credito',          o:'Motor originación',          i:'ELT batch (semanal)',    c:'Análisis de conversión, Pricing' },
      { e:'fct_originacion_ventas',        o:'Motor originación + CRM',    i:'CDC streaming',          c:'Dashboard Adquisición, CAC, ROI' },
      { e:'fct_cartera_snapshot_diario',   o:'Core crediticio + Cobranza', i:'Snapshot diario (D+1)',  c:'Mora, PCR, Provisiones, NIIF 9' },
      { e:'fct_provisiones_niif9',         o:'Modelo ML + Reglas NIIF 9',  i:'Batch mensual (cierre)', c:'Comité de riesgo, Auditoría' },
      { e:'fct_lineas_fondeo_utilizacion', o:'ALM + Tesorería',            i:'CDC streaming',          c:'Liquidez, Capital disponible, NIM' },
    ];

    const ltbl = document.createElement('table');
    Object.assign(ltbl.style, { width:'100%', borderCollapse:'collapse', fontFamily:mono, fontSize:'10.5px', marginBottom:'20px' });
    const lthead = document.createElement('thead');
    const lthr  = document.createElement('tr');
    ['Entidad Analítica','Sistema Origen','Mecanismo de Ingesta','Consumo Estratégico'].forEach(h => lthr.appendChild(thCell(h)));
    lthead.appendChild(lthr);
    ltbl.appendChild(lthead);

    const ltbody = document.createElement('tbody');
    lineage.forEach((row, ri) => {
      const tr = document.createElement('tr');
      tr.style.background = ri%2===0 ? 'transparent' : C.sf+'80';
      const isDim = row.e.startsWith('dim_');
      [row.e, row.o, row.i, row.c].forEach((val, ci) => {
        const td = document.createElement('td');
        td.textContent = val;
        Object.assign(td.style, {
          padding:'6px 10px', borderBottom:`1px solid ${C.bd}22`,
          color: ci===0 ? (isDim?'#a78bfa':'#7b9fff') : ci===1 ? C.c3 : ci===2 ? C.gold+'cc' : C.c2,
          fontSize: ci===2 ? '9.5px' : '10.5px',
          fontWeight: ci===0 ? '500' : '400',
          whiteSpace: ci===0 ? 'nowrap' : 'normal',
        });
        tr.appendChild(td);
      });
      ltbody.appendChild(tr);
    });
    ltbl.appendChild(ltbody);
    ct.appendChild(ltbl);
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN INIT — window.initNexusCreditDashboard(containerEl, opts)
  // ══════════════════════════════════════════════════════════════
  return async function initNexusCreditDashboard(containerEl, options = {}) {
    const {
      isModal = false,
      onClose = null,
    } = options;

    await loadChartJS();

    containerEl.innerHTML = '';
    Object.assign(containerEl.style, {
      fontFamily:sans, background:C.bg, color:C.cream,
      ...(isModal ? { position:'fixed', inset:'0', zIndex:'9999', overflowY:'auto' } : { minHeight:'100vh', paddingBottom:'40px' }),
    });

    // ── HEADER ─────────────────────────────────────────────────
    const header = mk('div', {
      background:C.sf, borderBottom:`1px solid ${C.bd}`,
      padding:'13px 22px', display:'flex', alignItems:'center',
      justifyContent:'space-between', flexWrap:'wrap', gap:'10px',
      position:isModal?'sticky':'relative', top:'0', zIndex:'10',
    });
    const logo = mk('div', {
      width:'34px', height:'34px', borderRadius:'3px',
      background:C.navy, border:`1px solid ${C.gold}55`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:serif, fontSize:'15px', color:C.gold, flexShrink:'0',
    });
    logo.textContent = 'N';

    const titleWrap = mk('div');
    const titleLine = mk('div', { fontFamily:serif, fontSize:'15px', fontWeight:'400', color:C.cream, letterSpacing:'-.01em' });
    titleLine.innerHTML = 'NexusCredit <span style="color:'+C.c4+';font-size:13px">· Panel Gerencial C-Suite</span>';
    ap(titleWrap, titleLine, txt('Período Ene–Jun 2026 · Cartera >$10M USD · NIIF 9 · Datos simulados', { fontFamily:mono, fontSize:'8.5px', color:C.c4, letterSpacing:'.1em', textTransform:'uppercase', marginTop:'1px' }));

    const identity = mk('div', { display:'flex', alignItems:'center', gap:'14px' });
    ap(identity, logo, titleWrap);

    const actions = mk('div', { display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' });
    const badges  = mk('div', { display:'flex', gap:'4px', flexWrap:'wrap' });
    ['NIIF 9','ALM','Tesorería','Cobranza','CRM','BI'].forEach(s => {
      badges.appendChild(txt(s, { fontFamily:mono, fontSize:'8px', letterSpacing:'.07em', textTransform:'uppercase', color:C.c4, padding:'2px 6px', border:`1px solid ${C.bd}`, borderRadius:'2px' }));
    });
    ap(actions, badges);
    if (isModal && onClose) {
      const closeBtn = mk('button', { background:'none', border:`1px solid ${C.bd}`, borderRadius:'2px', color:C.c4, cursor:'pointer', fontFamily:mono, fontSize:'11px', padding:'4px 10px' });
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', onClose);
      actions.appendChild(closeBtn);
    }
    ap(header, identity, actions);
    containerEl.appendChild(header);

    // ── TABS ───────────────────────────────────────────────────
    const tabs = ['overview','adquisicion','cobranza','prediccion','marketing','tesoreria','arquitectura_datos'];
    const tl   = { overview:'Resumen ejecutivo', adquisicion:'Adquisición', cobranza:'Cobranza', prediccion:'Predicción', marketing:'Marketing', tesoreria:'Tesorería & Capital', arquitectura_datos:'Arquitectura de Datos' };
    const renderers = { overview:renderOverview, adquisicion:renderAdquisicion, cobranza:renderCobranza, prediccion:renderPrediccion, marketing:renderMarketing, tesoreria:renderTesoreria, arquitectura_datos:renderArquitecturaDatos };
    let activeTab = 'overview';

    const tabBar = mk('div', { display:'flex', borderBottom:`1px solid ${C.bd}`, padding:'0 22px', background:C.sf, overflowX:'auto' });
    const tabBtns = {};
    tabs.forEach(t => {
      const btn = mk('button', {
        background:'none', border:'none', cursor:'pointer',
        color:t==='overview'?C.gold:C.c4,
        padding:'10px 16px', fontSize:'9px', fontFamily:mono,
        letterSpacing:'.1em', textTransform:'uppercase',
        borderBottom:`1px solid ${t==='overview'?C.gold:'transparent'}`,
        transition:'color .15s', whiteSpace:'nowrap',
      });
      btn.textContent = tl[t];
      tabBtns[t] = btn;
      tabBar.appendChild(btn);
    });
    ap(tabBar,
      mk('div', { flex:'1' }),
      txt('Jun 2026 · v2.0', { fontFamily:mono, fontSize:'8px', color:C.c4, letterSpacing:'.08em', alignSelf:'center', paddingRight:'4px' })
    );
    containerEl.appendChild(tabBar);

    // ── CONTENT ────────────────────────────────────────────────
    const content = mk('div', { padding:'18px 22px' });
    content.classList.add('ncrd-content');
    containerEl.appendChild(content);

    function switchTab(t) {
      tabs.forEach(x => { tabBtns[x].style.color = x===t?C.gold:C.c4; tabBtns[x].style.borderBottom=`1px solid ${x===t?C.gold:'transparent'}`; });
      destroyCharts();
      content.innerHTML = '';
      activeTab = t;
      renderers[t](content);
    }

    tabs.forEach(t => tabBtns[t].addEventListener('click', () => switchTab(t)));
    switchTab('overview');
  };

})();
