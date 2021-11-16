precision mediump float;

uniform sampler2D uFbo;
uniform float uDeltaTime;
uniform float uTime;
uniform sampler2D uInitTexture;
// uniform vec3 uBoxCenter;
uniform vec3 uMousePosition;
uniform float uMouseSpeed;
uniform vec2 uLifeSpan;
uniform vec2 uSpeed;
uniform float uNoiseSize;
uniform float uNoiseSpeed;

varying vec2 vUv;

#define PI 3.14159265359

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}


float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
float quarticOut(float t) {
  return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}
float quadraticOut(float t) {
  return -t * (t - 2.0);
}
float remap(float value, float low1, float high1, float low2, float high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

void main() {
  float lifeSpan = remap(rand(vUv), 0., 1., uLifeSpan.x, uLifeSpan.y);

  vec4 data = texture2D(uFbo, vUv);
  vec4 initData = texture2D(uInitTexture, vUv);

  vec3 position = data.rgb;
  float lifeTime = data.a;

  if (lifeTime >= 0.) lifeTime += uDeltaTime / lifeSpan;

  if (lifeTime < 0.) {
    // ---------------
    // --- STANDBY ---
    // ---------------
    float r = uMouseSpeed;
    if (length(uMousePosition - position) < 0.1 &&
        rand(vUv + uTime) < r)
      lifeTime = 0.;

  } else if (lifeTime > 1.) {
    // --------------
    // ---- DEAD ----
    // --------------
    lifeTime = -1.;
    position = initData.rgb;

  } else {
    // ---------------
    // ---- ALIVE ----
    // ---------------
    float baseDeg = rand(vUv);
    float noiseDeg = snoise(position.xy * uNoiseSize + uTime * uNoiseSpeed);
    float deg = mix(baseDeg, noiseDeg, lifeTime) * PI * 2.;
    float dist = remap(rand(vUv + 1.), 0., 1., uSpeed.x, uSpeed.y);
    vec3 dir = vec3(cos(deg), sin(deg), 0.);
    float prog = quadraticOut(clamp(lifeTime, 0., 1.));
    position += dir * dist * (1. - prog);
  }

	gl_FragColor = vec4(position, lifeTime);
}
