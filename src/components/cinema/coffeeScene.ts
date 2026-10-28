import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * কফি হাউসের কাপ — a cinematic WebGL homage to the Coffee House cup.
 *
 * A glossy cream-porcelain cup and saucer with a breathing liquid sheen, in a
 * light, warm room. Roasting embers spiral up around it, steam curls off the
 * crema and a few beans orbit.
 * The camera circles the cup with scroll progress and finally looks down into it.
 *
 * Everything is procedural (no model or texture downloads).
 */

// Simplex noise by Stefan Gustavson / Ashima Arts (MIT), plus a 4-octave fbm.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.5,s=0.0;for(int i=0;i<4;i++){s+=a*snoise(p);p*=2.02;a*=0.5;}return s;}
vec3 srgb(vec3 c){return pow(c,vec3(2.2));}
`;

// Shared uniforms: time and a slow breathing pulse.
type Shared = { uTime: { value: number }; uBreath: { value: number } };

const METAL_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vN;
varying vec3 vW;
void main(){
  vec3 p = position;
  // the surface breathes: a slow, very small swell along the normal
  p += normal * snoise(p * 3.0 + vec3(0.0, uTime * 0.35, 0.0)) * 0.006;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const METAL_FRAG = /* glsl */ `
uniform float uTime;
uniform float uBreath;
varying vec3 vN;
varying vec3 vW;
void main(){
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  vec3 R = reflect(-V, N);

  // One glaze everywhere: warm cream porcelain. Only light and shade vary.
  vec3 glaze = srgb(vec3(0.94, 0.82, 0.66));
  vec3 Lkey = normalize(vec3(-0.6, 0.9, 0.35));
  vec3 Lfill = normalize(vec3(0.8, 0.1, 0.6));
  float wrap = max(dot(N, Lkey) * 0.6 + 0.4, 0.0);
  float fill = max(dot(N, Lfill), 0.0);
  vec3 col = glaze * (0.32 + wrap * 0.58 + fill * 0.18);

  // liquid sheen: a soft highlight that flows over the glaze, same hue
  float flow = fbm(R * 0.8 + vec3(0.0, uTime * 0.12, 0.0));
  float sheen = smoothstep(0.55, 1.0, 0.5 + 0.5 * sin(flow * 4.0 + R.y * 2.0 - uTime * 0.3));
  col += glaze * sheen * 0.12;
  col += vec3(1.0, 0.95, 0.88) * pow(max(dot(R, Lkey), 0.0), 80.0) * 1.4;

  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += glaze * fres * (0.25 + 0.15 * uBreath);
  gl_FragColor = vec4(col, 1.0);
}`;

const COFFEE_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vW;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const COFFEE_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vW;
void main(){
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = uTime;

  // crema marbling, slowly swirled like a stirred cup
  float swirl = a + (1.0 - r) * 3.4 + t * 0.12;
  vec2 q = vec2(cos(swirl), sin(swirl)) * r;
  float n = fbm(vec3(q * 2.4, t * 0.08));
  float marble = smoothstep(-0.35, 0.45, n + 0.18 * sin(r * 14.0 - t * 0.6));
  vec3 col = mix(srgb(vec3(0.26, 0.13, 0.06)), srgb(vec3(0.78, 0.5, 0.26)), marble * 0.9);
  col = mix(col, srgb(vec3(0.92, 0.76, 0.52)) * 0.85, smoothstep(0.76, 0.98, r) * 0.7);

  // ripples catch the lamp
  float ripple = sin(r * 38.0 - t * 1.6) * 0.5;
  vec3 N = normalize(vec3(p.x * (0.12 + ripple * 0.05), 1.0, -p.y * (0.12 + ripple * 0.05)));
  vec3 V = normalize(cameraPosition - vW);
  vec3 H = normalize(normalize(vec3(-0.6, 0.9, 0.35)) + V);
  col += pow(max(dot(N, H), 0.0), 140.0) * vec3(1.0, 0.88, 0.72) * 1.2;
  col *= 1.0 - smoothstep(0.95, 1.0, r) * 0.6;
  gl_FragColor = vec4(col, 1.0);
}`;

