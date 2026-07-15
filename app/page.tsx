"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import {
  Activity,
  Atom,
  ChevronRight,
  Dna,
  Gauge,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Sparkles as SparklesIcon,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import * as THREE from "three";

type Genes = {
  limbs: number;
  segments: number;
  spread: number;
  rhythm: number;
};

type RunState = "design" | "incubating" | "ready" | "testing" | "paused" | "success" | "failed";

const INITIAL_GENES: Genes = { limbs: 6, segments: 3, spread: 52, rhythm: 1.2 };

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function metricsFor(genes: Genes) {
  const stability = clamp(
    96 - Math.abs(genes.limbs - 6) * 9 - Math.abs(genes.spread - 52) * 0.72 - Math.max(0, genes.segments - 4) * 8,
  );
  const mobility = clamp(22 + genes.limbs * 5.8 + genes.segments * 7.5 + genes.rhythm * 15 - genes.spread * 0.1);
  const energy = clamp(108 - genes.limbs * genes.segments * 2.35 - genes.rhythm * 9 + genes.spread * 0.08);
  const viability = Math.round(stability * 0.47 + mobility * 0.34 + energy * 0.19);
  return { stability: Math.round(stability), mobility: Math.round(mobility), energy: Math.round(energy), viability };
}

function playTone(kind: "grow" | "launch" | "success" | "click", muted: boolean) {
  if (muted || typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequencies = { grow: [110, 330], launch: [170, 240], success: [330, 660], click: [220, 260] };
  const [start, end] = frequencies[kind];
  const duration = kind === "success" ? 0.7 : kind === "grow" ? 0.55 : 0.18;
  oscillator.type = kind === "grow" ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(start, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(end, context.currentTime + duration);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.addEventListener("ended", () => void context.close());
}

function CameraRig({ testing }: { testing: boolean }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const target = testing ? new THREE.Vector3(7.7, 5.1, 9.2) : new THREE.Vector3(8.7, 5.8, 10.8);
    camera.position.lerp(target, 1 - Math.pow(0.02, delta));
  });
  return null;
}

function Chamber() {
  const ribs = Array.from({ length: 9 }, (_, index) => index);
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[11, 0.12, 5.7]} />
        <meshStandardMaterial color="#10131a" metalness={0.72} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.7, 5.4, 28, 12]} />
        <meshStandardMaterial color="#181b24" metalness={0.45} roughness={0.5} wireframe />
      </mesh>
      {ribs.map((index) => {
        const x = -4.8 + index * 1.2;
        return (
          <group key={index} position={[x, 0, 0]}>
            <mesh position={[0, 1.8, -2.58]} castShadow>
              <boxGeometry args={[0.1, 3.6, 0.18]} />
              <meshStandardMaterial color="#242834" metalness={0.9} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0.05, -2.35]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
              <meshStandardMaterial color="#9c63ff" emissive="#7137ff" emissiveIntensity={2.8} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 3.55, -2.4]}>
        <boxGeometry args={[10.7, 0.12, 0.16]} />
        <meshStandardMaterial color="#282c38" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.5, -2.3]}>
        <boxGeometry args={[9.8, 0.025, 0.04]} />
        <meshStandardMaterial color="#8a52ff" emissive="#7134ff" emissiveIntensity={4} toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[0, 0, side * 2.72]}>
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[10.8, 2.4, 0.12]} />
            <meshStandardMaterial color="#0c0e14" metalness={0.65} roughness={0.45} />
          </mesh>
        </group>
      ))}
      <RoundedBox args={[1.35, 0.32, 1.9]} radius={0.12} position={[-3.25, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#242836" metalness={0.7} roughness={0.28} />
      </RoundedBox>
      <mesh position={[-3.25, 0.32, 0]}>
        <cylinderGeometry args={[0.63, 0.68, 0.09, 48]} />
        <meshStandardMaterial color="#2f283e" emissive="#4a236f" emissiveIntensity={0.65} metalness={0.5} />
      </mesh>
      <mesh position={[-3.25, 0.375, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.56, 48]} />
        <meshStandardMaterial color="#b07cff" emissive="#8e50ff" emissiveIntensity={3.8} toneMapped={false} />
      </mesh>
      <Sparkles count={38} scale={[9, 3.5, 5]} size={1.2} speed={0.16} color="#9f70ff" opacity={0.32} />
    </group>
  );
}

