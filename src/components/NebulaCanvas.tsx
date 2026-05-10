import { useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const MAX_GROUPS = 8;
const SETTLE_TIME = 3.0; // 引力完成时间
const ROTATE_SPEED = 0.08; // 稳定后旋转速度 rad/s

interface ParticleGroup {
  positions: Float32Array;
  velocities: Float32Array;
  targets: Float32Array;
  age: number;
  count: number;
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function createGroup(textLength: number): ParticleGroup {
  const count = Math.min(120, 60 + Math.floor(textLength / 2));
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);

  // 星系盘面倾斜角度（绕 X 轴倾斜约 20°，让相机看到立体感）
  const tilt = 0.35;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.02;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 0.15 + Math.random() * 0.6;
    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    velocities[i * 3 + 2] = Math.cos(phi) * speed;

    // 椭圆螺旋星云目标（在 XZ 平面上）
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.3 + Math.random() * 1.7;
    const lx = radius * Math.cos(angle) * 1.6;  // 盘面局部 x
    const lz = radius * Math.sin(angle) * 0.7;  // 盘面局部 z
    const thickness = (Math.random() - 0.5) * 0.4; // Y 轴厚度
    const pertX = Math.sin(angle * 3 + radius * 2) * 0.15;
    const pertZ = Math.cos(angle * 5 - radius) * 0.15;

    // 将盘面绕 X 轴倾斜，使 Z 分量进入 Y，产生立体视觉效果
    const ty = lz * cosTilt - thickness * sinTilt + pertZ * cosTilt;
    const tz = lz * sinTilt + thickness * cosTilt + pertZ * sinTilt;

    targets[i * 3] = lx + pertX;
    targets[i * 3 + 1] = ty;
    targets[i * 3 + 2] = tz;
  }

  return { positions, velocities, targets, age: 0, count };
}

function Particles({ color }: { color: string }) {
  const groupsRef = useRef<ParticleGroup[]>([]);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const emitTrigger = useStore((s) => s.emitTrigger);

  const targetColor = useRef(new THREE.Color(color));
  const displayColor = useRef(new THREE.Color(color));
  const timeAcc = useRef(0);

  const mergedPositions = useMemo(() => new Float32Array(MAX_GROUPS * 120 * 3), []);

  useEffect(() => {
    targetColor.current.set(color);
  }, [color]);

  useEffect(() => {
    if (!emitTrigger) return;
    const group = createGroup(emitTrigger.text.length);
    const groups = groupsRef.current;
    if (groups.length >= MAX_GROUPS) {
      groups.shift();
    }
    groups.push(group);
  }, [emitTrigger]);

  useFrame((_, delta) => {
    const groups = groupsRef.current;

    // 颜色平滑过渡
    displayColor.current.lerp(targetColor.current, delta * 2);
    if (matRef.current) {
      matRef.current.color.copy(displayColor.current);
      // 粒子微微脉动，模拟星光闪烁
      timeAcc.current += delta;
      const pulse = 1 + Math.sin(timeAcc.current * 1.5) * 0.08;
      matRef.current.size = 0.045 * pulse;
    }

    if (groups.length === 0) return;

    let totalCount = 0;

    for (const g of groups) {
      g.age += delta;

      const settling = g.age < SETTLE_TIME;
      const drag = Math.exp(-1.5 * delta);
      const gravityStrength = settling ? smoothstep(g.age / SETTLE_TIME) * 1.2 : 0;

      for (let i = 0; i < g.count; i++) {
        const idx = i * 3;

        g.velocities[idx] *= drag;
        g.velocities[idx + 1] *= drag;
        g.velocities[idx + 2] *= drag;

        if (settling) {
          const dx = g.targets[idx] - g.positions[idx];
          const dy = g.targets[idx + 1] - g.positions[idx + 1];
          const dz = g.targets[idx + 2] - g.positions[idx + 2];
          g.velocities[idx] += dx * gravityStrength * delta;
          g.velocities[idx + 1] += dy * gravityStrength * delta;
          g.velocities[idx + 2] += dz * gravityStrength * delta;
        }

        g.positions[idx] += g.velocities[idx] * delta;
        g.positions[idx + 1] += g.velocities[idx + 1] * delta;
        g.positions[idx + 2] += g.velocities[idx + 2] * delta;
      }

      // 差分旋转：模拟星系，内圈快外圈慢
      const baseSpeed = (settling ? 0.03 : ROTATE_SPEED) * delta;
      for (let i = 0; i < g.count; i++) {
        const idx = i * 3;
        const x = g.positions[idx];
        const z = g.positions[idx + 2];
        const dist = Math.sqrt(x * x + z * z) + 0.3;
        const speed = baseSpeed / (dist * 0.8);
        const cos = Math.cos(speed);
        const sin = Math.sin(speed);
        g.positions[idx] = x * cos - z * sin;
        g.positions[idx + 2] = x * sin + z * cos;
      }

      mergedPositions.set(g.positions.subarray(0, g.count * 3), totalCount * 3);
      totalCount += g.count;
    }

    const geo = geoRef.current;
    if (geo) {
      const attr = geo.getAttribute('position') as THREE.BufferAttribute;
      attr.needsUpdate = true;
      geo.setDrawRange(0, totalCount);
    }
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[mergedPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.045}
        color={color}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function NebulaCanvas() {
  const currentColor = useStore((s) => s.currentColor);

  return (
    <Canvas
      className="absolute inset-0 z-0"
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ alpha: false, antialias: true }}
    >
      <color attach="background" args={['#000000']} />
      <Particles color={currentColor} />
    </Canvas>
  );
}