const STEAM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const STEAM_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uFade;
varying vec2 vUv;
void main(){
  float t = uTime;
  float sway = snoise(vec3(vUv.y * 1.6 - t * 0.25, uSeed, 0.0));
  float x = vUv.x - 0.5 - sway * 0.22 * vUv.y;
  float width = mix(0.05, 0.22, vUv.y);
  float body = smoothstep(width, 0.0, abs(x));
  float wisp = fbm(vec3(vUv.x * 3.0, vUv.y * 4.0 - t * 0.5, uSeed));
  float alpha = body * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.45, vUv.y) * (0.5 + 0.5 * wisp);
  gl_FragColor = vec4(srgb(vec3(1.0, 0.97, 0.92)), alpha * 0.4 * uFade);
}`;

const EMBER_VERT = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform float uPixel;
uniform float uSize;
varying float vLife;
varying float vSeed;
void main(){
  float speed = 0.05 + aSeed.w * 0.09;
  float life = fract(uTime * speed + aSeed.x);
  float radius = 0.7 + aSeed.y * 2.5;
  float ang = aSeed.z * 6.2831 + uTime * (0.1 + 0.22 * aSeed.w) + life * 2.6;
  vec3 p = vec3(cos(ang) * radius, -0.6 + life * 4.8, sin(ang) * radius);
  p.x += snoise(vec3(p.xy * 0.6, uTime * 0.2 + aSeed.x * 10.0)) * 0.35;
  p.z += snoise(vec3(p.zy * 0.6, uTime * 0.2 + aSeed.y * 10.0)) * 0.35;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float flicker = 0.6 + 0.4 * sin(uTime * (8.0 + aSeed.y * 12.0) + aSeed.z * 40.0);
  gl_PointSize = uSize * (0.35 + aSeed.w * 0.9) * (1.0 - life * 0.65) * flicker * uPixel / -mv.z;
  vLife = life;
  vSeed = aSeed.y;
}`;

const EMBER_FRAG = /* glsl */ `
varying float vLife;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.1, d);
  // golden spark → terracotta → roasted brown as it rises and cools
  vec3 col = mix(srgb(vec3(0.98, 0.72, 0.32)), srgb(vec3(0.85, 0.42, 0.18)), smoothstep(0.0, 0.5, vLife));
  col = mix(col, srgb(vec3(0.55, 0.26, 0.12)), smoothstep(0.5, 1.0, vLife));
  float fade = smoothstep(0.0, 0.06, vLife) * smoothstep(1.0, 0.7, vLife);
  gl_FragColor = vec4(col * 1.25, core * fade * 0.85);
}`;

