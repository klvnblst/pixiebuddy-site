"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

const STORE_URL = "https://pixiebuddy.itch.io/pixiebuddy";
const evolution = [
  { stage: "EV0", name: "Core", time: "~30 sec fabrication", image: "/assets/pets/ev0.webp" },
  { stage: "EV1", name: "Baby", time: "24 hours", image: "/assets/pets/ev1.webp" },
  { stage: "EV2", name: "Child", time: "24 hours", image: "/assets/pets/ev2.webp" },
  { stage: "EV3", name: "Young", time: "24 hours", image: "/assets/pets/ev3.webp" },
  { stage: "EV4", name: "Adult", time: "Permanent", image: "/assets/pets/ev4.webp" },
];
const rarities = [
  { name: "Citrine", tier: "Common", chance: "55%", color: "#F2C24E", image: "/assets/pets/citrine-ev4.webp" },
  { name: "Emerald", tier: "Uncommon", chance: "25%", color: "#3FB877", image: "/assets/pets/emerald-ev4.webp" },
  { name: "Lapis", tier: "Rare", chance: "12%", color: "#2E6FCB", image: "/assets/pets/lapis-ev4.webp" },
  { name: "Amethyst", tier: "Epic", chance: "6%", color: "#A86BE0", image: "/assets/pets/amethyst-ev4.webp" },
  { name: "Ruby", tier: "Mythic", chance: "2%", color: "#E03E5C", image: "/assets/pets/ruby-ev4.webp" },
];
const heroActions = [
  { label: "Feed", icon: "/assets/icons/battery.png", status: "Battery recharged · hunger +20" },
  { label: "Play", icon: "/assets/icons/gamepad.png", status: "Ready for a tiny game" },
  { label: "Pet", icon: "/assets/icons/heart.png", status: "Affection received ♡" },
  { label: "Rest", icon: "/assets/icons/moon.png", status: "Entering cozy standby…" },
];

