import { useEffect, useMemo, useState } from "react";

type ApiHealth = { status: string; message: string };
type Section = "Overview" | "Workforce" | "AI Ecosystem" | "ROI & Investments" | "Workflow Analytics" | "Settings";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const navigation: { name: Section; icon: string }[] = [
  { name: "Overview", icon: "overview" },
  { name: "Workforce", icon: "users" },
  { name: "AI Ecosystem", icon: "ecosystem" },
  { name: "ROI & Investments", icon: "roi" },
  { name: "Workflow Analytics", icon: "workflow" },
  { name: "Settings", icon: "settings" },
];

const tools = [
  { name: "ChatGPT Enterprise", description: "Core generative agent", vendor: "OpenAI", seats: "507 / 650", spend: "₹6.2L", use: 78, health: "Healthy" },
  { name: "Microsoft 365 Copilot", description: "Office suite integration", vendor: "Microsoft", seats: "256 / 400", spend: "₹3.8L", use: 64, health: "Healthy" },
  { name: "Cursor Business", description: "Dev IDE multiplier", vendor: "Anysphere", seats: "165 / 180", spend: "₹2.4L", use: 92, health: "Healthy" },
  { name: "Claude Team", description: "Analytical research", vendor: "Anthropic", seats: "78 / 110", spend: "₹2.1L", use: 71, health: "Healthy" },
  { name: "Gemini Advanced", description: "Workspace add-on", vendor: "Google", seats: "43 / 80", spend: "₹1.9L", use: 54, health: "Review" },
];

const departments = [
  { name: "Engineering", seats: "480 seats", percent: 84 },
  { name: "Marketing", seats: "210 seats", percent: 76 },
  { name: "Finance", seats: "135 seats", percent: 62 },
  { name: "Operations", seats: "320 seats", percent: 58 },
  { name: "Human Resources", seats: "90 seats", percent: 49 },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="11" width="7" height="10" rx="1" /><rect x="3" y="14" width="8" height="7" rx="1" /></>,
    ecosystem: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
    roi: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M7 5V3h10v2M7 12h10M7 16h6" /></>,
    workflow: <><path d="M4 6h5l3 6h5l3 6" /><circle cx="4" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="20" cy="18" r="2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a7.7 7.7 0 0 0 0-6l1.2-.9-1.2-2.1-1.4.5a7.7 7.7 0 0 0-5.2-2.2L12.5 3h-2l-.3 1.4A7.7 7.7 0 0 0 5 6.6l-1.4-.5-1.2 2.1 1.2.9a7.7 7.7 0 0 0 0 6l-1.2.9 1.2 2.1 1.4-.5a7.7 7.7 0 0 0 5.2 2.2l.3 1.4h2l.3-1.4a7.7 7.7 0 0 0 5.2-2.2l1.4.5 1.2-2.1-1.2-.9Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? <circle cx="12" cy="12" r="8" />}</svg>;
}