const BEAN_VERT = /* glsl */ `
attribute vec3 aBean;
attribute float aGroove;
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
varying float vGroove;
varying float vRoast;
void main(){
  vec4 local = vec4(position, 1.0);
  vec3 n = normal;
  vRoast = 0.5;
  #ifdef USE_INSTANCING
    local = instanceMatrix * local;
    n = mat3(instanceMatrix) * n;
    vRoast = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
  #endif
  vL = aBean;
  vGroove = aGroove;
  vec4 w = modelMatrix * local;
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const BEAN_FRAG = /* glsl */ `
varying vec3 vN;
varying vec3 vW;
varying vec3 vL;
varying float vGroove;
varying float vRoast;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  vec3 N = normalize(vN);
  // fine wrinkles of a roasted surface: bump the normal with high-frequency noise
  vec3 q = vL * 18.0;
  N = normalize(N + vec3(snoise(q), snoise(q + 17.3), snoise(q + 41.7)) * 0.05);

  // mottled roast, each bean a slightly different shade
  float mottle = fbm(vL * 2.6 + vRoast * 5.0) + 0.12 * snoise(vL * 16.0);
  vec3 roast = mix(srgb(vec3(0.33, 0.19, 0.1)), srgb(vec3(0.46, 0.27, 0.13)), vRoast);
  vec3 col = roast * (0.82 + 0.3 * smoothstep(-0.6, 0.6, mottle));
  // the ends roast a touch darker than the middle
  col *= 1.0 - smoothstep(0.55, 1.0, abs(vL.y)) * 0.3;
  // the crease: deep shadow, with a pale line of silverskin at its base
  col *= mix(1.0, 0.3, smoothstep(0.2, 0.75, vGroove));
  col = mix(col, srgb(vec3(0.74, 0.58, 0.38)), smoothstep(0.82, 0.97, vGroove) * smoothstep(-0.2, 0.4, snoise(vL * 40.0)) * 0.85);

  vec3 L = normalize(vec3(-0.6, 0.9, 0.35));
  vec3 Lfill = normalize(vec3(0.8, 0.1, 0.6));
  col *= 0.6 + max(dot(N, L), 0.0) * 0.7 + max(dot(N, Lfill), 0.0) * 0.25;
  // oily roast sheen: a tight glint over a broader soft gloss
  float spec = max(dot(reflect(-V, N), L), 0.0);
  col += srgb(vec3(1.0, 0.92, 0.8)) * (pow(spec, 40.0) * 0.4 + pow(spec, 6.0) * 0.08) * (1.0 - vGroove);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  col += srgb(vec3(0.95, 0.7, 0.42)) * fres * 0.25;
  gl_FragColor = vec4(col, 1.0);
}`;

const GROUND_VERT = COFFEE_VERT;
const GROUND_FRAG = /* glsl */ `
uniform float uBreath;
varying vec2 vUv;
void main(){
  float r = length(vUv * 2.0 - 1.0) * 8.0;
  // soft contact shadow under the saucer and a warm pool of lamplight around it
  float shadow = smoothstep(1.6, 0.5, r) * 0.42 + exp(-pow(r - 1.1, 2.0) * 3.0) * 0.12;
  float pool = exp(-r * r * 0.08) * (0.85 + 0.15 * uBreath);
  vec3 col = mix(srgb(vec3(0.98, 0.84, 0.62)), srgb(vec3(0.36, 0.2, 0.11)), clamp(shadow / 0.5, 0.0, 1.0));
  gl_FragColor = vec4(col, max(shadow, pool * 0.22) * smoothstep(7.5, 2.0, r));
}`;

const BACKDROP_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}`;

const BACKDROP_FRAG = /* glsl */ `
uniform float uTime;
uniform float uBreath;
uniform vec2 uRes;
uniform vec2 uFocus;
varying vec2 vUv;
void main(){
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.05;
  float n = fbm(vec3(p * 1.4, t));
  float smoke = smoothstep(-0.2, 0.9, fbm(vec3(p * 2.8 + n, t * 1.5 + 3.0)));
  // light cream room, drifting sandy haze, a caramel glow behind the cup
  vec3 col = mix(srgb(vec3(0.97, 0.92, 0.84)), srgb(vec3(0.9, 0.76, 0.58)), smoke * 0.35);
  vec2 c = p - uFocus;
  col = mix(col, srgb(vec3(0.8, 0.57, 0.36)), exp(-dot(c, c) * 2.6) * (0.5 + 0.08 * uBreath));
  col *= mix(0.86, 1.0, smoothstep(1.3, 0.3, length(p)));
  gl_FragColor = vec4(col, 1.0);
}`;

const prefix = (src: string) => NOISE + src;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => { const x = clamp01((v - a) / (b - a)); return x * x * (3 - 2 * x); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cup profile (radius, height) traced outer wall → rim → inner wall, for LatheGeometry. */
const CUP_PROFILE: [number, number][] = [
  [0, 0], [0.3, 0], [0.33, 0.02], [0.34, 0.06], [0.36, 0.08], [0.44, 0.18], [0.52, 0.36], [0.58, 0.58],
  [0.62, 0.8], [0.64, 0.95], [0.648, 1.0], [0.638, 1.018], [0.622, 1.0], [0.6, 0.92], [0.56, 0.7],
  [0.5, 0.45], [0.42, 0.25], [0.3, 0.14], [0, 0.12],
];
const SAUCER_PROFILE: [number, number][] = [
  [0, -0.05], [0.42, -0.05], [0.46, -0.03], [0.5, -0.02], [0.9, 0.05], [1.04, 0.11], [1.08, 0.135],
  [1.06, 0.15], [1.02, 0.13], [0.88, 0.075], [0.5, 0.02], [0, 0.02],
];
const lathe = (profile: [number, number][]) => new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 128);

