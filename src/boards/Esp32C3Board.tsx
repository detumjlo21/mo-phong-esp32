import { Text } from '@react-three/drei';
import { C3_PINS, PITCH, HEADER_Z, type C3Pin } from './esp32c3-devkitm1.pins';

// Kích thước hình học (đơn vị cảnh 3D). Tỉ lệ khoảng cách hàng/bước chân đúng thực tế;
// chiều dài/rộng tổng thể là xấp xỉ — đối chiếu file DIMENSION của Espressif trước khi phát hành.
const L = 2.6, W = 1.5, T = 0.12;
const TOP = T / 2;
const GOLD = '#d4ac65';
const ACCENT = '#55ccff';

type Props = {
  selectedPin: string | null;
  onPin: (id: string) => void;
  selected?: boolean;
  powerOn?: boolean;                       // đèn 5V
  rgb?: [number, number, number] | null;   // LED RGB trên GPIO8, 0–1
  showLabels?: boolean;
};

const pinColor = (p: C3Pin) =>
  p.kind === 'gnd' ? '#4a4f57' : p.kind === '3v3' ? '#e8913a' : p.kind === '5v' ? '#d9453b' : p.kind === 'reset' ? '#8e6bd1' : GOLD;

export default function Esp32C3Board({ selectedPin, onPin, selected, powerOn, rgb, showLabels = true }: Props) {
  const rgbColor = rgb ? `rgb(${rgb.map(v => Math.round(v * 255)).join(',')})` : '#e9edf0';
  return (
    <group>
      {/* PCB */}
      <mesh castShadow receiveShadow><boxGeometry args={[L, T, W]} /><meshStandardMaterial color="#10161d" roughness={0.45} metalness={0.2} /></mesh>

      {/* PCB edge / printed traces / mounting vias: visual-only, not PCB fabrication data */}
      {[-0.67,0.67].flatMap(z=>[-1.09,-0.72,0.05,0.87].map(x=>(
        <mesh key={`via-${x}-${z}`} position={[x,TOP+0.003,z]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[0.027,0.046,18]}/><meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.28}/>
        </mesh>
      )))}
      {[-0.14,0,0.14].map((z,i)=>(
        <mesh key={`trace-${i}`} position={[-0.36,TOP+0.003,z]}>
          <boxGeometry args={[0.25,0.006,0.008]}/><meshBasicMaterial color="#447b8d"/>
        </mesh>
      ))}
      {/* Module ESP32-C3-MINI-1: vỏ che + vùng ăng-ten PCB */}
      <mesh position={[0.5, TOP + 0.05, 0]} castShadow><boxGeometry args={[0.95, 0.1, 0.72]} /><meshStandardMaterial color="#c9d0d8" metalness={0.9} roughness={0.28} /></mesh>
      <Text position={[0.5, TOP + 0.105, 0.05]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.075} color="#2b3640">ESP32-C3-MINI-1</Text>
      {[-0.26, -0.13, 0, 0.13, 0.26].map((z, i) => (
        <mesh key={i} position={[1.12 + (i % 2) * 0.08, TOP + 0.004, z]}><boxGeometry args={[0.18, 0.006, 0.035]} /><meshStandardMaterial color={GOLD} metalness={0.6} /></mesh>
      ))}

      {/* Cổng Micro-USB */}
      <mesh position={[-L / 2 + 0.12, TOP + 0.07, 0]} castShadow><boxGeometry args={[0.36, 0.14, 0.5]} /><meshStandardMaterial color="#c3ccd4" metalness={0.9} roughness={0.25} /></mesh>
      <mesh position={[-L / 2 + 0.0, TOP + 0.07, 0]}><boxGeometry args={[0.02, 0.06, 0.34]} /><meshStandardMaterial color="#05080b" /></mesh>

      {/* USB connector shell lips */}
      {[-0.225,0.225].map(z=><mesh key={`usb-${z}`} position={[-L/2+0.01,TOP+0.075,z]}>
          <boxGeometry args={[0.14,0.11,0.026]}/><meshStandardMaterial color="#b5c6d2" metalness={0.8} roughness={0.25}/>
      </mesh>)}
      {/* Chip cầu nối USB-UART và LDO 5V→3V3 */}
      <mesh position={[-0.72, TOP + 0.02, 0]}><boxGeometry args={[0.2, 0.04, 0.2]} /><meshStandardMaterial color="#0a0c0f" roughness={0.5} /></mesh>
      <mesh position={[-0.42, TOP + 0.025, -0.12]}><boxGeometry args={[0.14, 0.05, 0.12]} /><meshStandardMaterial color="#0a0c0f" roughness={0.5} /></mesh>

      {/* Nút BOOT và RESET */}
      {[-0.3, 0.3].map((z, i) => (
        <group key={i} position={[-0.98, TOP, z]}>
          <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.22, 0.08, 0.22]} /><meshStandardMaterial color="#c6ccd2" metalness={0.8} roughness={0.3} /></mesh>
          <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.055, 0.055, 0.05, 20]} /><meshStandardMaterial color="#14181d" /></mesh>
          {showLabels && <Text position={[0.2, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.055} color="#e9eef2" anchorX="left">{i === 0 ? 'BOOT' : 'RST'}</Text>}
        </group>
      ))}

      {/* LED nguồn 5V và LED RGB (GPIO8) */}
      <mesh position={[-0.3, TOP + 0.015, 0.3]}><boxGeometry args={[0.08, 0.03, 0.05]} /><meshStandardMaterial color="#d33" emissive="#ff2222" emissiveIntensity={powerOn ? 2 : 0} /></mesh>
      <mesh position={[0.02, TOP + 0.02, 0.3]}><boxGeometry args={[0.12, 0.04, 0.12]} /><meshStandardMaterial color="#f2f4f5" emissive={rgbColor} emissiveIntensity={rgb ? 2.2 : 0} /></mesh>

      {/* Additional SMD details and high-contrast ink on PCB */}
      {Array.from({length:13},(_,i)=>(
        <mesh key={`smd-${i}`} position={[-0.64+(i%5)*0.12,TOP+0.012,-0.38+Math.floor(i/5)*0.12]} castShadow>
          <boxGeometry args={[0.06,0.022,0.036]}/>
          <meshStandardMaterial color={i%4===0?'#aeb6c1':'#252c37'} roughness={0.47} metalness={0.2}/>
        </mesh>
      ))}
      <Text position={[-0.35,TOP+0.005,-0.55]} rotation={[-Math.PI/2,0,0]} fontSize={0.054} color="#f0f7ff" anchorX="center">DKV CIRCUIT LAB</Text>
      {/* Hai hàng header J1 / J3 */}
      {(['J1', 'J3'] as const).map(h => (
        <mesh key={h} position={[-0.95 + 7 * PITCH, TOP + 0.045, HEADER_Z[h]]} castShadow>
          <boxGeometry args={[15 * PITCH, 0.09, 0.14]} /><meshStandardMaterial color="#0b0d10" roughness={0.6} />
        </mesh>
      ))}
      {C3_PINS.map(p => {
        const sel = p.id === selectedPin;
        return (
          <group key={p.id} position={[p.x, 0, p.z]}>
            {/* chân kim loại phía dưới (cắm xuống breadboard) và đầu chân phía trên */}
            <mesh position={[0, -0.2, 0]}><boxGeometry args={[0.03, 0.28, 0.03]} /><meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.25} /></mesh>
            <mesh position={[0, TOP + 0.1, 0]} userData={{ pin: true }} onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onPin(p.id); }}>
              <cylinderGeometry args={[0.062, 0.062, 0.03, 16]} />
              <meshStandardMaterial color={sel ? ACCENT : pinColor(p)} metalness={0.65} roughness={0.25} emissive={sel ? '#eab431' : '#000'} emissiveIntensity={sel ? 1 : 0} />
            </mesh>
            {showLabels && (
              <Text position={[0, TOP + 0.002, p.header === 'J1' ? 0.2 : -0.2]} rotation={[-Math.PI / 2, 0, p.header === 'J1' ? Math.PI / 2 : -Math.PI / 2]}
                fontSize={0.06} color={p.strapping ? '#ffd27a' : '#e9eef2'} anchorX="center">{p.label}</Text>
            )}
          </group>
        );
      })}

      <Text position={[0.45, TOP + 0.002, -0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.09} color="#e9eef2" anchorX="center">ESP32-C3-DevKitM-1</Text>

      {selected && (
        <mesh position={[0, -T / 2 - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[L * 0.56, L * 0.59, 64]} /><meshBasicMaterial color="#38c7fa" toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