function PurchaseLink({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <a className={`purchase-cta ${className}`} href={STORE_URL} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function Starfield() {
  return <div className="starfield" aria-hidden="true">{Array.from({ length: 32 }, (_, index) => (
    <span key={index} style={{ "--x": `${(index * 37 + 11) % 100}%`, "--y": `${(index * 61 + 7) % 100}%`, "--s": `${1 + (index % 3)}px`, "--d": `${8 + (index % 7) * 2}s`, "--delay": `${-(index % 9)}s` } as CSSProperties} />
  ))}</div>;
}

function WindowBar({ title, accent = "#A86BE0" }: { title: string; accent?: string }) {
  return <div className="window-bar"><div className="window-lights" aria-hidden="true"><i /><i /><i /></div><span>{title}</span><b style={{ color: accent }}>●</b></div>;
}

export default function Home() {
  const [effects, setEffects] = useState(true);
  const [heroStatus, setHeroStatus] = useState("Balanced module · nearby and curious");
  const [heroPet, setHeroPet] = useState("/assets/pets/amethyst-ev4.webp");
  const [petClicks, setPetClicks] = useState(0);
  const [selectedEvolution, setSelectedEvolution] = useState(4);
  const [selectedRarity, setSelectedRarity] = useState(3);
  const heroScene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stored = window.localStorage.getItem("pixiebuddy-effects");
    const enabled = stored == null ? !reduced : stored === "on";
    setEffects(enabled);
    document.documentElement.dataset.effects = enabled ? "on" : "off";
  }, []);

  function toggleEffects() {
    const next = !effects;
    setEffects(next);
    document.documentElement.dataset.effects = next ? "on" : "off";
    window.localStorage.setItem("pixiebuddy-effects", next ? "on" : "off");
  }
  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (!effects || !heroScene.current) return;
    const box = heroScene.current.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
    const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    heroScene.current.style.setProperty("--tilt-x", `${y * -3.5}deg`);
    heroScene.current.style.setProperty("--tilt-y", `${x * 4.5}deg`);
    heroScene.current.style.setProperty("--cursor-x", `${(x + 1) * 50}%`);
    heroScene.current.style.setProperty("--cursor-y", `${(y + 1) * 50}%`);
    document.documentElement.style.setProperty("--parallax-x", `${x * -14}px`);
    document.documentElement.style.setProperty("--parallax-y", `${y * -9}px`);
  }
  function resetScene() {
    heroScene.current?.style.setProperty("--tilt-x", "0deg");
    heroScene.current?.style.setProperty("--tilt-y", "0deg");
  }
  function reactToAction(index: number) {
    const action = heroActions[index];
    setHeroStatus(action.status);
    setHeroPet(index === 3 ? "/assets/pets/amethyst-sleep.webp" : "/assets/pets/amethyst-ev4.webp");
  }
  function tapBuddy() {
    const next = petClicks + 1;
    setPetClicks(next);
    setHeroPet("/assets/pets/amethyst-ev4.webp");
    setHeroStatus(next >= 5 ? "✦ Secret star signal found!" : "♡ PixieBuddy noticed you");
  }
  function tiltCard(event: PointerEvent<HTMLElement>) {
    if (!effects) return;
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    card.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    card.style.setProperty("--shine-x", `${x * 100}%`);
    card.style.setProperty("--shine-y", `${y * 100}%`);
  }
  function resetTilt(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }

  return <main>
    <Starfield />
    <nav className="site-nav" aria-label="Primary navigation">
      <a className="brand" href="#top" aria-label="PixieBuddy home"><img src="/assets/icons/tray.webp" alt="" /><span>PixieBuddy</span></a>
      <div className="nav-links">
        <a href="#care">Care</a><a href="#evolution">Evolution</a><a href="#rarities">Collection</a><a href="#games">Mini-games</a>
        <button className="effects-toggle" onClick={toggleEffects} aria-pressed={!effects}><span aria-hidden="true">{effects ? "✦" : "◇"}</span> Effects {effects ? "on" : "off"}</button>
        <PurchaseLink className="nav-buy">Get it · $1.99</PurchaseLink>
      </div>
    </nav>

    <header className="hero section-shell" id="top">
      <div className="hero-copy reveal-now">
        <div className="eyebrow"><i /> 100% offline · Windows desktop</div>
        <p className="chapter-label">01 · Meet your desktop companion</p>
        <h1>A tiny universe lives <span>on your desktop.</span></h1>
        <p className="hero-lead">PixieBuddy is a pixel-art virtual pet that stays close while you work, rests at night, grows through four stages and turns every unique Core into a story worth keeping.</p>
        <div className="hero-actions"><PurchaseLink className="button primary">Bring PixieBuddy home <strong>$1.99</strong></PurchaseLink><a className="button secondary" href="#evolution">Watch it evolve ↓</a></div>
        <ul className="trust-row" aria-label="Product highlights"><li><b>Offline</b><span>No account or telemetry</span></li><li><b>Gentle</b><span>No death or punishment</span></li><li><b>Yours</b><span>Local save, unique seed</span></li></ul>
      </div>
      <div className="hero-visual" ref={heroScene} onPointerMove={moveScene} onPointerLeave={resetScene} aria-label="Interactive demonstration of PixieBuddy living on a desktop">
        <div className="desktop-frame"><WindowBar title="DESKTOP · HOME" /><div className="desktop-wallpaper">
          <div className="desktop-nebula" /><div className="desktop-shortcuts" aria-hidden="true"><span><img src="/assets/icons/cards.png" alt="" />COLLECTION</span><span><img src="/assets/icons/clock.png" alt="" />FOCUS</span></div>
          <div className="status-window glass-panel"><div><span>CORE</span><b>AMETHYST</b></div><div className="mini-bars"><i /><i /><i /><i /></div><small>EV4 · EPIC · 84/100</small></div>
          <button className="hero-pet-button" onClick={tapBuddy} aria-label="Pet PixieBuddy"><span className="pet-glow" /><img src={heroPet} alt="Animated Amethyst PixieBuddy" /><span className="reaction-bubble" aria-live="polite">{heroStatus}</span></button>
          <div className="radial-actions" aria-label="Pet care controls">{heroActions.map((action, index) => <button key={action.label} onClick={() => reactToAction(index)} onPointerEnter={() => setHeroStatus(`${action.label}? I’m ready.`)} aria-label={action.label}><img src={action.icon} alt="" /><span>{action.label}</span></button>)}</div>
          <div className="taskbar"><span><i /> PIXIEBUDDY RUNNING</span><time>22:14</time></div>
        </div></div>
        <div className="cursor-halo" aria-hidden="true" /><div className="orbit-pixels" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div>
      </div>
      <a className="scroll-cue" href="#care"><span>Scroll to meet your buddy</span><i /></a>
    </header>

    <div className="signal-divider" aria-hidden="true"><span>CORE SIGNAL · 84%</span></div>

    <section className="story-section care-section section-shell" id="care">
      <div className="story-copy reveal"><p className="chapter-label">02 · Care for it</p><h2>Small rituals.<br /><span>A real presence.</span></h2><p>Hunger, happiness, energy and cleanliness change over time. Feed it, bathe it, play, pet it or let it sleep. If life gets busy, care always brings it back.</p>
        <div className="care-notes"><span><img src="/assets/icons/moon.png" alt="" /><b>Day & night</b> Sleeps automatically from 10 PM to 8 AM.</span><span><img src="/assets/icons/flask.png" alt="" /><b>Care heals</b> Illness is recoverable; no guilt loop.</span><span><img src="/assets/icons/palette.png" alt="" /><b>Temperament</b> Active, balanced or lazy micro-behavior.</span></div>
      </div>
      <div className="care-console reveal"><WindowBar title="CARE CONSOLE · AX-SHADOW" accent="#3FB877" /><div className="care-body"><div className="care-pet-stage"><span className="floor-grid" /><img src="/assets/pets/emerald-move.webp" alt="Emerald PixieBuddy moving" /><div className="heart-ping">♡</div></div><div className="care-readout">
        {[["HUNGER","82","#F2C24E"],["HAPPINESS","94","#E03E5C"],["ENERGY","71","#2E6FCB"],["CLEAN","88","#8FC7EE"]].map(([label,value,color]) => <div className="care-meter" key={label}><span>{label}</span><b>{value}</b><i><em style={{ width: `${value}%`, background: color }} /></i></div>)}
        <p><i /> HEALTHY · BALANCED MODULE</p></div></div><div className="console-actions">{heroActions.map(action => <span key={action.label}><img src={action.icon} alt="" />{action.label}</span>)}</div></div>
    </section>
    <section className="evolution-section section-shell" id="evolution">
      <div className="section-heading reveal"><p className="chapter-label">03 · Watch it evolve</p><h2>From a sleeping Core to a companion <span>that stays.</span></h2><p>The first journey follows confirmed in-game timing. EV4 is permanent—there is no terminal aging.</p></div>
      <div className="evolution-orbit reveal"><div className="evolution-line" aria-hidden="true"><i style={{ width: `${selectedEvolution * 25}%` }} /></div>{evolution.map((item,index) => <button className={selectedEvolution === index ? "evo-station active" : "evo-station"} key={item.stage} onClick={() => setSelectedEvolution(index)} aria-pressed={selectedEvolution === index}><span className="station-image"><img src={item.image} alt={`${item.stage} ${item.name}`} /></span><strong>{item.stage} · {item.name}</strong><small>{item.time}</small></button>)}</div>
      <div className="selected-stage reveal"><span>SELECTED STAGE</span><b>{evolution[selectedEvolution].stage} · {evolution[selectedEvolution].name}</b><p>{selectedEvolution === 0 ? "Mechanical fabrication initializes a new unique Core." : selectedEvolution === 4 ? "Adult form unlocked. Permanent, collectible and always yours." : "A living stage in the first PixieBuddy journey."}</p></div>
    </section>

    <div className="signal-divider orbital" aria-hidden="true"><span>RARITY CONSTELLATION</span></div>

    <section className="rarity-section section-shell" id="rarities">
      <div className="section-heading reveal"><p className="chapter-label">04 · Discover rare variants</p><h2>Every Core is born with a <span>unique signature.</span></h2><p>Five gem tiers, one seed-defined identity. Rarity changes color, glow and finish—not how much your buddy deserves care.</p></div>
      <div className="rarity-showcase reveal"><div className="rarity-tabs" role="tablist" aria-label="PixieBuddy rarities">{rarities.map((rarity,index) => <button key={rarity.name} className={selectedRarity === index ? "active" : ""} onClick={() => setSelectedRarity(index)} role="tab" aria-selected={selectedRarity === index} style={{ "--rarity": rarity.color } as CSSProperties}><i /><span>{rarity.tier}</span><b>{rarity.name}</b><small>{rarity.chance} base roll</small></button>)}</div>
        <article className="rarity-focus" style={{ "--rarity": rarities[selectedRarity].color } as CSSProperties} onPointerMove={tiltCard} onPointerLeave={resetTilt}><div className="rarity-constellation" aria-hidden="true"><i /><i /><i /><i /><i /></div><img src={rarities[selectedRarity].image} alt={`${rarities[selectedRarity].tier} ${rarities[selectedRarity].name} PixieBuddy`} /><div className="rarity-meta"><span>CORE VARIANT</span><strong>{rarities[selectedRarity].name}</strong><p>★ {rarities[selectedRarity].tier.toUpperCase()} · {rarities[selectedRarity].chance}</p></div><div className="holo-shine" aria-hidden="true" /></article>
      </div>
    </section>

    <section className="collection-section section-shell" id="collection">
      <div className="card-stack reveal" onPointerMove={tiltCard} onPointerLeave={resetTilt}><img className="stack-card back-two" src="/assets/cards/card-d23419b9-2026-06-01T150936Z-core-era-001.webp" alt="" /><img className="stack-card back-one" src="/assets/cards/card-31313856-2026-07-13T235145Z-core-era-001.webp" alt="" /><div className="real-card"><img src="/assets/cards/card-a23445f2-2026-07-14T003930Z-core-era-001.webp" alt="A real PixieBuddy birth card from the game" /><span className="card-rainbow" aria-hidden="true" /></div><div className="packet-pixels" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div></div>
      <div className="story-copy reveal"><p className="chapter-label">05 · Collect its story</p><h2>A memory shelf,<br /><span>not a loot box.</span></h2><p>When a Core is recycled, it is archived and minted as an immutable in-game card. Its seed, origin, chassis and personality remain part of your collection—and you can reactivate it later.</p><ul className="feature-list"><li><i /> Real cards rendered by PixieBuddy</li><li><i /> Live holographic viewer by rarity</li><li><i /> Shared shelf across up to five buddies</li></ul></div>
    </section>

    <section className="games-section section-shell" id="games">
      <div className="section-heading reveal"><p className="chapter-label">Open a tiny window together</p><h2>Three mini-games,<br /><span>three different rhythms.</span></h2></div>
      <div className="game-windows">
        <article className="game-window game-ttt reveal"><WindowBar title="TIC-TAC-TOE" accent="#F2C24E" /><div className="ttt-board" aria-label="Tic-Tac-Toe board preview"><b>×</b><i /><em>○</em><i /><b>×</b><i /><em>○</em><i /><b>×</b></div><div className="game-copy"><img src="/assets/icons/tictactoe.png" alt="" /><span><b>Tic-Tac-Toe</b> Neon board, undo and a playful minimax pet.</span></div></article>
        <article className="game-window game-radar reveal"><WindowBar title="SCANNER MODE" accent="#3FB877" /><div className="radar-screen" aria-label="Scanner Mode radar preview"><i /><i /><i /><i /><span /><b>07.4s</b></div><div className="game-copy"><img src="/assets/icons/radar.png" alt="" /><span><b>Scanner Mode</b> Follow the translucent signal before it moves.</span></div></article>
        <article className="game-window game-beats reveal"><WindowBar title="PIXEL BEATS · D F J K" accent="#2E6FCB" /><div className="beat-lanes" aria-label="Pixel Beats lane preview">{[0,1,2,3].map(lane => <i key={lane}><em style={{ height: `${42 + lane * 17}px` }} /><b>{["D","F","J","K"][lane]}</b></i>)}</div><div className="game-copy"><img src="/assets/icons/drop.png" alt="" /><span><b>Pixel Beats</b> Four hold lanes, original chiptune arrangements and grades.</span></div></article>
      </div>
    </section>
    <section className="focus-section section-shell" id="focus">
      <div className="focus-scene reveal"><div className="lamp-light" aria-hidden="true" /><div className="pomodoro-card glass-panel"><span>FOCUS SESSION</span><div className="timer-ring"><b>25:00</b><small>FOCUS</small></div><div className="timer-controls"><i /><i /><i /></div></div><img src="/assets/pets/amethyst-sleep.webp" alt="PixieBuddy resting beside the Pomodoro timer" /><div className="focus-desk" aria-hidden="true" /></div>
      <div className="story-copy reveal"><p className="chapter-label">06 · Focus together</p><h2>Focus with a little company.</h2><p>Start a quiet Pomodoro from PixieBuddy’s menu. A floating glass timer keeps the cycle visible while your buddy sits nearby—no intrusive notifications, no invented rewards.</p><div className="quiet-note"><i /> Your focus time is stored locally with the rest of the app.</div></div>
    </section>

    <section className="offline-section section-shell"><div className="offline-console reveal"><span className="offline-signal"><i /> LOCAL SIGNAL ONLY</span><h2>Truly offline.<br />Completely yours.</h2><p>No account. No AI at runtime. No internet connection. No telemetry.</p><div className="offline-grid"><span><b>save.json</b><small>Local state</small></span><span><b>7</b><small>Languages</small></span><span><b>18</b><small>Achievements</small></span><span><b>5</b><small>Buddies at once</small></span></div></div></section>

    <section className="faq-section section-shell" id="faq"><div className="section-heading reveal"><p className="chapter-label">Before you bring one home</p><h2>Honest answers.<br /><span>No mystery pricing.</span></h2></div><div className="faq-list reveal">
      <details open><summary>What does PixieBuddy cost?<i>+</i></summary><p>US$ 1.99 on itch.io. The store page is the official purchase and download destination.</p></details>
      <details><summary>Does my pet die if I forget it?<i>+</i></summary><p>No. Stats change and illness can happen, but normal care or medicine always restores it. There is no death, grave or terminal aging.</p></details>
      <details><summary>Which system is supported?<i>+</i></summary><p>The current release is for Windows desktop. Android and iOS are future directions, not part of this purchase.</p></details>
      <details><summary>Does it need internet or a login?<i>+</i></summary><p>No. PixieBuddy runs offline, stores its state locally and asks for no account.</p></details>
    </div></section>

    <section className="final-cta section-shell"><div className="final-window reveal"><div className="final-stars" aria-hidden="true" /><img src="/assets/pets/amethyst-ev4.webp" alt="Amethyst PixieBuddy waiting on a desktop" /><div><p className="chapter-label">07 · Bring PixieBuddy home</p><h2>Your desktop has room for a little more life.</h2><p>One gentle companion. A universe of unique Cores. Yours for US$ 1.99.</p><PurchaseLink className="button primary final-buy">Get PixieBuddy on itch.io <strong>$1.99</strong></PurchaseLink><small>Windows · 100% offline · External store opens in a new tab</small></div></div></section>

    <footer><a className="brand" href="#top"><img src="/assets/icons/tray.webp" alt="" /><span>PixieBuddy</span></a><p>A classic desktop pet made with pixel art, warm chiptune and no pressure.</p><div><a href="#faq">FAQ</a><a href="#top">Back to top ↑</a></div></footer>
  </main>;
}