function Beacon({ active }: { active: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = (active ? 19 : 12) + Math.sin(clock.elapsedTime * 2.5) * 2;
  });
  return (
    <group position={[3.55, 0, 0]}>
      <mesh position={[0, 0.17, 0]} receiveShadow>
        <cylinderGeometry args={[0.72, 0.82, 0.32, 48]} />
        <meshStandardMaterial color="#20262e" metalness={0.88} roughness={0.24} />
      </mesh>
      <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.22}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <octahedronGeometry args={[0.43, 1]} />
          <meshStandardMaterial color="#efffff" emissive="#72e8ff" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        <pointLight ref={light} position={[0, 1.2, 0]} color="#66e6ff" distance={6} decay={2} />
        <Sparkles count={18} scale={[1.4, 2.4, 1.4]} size={2.3} speed={0.4} color="#baf6ff" />
      </Float>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 48]} />
        <meshStandardMaterial color="#5fe2ff" emissive="#58dcff" emissiveIntensity={4.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ProceduralCreature({
  genes,
  runState,
  progress,
  incubation,
}: {
  genes: Genes;
  runState: RunState;
  progress: number;
  incubation: number;
}) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const limbRefs = useRef<Array<THREE.Mesh | null>>([]);
  const jointRefs = useRef<Array<THREE.Mesh | null>>([]);
  const segments = useMemo(
    () => Array.from({ length: genes.limbs * genes.segments }, (_, i) => ({ limb: Math.floor(i / genes.segments), segment: i % genes.segments })),
    [genes.limbs, genes.segments],
  );
  const unitY = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const start = useMemo(() => new THREE.Vector3(), []);
  const end = useMemo(() => new THREE.Vector3(), []);
  const midpoint = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const isTesting = runState === "testing" || runState === "paused" || runState === "success" || runState === "failed";

  useEffect(() => {
    limbRefs.current = limbRefs.current.slice(0, genes.limbs * genes.segments);
    jointRefs.current = jointRefs.current.slice(0, genes.limbs * genes.segments);
  }, [genes.limbs, genes.segments]);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime;
    if (root.current) {
      const x = isTesting ? -3.25 + progress * 0.067 : -3.25;
      const failureDrop = runState === "failed" ? 0.43 : 0;
      const gaitBob = runState === "testing" ? Math.abs(Math.sin(time * genes.rhythm * 4.2)) * 0.08 : Math.sin(time * 1.3) * 0.025;
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, x, 6, delta);
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, 0.83 - failureDrop + gaitBob, 6, delta);
      root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, runState === "failed" ? -0.5 : 0, 5, delta);
      const birthScale = runState === "incubating" ? Math.max(0.04, incubation / 100) : 1;
      root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x, birthScale, 8, delta));
    }
    if (core.current) {
      const pulse = 1 + Math.sin(time * 2.6) * 0.045;
      core.current.scale.setScalar(pulse);
      core.current.rotation.y += delta * 0.22;
      core.current.rotation.x += delta * 0.08;
    }

    segments.forEach(({ limb, segment }, index) => {
      const mesh = limbRefs.current[index];
      const joint = jointRefs.current[index];
      if (!mesh || !joint) return;
      const angle = (limb / genes.limbs) * Math.PI * 2;
      const radialX = Math.cos(angle);
      const radialZ = Math.sin(angle);
      const phase = time * genes.rhythm * 4 + limb * Math.PI;
      const walking = runState === "testing" ? 1 : 0.18;
      const stride = Math.sin(phase) * 0.18 * walking * (segment + 1) / genes.segments;
      const lift = Math.max(0, Math.sin(phase)) * 0.22 * walking;
      const length = 0.42 + genes.spread / 220;
      const startRadius = 0.48 + segment * length;
      const endRadius = 0.48 + (segment + 1) * length;
      const startY = -0.08 - (segment / genes.segments) * 0.44;
      const endY = -0.08 - ((segment + 1) / genes.segments) * 0.47 + lift;
      const tangentX = -radialZ * stride;
      const tangentZ = radialX * stride;
      start.set(radialX * startRadius + tangentX * 0.4, startY, radialZ * startRadius + tangentZ * 0.4);
      end.set(radialX * endRadius + tangentX, endY, radialZ * endRadius + tangentZ);
      midpoint.copy(start).add(end).multiplyScalar(0.5);
      direction.copy(end).sub(start);
      const len = direction.length();
      quaternion.setFromUnitVectors(unitY, direction.normalize());
      mesh.position.copy(midpoint);
      mesh.quaternion.copy(quaternion);
      mesh.scale.set(1, len, 1);
      joint.position.copy(end);
    });
  });

  return (
    <group ref={root} position={[-3.25, 0.83, 0]}>
      <group visible={incubation > 8 || runState !== "incubating"}>
        {segments.map(({ limb, segment }, index) => (
          <group key={`${limb}-${segment}`} visible={runState !== "incubating" || incubation > 20 + (segment / genes.segments) * 55}>
            <mesh ref={(node) => { limbRefs.current[index] = node; }} castShadow>
              <capsuleGeometry args={[0.075, 1, 7, 12]} />
              <meshStandardMaterial
                color={segment === genes.segments - 1 ? "#b7a7ce" : "#ded7e9"}
                roughness={0.28}
                metalness={0.42}
                emissive="#7d41be"
                emissiveIntensity={0.08 + segment * 0.04}
              />
            </mesh>
            <mesh ref={(node) => { jointRefs.current[index] = node; }} castShadow>
              <sphereGeometry args={[0.12 - segment * 0.012, 16, 12]} />
              <meshStandardMaterial color="#25212f" metalness={0.8} roughness={0.24} emissive="#9c54ff" emissiveIntensity={1.1} />
            </mesh>
          </group>
        ))}
        <mesh ref={core} castShadow>
          <icosahedronGeometry args={[0.55, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            resolution={256}
            transmission={0.92}
            thickness={0.72}
            roughness={0.13}
            chromaticAberration={0.08}
            distortion={0.22}
            distortionScale={0.3}
            temporalDistortion={0.08}
            ior={1.34}
            color="#b98cff"
          />
        </mesh>
        <mesh scale={0.56}>
          <icosahedronGeometry args={[0.55, 2]} />
          <meshStandardMaterial color="#f0dcff" emissive="#a13cff" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        <pointLight color="#a66cff" intensity={11} distance={3.5} decay={2} />
        <Sparkles count={16} scale={1.25} size={2.1} speed={0.5} color="#d8b9ff" />
      </group>
    </group>
  );
}

function IncubatorField({ active, progress }: { active: boolean; progress: number }) {
  const rings = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (rings.current) {
      rings.current.rotation.y += delta * (active ? 1.8 : 0.25);
      rings.current.position.y = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.04;
    }
  });
  return (
    <group position={[-3.25, 0, 0]} visible={active}>
      <group ref={rings}>
        {[0, 1, 2].map((ring) => (
          <mesh key={ring} rotation={[Math.PI / 2 + ring * 0.36, ring * 0.7, 0]} scale={1 + ring * 0.16}>
            <torusGeometry args={[0.82, 0.014, 8, 72]} />
            <meshBasicMaterial color={ring === 1 ? "#72e8ff" : "#a65cff"} transparent opacity={0.8} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1, 0]} color="#984cff" intensity={10 + progress * 0.18} distance={4} />
      <Sparkles count={60} scale={[2, 2.4, 2]} size={3} speed={1.2} color="#bb79ff" />
    </group>
  );
}

