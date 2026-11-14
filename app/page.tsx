"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { I18N } from "./i18n";

const STORE_URL = "https://pixiebuddy.itch.io/pixiebuddy";
type Language = "en" | "pt" | "es" | "fr" | "de" | "it" | "ru";

const languages: { code: Language; region: string; label: string }[] = [
  { code: "en", region: "GB", label: "English" },
  { code: "pt", region: "BR", label: "Português" },
  { code: "es", region: "ES", label: "Español" },
  { code: "fr", region: "FR", label: "Français" },
  { code: "de", region: "DE", label: "Deutsch" },
  { code: "it", region: "IT", label: "Italiano" },
  { code: "ru", region: "RU", label: "Русский" },
];

const achievementDefs = [
  { id: "named", icon: "🏷️", unlocked: true },
  { id: "first_feed", icon: "🔋", unlocked: true },
  { id: "first_bath", icon: "🛁", unlocked: true },
  { id: "first_pet", icon: "💕", unlocked: true },
  { id: "first_game", icon: "🎮", unlocked: true },
  { id: "best_friend", icon: "🤝", unlocked: true },
  { id: "ev2", icon: "🌱", unlocked: true },
  { id: "ev4", icon: "🌟", unlocked: true },
  { id: "week_alive", icon: "📅", unlocked: true },
  { id: "pomodoro_hour", icon: "⏲️", unlocked: true },
  { id: "velha_win", icon: "⭕", unlocked: true },
  { id: "rhythm_win", icon: "💧", unlocked: true },
  { id: "hidecore_win", icon: "📡", unlocked: true },
  { id: "mythic_core", icon: "👑", unlocked: false },
  { id: "mythic_void", icon: "🌌", unlocked: false },
  { id: "veteran", icon: "🎖️", unlocked: false },
  { id: "month_alive", icon: "🌙", unlocked: false },
  { id: "collector", icon: "🗂️", unlocked: false },
];
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
  const [language, setLanguage] = useState<Language>("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [heroStatus, setHeroStatus] = useState("Balanced module · nearby and curious");
  const [heroPet, setHeroPet] = useState("/assets/pets/amethyst-ev4.webp");
  const [petClicks, setPetClicks] = useState(0);
  const [selectedEvolution, setSelectedEvolution] = useState(4);
  const [selectedRarity, setSelectedRarity] = useState(3);
  const heroScene = useRef<HTMLDivElement>(null);
  const languageMenu = useRef<HTMLDivElement>(null);
  const dictionary = I18N[language] || I18N.en;
  const t = (key: string, fallback = key) => dictionary[key] || I18N.en[key] || fallback;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stored = window.localStorage.getItem("pixiebuddy-effects");
    const enabled = stored == null ? !reduced : stored === "on";
    setEffects(enabled);
    document.documentElement.dataset.effects = enabled ? "on" : "off";
    const storedLanguage = window.localStorage.getItem("pixiebuddy-language")?.slice(0, 2) as Language | undefined;
    const browserLanguage = navigator.language.slice(0, 2) as Language;
    const initialLanguage = languages.some(({ code }) => code === storedLanguage)
      ? storedLanguage!
      : languages.some(({ code }) => code === browserLanguage) ? browserLanguage : "en";
    setLanguage(initialLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t("page_title", "PixieBuddy — A tiny companion that lives on your desktop");
    window.localStorage.setItem("pixiebuddy-language", language);
  }, [language]);

  useEffect(() => {
    function closeLanguageMenu(event: globalThis.PointerEvent) {
      if (!languageMenu.current?.contains(event.target as Node)) setLanguageOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setLanguageOpen(false);
    }
    window.addEventListener("pointerdown", closeLanguageMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeLanguageMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function chooseLanguage(next: Language) {
    setLanguage(next);
    setLanguageOpen(false);
  }

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
        <a href="#care">{t("nav_features", "Features")}</a>
        <a href="#evolution">{t("nav_evolution", "Evolution")}</a>
        <a href="#rarities">{t("nav_rarity", "Rarities")}</a>
        <a href="#games">{t("nav_games", "Mini-games")}</a>
        <a href="#achievements">{t("nav_achievements", "Achievements")}</a>
        <a href="#faq">{t("nav_faq", "FAQ")}</a>
        <a className="nav-wiki" href="/wiki">{t("nav_guide", "Wiki")}</a>
        <button className="effects-toggle" onClick={toggleEffects} aria-pressed={!effects}><span aria-hidden="true">{effects ? "✦" : "◇"}</span> Effects {effects ? "on" : "off"}</button>
        <div className="language-switch" ref={languageMenu}>
          <button className="language-button" onClick={() => setLanguageOpen(open => !open)} aria-haspopup="menu" aria-expanded={languageOpen} aria-label="Select language">
            <img src="/assets/icons/globe.png" alt="" />
            <span>{languages.find(({ code }) => code === language)?.label}</span>
            <b aria-hidden="true">▴</b>
          </button>
          {languageOpen && <div className="language-menu" role="menu">
            {languages.map(item => <button key={item.code} className={language === item.code ? "active" : ""} onClick={() => chooseLanguage(item.code)} role="menuitem">
              <span className="language-region">{item.region}</span>
              <span>{item.label}</span>
              <b aria-hidden="true">{language === item.code ? "✓" : ""}</b>
            </button>)}
          </div>}
        </div>
        <PurchaseLink className="nav-buy">Free</PurchaseLink>
      </div>
    </nav>

    <header className="hero section-shell" id="top">
      <div className="hero-copy reveal-now">
        <div className="eyebrow"><i /> {t("hero_badge", "100% offline · no AI · no internet")}</div>
        <p className="chapter-label">01 · PixieBuddy</p>
        <h1 dangerouslySetInnerHTML={{ __html: t("hero_title", "A tiny universe lives <span>on your desktop.</span>") }} />
        <p className="hero-lead">{t("hero_sub", "A gentle pixel-art virtual pet that stays close while you work.")}</p>
        <div className="hero-actions"><PurchaseLink className="button primary">{t("hero_cta1", "Get PixieBuddy")} <strong>Free</strong></PurchaseLink><a className="button secondary" href="#evolution">{t("hero_cta2", "Watch it evolve")}</a></div>
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
      <div className="section-heading reveal"><p className="chapter-label">{t("game_tag", "Mini-games")}</p><h2>{t("game_head", "Play together, strengthen the bond")}</h2><p>{t("game_sub", "Every match rewards care and counts toward achievements.")}</p></div>
      <div className="game-windows">
        <article className="game-window game-ttt reveal"><WindowBar title="TIC-TAC-TOE" accent="#F2C24E" /><div className="ttt-board" aria-label="Tic-Tac-Toe board preview"><b>×</b><i /><em>○</em><i /><b>×</b><i /><em>○</em><i /><b>×</b></div><div className="game-copy"><img src="/assets/icons/tictactoe.png" alt="" /><span><b>Tic-Tac-Toe</b> Neon board, undo and a playful minimax pet.</span></div></article>
        <article className="game-window game-radar reveal"><WindowBar title="SCANNER MODE" accent="#3FB877" /><div className="radar-screen" aria-label="Scanner Mode radar preview"><i /><i /><i /><i /><span /><b>07.4s</b></div><div className="game-copy"><img src="/assets/icons/radar.png" alt="" /><span><b>Scanner Mode</b> Follow the translucent signal before it moves.</span></div></article>
        <article className="game-window game-beats reveal"><WindowBar title="PIXEL BEATS · D F J K" accent="#2E6FCB" /><div className="beat-lanes" aria-label="Pixel Beats lane preview">{[0,1,2,3].map(lane => <i key={lane}><em style={{ height: `${42 + lane * 17}px` }} /><b>{["D","F","J","K"][lane]}</b></i>)}</div><div className="game-copy"><img src="/assets/icons/drop.png" alt="" /><span><b>Pixel Beats</b> Four hold lanes, original chiptune arrangements and grades.</span></div></article>
      </div>
    </section>

    <section className="achievements-section section-shell" id="achievements">
      <div className="section-heading reveal">
        <p className="chapter-label">{t("ach_tag", "🏆 Achievements")}</p>
        <h2>{t("ach_head", "18 trophies to unlock")}</h2>
        <p>{t("ach_sub", "Achievements record the path you took together without locking any pet rule.")}</p>
        <div className="achievement-progress"><b>13</b><span>{t("ach_counter_suffix", "/ 18 unlocked")}</span><i><em style={{ width: `${(13 / 18) * 100}%` }} /></i></div>
      </div>
      <div className="achievement-grid reveal">
        {achievementDefs.map(achievement => <article className={achievement.unlocked ? "achievement-card unlocked" : "achievement-card locked"} key={achievement.id}>
          <span className="achievement-state" aria-label={achievement.unlocked ? "Unlocked" : "Locked"}>{achievement.unlocked ? "✓" : "🔒"}</span>
          <span className="achievement-icon" aria-hidden="true">{achievement.icon}</span>
          <h3>{t(`ach_${achievement.id}_t`, achievement.id)}</h3>
          <p>{t(`ach_${achievement.id}_d`, "")}</p>
          <span className={achievement.unlocked ? "achievement-tier" : "achievement-tier hard"}>{t(achievement.unlocked ? "ach_common" : "ach_hard", achievement.unlocked ? "Common" : "★ Hard")}</span>
        </article>)}
      </div>
    </section>

    <section className="focus-section section-shell" id="focus">
      <div className="focus-scene reveal"><div className="lamp-light" aria-hidden="true" /><div className="pomodoro-card glass-panel"><span>FOCUS SESSION</span><div className="timer-ring"><b>25:00</b><small>FOCUS</small></div><div className="timer-controls"><i /><i /><i /></div></div><img src="/assets/pets/amethyst-sleep.webp" alt="PixieBuddy resting beside the Pomodoro timer" /><div className="focus-desk" aria-hidden="true" /></div>
      <div className="story-copy reveal"><p className="chapter-label">06 · Focus together</p><h2>Focus with a little company.</h2><p>Start a quiet Pomodoro from PixieBuddy’s menu. A floating glass timer keeps the cycle visible while your buddy sits nearby—no intrusive notifications, no invented rewards.</p><div className="quiet-note"><i /> Your focus time is stored locally with the rest of the app.</div></div>
    </section>

    <section className="offline-section section-shell"><div className="offline-console reveal"><span className="offline-signal"><i /> LOCAL SIGNAL ONLY</span><h2>Truly offline.<br />Completely yours.</h2><p>No account. No AI at runtime. No internet connection. No telemetry.</p><div className="offline-grid"><span><b>save.json</b><small>Local state</small></span><span><b>7</b><small>Languages</small></span><span><b>18</b><small>Achievements</small></span><span><b>5</b><small>Buddies at once</small></span></div></div></section>

    <section className="faq-section section-shell" id="faq"><div className="section-heading reveal"><p className="chapter-label">{t("faq_tag", "Frequently asked")}</p><h2>{t("faq_head", "Everything you need to know")}</h2><p>{t("faq_sub", "Honest, direct answers about how PixieBuddy really works.")}</p></div><div className="faq-list reveal">
      {Array.from({ length: 9 }, (_, index) => index + 1).map((number, index) => <details open={index === 0} key={number}><summary>{t(`faq${number}_q`)}<i>+</i></summary><p dangerouslySetInnerHTML={{ __html: t(`faq${number}_a`) }} /></details>)}
    </div></section>

    <section className="final-cta section-shell"><div className="final-window reveal"><div className="final-stars" aria-hidden="true" /><img src="/assets/pets/amethyst-ev4.webp" alt="Amethyst PixieBuddy waiting on a desktop" /><div><p className="chapter-label">07 · Bring PixieBuddy home</p><h2>Your desktop has room for a little more life.</h2><p>One gentle companion. A universe of unique Cores. Yours for free.</p><PurchaseLink className="button primary final-buy">Get PixieBuddy on itch.io <strong>Free</strong></PurchaseLink><small>Windows · 100% offline · External store opens in a new tab</small></div></div></section>

    <footer><a className="brand" href="#top"><img src="/assets/icons/tray.webp" alt="" /><span>PixieBuddy</span></a><p>A classic desktop pet made with pixel art, warm chiptune and no pressure.</p><div><a href="/wiki">{t("nav_guide", "Wiki")}</a><a href="#faq">{t("nav_faq", "FAQ")}</a><a href="#top">{t("final_cta", "Back to top ↑")}</a></div></footer>
  </main>;
}