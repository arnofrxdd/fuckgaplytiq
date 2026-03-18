<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Gaplytiq Redesign Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 40px;
    line-height: 1.7;
    font-size: 15px;
  }
  h1 { font-size: 28px; font-weight: 700; color: #0f0f0f; margin-bottom: 6px; }
  h2 { font-size: 20px; font-weight: 600; color: #111; margin: 40px 0 12px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
  h3 { font-size: 16px; font-weight: 600; color: #222; margin: 24px 0 8px; }
  p { margin-bottom: 14px; color: #2d2d2d; }
  .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
  .tag { display: inline-block; background: #f0f0f0; color: #444; font-size: 12px; font-weight: 500; padding: 2px 10px; border-radius: 99px; margin-right: 6px; }
  .tag.green { background: #e6f4ea; color: #1a6e2e; }
  .tag.blue { background: #e8f0fe; color: #1a56b0; }
  .tag.amber { background: #fef3cd; color: #7d4e00; }
  .tag.purple { background: #f0edff; color: #4a3ab5; }
  .tag.red { background: #fdecea; color: #b71c1c; }
  blockquote {
    border-left: 3px solid #534AB7;
    padding: 12px 20px;
    background: #f7f6ff;
    border-radius: 0 8px 8px 0;
    margin: 16px 0;
    font-style: italic;
    color: #3c3489;
  }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; font-size: 14px; }
  th { background: #f5f5f5; text-align: left; padding: 10px 14px; font-weight: 600; border: 1px solid #e0e0e0; }
  td { padding: 9px 14px; border: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #fafafa; }
  .diagram-wrap {
    background: #f9f9f9;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    padding: 24px 16px;
    margin: 24px 0;
  }
  .diagram-label {
    font-size: 12px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
  }
  .callout {
    background: #fff8e1;
    border-left: 3px solid #f59e0b;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin: 16px 0;
    font-size: 14px;
    color: #5c3d00;
  }
  .callout.info {
    background: #e8f4fd;
    border-color: #3b82f6;
    color: #1e3a5f;
  }
  ul { padding-left: 20px; margin-bottom: 14px; }
  ul li { margin-bottom: 6px; }
  hr { border: none; border-top: 1px solid #eee; margin: 36px 0; }

  /* SVG diagram color classes */
  svg .c-gray rect   { fill: #f1efe8; stroke: #b4b2a9; }
  svg .c-gray text   { fill: #444441; }
  svg .c-blue rect   { fill: #e6f1fb; stroke: #378add; }
  svg .c-blue text   { fill: #0c447c; }
  svg .c-purple rect { fill: #eeedfe; stroke: #7f77dd; }
  svg .c-purple text { fill: #3c3489; }
  svg .c-teal rect   { fill: #e1f5ee; stroke: #1d9e75; }
  svg .c-teal text   { fill: #085041; }
  svg .c-green rect  { fill: #eaf3de; stroke: #639922; }
  svg .c-green text  { fill: #27500a; }
  svg .c-amber rect  { fill: #faeeda; stroke: #ba7517; }
  svg .c-amber text  { fill: #633806; }
  svg .c-coral rect  { fill: #faece7; stroke: #d85a30; }
  svg .c-coral text  { fill: #712b13; }
  svg text { font-family: 'Segoe UI', system-ui, sans-serif; }
  svg .th  { font-weight: 600; font-size: 14px; }
  svg .ts  { font-weight: 400; font-size: 12px; fill: #555; }
  svg .label { font-size: 11px; fill: #999; }
</style>
</head>
<body>

<h1>Gaplytiq Redesign Report</h1>
<p class="subtitle">Internal planning document &mdash; Resume-first platform strategy</p>

<span class="tag green">Phase 1: Now</span>
<span class="tag blue">Phase 2: Future</span>
<span class="tag purple">Resumy base</span>

<hr>

<h2>What Is Gaplytiq?</h2>

<p>Gaplytiq is a <strong>resume creation platform</strong> powered by AI. That is what we sell. That is what we are.</p>

<blockquote>"We build you the best resume." &mdash; full stop. That is the product.</blockquote>

<p>We are taking Resumy's proven resume engine as our base architecture, redesigning the entry experience and dashboard, and rebranding the entire product under the Gaplytiq name.</p>

<p>The AI Interview Lab exists as a <strong>bonus feature only</strong> &mdash; it is not advertised, not on the landing page, and not part of the sales pitch. It quietly appears after the resume is finalised as a helpful next step. Users who discover it love it. We never lead with it.</p>

<div class="callout">
  <strong>The old mistake:</strong> The original Gaplytiq was interview-only with no entry point. It flopped. Resumy works but stops at the resume. Gaplytiq 2.0 is purely a resume product &mdash; with a hidden bonus that keeps users engaged.
</div>

<hr>

<h2>Diagram 1 &mdash; What We Actually Are</h2>

<div class="diagram-wrap">
  <div class="diagram-label">Product identity</div>
  <svg width="100%" viewBox="0 0 780 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>
  <!-- What we sell -->
  <g class="c-teal">
    <rect x="20" y="30" width="200" height="60" rx="10" stroke-width="0.8"/>
    <text class="th" x="120" y="54" text-anchor="middle" dominant-baseline="central">Resume creator</text>
    <text class="ts" x="120" y="72" text-anchor="middle" dominant-baseline="central">The product we sell</text>
  </g>
  <!-- Plus -->
  <text x="242" y="62" text-anchor="middle" dominant-baseline="central" font-size="22" fill="#ccc">+</text>
  <!-- Bonus -->
  <g class="c-gray">
    <rect x="265" y="30" width="200" height="60" rx="10" stroke-width="0.8"/>
    <text class="th" x="365" y="54" text-anchor="middle" dominant-baseline="central">AI interview lab</text>
    <text class="ts" x="365" y="72" text-anchor="middle" dominant-baseline="central">Hidden bonus, never advertised</text>
  </g>
  <!-- Arrow -->
  <line x1="465" y1="60" x2="510" y2="60" stroke="#aaa" stroke-width="1.5" marker-end="url(#arr1)" fill="none"/>
  <!-- Result -->
  <g class="c-purple">
    <rect x="510" y="20" width="250" height="80" rx="10" stroke-width="0.8"/>
    <text class="th" x="635" y="44" text-anchor="middle" dominant-baseline="central">Gaplytiq 2.0</text>
    <text class="ts" x="635" y="62" text-anchor="middle" dominant-baseline="central">Best resume platform</text>
    <text class="ts" x="635" y="78" text-anchor="middle" dominant-baseline="central">Built on Resumy engine</text>
  </g>
  <!-- What stays / what changes -->
  <text class="label" x="120" y="110" text-anchor="middle">WHAT WE SELL</text>
  <text class="label" x="365" y="110" text-anchor="middle">WHAT WE DON'T ADVERTISE</text>
  <text class="label" x="635" y="110" text-anchor="middle">THE PRODUCT</text>
  <!-- Landing page note -->
  <rect x="20" y="130" width="200" height="44" rx="6" fill="#fff" stroke="#e0e0e0" stroke-width="0.8"/>
  <text class="ts" x="120" y="148" text-anchor="middle" dominant-baseline="central" fill="#666">Landing page says only:</text>
  <text class="th" x="120" y="164" text-anchor="middle" dominant-baseline="central" fill="#1d9e75">"We build your resume"</text>
  <!-- Interview note -->
  <rect x="265" y="130" width="200" height="44" rx="6" fill="#fff" stroke="#e0e0e0" stroke-width="0.8"/>
  <text class="ts" x="365" y="148" text-anchor="middle" dominant-baseline="central" fill="#666">Appears only after resume</text>
  <text class="ts" x="365" y="164" text-anchor="middle" dominant-baseline="central" fill="#888">is done. Never before.</text>
  </svg>
</div>

<hr>

<h2>Phase 1 &mdash; Immediate Redesign (Build Now)</h2>

<h3>What stays the same (from Resumy)</h3>
<ul>
  <li><strong>Form Panel</strong> &mdash; where users fill in their resume details</li>
  <li><strong>Finalise Dashboard</strong> &mdash; where the resume is previewed and downloaded</li>
</ul>
<p>These are not touched. Resumy's engine is solid and we are not rebuilding what works.</p>

<h3>What changes &mdash; everything before and after the engine</h3>

<div class="diagram-wrap">
  <div class="diagram-label">Phase 1 &mdash; Full user flow</div>
  <svg width="100%" viewBox="0 0 780 680" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- ENTRY POINTS -->
  <text class="label" x="390" y="18" text-anchor="middle">ENTRY POINTS</text>
  <g class="c-gray">
    <rect x="20" y="28" width="160" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="100" y="47" text-anchor="middle" dominant-baseline="central">Landing page</text>
    <text class="ts" x="100" y="63" text-anchor="middle" dominant-baseline="central">Organic / ads</text>
  </g>
  <g class="c-gray">
    <rect x="310" y="28" width="160" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="47" text-anchor="middle" dominant-baseline="central">Direct link</text>
    <text class="ts" x="390" y="63" text-anchor="middle" dominant-baseline="central">College / referral</text>
  </g>
  <g class="c-gray">
    <rect x="600" y="28" width="160" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="680" y="47" text-anchor="middle" dominant-baseline="central">Return user</text>
    <text class="ts" x="680" y="63" text-anchor="middle" dominant-baseline="central">Saved resume</text>
  </g>

  <line x1="100" y1="76" x2="300" y2="110" stroke="#aaa" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="390" y1="76" x2="390" y2="110" stroke="#aaa" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="680" y1="76" x2="480" y2="110" stroke="#aaa" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>

  <!-- AUTH -->
  <g class="c-blue">
    <rect x="230" y="110" width="320" height="46" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="128" text-anchor="middle" dominant-baseline="central">Sign up / Log in</text>
    <text class="ts" x="390" y="144" text-anchor="middle" dominant-baseline="central">Email or Google auth</text>
  </g>
  <line x1="390" y1="156" x2="390" y2="182" stroke="#378add" stroke-width="1.5" marker-end="url(#arr2)" fill="none"/>

  <!-- DASHBOARD container -->
  <g class="c-purple">
    <rect x="20" y="182" width="740" height="336" rx="14" stroke-width="0.7"/>
    <text class="th" x="390" y="206" text-anchor="middle" dominant-baseline="central">Dashboard &mdash; main entrance (always open on login)</text>
  </g>

  <!-- RESUME BUILDER - highlighted as core -->
  <g class="c-teal">
    <rect x="44" y="218" width="692" height="54" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="238" text-anchor="middle" dominant-baseline="central">Resume builder &mdash; CORE PRODUCT (Resumy engine, unchanged)</text>
    <text class="ts" x="390" y="256" text-anchor="middle" dominant-baseline="central">Always first visible. Form panel + finalise dashboard stays the same.</text>
  </g>

  <!-- 3 modes -->
  <g class="c-teal">
    <rect x="44" y="286" width="210" height="52" rx="8" stroke-width="0.7"/>
    <text class="th" x="149" y="306" text-anchor="middle" dominant-baseline="central">Build from scratch</text>
    <text class="ts" x="149" y="322" text-anchor="middle" dominant-baseline="central">Fresh resume</text>
  </g>
  <g class="c-teal">
    <rect x="285" y="286" width="210" height="52" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="306" text-anchor="middle" dominant-baseline="central">Upload old CV</text>
    <text class="ts" x="390" y="322" text-anchor="middle" dominant-baseline="central">Auto-enhance format</text>
  </g>
  <g class="c-teal">
    <rect x="526" y="286" width="210" height="52" rx="8" stroke-width="0.7"/>
    <text class="th" x="631" y="306" text-anchor="middle" dominant-baseline="central">AI cover letter</text>
    <text class="ts" x="631" y="322" text-anchor="middle" dominant-baseline="central">Per job application</text>
  </g>

  <line x1="149" y1="272" x2="631" y2="272" stroke="#1d9e75" stroke-width="0.5" fill="none" opacity="0.4"/>
  <line x1="149" y1="272" x2="149" y2="286" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="390" y1="272" x2="390" y2="286" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="631" y1="272" x2="631" y2="286" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>

  <!-- ATS + Skill gap -->
  <g class="c-teal">
    <rect x="44" y="354" width="330" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="209" y="372" text-anchor="middle" dominant-baseline="central">ATS score</text>
    <text class="ts" x="209" y="388" text-anchor="middle" dominant-baseline="central">Real-time keyword optimisation</text>
  </g>
  <g class="c-teal">
    <rect x="406" y="354" width="330" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="571" y="372" text-anchor="middle" dominant-baseline="central">Skill gap analysis</text>
    <text class="ts" x="571" y="388" text-anchor="middle" dominant-baseline="central">Missing skills for target role</text>
  </g>
  <line x1="209" y1="354" x2="209" y2="346" stroke="#1d9e75" stroke-width="1" fill="none"/>
  <line x1="209" y1="346" x2="571" y2="346" stroke="#1d9e75" stroke-width="0.5" fill="none" opacity="0.4"/>
  <line x1="571" y1="346" x2="571" y2="354" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="209" y1="346" x2="209" y2="354" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>

  <!-- Resume done -->
  <g class="c-green">
    <rect x="210" y="418" width="360" height="46" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="437" text-anchor="middle" dominant-baseline="central">Resume finalised</text>
    <text class="ts" x="390" y="453" text-anchor="middle" dominant-baseline="central">Download / share / save to profile</text>
  </g>
  <line x1="209" y1="402" x2="320" y2="418" stroke="#639922" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>
  <line x1="571" y1="402" x2="460" y2="418" stroke="#639922" stroke-width="1.2" marker-end="url(#arr2)" fill="none"/>

  <!-- UPSELL -->
  <g class="c-amber">
    <rect x="140" y="480" width="500" height="26" rx="6" stroke-width="0.7"/>
    <text class="th" x="390" y="493" text-anchor="middle" dominant-baseline="central">"Want to practice for this interview? Try our AI Interview Lab." (bonus, never advertised)</text>
  </g>
  <line x1="390" y1="464" x2="390" y2="480" stroke="#ba7517" stroke-width="1.5" marker-end="url(#arr2)" fill="none"/>

  <!-- INTERVIEW LAB (bonus) -->
  <g class="c-coral">
    <rect x="200" y="524" width="380" height="48" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="543" text-anchor="middle" dominant-baseline="central">AI interview lab (bonus)</text>
    <text class="ts" x="390" y="559" text-anchor="middle" dominant-baseline="central">Role questions + real-time feedback</text>
  </g>
  <line x1="390" y1="506" x2="390" y2="524" stroke="#d85a30" stroke-width="1.5" marker-end="url(#arr2)" fill="none"/>

  <!-- OUTCOME -->
  <g class="c-green">
    <rect x="250" y="596" width="280" height="46" rx="8" stroke-width="0.7"/>
    <text class="th" x="390" y="615" text-anchor="middle" dominant-baseline="central">User exits job-ready</text>
    <text class="ts" x="390" y="631" text-anchor="middle" dominant-baseline="central">Strong resume + confidence</text>
  </g>
  <line x1="390" y1="572" x2="390" y2="596" stroke="#639922" stroke-width="1.5" marker-end="url(#arr2)" fill="none"/>

  <!-- Side labels -->
  <text class="label" x="8" y="246" text-anchor="start" fill="#1d9e75" font-weight="600">CORE</text>
  <text class="label" x="8" y="314" text-anchor="start">modes</text>
  <text class="label" x="8" y="380" text-anchor="start">add-ons</text>
  <text class="label" x="8" y="444" text-anchor="start">done</text>
  <text class="label" x="8" y="493" text-anchor="start">bonus</text>
  <text class="label" x="8" y="548" text-anchor="start">bonus</text>
  <text class="label" x="8" y="620" text-anchor="start">goal</text>

  </svg>
</div>

<h3>Entry points</h3>
<table>
  <tr><th>Source</th><th>How they arrive</th></tr>
  <tr><td>Landing page</td><td>Organic search, ads, word of mouth — landing page says one thing: "We build your resume"</td></tr>
  <tr><td>Direct link</td><td>College partnerships, campus referrals, shared links</td></tr>
  <tr><td>Return user</td><td>Coming back to edit a saved resume — land directly on dashboard</td></tr>
</table>

<h3>The dashboard</h3>
<p>This is the product. After login, the user lands here immediately. The resume builder is always the first thing they see. Nothing else competes for attention on first load.</p>

<h3>3 resume modes</h3>
<table>
  <tr><th>Mode</th><th>What it does</th></tr>
  <tr><td>Build from scratch</td><td>AI-guided fresh resume creation with high-end templates</td></tr>
  <tr><td>Upload old CV</td><td>Auto-enhance and reformat existing documents into professional output</td></tr>
  <tr><td>AI cover letter</td><td>Generate a unique, tailored cover letter per job application</td></tr>
</table>

<h3>Value-add analysis (built into the resume process)</h3>
<p>These are not separate products. They run quietly as part of creating the resume:</p>
<ul>
  <li><strong>ATS Score</strong> &mdash; real-time keyword checking against the target role</li>
  <li><strong>Skill Gap Analysis</strong> &mdash; shows what skills are missing for that specific role</li>
</ul>

<h3>The bonus moment</h3>
<p>After the resume is finalised, a single gentle prompt appears: <em>"Want to practice for this interview? Try our AI Interview Lab."</em> This is the only time the interview lab is ever mentioned. It is never on the landing page, never in the dashboard cards, never part of the pitch.</p>

<div class="callout info">
  <strong>AI Interview Lab status:</strong> Either extract it from the old Gaplytiq platform or rebuild from scratch. It is a bonus feature &mdash; build it after the resume flow is stable.
</div>

<hr>

<h2>Phase 2 &mdash; Future Upgrades (Build Later)</h2>

<div class="callout">
  <strong>Important:</strong> Do not build any of Phase 2 until Phase 1 is live and stable. These are upgrades, not requirements.
</div>

<div class="diagram-wrap">
  <div class="diagram-label">Phase 2 &mdash; Build order (left to right)</div>
  <svg width="100%" viewBox="0 0 780 360" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Step badges -->
  <g class="c-amber"><rect x="20" y="16" width="24" height="24" rx="4" stroke-width="0.5"/><text class="th" x="32" y="28" text-anchor="middle" dominant-baseline="central">1</text></g>
  <g class="c-coral"><rect x="218" y="16" width="24" height="24" rx="4" stroke-width="0.5"/><text class="th" x="230" y="28" text-anchor="middle" dominant-baseline="central">2</text></g>
  <g class="c-purple"><rect x="416" y="16" width="24" height="24" rx="4" stroke-width="0.5"/><text class="th" x="428" y="28" text-anchor="middle" dominant-baseline="central">3</text></g>
  <g class="c-blue"><rect x="614" y="16" width="24" height="24" rx="4" stroke-width="0.5"/><text class="th" x="626" y="28" text-anchor="middle" dominant-baseline="central">4</text></g>

  <!-- Thin onboarding -->
  <g class="c-amber">
    <rect x="20" y="50" width="178" height="140" rx="10" stroke-width="0.7"/>
    <text class="th" x="109" y="76" text-anchor="middle" dominant-baseline="central">Thin onboarding</text>
    <text class="ts" x="109" y="96" text-anchor="middle" dominant-baseline="central">Chat bubble on first login</text>
    <text class="ts" x="109" y="114" text-anchor="middle" dominant-baseline="central">3 fields only:</text>
    <text class="ts" x="109" y="130" text-anchor="middle" dominant-baseline="central">Name, Role, Company</text>
    <text class="ts" x="109" y="148" text-anchor="middle" dominant-baseline="central">Dashboard personalises</text>
    <text class="ts" x="109" y="165" text-anchor="middle" dominant-baseline="central">instantly after</text>
  </g>
  <text class="label" x="109" y="208" text-anchor="middle">No forms. Just talk.</text>

  <line x1="198" y1="120" x2="218" y2="120" stroke="#aaa" stroke-width="1.5" marker-end="url(#arr3)" fill="none"/>

  <!-- Visual polish -->
  <g class="c-coral">
    <rect x="218" y="50" width="178" height="140" rx="10" stroke-width="0.7"/>
    <text class="th" x="307" y="76" text-anchor="middle" dominant-baseline="central">Visual polish</text>
    <text class="ts" x="307" y="96" text-anchor="middle" dominant-baseline="central">Fix kerning + spacing</text>
    <text class="ts" x="307" y="114" text-anchor="middle" dominant-baseline="central">Remove small cards</text>
    <text class="ts" x="307" y="132" text-anchor="middle" dominant-baseline="central">3 large pillar cards</text>
    <text class="ts" x="307" y="150" text-anchor="middle" dominant-baseline="central">High-aesthetic design</text>
  </g>
  <text class="label" x="307" y="208" text-anchor="middle">First impression = trust</text>

  <line x1="396" y1="120" x2="416" y2="120" stroke="#aaa" stroke-width="1.5" marker-end="url(#arr3)" fill="none"/>

  <!-- Lazy mode -->
  <g class="c-purple">
    <rect x="416" y="50" width="178" height="140" rx="10" stroke-width="0.7"/>
    <text class="th" x="505" y="72" text-anchor="middle" dominant-baseline="central">Resume lazy mode</text>
    <text class="ts" x="505" y="90" text-anchor="middle" dominant-baseline="central">AI autopilot in Form Panel</text>
    <text class="ts" x="505" y="108" text-anchor="middle" dominant-baseline="central">Type one sentence</text>
    <text class="ts" x="505" y="124" text-anchor="middle" dominant-baseline="central">AI writes 3-4 bullets</text>
    <text class="ts" x="505" y="140" text-anchor="middle" dominant-baseline="central">Form auto-fills</text>
    <text class="ts" x="505" y="158" text-anchor="middle" dominant-baseline="central">User just reviews</text>
  </g>
  <text class="label" x="505" y="208" text-anchor="middle">Biggest differentiator</text>

  <line x1="594" y1="120" x2="614" y2="120" stroke="#aaa" stroke-width="1.5" marker-end="url(#arr3)" fill="none"/>

  <!-- Command hub -->
  <g class="c-blue">
    <rect x="614" y="50" width="148" height="140" rx="10" stroke-width="0.7"/>
    <text class="th" x="688" y="72" text-anchor="middle" dominant-baseline="central">Command hub</text>
    <text class="ts" x="688" y="90" text-anchor="middle" dominant-baseline="central">Top bar always visible</text>
    <text class="ts" x="688" y="108" text-anchor="middle" dominant-baseline="central">"Build resume" routes in</text>
    <text class="ts" x="688" y="124" text-anchor="middle" dominant-baseline="central">"Mock interview" routes</text>
    <text class="ts" x="688" y="140" text-anchor="middle" dominant-baseline="central">"Coding test" external</text>
    <text class="ts" x="688" y="158" text-anchor="middle" dominant-baseline="central">Dynamic greeting</text>
  </g>
  <text class="label" x="688" y="208" text-anchor="middle">Build last, needs others</text>

  <!-- Bottom note -->
  <rect x="20" y="230" width="742" height="48" rx="8" fill="#fff" stroke="#e0e0e0" stroke-width="0.8"/>
  <text class="ts" x="391" y="250" text-anchor="middle" dominant-baseline="central" fill="#888">All Phase 2 features are future upgrades. Do not build until Phase 1 is live.</text>
  <text class="ts" x="391" y="266" text-anchor="middle" dominant-baseline="central" fill="#aaa">Phase 1 = ship the product. Phase 2 = make it exceptional.</text>

  </svg>
</div>

<h3>Step 1 &mdash; Thin onboarding</h3>
<p>First-login chat bubble. No long forms. The agent asks three things: Name, Role, Target Company. Dashboard instantly personalises. Build this first because everything else (greeting, suggestions, interview questions) depends on knowing the user's role.</p>

<h3>Step 2 &mdash; Visual polish</h3>
<p>Fix kerning and paragraph spacing so text feels compact and premium. Remove the small cluttered cards. Replace with 3 large, high-aesthetic interactive cards for the main pillars. First impressions drive trust &mdash; this must look serious before people even use it.</p>

<h3>Step 3 &mdash; Resume lazy mode</h3>
<p>An AI Autopilot button added to the existing Form Panel. User types one sentence describing their experience. AI generates 3-4 high-impact ATS-friendly bullet points and auto-fills the form. User reviews and edits if needed. This is the biggest differentiator &mdash; students hate filling forms.</p>

<h3>Step 4 &mdash; AI command hub</h3>
<p>A sleek minimalist search bar permanently at the top of the dashboard. Dynamic greeting using the user's name and target role. Natural language routing: resume builder, interview lab, or external tools like HackerRank. Build this last because it needs the other features to already exist before it can route to them.</p>

<hr>

<h2>Technology Decisions</h2>

<table>
  <tr><th>Component</th><th>Decision</th></tr>
  <tr><td>Resume engine</td><td>Keep Resumy's architecture and code. Rebrand only.</td></tr>
  <tr><td>Form Panel + Finalise Dashboard</td><td>Untouched. Zero changes.</td></tr>
  <tr><td>Interview Lab</td><td>Extract from old Gaplytiq or rebuild. Bonus feature, not urgent.</td></tr>
  <tr><td>Branding</td><td>Gaplytiq throughout. Resumy name is retired.</td></tr>
  <tr><td>Main entrance</td><td>Dashboard. Not landing page.</td></tr>
  <tr><td>Landing page message</td><td>One message only: "We build your resume."</td></tr>
</table>

<hr>

<h2>Summary</h2>

<table>
  <tr><th>Phase</th><th>What</th><th>When</th></tr>
  <tr><td><span class="tag green">Phase 1</span></td><td>New dashboard, user flow, resume modes, upsell trigger</td><td>Now</td></tr>
  <tr><td><span class="tag amber">Phase 2 &mdash; 1</span></td><td>Thin onboarding (3-field chat bubble)</td><td>After Phase 1 ships</td></tr>
  <tr><td><span class="tag amber">Phase 2 &mdash; 2</span></td><td>Visual polish (big cards, typography)</td><td>After onboarding</td></tr>
  <tr><td><span class="tag purple">Phase 2 &mdash; 3</span></td><td>Resume lazy mode (AI autopilot in form)</td><td>After polish</td></tr>
  <tr><td><span class="tag blue">Phase 2 &mdash; 4</span></td><td>AI Command Hub (top bar routing)</td><td>Last</td></tr>
</table>

<blockquote>Resume is the product. Everything else supports the resume. Interview lab is a bonus that keeps users happy after they've already got what they came for.</blockquote>

<hr>
<p style="color:#aaa; font-size:13px; text-align:center; margin-top:32px;">Gaplytiq Redesign Report &mdash; internal planning document</p>

</body>
</html>