/**
 * A roasted coffee bean, sculpted from a sphere: oval outline, domed back and a
 * flat face split by an S-shaped crease with slightly raised lips. `aBean` keeps
 * the undeformed coordinates for texturing; `aGroove` is 1 at the crease floor.
 */
function beanGeometry() {
  let geo: THREE.BufferGeometry = new THREE.SphereGeometry(1, 128, 96);
  geo.deleteAttribute('normal');
  geo.deleteAttribute('uv');
  geo = mergeVertices(geo);
  const pos = geo.getAttribute('position');
  const base = new Float32Array(pos.count * 3);
  const groove = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    base.set([x, y, z], i * 3);
    const face = smooth(0, 0.35, z);
    const d = x - 0.16 * Math.sin(y * 2.6);
    const g = Math.exp(-(d * d) / 0.012) * face * smooth(1, 0.82, Math.abs(y));
    const lip = Math.exp(-((Math.abs(d) - 0.17) ** 2) / 0.005) * face * 0.06;
    const flat = (z > 0 ? z * 0.4 : z) - g * 0.36 + lip;
    const wobble = 1 + 0.03 * Math.sin(y * 5 + x * 3);
    pos.setXYZ(i, x * 0.07 * wobble, y * 0.1, flat * 0.068);
    groove[i] = g;
  }
  geo.setAttribute('aBean', new THREE.BufferAttribute(base, 3));
  geo.setAttribute('aGroove', new THREE.BufferAttribute(groove, 1));
  geo.computeVertexNormals();
  return geo;
}

export type CoffeeSceneOptions = { reduced: boolean };

export class CoffeeScene {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  private shared: Shared = { uTime: { value: 0 }, uBreath: { value: 0 } };
  private sculpture = new THREE.Group();
  private steam: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
  private beans: THREE.InstancedMesh;
  private beanSeeds: { r: number; a: number; y: number; s: number; spin: THREE.Vector3; scale: number; shape: THREE.Vector3 }[] = [];
  private embers: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private backdrop: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private last = performance.now();
  private frame = 0;
  private active = true;
  private target = 0;
  private progress = 0;
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();
  private size = { w: 1, h: 1 };
  private dummy = new THREE.Object3D();
  private focus = new THREE.Vector3();
  private reduced: boolean;