function Scene({ genes, runState, progress, incubation }: { genes: Genes; runState: RunState; progress: number; incubation: number }) {
  const testing = ["testing", "paused", "success", "failed"].includes(runState);
  return (
    <>
      <color attach="background" args={["#06070b"]} />
      <fog attach="fog" args={["#07080e", 9, 20]} />
      <ambientLight intensity={0.48} color="#b5a8d8" />
      <directionalLight position={[2.5, 7, 4]} intensity={2.9} color="#e7e3ff" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-3.4, 5.5, 2]} target-position={[-3.2, 0, 0]} angle={0.45} penumbra={0.8} intensity={9} color="#8250ff" castShadow />
      <Chamber />
      <Beacon active={testing} />
      <ProceduralCreature genes={genes} runState={runState} progress={progress} incubation={incubation} />
      <IncubatorField active={runState === "incubating"} progress={incubation} />
      <ContactShadows position={[0, 0.08, 0]} opacity={0.75} scale={10} blur={2.2} far={4} color="#05030a" />
      <Environment preset="warehouse" environmentIntensity={0.28} />
      <CameraRig testing={testing} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={7}
        maxDistance={14}
        minPolarAngle={0.65}
        maxPolarAngle={1.35}
        target={[0, 0.85, 0]}
        dampingFactor={0.06}
      />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.62} intensity={1.25} radius={0.72} />
        <Vignette eskil={false} offset={0.18} darkness={0.72} />
      </EffectComposer>
    </>
  );
}