function App() {
  const [section, setSection] = useState<Section>("Overview");
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [vendor, setVendor] = useState("All tools");
  const [adoption, setAdoption] = useState(70);
  const [monthlyRuns, setMonthlyRuns] = useState(45000);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiUrl}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
        return (await response.json()) as ApiHealth;
      })
      .then(setHealth)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setApiError(requestError instanceof Error ? requestError.message : "Could not connect to the backend.");
      });
    return () => controller.abort();
  }, []);

  const filteredTools = useMemo(() => tools.filter((tool) => {
    const matchesSearch = `${tool.name} ${tool.vendor}`.toLowerCase().includes(query.toLowerCase());
    const matchesVendor = vendor === "All tools" || tool.vendor === vendor;
    return matchesSearch && matchesVendor;
  }), [query, vendor]);

  const title = section === "ROI & Investments" ? "Investment vs. measured value" : section === "AI Ecosystem" ? "Your AI ecosystem" : section === "Workflow Analytics" ? "Workflow analytics" : section === "Workforce" ? "Human + AI workforce" : section === "Settings" ? "Workspace settings" : "Executive overview";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setSection("Overview")} aria-label="Coefficient home">
          <span className="brand-mark">C</span>
          <span className="brand-name">COEFFICIENT<small>INTELLIGENCE PLATFORM</small></span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map((item) => (
            <button className={`nav-item ${section === item.name ? "active" : ""}`} key={item.name} onClick={() => setSection(item.name)} aria-label={item.name}>
              <span className="nav-icon"><Icon name={item.icon} /></span><span>{item.name}</span>
              {item.name === "AI Ecosystem" && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-avatar">AC</div>
          <div className="workspace-copy"><strong>Acme Corp Demo</strong><span>Enterprise workspace</span></div>
          <Icon name="chevron" />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Executive Platform</span><span className="crumb-slash">/</span><strong>Workspace Multiplier</strong></div>
          <div className="topbar-actions">
            <button className="select-button"><Icon name="calendar" /> Last 90 days <Icon name="chevron" /></button>
            <button className="select-button department-select"><Icon name="users" /> All Departments <Icon name="chevron" /></button>
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Icon name="bell" /><span className="notification-dot" /></button>
              {showNotifications && <div className="notification-popover"><strong>You’re all caught up</strong><span>New workspace signals will appear here.</span></div>}
            </div>
            <button className="profile-button" aria-label="Profile">A</button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="heading-row"><h1>{title}</h1>{section === "Overview" && <span className="demo-badge">DEMO WORKSPACE</span>}</div><p>{section === "Overview" ? "A clear view of how AI is changing the way your teams work." : "One connected view of adoption, investment, and impact across your organization."}</p></div>
            <div className="heading-actions"><span className={`api-status ${health ? "connected" : apiError ? "disconnected" : ""}`}><i />{health ? "Live data" : apiError ? "API offline" : "Connecting"}</span><button className="filter-button"><span>☷</span> Filters</button></div>
          </div>

          {(section === "Overview" || section === "Workforce") && <Overview onNavigate={setSection} />}
          {(section === "AI Ecosystem" || section === "Settings") && (
            <Ecosystem query={query} setQuery={setQuery} vendor={vendor} setVendor={setVendor} filteredTools={filteredTools} />
          )}
          {section === "ROI & Investments" && <Roi adoption={adoption} setAdoption={setAdoption} monthlyRuns={monthlyRuns} setMonthlyRuns={setMonthlyRuns} />}
          {section === "Workflow Analytics" && <Workflow />}

          <footer className="page-footer"><span>Coefficient <span className="footer-dot">·</span> Human + AI intelligence</span><span>{health ? health.message : apiError ? "Connect the FastAPI backend to load live data." : "Connecting to FastAPI…"}</span></footer>
        </div>
      </main>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const kpis = [
    { label: "AI spend", value: "₹18.4L", note: "+12% quarter on quarter", icon: "↗" },
    { label: "Adoption", value: "68%", note: "+8.4% this month", icon: "◎" },
    { label: "Productivity", value: "+17.2%", note: "vs. team baseline", icon: "⌁" },
    { label: "Estimated ROI", value: "2.4×", note: "₹22.9L value created", icon: "↗", accent: true },
  ];
  return <>
    <section className="kpi-grid">
      {kpis.map((kpi) => <article className={`kpi-card ${kpi.accent ? "kpi-highlight" : ""}`} key={kpi.label}><div className="kpi-top"><span>{kpi.label}</span><span className="kpi-icon">{kpi.icon}</span></div><strong>{kpi.value}</strong><div className="kpi-note"><span className="positive">↗</span> {kpi.note}</div></article>)}
    </section>

    <section className="dashboard-grid">
      <article className="panel trajectory-panel">
        <div className="panel-heading"><div><span className="section-kicker">VALUE OVER TIME</span><h2>Trajectory &amp; benefit realization</h2><p>Monthly AI investment compared with operational value</p></div><button className="more-button" aria-label="More chart options">···</button></div>
        <div className="chart-legend"><span><i className="legend-benefit" /> Benefit <strong>₹22.9L</strong></span><span><i className="legend-spend" /> Spend <strong>₹18.4L</strong></span></div>
        <div className="chart-wrap" role="img" aria-label="Benefit growth rising above AI spend from October through February">
          <div className="chart-y-label y-top">₹24L</div><div className="chart-y-label y-mid">₹18L</div><div className="chart-y-label y-low">₹12L</div>
          <div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-gridline line-three" />
          <svg className="line-chart" viewBox="0 0 640 220" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#236c58" stopOpacity=".16" /><stop offset="100%" stopColor="#236c58" stopOpacity="0" /></linearGradient></defs>
            <path d="M18 172 L160 143 L302 109 L444 63 L586 22 L586 208 L18 208 Z" fill="url(#area)" />
            <path d="M18 172 L160 143 L302 109 L444 63 L586 22" fill="none" stroke="#176c53" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <path d="M18 185 L160 164 L302 139 L444 115 L586 91" fill="none" stroke="#78827d" strokeWidth="2" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
            {[["18","172"],["160","143"],["302","109"],["444","63"],["586","22"]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" fill="#176c53" />)}
            {[["18","185"],["160","164"],["302","139"],["444","115"],["586","91"]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="3" fill="#78827d" />)}
          </svg>
          <div className="chart-months"><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><strong>Feb · Current</strong></div>
        </div>
      </article>

      <article className="panel signals-panel">
        <div className="panel-heading compact-heading"><div><span className="section-kicker">NEEDS YOUR ATTENTION</span><h2>Executive signals <span className="signal-count">3</span></h2></div><span className="signal-live"><i /> Live</span></div>
        <div className="signal-card"><div className="signal-meta"><span className="signal-tag">COST VECTOR</span><span className="signal-save">Save ₹1.2L/qtr</span></div><h3>License overlap detected</h3><p>14 duplicate seats between Copilot and Cursor across Engineering.</p><button onClick={() => onNavigate("AI Ecosystem")}>Review seats <Icon name="arrow" /></button></div>
        <div className="signal-card"><div className="signal-meta"><span className="signal-tag tag-green">VELOCITY UPLIFT</span><span className="signal-save">98% quality</span></div><h3>Support triage compressed</h3><p>Resolution time is down 24 minutes with AI-assisted ticket summaries.</p><button className="subtle-button" onClick={() => onNavigate("Workflow Analytics")}>View details <Icon name="arrow" /></button></div>
        <div className="signal-card"><div className="signal-meta"><span className="signal-tag tag-red">GOVERNANCE</span><span className="signal-alert">Action needed</span></div><h3>Invoice verification variance</h3><p>A 4.2% discrepancy was flagged in the human-in-the-loop audit.</p><button className="subtle-button" onClick={() => onNavigate("ROI & Investments")}>Review audit <Icon name="arrow" /></button></div>
      </article>

      <article className="panel adoption-panel">
        <div className="panel-heading compact-heading"><div><span className="section-kicker">PEOPLE &amp; ADOPTION</span><h2>Department adoption</h2></div><button className="text-link" onClick={() => onNavigate("Workforce")}>View all <Icon name="arrow" /></button></div>
        <div className="department-list">{departments.map((dept) => <div className="department-row" key={dept.name}><div className="department-info"><span>{dept.name}</span><small>{dept.seats}</small><strong>{dept.percent}%</strong></div><div className="progress-track"><span style={{ width: `${dept.percent}%` }} /></div></div>)}</div>
      </article>

      <article className="panel model-panel">
        <div className="panel-heading compact-heading"><div><span className="section-kicker">HOW WORK GETS DONE</span><h2>Human–AI model</h2><p>Workflow composition across 410 pathways</p></div><span className="model-icon">◈</span></div>
        <div className="stacked-bar"><span /><span /><span /></div>
        <div className="model-legend"><div><i className="swatch-human" />Human-led <strong>35%</strong><small>144 flows</small></div><div><i className="swatch-collab" />Collaborative <strong>45%</strong><small>185 flows</small></div><div><i className="swatch-ai" />AI-assisted <strong>20%</strong><small>81 flows</small></div></div>
        <div className="model-footer"><span>50% collaborative target by Q3</span><button className="text-link" onClick={() => onNavigate("Workflow Analytics")}>Explore workflows <Icon name="arrow" /></button></div>
      </article>

      <article className="quick-track">
        <div className="quick-track-heading"><span className="section-kicker">YOUR NEXT MOVE</span><Icon name="arrow" /></div>
        <div className="quick-actions"><button onClick={() => onNavigate("ROI & Investments")}><span>↗</span>Explore ROI</button><button onClick={() => onNavigate("Workflow Analytics")}><span>▣</span>See workflows</button><button onClick={() => onNavigate("AI Ecosystem")}><span>⌘</span>Manage AI</button></div>
      </article>
    </section>
  </>;
}

function Ecosystem({ query, setQuery, vendor, setVendor, filteredTools }: { query: string; setQuery: (value: string) => void; vendor: string; setVendor: (value: string) => void; filteredTools: typeof tools }) {
  return <>
    <section className="kpi-grid ecosystem-kpis">
      <Kpi label="Total monthly spend" value="₹18.4L" note="↓ 6.1% this quarter" />
      <Kpi label="Active AI tools" value="12" note="Across 4 vendors" />
      <Kpi label="Provisioned seats" value="1,420" note="371 seats available" />
      <Kpi label="Average utilization" value="72%" note="Healthy · +4.2% MoM" accent />
    </section>
    <section className="panel ecosystem-panel">
      <div className="ecosystem-toolbar"><div className="search-field"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools or vendors…" aria-label="Search tools or vendors" /></div><div className="vendor-filters">{["All tools", "OpenAI", "Microsoft", "Anysphere", "Anthropic", "Google"].map((item) => <button className={vendor === item ? "selected" : ""} key={item} onClick={() => setVendor(item)}>{item}</button>)}</div><button className="export-button"><Icon name="download" /> Export report</button></div>
      <div className="table-scroll"><table className="tool-table"><thead><tr><th>TOOL &amp; PLATFORM</th><th>VENDOR</th><th>SEATS<br />(ACTIVE / TOTAL)</th><th>SPEND / MO</th><th>UTILIZATION</th><th>STATUS</th></tr></thead><tbody>{filteredTools.map((tool) => <tr key={tool.name}><td><div className="tool-name"><span className="tool-logo">{tool.name.slice(0, 1)}</span><div><strong>{tool.name}</strong><small>{tool.description}</small></div></div></td><td>{tool.vendor}</td><td>{tool.seats}</td><td>{tool.spend}</td><td><div className="util-cell"><span className="mini-track"><i style={{ width: `${tool.use}%` }} /></span><strong>{tool.use}%</strong></div></td><td><span className={`health-pill ${tool.health === "Review" ? "needs-review" : ""}`}><i />{tool.health}</span></td></tr>)}</tbody></table></div>
      {filteredTools.length === 0 && <div className="empty-state">No tools match that search. Try another name or vendor.</div>}
      <div className="table-footer"><span>Showing <strong>{filteredTools.length}</strong> of 12 tools</span><div className="pagination"><button aria-label="Previous page">‹</button><button className="page-current">1</button><button>2</button><button>3</button><button aria-label="Next page">›</button></div></div>
    </section>
  </>;
}

function Kpi({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return <article className={`kpi-card ${accent ? "kpi-highlight" : ""}`}><div className="kpi-top"><span>{label}</span><span className="kpi-icon">↗</span></div><strong>{value}</strong><div className="kpi-note">{note}</div></article>;
}

function Roi({ adoption, setAdoption, monthlyRuns, setMonthlyRuns }: { adoption: number; setAdoption: (value: number) => void; monthlyRuns: number; setMonthlyRuns: (value: number) => void }) {
  const benefit = (4.5 * adoption / 70 * monthlyRuns / 45000).toFixed(1);
  return <>
    <section className="kpi-grid roi-kpis"><Kpi label="Total AI outlay" value="₹18.4L" note="Within ₹20L budget" /><Kpi label="Gross benefit" value="₹22.9L" note="Annualized value created" /><Kpi label="Net economic yield" value={`+₹${benefit}L`} note="After investment" accent /><Kpi label="Return on investment" value={`${(Number(benefit) / 18.4 * 100).toFixed(1)}%`} note="Target benchmark: +15%" /></section>
    <section className="roi-layout">
      <article className="panel ledger-panel"><div className="panel-heading"><div><span className="section-kicker">FY25–Q3 CONSOLIDATED</span><h2>Capital allocation &amp; benefit realization</h2><p>Reconcile investment with measurable value.</p></div><span className="formula-pill">ROI = (Benefit − Cost) / Cost</span></div><div className="allocation-head"><span>CAPITAL OUTLAY COMPOSITION · ₹18.4L</span><strong>Q3 allocation</strong></div><div className="allocation-bar"><i /><i /><i /></div><div className="allocation-legend"><span>Licenses <strong>₹13.8L</strong></span><span>Enablement <strong>₹3.2L</strong></span><span>Infrastructure <strong>₹1.4L</strong></span></div><div className="ledger-title"><span>WATERFALL LEDGER SEQUENCE</span><span>Net yield: +₹{benefit}L</span></div><div className="ledger-rows"><Ledger label="Total capital outlay" amount="−₹18.4L" negative /><Ledger label="Direct operating savings" amount="+₹9.6L" /><Ledger label="Released capacity value" amount="+₹8.1L" /><Ledger label="Quality & rework dividend" amount="+₹5.2L" /><div className="ledger-total"><span>✓ &nbsp; Net economic gain</span><strong>+₹{benefit}L</strong></div></div><p className="footnote"><Icon name="shield" /> Released capacity is risk-adjusted at a 65% baseline to exclude non-recoverable idle micro-intervals.</p></article>
      <div className="scenario-column"><article className="panel scenario-panel"><div className="panel-heading"><div><span className="section-kicker">MODEL YOUR NEXT MOVE</span><h2>Scenario stress-test</h2><p>Adjust assumptions to explore potential impact.</p></div><button className="reset-button" onClick={() => { setAdoption(70); setMonthlyRuns(45000); }}>Reset</button></div><div className="slider-control"><div><label htmlFor="adoption">AI adoption</label><strong>{adoption}%</strong></div><input id="adoption" type="range" min="20" max="100" value={adoption} onChange={(event) => setAdoption(Number(event.target.value))} /><div className="range-labels"><span>20%</span><span>100%</span></div></div><div className="slider-control"><div><label htmlFor="monthly-runs">Monthly workflow runs</label><strong>{monthlyRuns.toLocaleString("en-IN")}</strong></div><input id="monthly-runs" type="range" min="10000" max="120000" step="5000" value={monthlyRuns} onChange={(event) => setMonthlyRuns(Number(event.target.value))} /><div className="range-labels"><span>10k</span><span>120k</span></div></div><div className="slider-footnote">Forecast adjusts instantly as assumptions change.</div></article><article className="recalculation-card"><div className="recalc-top"><span>LIVE MODEL RECALCULATION</span><span><i /> SIM ACTIVE</span></div><div className="recalc-metrics"><div><small>PROJECTED COST</small><strong>₹55.38L</strong><span>per quarter</span></div><div className="recalc-benefit"><small>SIMULATED NET BENEFIT</small><strong>+₹{benefit}L</strong><span>+{(Number(benefit) / 18.4 * 100).toFixed(1)}% ROI</span></div><div><small>CAPITAL PAYBACK</small><strong>1.2 mos</strong><span>amortization period</span></div></div><button className="commit-button"><Icon name="shield" /> Commit baseline to executive board <Icon name="arrow" /></button></article></div>
    </section>
  </>;
}

function Ledger({ label, amount, negative = false }: { label: string; amount: string; negative?: boolean }) {
  return <div className={`ledger-row ${negative ? "ledger-negative" : ""}`}><span className="ledger-symbol">{negative ? "−" : "+"}</span><span>{label}</span><span className="ledger-bar"><i /></span><strong>{amount}</strong></div>;
}

function Workflow() {
  const rows = [
    { name: "Customer support triage", team: "Customer Operations", time: "−24 min", quality: "98%", impact: "High" },
    { name: "Code review & testing", team: "Engineering", time: "−42 min", quality: "96%", impact: "High" },
    { name: "Invoice processing", team: "Finance", time: "−18 min", quality: "95%", impact: "Medium" },
    { name: "Campaign content drafts", team: "Marketing", time: "−35 min", quality: "93%", impact: "Medium" },
  ];
  return <><section className="kpi-grid"><Kpi label="Workflows mapped" value="410" note="Across 5 departments" /><Kpi label="Time returned" value="14.3k hrs" note="This quarter" /><Kpi label="Quality maintained" value="96.4%" note="Across AI-assisted work" accent /><Kpi label="Collaborative workflows" value="45%" note="Target: 50% by Q3" /></section><section className="panel workflow-panel"><div className="panel-heading"><div><span className="section-kicker">MEASURABLE OUTCOMES</span><h2>Workflows creating momentum</h2><p>Where human judgment and AI assistance work better together.</p></div><button className="export-button"><Icon name="download" /> Export report</button></div><div className="workflow-list">{rows.map((row, index) => <article className="workflow-row" key={row.name}><span className="workflow-number">0{index + 1}</span><div className="workflow-details"><strong>{row.name}</strong><span>{row.team}</span></div><div className="workflow-metric"><small>TIME SAVED / RUN</small><strong>{row.time}</strong></div><div className="workflow-metric"><small>QUALITY</small><strong>{row.quality}</strong></div><span className={`impact-badge ${row.impact === "High" ? "impact-high" : ""}`}>{row.impact} impact</span><button className="icon-button" aria-label={`View ${row.name}`}><Icon name="arrow" /></button></article>)}</div><div className="workflow-insight"><span className="insight-mark">✳</span><div><strong>People-first insight</strong><p>Workflows with a human review step are delivering 18% higher quality than fully automated paths.</p></div><span className="insight-source">From 410 mapped workflows</span></div></section></>;
}

export default App;
