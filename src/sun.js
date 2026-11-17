/* «Солнце»: неровное кольцо и шар, однобитное зерно. Используется на первом экране.
   startSun(canvas, { bg, fg }) → { pause(), resume() } */
import { WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, TorusGeometry, IcosahedronGeometry, PlaneGeometry, MeshStandardMaterial, ShaderMaterial, Mesh, Group, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, Vector2, Vector3 } from "three";
const THREE = { WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, TorusGeometry, IcosahedronGeometry, PlaneGeometry, MeshStandardMaterial, ShaderMaterial, Mesh, Group, AmbientLight, DirectionalLight, WebGLRenderTarget, NearestFilter, Vector2, Vector3 };

const P = { px: 2, contrast: 1.2, lump: 1.75, speed: 0.55, tilt: -0.34 };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hexVec = h => new THREE.Vector3(parseInt(h.slice(1,3),16)/255, parseInt(h.slice(3,5),16)/255, parseInt(h.slice(5,7),16)/255);

/* ---------- шум (simplex 3D) для рельефа ---------- */
const grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
const perm = new Uint8Array(512);
{ let s = 1337; const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]; }
function noise3(x, y, z) {
  const F3 = 1/3, G3 = 1/6, s = (x+y+z)*F3;
  const i = Math.floor(x+s), j = Math.floor(y+s), k = Math.floor(z+s), t = (i+j+k)*G3;
  const x0 = x-i+t, y0 = y-j+t, z0 = z-k+t;
  let i1,j1,k1,i2,j2,k2;
  if (x0>=y0) { if (y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;} else if (x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;} else {i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} }
  else { if (y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;} else if (x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;} else {i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
  const pts = [[x0,y0,z0,0,0,0],[x0-i1+G3,y0-j1+G3,z0-k1+G3,i1,j1,k1],[x0-i2+2*G3,y0-j2+2*G3,z0-k2+2*G3,i2,j2,k2],[x0-1+.5,y0-1+.5,z0-1+.5,1,1,1]];
  const ii=i&255, jj=j&255, kk=k&255; let n = 0;
  for (const [a,b,c,di,dj,dk] of pts) {
    let tt = .6 - a*a - b*b - c*c; if (tt < 0) continue;
    const g = grad3[perm[ii+di+perm[jj+dj+perm[kk+dk]]] % 12]; tt *= tt;
    n += tt*tt*(g[0]*a + g[1]*b + g[2]*c);
  }
  return 32*n;
}
const fbm = (x,y,z) => noise3(x,y,z)*.7 + noise3(x*2.1,y*2.1,z*2.1)*.3;

/* ---------- геометрия: неровное кольцо и шар ---------- */
function lumpy(geo, amt, freq, chunk) {
  const pos = geo.attributes.position, nrm = geo.attributes.normal, v = new THREE.Vector3(), n = new THREE.Vector3();
  const base = Float32Array.from(pos.array), baseN = Float32Array.from(nrm.array);
  geo.userData.apply = (k) => {
    for (let i = 0; i < pos.count; i++) {
      v.fromArray(base, i*3); n.fromArray(baseN, i*3);
      let d = fbm(v.x*freq, v.y*freq, v.z*freq) * amt;
      // «обломки»: резкие выступы, как на рендере из Illustrator
      const c = noise3(v.x*chunk+7, v.y*chunk, v.z*chunk);
      d += Math.max(0, c - .25) * amt * 1.6;
      v.addScaledVector(n, d * k);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
  };
  geo.userData.apply(1);
  return geo;
}

export function startSun(canvas, colors, onFirstFrame) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });   // бросит ошибку, если WebGL нет
  const ringGeo = lumpy(new THREE.TorusGeometry(1.55, .16, 48, 420), .1, 2.2, 4.2);
  const sunGeo  = lumpy(new THREE.IcosahedronGeometry(.36, 6), .05, 4, 6);
  ringGeo.userData.apply(P.lump); sunGeo.userData.apply(P.lump);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .05, 50);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .85, metalness: 0 });
  const ring = new THREE.Mesh(ringGeo, mat), sun = new THREE.Mesh(sunGeo, mat);
  // spin крутит кольцо вокруг вертикальной оси (вправо), axis задаёт наклон этой оси
  const spin = new THREE.Group(); spin.add(ring);
  const axis = new THREE.Group(); axis.add(spin); axis.rotation.z = P.tilt;
  scene.add(axis, sun);
  scene.add(new THREE.AmbientLight(0xffffff, .1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, .7); rim.position.set(4, -2, -3); scene.add(rim);

  // пост-обработка: однобитное зерно, как «Порог» в Photoshop
  const rt = new THREE.WebGLRenderTarget(1, 1, { magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter });
  const post = new THREE.ShaderMaterial({
    uniforms: { tex: { value: rt.texture }, res: { value: new THREE.Vector2() }, px: { value: P.px },
                contrast: { value: P.contrast }, bg: { value: hexVec(colors.bg) }, fg: { value: hexVec(colors.fg) }, seed: { value: 0 } },
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `
      uniform sampler2D tex; uniform vec2 res; uniform float px, contrast, seed; uniform vec3 bg, fg;
      float hash(vec2 p){ return fract(sin(dot(p + seed*17.13, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 cell = floor(gl_FragCoord.xy / px);
        float l = dot(texture2D(tex, (cell + .5) * px / res).rgb, vec3(.299,.587,.114));
        l = clamp(pow(l, 1.15) * contrast, 0., 1.);
        float on = (l > .02) ? step(hash(cell), l) : 0.;
        gl_FragColor = vec4(mix(bg, fg, on), 1.);
      }`
  });
  const postScene = new THREE.Scene(); postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight, dpr = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    rt.setSize(w*dpr, h*dpr); post.uniforms.res.value.set(w*dpr, h*dpr);
    camera.aspect = w / h;
    camera.position.set(0, 0, w < h ? 7.2 * Math.min(2.2, h / w) : 7.2);   // на телефоне кольцо целиком
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize); resize();

  let last = performance.now(), grainTick = 0, running = true, first = true;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const sp = reduce ? P.speed * .35 : P.speed;
    spin.rotation.y += dt * .6 * sp;
    sun.rotation.y += dt * .5 * sp; sun.rotation.x += dt * .2 * sp;
    // зерно чуть «дышит», 12 раз в секунду, как плёнка
    if ((grainTick += dt) > 1/12) { grainTick = 0; post.uniforms.seed.value = reduce ? 0 : Math.random()*10; }
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 1); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(postScene, postCam);
    if (first) { first = false; onFirstFrame && onFirstFrame(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    pause() { running = false; },
    resume() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  };
}