function FallbackScene({ genes, runState, progress, incubation }: { genes: Genes; runState: RunState; progress: number; incubation: number }) {
  const creatureScale = runState === "incubating" ? Math.max(0.08, incubation / 100) : 1;
  const creatureLeft = 28 + progress * 0.42;
  return (
    <div className="fallback-scene" aria-hidden="true">
      <div className="fallback-ceiling"><i /><i /><i /><i /><i /><i /></div>
      <div className="fallback-grid" />
      <div className="fallback-incubator"><span /><span /><span /></div>
      <div className="fallback-beacon"><i /><b /><em /></div>
      <div
        className={`fallback-creature ${runState}`}
        style={{ left: `${creatureLeft}%`, transform: `translate(-50%, -50%) scale(${creatureScale})` }}
      >
        {Array.from({ length: genes.limbs }, (_, limb) => (
          <div
            className="fallback-limb"
            key={limb}
            style={{ "--limb-angle": `${(limb / genes.limbs) * 360}deg`, "--limb-length": `${36 + genes.segments * 12}px` } as React.CSSProperties}
          >
            {Array.from({ length: genes.segments }, (_, segment) => <i key={segment} />)}
          </div>
        ))}
        <div className="fallback-core"><span /></div>
      </div>
      <div className="fallback-dust">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>
      <div className="webgl-note">MODO DE COMPATIBILIDADE VISUAL</div>
    </div>
  );
}

