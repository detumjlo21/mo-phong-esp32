import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Box, CircuitBoard, Download, FileUp, FolderOpen, Home, Info, Menu, Play, RotateCcw, Save, Search, Settings2, Trash2, Unplug, X, Zap, ZoomIn } from 'lucide-react';

type Kind = 'esp32'|'breadboard'|'led'|'resistor'|'potentiometer'|'button';
type Part = { id:string; kind:Kind; x:number; z:number };
type Wire = { from:string; to:string };
type Project = { parts:Part[]; wires:Wire[]; gpioHigh:boolean; title:string };
type Tab = 'overview'|'pins'|'code';
type Section = 'workspace'|'parts';
const KEY='dkv-circuit-lab-v02'; // Tương thích dự án đã lưu từ các bản trước
const CATALOG: Record<Kind,{name:string;subtitle:string;icon:string}> = {
 esp32:{name:'ESP32-C3',subtitle:'Vi điều khiển',icon:'▣'},breadboard:{name:'Breadboard',subtitle:'Bảng cắm thử',icon:'▤'},led:{name:'LED đỏ',subtitle:'Đèn phát sáng',icon:'●'},resistor:{name:'Điện trở 220Ω',subtitle:'Giới hạn dòng',icon:'▰'},potentiometer:{name:'Biến trở 10kΩ',subtitle:'Điều chỉnh analog',icon:'◉'},button:{name:'Nút nhấn',subtitle:'Đóng/ngắt mạch',icon:'▢'}
};
const PIN_DEF: Record<Kind,{name:string;x:number;z:number}[]> = {
 esp32:[{name:'GPIO2',x:-.75,z:.53},{name:'GPIO4',x:-.30,z:.53},{name:'3V3',x:.25,z:.53},{name:'GND',x:.77,z:.53}],
 breadboard:[{name:'A1',x:-.75,z:.47},{name:'A2',x:-.25,z:.47},{name:'B1',x:.25,z:.47},{name:'B2',x:.75,z:.47}],
 led:[{name:'A',x:-.30,z:.39},{name:'K',x:.30,z:.39}],resistor:[{name:'1',x:-.53,z:.32},{name:'2',x:.53,z:.32}],
 potentiometer:[{name:'VCC',x:-.58,z:.40},{name:'SIG',x:0,z:.40},{name:'GND',x:.58,z:.40}],button:[{name:'1',x:-.38,z:.38},{name:'2',x:.38,z:.38}]
};
const starter:Project={title:'Mạch LED mẫu',parts:[{id:'esp1',kind:'esp32',x:-2.7,z:-.25},{id:'bread1',kind:'breadboard',x:1.6,z:-.25},{id:'r1',kind:'resistor',x:1.05,z:-.1},{id:'led1',kind:'led',x:2.15,z:-.1}],wires:[{from:'esp1:GPIO2',to:'r1:1'},{from:'r1:2',to:'led1:A'},{from:'led1:K',to:'esp1:GND'}],gpioHigh:false};
const empty:Project={title:'Mạch mới',parts:[],wires:[],gpioHigh:false};
// Visual collision and mounting rules. These are not electrical netlist rules.
function overlaps(a:Part,b:Part,pad=0){
 const width=(k:Kind)=>k==='breadboard'?3.25:k==='esp32'?2.18:k==='resistor'?1.38:1.15;
 const depth=(k:Kind)=>k==='breadboard'?1.75:k==='esp32'?1.24:.82;
 return Math.abs(a.x-b.x)<(width(a.kind)+width(b.kind))/2+pad && Math.abs(a.z-b.z)<(depth(a.kind)+depth(b.kind))/2+pad;
}
function isOnBreadboard(part:Part,parts:Part[]){
 if(part.kind==='breadboard'||part.kind==='esp32')return false;
 return parts.some(b=>b.kind==='breadboard' && Math.abs(part.x-b.x)<1.42 && Math.abs(part.z-b.z)<.62);
}
function componentHeight(part:Part,parts:Part[]){return isOnBreadboard(part,parts)?.36:.17;}
function fixBoardCollision(project:Project):Project{
 const parts=project.parts.map(p=>({...p}));
 for(const board of parts.filter(p=>p.kind==='breadboard')){
   for(const esp of parts.filter(p=>p.kind==='esp32')){
     if(overlaps(board,esp,.12)){
       const dx=esp.x-board.x;
       const desired=(3.25+2.18)/2+.28;
       esp.x=board.x+(dx<=0?-desired:desired);
     }
   }
 }
 return {...project,parts};
}
function validProject(data:unknown): data is Project {if(!data||typeof data!=='object')return false;const p=data as Project;return Array.isArray(p.parts)&&Array.isArray(p.wires)&&typeof p.gpioHigh==='boolean'&&p.parts.length<150&&p.wires.length<500&&p.parts.every(v=>typeof v.id==='string'&&v.id.length<100&&v.kind in CATALOG&&Number.isFinite(v.x)&&Number.isFinite(v.z))&&p.wires.every(w=>typeof w.from==='string'&&typeof w.to==='string');}
function findPower(project:Project){const links=new Map<string,Set<string>>();const add=(a:string,b:string)=>{if(!links.has(a))links.set(a,new Set());if(!links.has(b))links.set(b,new Set());links.get(a)!.add(b);links.get(b)!.add(a)};for(const w of project.wires)add(w.from,w.to);for(const p of project.parts){if(p.kind==='resistor')add(`${p.id}:1`,`${p.id}:2`);}const reachable=(a:string,b:string)=>{const todo=[a],seen=new Set<string>();while(todo.length){const cur=todo.pop()!;if(cur===b)return true;if(seen.has(cur))continue;seen.add(cur);for(const v of links.get(cur)||[])todo.push(v)}return false};const esp=project.parts.find(p=>p.kind==='esp32');const leds=project.parts.filter(p=>p.kind==='led');const active=new Set<string>();if(esp&&project.gpioHigh){for(const led of leds){if(reachable(`${esp.id}:GPIO2`,`${led.id}:A`)&&reachable(`${led.id}:K`,`${esp.id}:GND`))active.add(led.id)}}return active;}
// 3D objects represent functional connector points, not a certified electrical CAD footprint.
function Part3D({part,selectedPin,onPin,lit,selected,baseY}:{part:Part;selectedPin:string|null;onPin:(v:string)=>void;lit:boolean;selected:boolean;baseY:number}){
 const kind=part.kind;
 const w=kind==='breadboard'?3.25:kind==='esp32'?2.18:kind==='resistor'?1.38:1.15;
 const d=kind==='breadboard'?1.75:kind==='esp32'?1.24:.82;
 const pinMaterial='#d4ac65';
 return <group position={[part.x,baseY,part.z]}>
  {/* Component-specific detailed procedural 3D geometry. */}
  {kind==='esp32'&&<>
    <mesh castShadow receiveShadow><boxGeometry args={[w,.18,d]}/><meshStandardMaterial color="#0b3153" metalness={.25} roughness={.34}/></mesh>
    <mesh position={[.18,.135,-.16]} castShadow><boxGeometry args={[.72,.13,.66]}/><meshStandardMaterial color="#cbd3de" metalness={.84} roughness={.26}/></mesh>
    <mesh position={[-.62,.135,.04]} castShadow><boxGeometry args={[.48,.12,.4]}/><meshStandardMaterial color="#161c29" metalness={.2}/></mesh>
    <mesh position={[-.98,.015,0]}><boxGeometry args={[.19,.15,.37]}/><meshStandardMaterial color="#c6d8e0" metalness={.8}/></mesh>
    {Array.from({length:9},(_,i)=><group key={i}>
      {[-1,1].map(side=><mesh key={side} position={[-.88+i*.22,.05,side*.56]}><boxGeometry args={[.105,.115,.095]}/><meshStandardMaterial color="#d8b566" metalness={.65}/></mesh>)}
    </group>)}
    {Array.from({length:5},(_,i)=><mesh key={i} position={[-.07+i*.085,.215,-.12]} rotation={[0,0,0]}><boxGeometry args={[.025,.008,.36]}/><meshStandardMaterial color="#607988"/></mesh>)}
    {/* Female header rails + connector openings for recognizable development-board silhouette. */}
    {[-.53,.53].map(side=><group key={`header-${side}`}>
      <mesh position={[0,.135,side]}><boxGeometry args={[2.02,.19,.17]}/><meshStandardMaterial color="#111925" roughness={.55}/></mesh>
      {Array.from({length:10},(_,i)=><mesh key={i} position={[-.87+i*.19,.238,side]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[.045,12]}/><meshBasicMaterial color="#354959"/>
      </mesh>)}
    </group>)}
    <mesh position={[-1.098,.07,0]}><boxGeometry args={[.105,.04,.29]}/><meshStandardMaterial color="#708a9b" metalness={.85}/></mesh>
    {Array.from({length:8},(_,i)=><mesh key={`chip-leg-${i}`} position={[-.62+i*.053,.21,.06]}>
       <boxGeometry args={[.018,.01,.09]}/><meshStandardMaterial color="#bfc8d4" metalness={.75}/>
    </mesh>)}
    {/* Realistic silkscreen and PCB details: these are visual, not exact pin footprints. */}
    <Text position={[-.15,.101,.36]} rotation={[-Math.PI/2,0,0]} fontSize={.14} color="#f0fff5" anchorX="center">ESP32-C3</Text>
    <Text position={[.2,.217,-.17]} rotation={[-Math.PI/2,0,0]} fontSize={.09} color="#314a56" anchorX="center">ESPRESSIF</Text>
    <Text position={[-.79,.103,-.31]} rotation={[-Math.PI/2,0,0]} fontSize={.065} color="#e8f7ed">PWR</Text>
    {Array.from({length:8},(_,i)=><group key={`silk-${i}`}>
      <Text position={[-.78+i*.215,.103,.43]} rotation={[-Math.PI/2,0,0]} fontSize={.068} color="#d5f8e3" anchorX="center">{['0','1','2','3','4','5','3V3','G'][i]}</Text>
      <mesh position={[-.79+i*.22,.101,-.52]}><boxGeometry args={[.08,.004,.035]}/><meshBasicMaterial color="#d0dfdb"/></mesh>
    </group>)}
    {[[-.48,-.25],[-.48,.12],[.65,.32]].map(([x,z],i)=><mesh key={`smd-${i}`} position={[x,.109,z]}><boxGeometry args={[.10,.04,.07]}/><meshStandardMaterial color="#1d2932"/></mesh>)}
    {[-.86,.86].map(x=>[-.45,.45].map(z=><mesh key={`${x}-${z}`} position={[x,.105,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.035,.052,16]}/><meshBasicMaterial color="#c4a85d" side={THREE.DoubleSide}/></mesh>))}
    <mesh position={[-.76,.13,-.33]}><sphereGeometry args={[.065,12,12]}/><meshStandardMaterial color="#10d5fc" emissive="#10d5fc" emissiveIntensity={.65}/></mesh>
  </>}
  {kind==='breadboard'&&<>
    <mesh castShadow receiveShadow><boxGeometry args={[w,.19,d]}/><meshStandardMaterial color="#e8edf2" roughness={.8}/></mesh>
    <mesh position={[0,.103,0]}><boxGeometry args={[w-.13,.013,.28]}/><meshStandardMaterial color="#cfd5de"/></mesh>
    {Array.from({length:140},(_,i)=>{const column=i%20,row=Math.floor(i/20);const z=(-.7+row*.23)+(row>2?.12:0);return <mesh key={i} position={[-1.44+column*.151,.106,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.023,.038,10]}/><meshBasicMaterial color="#65727f" side={THREE.DoubleSide}/></mesh>})}
    {[-.79,.79].map((z,i)=><group key={i}><mesh position={[0,.111,z]}><boxGeometry args={[3,.013,.018]}/><meshBasicMaterial color={i===0?'#df6e69':'#4675b8'}/></mesh></group>)}
    <mesh position={[0,.112,-.06]}><boxGeometry args={[3.05,.008,.065]}/><meshStandardMaterial color="#b8c1c9"/></mesh>
    {[-.83,.83].map(z=>Array.from({length:20},(_,i)=><mesh key={`${z}-${i}`} position={[-1.44+i*.151,.116,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.022,.036,10]}/><meshBasicMaterial color="#65727f" side={THREE.DoubleSide}/></mesh>))}
    {Array.from({length:20},(_,i)=><Text key={`col-${i}`} position={[-1.44+i*.151,.114,.61]} rotation={[-Math.PI/2,0,0]} fontSize={.07} color="#6b7c89" anchorX="center">{i+1}</Text>)}
    <Text position={[0,.115,-.79]} rotation={[-Math.PI/2,0,0]} fontSize={.085} color="#c44951">+ POWER</Text>
    <Text position={[0,.115,.84]} rotation={[-Math.PI/2,0,0]} fontSize={.085} color="#3978a9">- GND</Text>
    {[[-1.5,-.7],[1.5,-.7],[-1.5,.7],[1.5,.7]].map(([x,z],i)=><mesh key={i} position={[x,.112,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.065,.085,16]}/><meshBasicMaterial color="#a2acb8"/></mesh>)}
  </>}
  {kind==='led'&&<>
    <mesh position={[0,.05,0]} castShadow><cylinderGeometry args={[.34,.34,.12,32]}/><meshStandardMaterial color="#253e51" metalness={.25}/></mesh>
    <mesh position={[0,.28,0]} castShadow><sphereGeometry args={[.29,32,20,0,Math.PI*2,0,Math.PI/1.65]}/><meshPhysicalMaterial color={lit?'#ff303b':'#d73043'} transparent opacity={.88} roughness={.18} transmission={.08} emissive={lit?'#ff2134':'#340309'} emissiveIntensity={lit?2.6:.15}/></mesh>
    {[ -.18,.18].map((x,i)=><mesh key={i} position={[x,-.075,.12]}><cylinderGeometry args={[.021,.021,.35,8]}/><meshStandardMaterial color={pinMaterial} metalness={.7}/></mesh>)}
    {lit&&<pointLight color="#ff4559" intensity={.65} distance={2.5}/>}
  </>}
  {kind==='resistor'&&<>
    <mesh position={[0,.075,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.155,.155,.72,20]}/><meshStandardMaterial color="#dfc4a2" roughness={.55}/></mesh>
    {[-.52,.52].map(x=><mesh key={x} position={[x,.074,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.022,.022,.47,10]}/><meshStandardMaterial color="#b5bfc8" metalness={.8}/></mesh>)}
    {[-.23,-.07,.1,.25].map((x,i)=><mesh key={i} position={[x,.075,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.159,.159,.045,24]}/><meshStandardMaterial color={['#e94e2d','#d12f39','#473d31','#cfb44e'][i]}/></mesh>)}
  </>}
  {kind==='potentiometer'&&<>
    <mesh castShadow><boxGeometry args={[.95,.22,.72]}/><meshStandardMaterial color="#126caa" roughness={.48}/></mesh>
    <mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.31,.31,.35,32]}/><meshStandardMaterial color="#bdcbd5" metalness={.75} roughness={.25}/></mesh>
    <mesh position={[0,.51,0]} rotation={[0,Math.PI/7,0]}><boxGeometry args={[.55,.035,.065]}/><meshStandardMaterial color="#30495a"/></mesh>
    {[-.31,0,.31].map(x=><mesh key={x} position={[x,-.08,.43]}><boxGeometry args={[.07,.08,.35]}/><meshStandardMaterial color={pinMaterial}/></mesh>)}
  </>}
  {kind==='button'&&<>
    <mesh castShadow><boxGeometry args={[.96,.21,.73]}/><meshStandardMaterial color="#1c2d45" roughness={.65}/></mesh>
    <mesh position={[0,.21,0]} castShadow><cylinderGeometry args={[.23,.23,.22,24]}/><meshStandardMaterial color="#7fa1bd" metalness={.3}/></mesh>
    {[-.31,.31].map(x=><mesh key={x} position={[x,-.055,.33]}><boxGeometry args={[.09,.11,.26]}/><meshStandardMaterial color={pinMaterial}/></mesh>)}
  </>}
  <Text position={[0,.19,-d/2+.11]} rotation={[-Math.PI/2,0,0]} fontSize={kind==='esp32'?.155:.115} color={kind==='breadboard'?'#274456':'#effaff'} anchorX="center">{CATALOG[kind].name}</Text>
  {PIN_DEF[kind].map(pin=>{const id=`${part.id}:${pin.name}`;return <group key={id} position={[pin.x,.22,pin.z]}>
    <mesh userData={{pin:true}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onPin(id)}}>
      <cylinderGeometry args={[.072,.072,.072,16]}/>
      <meshStandardMaterial color={id===selectedPin?'#ffe08a':'#cfa966'} metalness={.65} roughness={.25} emissive={id===selectedPin?'#eab431':'#063e4e'} emissiveIntensity={id===selectedPin?1:.1}/>
    </mesh>
    {(selected||id===selectedPin)&&<Html center position={[0,.28,0]} style={{pointerEvents:'none'}}><span className="pin-label">{pin.name}</span></Html>}
  </group>})}
  {selected&&<mesh position={[0,-.035,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[Math.max(w,d)*.58,Math.max(w,d)*.61,64]}/><meshBasicMaterial color="#38c7fa" toneMapped={false}/></mesh>}
 </group>;
}
function Wire3D({a,b,index,onDelete}:{a:[number,number,number];b:[number,number,number];index:number;onDelete:(n:number)=>void}){
 const geometry=useMemo(()=>{const height=.75+Math.min(1,Math.hypot(a[0]-b[0],a[2]-b[2])*.16);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(...a),new THREE.Vector3(a[0],height,a[2]),new THREE.Vector3(b[0],height,b[2]),new THREE.Vector3(...b)],false,'centripetal');return new THREE.TubeGeometry(curve,52,.025,9,false)},[a,b]);
 const color=['#176ed2','#1d293d','#f49b36','#33b5ae'][index%4];
 return <group onClick={e=>{e.stopPropagation();onDelete(index)}}>
   <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={.36} metalness={.08}/></mesh>
   {[a,b].map((pt,i)=><group key={i} position={pt}>
      <mesh position={[0,.055,0]}><cylinderGeometry args={[.09,.09,.18,16]}/><meshStandardMaterial color={color} roughness={.3}/></mesh>
      <mesh position={[0,.16,0]}><cylinderGeometry args={[.052,.052,.10,12]}/><meshStandardMaterial color="#aebec7" metalness={.8}/></mesh>
   </group>)}
 </group>;
}
function Scene({project,onPin,selectedPin,onMove,onSelect,selectedPart,onDeleteWire,cameraMode}:{project:Project;onPin:(id:string)=>void;selectedPin:string|null;onMove:(id:string,x:number,z:number)=>void;onSelect:(id:string)=>void;selectedPart:string|null;onDeleteWire:(index:number)=>void;cameraMode:'perspective'|'top'}){
 const [drag,setDrag]=useState<string|null>(null);
 const dragRef=useRef<string|null>(null);
 const ground=useMemo(()=>new THREE.Plane(new THREE.Vector3(0,1,0),0),[]);
 const hit=useMemo(()=>new THREE.Vector3(),[]);
 const positions=useMemo(()=>{const map=new Map<string,[number,number,number]>();for(const p of project.parts)for(const pin of PIN_DEF[p.kind])map.set(`${p.id}:${pin.name}`,[p.x+pin.x,componentHeight(p,project.parts)+.22,p.z+pin.z]);return map},[project.parts]);
 const active=findPower(project);
 const move=(e:ThreeEvent<PointerEvent>)=>{if(!dragRef.current)return;const point=e.ray.intersectPlane(ground,hit);if(point)onMove(dragRef.current,Math.max(-12,Math.min(12,Math.round(point.x*10)/10)),Math.max(-12,Math.min(12,Math.round(point.z*10)/10)))};
 const release=(e:ThreeEvent<PointerEvent>)=>{
  dragRef.current=null;
  setDrag(null);
  const target=e.target as (EventTarget & {releasePointerCapture?:(pointerId:number)=>void}) | null;
  try {target?.releasePointerCapture?.(e.pointerId)} catch { /* Already released */ }
 };
 return <Canvas shadows camera={{position:cameraMode==='top'?[0,13,.01]:[6.8,7.8,10],fov:40}}>
   <color attach="background" args={['#f3f8fd']}/><ambientLight intensity={1.65}/><hemisphereLight args={['#ffffff','#c0d9e8',1.25]}/><directionalLight position={[5,11,7]} intensity={2.35} castShadow shadow-mapSize={[2048,2048]}/><directionalLight position={[-8,5,-5]} intensity={.9} color="#6acaff"/>
   {/* No grid: matte presentation surface without the checkerboard texture. */}
   <mesh position={[0,-.085,0]} receiveShadow><boxGeometry args={[17,.14,11]}/><meshStandardMaterial color="#e9f2fa" roughness={.88} metalness={.06}/></mesh>
   <mesh position={[0,-.006,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[16.9,10.9]}/><meshBasicMaterial color="#d6e8f6" transparent opacity={.10}/></mesh>
   <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]}><planeGeometry args={[100,100]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
   {project.parts.map(p=><group key={p.id} onPointerDown={e=>{if((e.object.userData as {pin?:boolean}).pin||e.button!==0)return;e.stopPropagation();dragRef.current=p.id;setDrag(p.id);onSelect(p.id);(e.target as (EventTarget & {setPointerCapture?:(pointerId:number)=>void}) | null)?.setPointerCapture?.(e.pointerId)}} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onClick={e=>{if((e.object.userData as {pin?:boolean}).pin)return;e.stopPropagation();onSelect(p.id)}}>
    <Part3D part={p} baseY={componentHeight(p,project.parts)} selectedPin={selectedPin} onPin={onPin} selected={selectedPart===p.id} lit={active.has(p.id)}/>
   </group>)}
   {project.wires.map((w,i)=>{const a=positions.get(w.from),b=positions.get(w.to);return a&&b?<Wire3D key={`${w.from}-${w.to}-${i}`} a={a} b={b} index={i} onDelete={onDeleteWire}/>:null})}
   <OrbitControls makeDefault enabled={!drag} minDistance={3} maxDistance={26} maxPolarAngle={Math.PI/2.03} enableDamping dampingFactor={.08}/>
 </Canvas>;
}
export default function App(){
 const [project,setProject]=useState<Project>(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw) as unknown;if(validProject(p))return fixBoardCollision(p)}}catch{}return fixBoardCollision(starter)});
 const [selectedPin,setSelectedPin]=useState<string|null>(null);const [selectedPart,setSelectedPart]=useState<string|null>(null);const [section,setSection]=useState<Section>('workspace');const [tab,setTab]=useState<Tab>('pins');const [search,setSearch]=useState('');const [message,setMessage]=useState('Nhấn một chân, sau đó nhấn chân thứ hai để nối dây.');const [running,setRunning]=useState(false);const [cameraMode,setCameraMode]=useState<'perspective'|'top'>('perspective');const [cameraRevision,setCameraRevision]=useState(0);const [code,setCode]=useState('const int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  delay(1000);\n  digitalWrite(LED, LOW);\n  delay(1000);\n}');
 const fileInput=useRef<HTMLInputElement>(null);const nextId=useRef(5);const active=findPower(project);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(project))}catch{}},[project]);
 function add(kind:Kind){
 const id=`${kind}-${nextId.current++}`;
 setProject(p=>{
  const index=p.parts.length;
  const board=p.parts.find(item=>item.kind==='breadboard');
  const ontoBoard=board && !['esp32','breadboard'].includes(kind);
  const candidate:Part={id,kind,x:ontoBoard?board.x+(index%4-1.5)*.58:(index%4)*1.8-2.7,z:ontoBoard?board.z:(2.7+Math.floor(index/4)*1.2)};
  return fixBoardCollision({...p,parts:[...p.parts,candidate]});
 });
 setSelectedPart(id);setMessage(`Đã thêm ${CATALOG[kind].name}. Nhấn Delete hoặc nút Xóa linh kiện để bỏ.`)
}
 function onPin(id:string){if(!selectedPin){setSelectedPin(id);setMessage(`Chân ${id} đã chọn. Hãy chọn chân thứ hai.`);return}if(selectedPin===id){setSelectedPin(null);return}if(selectedPin.split(':')[0]===id.split(':')[0]){setMessage('Hãy nối hai linh kiện khác nhau.');setSelectedPin(null);return}setProject(p=>{const exists=p.wires.some(w=>(w.from===selectedPin&&w.to===id)||(w.from===id&&w.to===selectedPin));return exists?p:{...p,wires:[...p.wires,{from:selectedPin,to:id}]}});setSelectedPin(null);setMessage('Đã tạo dây. Nhấn trực tiếp vào dây để xóa.')}
 function removePart(){if(!selectedPart)return;setProject(p=>({...p,parts:p.parts.filter(q=>q.id!==selectedPart),wires:p.wires.filter(w=>!w.from.startsWith(`${selectedPart}:`)&&!w.to.startsWith(`${selectedPart}:`))}));setSelectedPart(null);setMessage('Đã xóa linh kiện đã chọn.')}
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{
    if(event.key!=='Delete'&&event.key!=='Backspace')return;
    const target=event.target as HTMLElement|null;
    if(target?.closest('input, textarea, [contenteditable="true"]'))return;
    if(!selectedPart)return;
    event.preventDefault();
    setProject(p=>({...p,parts:p.parts.filter(x=>x.id!==selectedPart),wires:p.wires.filter(w=>!w.from.startsWith(`${selectedPart}:`)&&!w.to.startsWith(`${selectedPart}:`))}));
    setSelectedPart(null);setSelectedPin(null);setMessage('Đã xóa linh kiện và các dây kết nối liên quan.');
  };
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[selectedPart]);
 function reset(){setProject(empty);setSelectedPart(null);setSelectedPin(null);setRunning(false);setMessage('Đã tạo mạch trống mới.')}
 function saveFile(){const json=JSON.stringify({...project,format:'dkv-circuit-lab',version:3},null,2);const a=document.createElement('a');const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.href=url;a.download='DKV-Circuit-Lab-du-an.json';a.click();URL.revokeObjectURL(url);setMessage('Đã xuất file JSON; có thể chia sẻ mà không cần tài khoản.')}
 async function importFile(file?:File){if(!file)return;try{if(file.size>1024*1024)throw new Error('File vượt quá 1 MB.');const data:unknown=JSON.parse(await file.text());if(!validProject(data))throw new Error('Cấu trúc dự án không hợp lệ.');setProject(fixBoardCollision(data));setSelectedPart(null);setSelectedPin(null);setMessage('Đã nhập dự án thành công.')}catch(e){setMessage(e instanceof Error?e.message:'Không thể đọc file.')}}
 const catalog=(Object.keys(CATALOG) as Kind[]).filter(k=>CATALOG[k].name.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));
 const selected=project.parts.find(p=>p.id===selectedPart);const pinEntries=selected?PIN_DEF[selected.kind]:PIN_DEF.esp32;
 return <div className="shell">
  <header className="topbar"><div className="brand"><img className="brand-logo" src="/dkv-technology-logo.png?v=060" alt="DKV Technology – Đoàn Kiên Vũ"/><div><strong>DKV <span>CIRCUIT LAB</span></strong><small>3D ELECTRONICS WORKSPACE · VIỆT NAM</small></div></div><div className="top-actions"><span className="version">V0.6.1 · SELECTION FIX</span><button className="icon-button" title="Lưu dự án ra file JSON" onClick={saveFile}><Download size={18}/></button><button className="primary" onClick={()=>{setRunning(!running);setMessage(!running?'Đã bật mô phỏng GPIO. Code trong ô ví dụ chưa được biên dịch.':'Đã dừng mô phỏng.')}}>{running?<><X size={16}/> Dừng</>:<><Play size={16} fill="currentColor"/> Chạy mô phỏng</>}</button></div></header>
  <nav className="rail">
    <button className={section==='workspace'?'active':''} onClick={()=>setSection('workspace')}><Home/><span>Workspace</span></button>
    <button className={section==='parts'?'active':''} onClick={()=>setSection('parts')}><CircuitBoard/><span>Linh kiện</span></button>
    <button onClick={()=>setMessage('Nhấn hai chân để nối dây. Nhấn dây để xóa; chọn linh kiện và nhấn biểu tượng thùng rác để xóa linh kiện.')}><Settings2/><span>Công cụ</span></button>
  </nav>
  <aside className="library">
    <div className="panel-title"><span>THƯ VIỆN LINH KIỆN</span><Menu size={16}/></div>
    <div className="search"><Search size={16}/><input placeholder="Tìm linh kiện..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <p className="micro-title">THÊM VÀO WORKSPACE</p>
    <div className="catalog">{catalog.map(kind=><button key={kind} onClick={()=>add(kind)}><span className={`part-icon kind-${kind}`}>{CATALOG[kind].icon}</span><span><strong>{CATALOG[kind].name}</strong><small>{CATALOG[kind].subtitle}</small></span><span className="plus">+</span></button>)}</div>
    <div className="library-bottom"><strong><Zap size={16}/> WORKSPACE 3D</strong><p>Thêm linh kiện, kéo trên bàn 3D, chọn hai chân để nối dây. Nhấn vào dây để xóa.</p></div>
  </aside>
  <main className="workspace"><div className="workspace-heading"><div><span className="crumb">DKV / CIRCUIT EDITOR</span><h1>{project.title}</h1><p>Lắp mạch 3D · Không tài khoản · Lưu trên trình duyệt</p></div><div className="scene-counter"><Box size={17}/>{project.parts.length} linh kiện · {project.wires.length} dây</div></div><div className="canvas-wrap"><Scene key={`${cameraMode}-${cameraRevision}`} cameraMode={cameraMode} project={project} onPin={onPin} selectedPin={selectedPin} onMove={(id,x,z)=>setProject(p=>fixBoardCollision({...p,parts:p.parts.map(a=>a.id===id?{...a,x,z}:a)}))} onSelect={setSelectedPart} selectedPart={selectedPart} onDeleteWire={i=>{setProject(p=>({...p,wires:p.wires.filter((_,n)=>n!==i)}));setMessage('Đã xóa dây.')}}/><div className="canvas-hint"><ZoomIn size={15}/> Nhấn một lần để chọn · Nhả chuột vẫn giữ chọn · Thùng rác để xóa</div><div className="scene-watermark"><strong>DKV</strong> 3D CIRCUIT EDITOR <span>● VISUAL MODE</span></div><div className="scene-tools"><button title="Góc nhìn từ trên" onClick={()=>setCameraMode(v=>v==='top'?'perspective':'top')}><Box size={16}/></button><button title="Đặt lại camera" onClick={()=>setCameraRevision(v=>v+1)}><RotateCcw size={16}/></button><button title="Hủy chọn chân" onClick={()=>setSelectedPin(null)}><Unplug size={16}/></button><button title="Xóa linh kiện đã chọn" disabled={!selectedPart} onClick={removePart}><Trash2 size={16}/></button><button title="Tạo mạch mới" onClick={reset}><RotateCcw size={16}/></button></div></div><div className="notice"><Info size={16}/><span>{message}</span></div></main>
  <aside className="inspector"><div className="status-top"><div><strong>CIRCUIT WORKSPACE</strong><small>KHÔNG CẦN TÀI KHOẢN</small></div><span className="status-dot"/></div><div className="tabs"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>TỔNG QUAN</button><button className={tab==='pins'?'active':''} onClick={()=>setTab('pins')}>CHÂN</button><button className={tab==='code'?'active':''} onClick={()=>setTab('code')}>CODE</button></div>
   {selected&&<div className="selected-part-action"><span><b>Đang chọn</b><small>{CATALOG[selected.kind].name} · {selected.id}</small></span><button type="button" onClick={removePart} title="Xóa linh kiện đang chọn"><Trash2 size={15}/> Xóa linh kiện</button></div>}
   <div className="inspector-body">{tab==='pins'?<><h2>CHÂN LINH KIỆN</h2><p>{selected?CATALOG[selected.kind].name:'Chọn một linh kiện để xem chân và nút xóa.'}</p><table><thead><tr><th>CHÂN</th><th>CHỨC NĂNG</th></tr></thead><tbody>{pinEntries.map(pin=><tr key={pin.name}><td><span className="pin-dot"/>{pin.name}</td><td>{pin.name==='GND'?'Nối mass':pin.name==='3V3'?'Nguồn 3,3 V':pin.name==='GPIO2'||pin.name==='GPIO4'?'Chân GPIO':pin.name==='A'?'Cực dương':pin.name==='K'?'Cực âm':'Điểm kết nối'}</td></tr>)}</tbody></table><p className="muted">Các chân breadboard hiện chỉ là điểm nối minh họa; chưa có mô hình liên thông lỗ cắm.</p></>:tab==='overview'?<><h2>TỔNG QUAN</h2><p>Bàn lắp mạch điện tử 3D dành cho cộng đồng kỹ thuật Việt Nam. Tự chọn linh kiện và kết nối chân để thử logic mạch.</p><div className="metric"><span>Linh kiện trong mạch</span><b>{project.parts.length}</b></div><div className="metric"><span>Số dây kết nối</span><b>{project.wires.length}</b></div><div className="metric"><span>LED đang sáng</span><b>{active.size}</b></div><div className="warn">Mô phỏng logic GPIO đơn giản; chưa giải mạch điện và chưa thực thi firmware ESP32. Không dùng kết quả này để xác nhận an toàn phần cứng.</div></>:<><h2>CODE EDITOR</h2><p>Mã Arduino để tham khảo/chỉnh sửa; bản này chưa biên dịch hoặc chạy firmware ESP32.</p><textarea spellCheck={false} value={code} onChange={e=>setCode(e.target.value)}/><button className="soft" onClick={()=>setMessage('Code đã được chỉnh sửa trong trình duyệt. Chưa hỗ trợ chạy firmware.')}>Lưu bản nháp code</button></>}</div>
   <div className="inspector-bottom"><div className="control-title"><Zap size={17}/> THỬ MÔ PHỎNG GPIO</div><label className="gpio-toggle"><span>GPIO2 HIGH</span><input type="checkbox" checked={project.gpioHigh} onChange={e=>setProject(p=>({...p,gpioHigh:e.target.checked}))}/><span className="toggle-track"/></label><p className="muted">LED sáng khi nối GPIO2 → điện trở → LED(A) và LED(K) → GND, rồi bật GPIO2 HIGH.</p><div className="control-title"><FolderOpen size={17}/> DỰ ÁN CỦA BẠN</div><div className="save-actions"><button onClick={()=>{try{localStorage.setItem(KEY,JSON.stringify(project));setMessage('Đã lưu vào trình duyệt.')}catch{setMessage('Trình duyệt không cho phép lưu.')}}}><Save size={15}/> Lưu</button><button onClick={()=>fileInput.current?.click()}><FileUp size={15}/> Nhập</button><button onClick={saveFile}><Download size={15}/> Xuất</button></div><input ref={fileInput} type="file" hidden accept=".json,application/json" onChange={e=>{void importFile(e.target.files?.[0]);e.target.value=''}}/></div>
  </aside>
  <footer><span>DKV CIRCUIT LAB 3D · Bản thử nghiệm cộng đồng</span><span>Không cần đăng nhập · Mô phỏng logic · Lưu cục bộ</span></footer>
 </div>;
}