  constructor(private canvas: HTMLCanvasElement, { reduced }: CoffeeSceneOptions) {
    this.reduced = reduced;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setClearColor(0xf3e4cb, 1);

    const small = Math.min(window.innerWidth, window.innerHeight) < 700;

    // Backdrop: drifting roast smoke, drawn first behind everything.
    this.backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      vertexShader: BACKDROP_VERT, fragmentShader: prefix(BACKDROP_FRAG),
      uniforms: { ...this.shared, uRes: { value: new THREE.Vector2(1, 1) }, uFocus: { value: new THREE.Vector2() } }, depthWrite: false, depthTest: false,
    }));
    this.backdrop.frustumCulled = false;
    this.backdrop.renderOrder = -10;
    this.scene.add(this.backdrop);

    // The cup and saucer share one liquid-metal material.
    const metal = new THREE.ShaderMaterial({ vertexShader: prefix(METAL_VERT), fragmentShader: prefix(METAL_FRAG), uniforms: this.shared, side: THREE.DoubleSide });
    const cup = new THREE.Mesh(lathe(CUP_PROFILE), metal);
    cup.position.y = 0.02;
    const arc = Math.PI * 1.25;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.042, 24, 64, arc), metal);
    handle.position.set(0.57, 0.58, 0);
    handle.rotation.z = -arc / 2;
    handle.scale.set(1, 1.15, 1);
    const saucer = new THREE.Mesh(lathe(SAUCER_PROFILE), metal);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.592, 96), new THREE.ShaderMaterial({
      vertexShader: COFFEE_VERT, fragmentShader: prefix(COFFEE_FRAG), uniforms: this.shared,
    }));
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.88;
    this.sculpture.add(cup, handle, saucer, coffee);
    this.scene.add(this.sculpture);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.ShaderMaterial({
      vertexShader: GROUND_VERT, fragmentShader: prefix(GROUND_FRAG), uniforms: this.shared, transparent: true, depthWrite: false,
    }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.055;
    this.scene.add(ground);

    // Steam: three ribbons that turn to face the camera around the vertical axis.
    for (let i = 0; i < 3; i++) {
      const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.9), new THREE.ShaderMaterial({
        vertexShader: STEAM_VERT, fragmentShader: prefix(STEAM_FRAG),
        uniforms: { uTime: this.shared.uTime, uSeed: { value: i * 3.7 + 1.3 }, uFade: { value: 1 } },
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
      }));
      ribbon.position.set((i - 1) * 0.2, 1.85 + (i % 2) * 0.1, (i - 1) * 0.05);
      this.steam.push(ribbon);
      this.scene.add(ribbon);
    }

    // Roasted beans drifting in a slow orbit.
    const beanCount = small ? 14 : 22;
    this.beans = new THREE.InstancedMesh(beanGeometry(), new THREE.ShaderMaterial({
      vertexShader: BEAN_VERT, fragmentShader: prefix(BEAN_FRAG), uniforms: this.shared,
    }), beanCount);
    for (let i = 0; i < beanCount; i++) {
      this.beanSeeds.push({
        r: 1.45 + Math.random() * 0.9, a: (i / beanCount) * Math.PI * 2 + Math.random() * 0.4,
        y: 0.2 + Math.random() * 1.5, s: 0.05 + Math.random() * 0.08,
        spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.8),
        scale: 0.7 + Math.random() * 0.4,
        // no two beans quite the same shape
        shape: new THREE.Vector3(0.9 + Math.random() * 0.2, 0.92 + Math.random() * 0.16, 0.9 + Math.random() * 0.2),
      });
    }
    this.scene.add(this.beans);

    // Forge-like embers rising around the cup.
    const emberCount = small ? 700 : 1600;
    const seeds = new Float32Array(emberCount * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(emberCount * 3), 3));
    emberGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    emberGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1.5, 0), 6);
    this.embers = new THREE.Points(emberGeo, new THREE.ShaderMaterial({
      vertexShader: prefix(EMBER_VERT), fragmentShader: prefix(EMBER_FRAG),
      uniforms: { ...this.shared, uPixel: { value: 1 }, uSize: { value: 0.05 } },
      transparent: true, depthWrite: false,
    }));
    this.scene.add(this.embers);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.25, 0.5, 0.92);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.frame = requestAnimationFrame(this.loop);
  }

  /** Scroll progress through the pinned section, 0 → 1. */
  setProgress(value: number) { this.target = clamp01(value); }

  /** Pointer position in −1 … 1 for a small parallax. */
  setPointer(x: number, y: number) { this.pointer.set(x, y); }

  /** Pause rendering while the section is off screen. */
  setActive(active: boolean) {
    if (active === this.active) return;
    this.active = active;
    if (active) { this.last = performance.now(); this.frame = requestAnimationFrame(this.loop); }
    else cancelAnimationFrame(this.frame);
  }

  resize(w: number, h: number) {
    this.size = { w: Math.max(1, w), h: Math.max(1, h) };
    const ratio = Math.min(window.devicePixelRatio || 1, this.size.w < 700 ? 1.5 : 1.75);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(this.size.w, this.size.h, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(this.size.w, this.size.h);
    this.bloom.resolution.set(this.size.w * 0.5, this.size.h * 0.5);
    this.camera.aspect = this.size.w / this.size.h;
    this.camera.updateProjectionMatrix();
    this.backdrop.material.uniforms.uRes.value.set(this.size.w, this.size.h);
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    this.embers.material.uniforms.uPixel.value = (this.size.h * ratio) / (2 * Math.tan(fovRad / 2));
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach(m => m.dispose()); else material?.dispose();
    });
    this.composer.dispose();
    this.renderer.dispose();
  }

  private loop = () => {
    if (!this.active) return;
    this.frame = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const timeScale = this.reduced ? 0.2 : 1;
    const time = (this.shared.uTime.value += dt * timeScale);

    this.progress += (this.target - this.progress) * (1 - Math.exp(-dt * (this.reduced ? 12 : 3.2)));
    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-dt * 2.5));
    const p = this.progress;

    const breath = 0.5 + 0.5 * Math.sin(time * 0.9);
    this.shared.uBreath.value = breath;
    this.bloom.strength = 0.22 + breath * 0.08;

    // Camera: orbit the cup, rise, and finally look down into the crema.
    const orbit = this.reduced ? 0.35 : 1;
    const azimuth = -0.55 + p * Math.PI * 1.8 * orbit + this.pointerSmooth.x * 0.12;
    const elevation = mix(0.16, 0.42, smooth(0, 0.55, p)) + smooth(0.62, 1, p) * 0.78 - this.pointerSmooth.y * 0.06;
    const narrow = this.size.w < 900 ? 1.6 * Math.max(0, 1.4 - this.size.w / this.size.h) + 0.6 : 0;
    const distance = mix(6.6, 5.4, smooth(0, 0.5, p)) - smooth(0.62, 1, p) * 0.4 + narrow;
    const look = new THREE.Vector3(0, mix(0.6, 0.85, smooth(0.6, 1, p)), 0);
    this.camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      look.y + Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    this.camera.lookAt(look);

    // Frame the cup beside the chapter copy: right at the start, left mid-way, centred at the end.
    const { w, h } = this.size;
    if (w >= 900) {
      const shift = mix(mix(-0.22, 0.2, smooth(0.15, 0.4, p)), mix(-0.2, 0, smooth(0.8, 0.98, p)), smooth(0.45, 0.7, p));
      this.camera.setViewOffset(w, h, shift * w, smooth(0.8, 1, p) * h * 0.14, w, h);
    } else {
      this.camera.setViewOffset(w, h, 0, h * mix(0.13, 0.2, smooth(0.8, 1, p)), w, h);
    }

    // Keep the caramel glow of the backdrop sitting behind the cup wherever it is framed.
    this.camera.updateMatrixWorld();
    const focus = this.focus.set(0, 0.7, 0).project(this.camera);
    this.backdrop.material.uniforms.uFocus.value.set(focus.x * 0.5 * (w / h), focus.y * 0.5);

    this.sculpture.rotation.y = this.reduced ? 0 : Math.sin(time * 0.2) * 0.08;

    const steamFade = 1 - smooth(0.7, 0.95, p) * 0.85;
    for (const ribbon of this.steam) {
      ribbon.rotation.y = Math.atan2(this.camera.position.x - ribbon.position.x, this.camera.position.z - ribbon.position.z);
      ribbon.material.uniforms.uFade.value = steamFade;
    }

    this.beanSeeds.forEach((bean, i) => {
      const angle = bean.a + time * bean.s;
      this.dummy.position.set(Math.cos(angle) * bean.r, bean.y + Math.sin(time * 0.6 + i) * 0.12, Math.sin(angle) * bean.r);
      this.dummy.rotation.set(time * bean.spin.x, time * bean.spin.y, time * bean.spin.z);
      this.dummy.scale.copy(bean.shape).multiplyScalar(bean.scale);
      this.dummy.updateMatrix();
      this.beans.setMatrixAt(i, this.dummy.matrix);
    });
    this.beans.instanceMatrix.needsUpdate = true;

    this.composer.render(dt);
  };
}