function GeneSlider({
  label,
  gene,
  value,
  min,
  max,
  step,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  gene: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <label className={`gene-control ${disabled ? "is-disabled" : ""}`}>
      <span className="gene-topline">
        <span>
          <small>{gene}</small>
          <strong>{label}</strong>
        </span>
        <output>{Number.isInteger(step) ? value : value.toFixed(1)}{suffix}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        style={{ "--range-progress": `${percent}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="range-labels"><span>{min}{suffix}</span><span>{max}{suffix}</span></span>
    </label>
  );
}

function Metric({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="metric">
      <div className="metric-label"><span>{icon}</span>{label}<strong>{value}%</strong></div>
      <div className="metric-track"><i style={{ width: `${value}%`, background: color, boxShadow: `0 0 14px ${color}` }} /></div>
    </div>
  );
}

export default function Home() {
  const [genes, setGenes] = useState<Genes>(INITIAL_GENES);
  const [runState, setRunState] = useState<RunState>("design");
  const [incubation, setIncubation] = useState(100);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const metrics = useMemo(() => metricsFor(genes), [genes]);
  const controlsLocked = ["incubating", "testing", "paused"].includes(runState);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) || canvas.getContext("webgl");
        setWebglSupported(Boolean(context));
      } catch {
        setWebglSupported(false);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateGene = <K extends keyof Genes>(key: K, value: Genes[K]) => {
    setGenes((current) => ({ ...current, [key]: value }));
    setRunState("design");
    setProgress(0);
    setDiscovery(false);
    playTone("click", muted);
  };

  useEffect(() => {
    if (runState !== "incubating") return;
    const timer = window.setInterval(() => {
      setIncubation((current) => {
        const next = Math.min(100, current + 4);
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => setRunState("ready"), 180);
        }
        return next;
      });
    }, 70);
    return () => window.clearInterval(timer);
  }, [runState]);

  useEffect(() => {
    if (runState !== "testing") return;
    const scoreSpeed = 0.72 + metrics.mobility / 110;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + scoreSpeed;
        const willFail = metrics.stability < 37 || metrics.energy < 24;
        if (willFail && next >= 62) {
          window.clearInterval(timer);
          window.setTimeout(() => setRunState("failed"), 0);
          return 62;
        }
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setRunState("success");
            setDiscovery(true);
            playTone("success", muted);
          }, 0);
          return 100;
        }
        return next;
      });
    }, 60);
    return () => window.clearInterval(timer);
  }, [runState, metrics.mobility, metrics.stability, metrics.energy, muted]);

  const incubate = () => {
    setProgress(0);
    setDiscovery(false);
    setIncubation(0);
    setRunState("incubating");
    playTone("grow", muted);
  };

  const testCreature = () => {
    if (runState === "paused") {
      setRunState("testing");
      return;
    }
    setProgress(0);
    setDiscovery(false);
    setRunState("testing");
    playTone("launch", muted);
  };

  const reset = () => {
    setRunState("ready");
    setProgress(0);
    setDiscovery(false);
  };

  return (
    <main className="game-shell">
      <div className="scanlines" aria-hidden="true" />
      <header className="topbar glass-panel">
        <div className="brand-lockup">
          <span className="brand-mark"><Atom size={21} strokeWidth={1.7} /></span>
          <div><strong>GENESIS ENGINE</strong><small>PROTOCOLO DE RECONSTRUÇÃO // 01</small></div>
        </div>
        <div className="top-status">
          <span className="online-dot" /> SISTEMA OPERACIONAL
          <span className="divider" />
          <button className="icon-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Ativar som" : "Desativar som"}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </header>

      <section className="canvas-wrap" aria-label="Câmara de incubação tridimensional">
        {webglSupported ? (
          <Canvas shadows dpr={[1, 1.65]} camera={{ position: [8.7, 5.8, 10.8], fov: 39 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
            <Suspense fallback={null}>
              <Scene genes={genes} runState={runState} progress={progress} incubation={incubation} />
            </Suspense>
          </Canvas>
        ) : (
          <FallbackScene genes={genes} runState={runState} progress={progress} incubation={incubation} />
        )}
        <div className="viewport-label viewport-left"><ScanLine size={14} /> CÂMARA A-01</div>
        <div className="viewport-label viewport-right">ARRASTE PARA ORBITAR · SCROLL PARA ZOOM</div>
        <div className="crosshair" aria-hidden="true"><span /><span /></div>
        <div className={`run-banner ${runState}`}>
          {runState === "incubating" && <><span>INCUBANDO</span><strong>{incubation}%</strong></>}
          {runState === "testing" && <><span>TESTE EM CURSO</span><strong>{Math.round(progress)}%</strong></>}
          {runState === "paused" && <><span>SIMULAÇÃO PAUSADA</span><strong>{Math.round(progress)}%</strong></>}
          {runState === "success" && <><span>CONTATO ESTABELECIDO</span><strong>ÊXITO</strong></>}
          {runState === "failed" && <><span>INSTABILIDADE CRÍTICA</span><strong>FALHA</strong></>}
        </div>
      </section>

      <aside className="gene-panel glass-panel">
        <div className="panel-heading">
          <span className="section-number">01</span>
          <div><small>SEQUÊNCIA ATIVA</small><h1>Arquitetura corporal</h1></div>
          <Dna size={21} />
        </div>
        <p className="panel-copy">Modifique as leis de crescimento. A forma final é sintetizada em tempo real.</p>
        <div className="gene-list">
          <GeneSlider label="Membros radiais" gene="RAD-01" value={genes.limbs} min={3} max={10} step={1} disabled={controlsLocked} onChange={(value) => updateGene("limbs", value)} />
          <GeneSlider label="Segmentação" gene="SEG-02" value={genes.segments} min={1} max={5} step={1} disabled={controlsLocked} onChange={(value) => updateGene("segments", value)} />
          <GeneSlider label="Abertura angular" gene="ANG-07" value={genes.spread} min={25} max={80} step={1} suffix="°" disabled={controlsLocked} onChange={(value) => updateGene("spread", value)} />
          <GeneSlider label="Ritmo neural" gene="OSC-03" value={genes.rhythm} min={0.4} max={2.4} step={0.1} suffix="Hz" disabled={controlsLocked} onChange={(value) => updateGene("rhythm", value)} />
        </div>
        <button className="incubate-button" disabled={controlsLocked} onClick={incubate}>
          <SparklesIcon size={17} /> {runState === "incubating" ? "SINTETIZANDO..." : "INCUBAR NOVA FORMA"}<ChevronRight size={17} />
        </button>
      </aside>

      <aside className="analysis-panel glass-panel">
        <div className="panel-heading compact">
          <span className="section-number">02</span>
          <div><small>ANÁLISE PREDITIVA</small><h2>Viabilidade</h2></div>
          <strong className="viability">{metrics.viability}<small>%</small></strong>
        </div>
        <div className="metrics-list">
          <Metric icon={<Gauge size={13} />} label="Estabilidade" value={metrics.stability} color="#a86cff" />
          <Metric icon={<Activity size={13} />} label="Mobilidade" value={metrics.mobility} color="#61ddff" />
          <Metric icon={<Zap size={13} />} label="Reserva neural" value={metrics.energy} color="#d6a7ff" />
        </div>
        <div className="challenge-card">
          <span className="challenge-icon"><Lightbulb size={18} /></span>
          <div><small>OBJETIVO DE TESTE</small><strong>Alcançar a fonte lumínica</strong><p>Distância: 6,8 m · Piso estável</p></div>
        </div>
        <div className={`discovery-card ${discovery ? "revealed" : ""}`}>
          <span><Atom size={18} /></span>
          <div><small>FENÔMENO DESCOBERTO</small><strong>Locomoção radial sincronizada</strong></div>
        </div>
      </aside>

      <footer className="control-deck glass-panel">
        <div className="specimen-id"><span>ESPÉCIME</span><strong>GN-01 / AMETHYST</strong></div>
        <div className="progress-rail"><i style={{ width: `${progress}%` }} /><span style={{ left: `${progress}%` }} /></div>
        <div className="deck-actions">
          {runState === "testing" ? (
            <button className="secondary-button" onClick={() => setRunState("paused")}><Pause size={16} /> PAUSAR</button>
          ) : runState === "paused" ? (
            <button className="secondary-button" onClick={testCreature}><Play size={16} /> CONTINUAR</button>
          ) : (
            <button className="secondary-button" onClick={reset} disabled={runState === "incubating"}><RotateCcw size={16} /> REINICIAR</button>
          )}
          <button className="test-button" onClick={testCreature} disabled={runState === "incubating" || runState === "testing"}>
            <Play size={16} fill="currentColor" /> INICIAR TESTE
          </button>
        </div>
      </footer>
    </main>
  );
}
