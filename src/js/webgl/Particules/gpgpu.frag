precision mediump float;

uniform sampler2D uFbo;
uniform sampler2D uInitTexture;
uniform sampler2D uNormals;

uniform vec4 uBurnDirection;
uniform vec2 uLifeSpan;
uniform float uDeltaTime;
uniform float uSpeed;
uniform float uTime;
uniform float uNoiseScale;
uniform float uProgress;

varying vec2 vUv;

vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {

	vec3 s = floor(p + dot(p, vec3(F3)));
	vec3 x = p - s + dot(s, vec3(G3));
	 
	vec3 e = step(vec3(0.0), x - x.yzx);
	vec3 i1 = e*(1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	vec3 x1 = x - i1 + G3;
	vec3 x2 = x - i2 + 2.0*G3;
	vec3 x3 = x - 1.0 + 3.0*G3;
	 
	vec4 w, d;
	 
	w.x = dot(x, x);
	w.y = dot(x1, x1);
	w.z = dot(x2, x2);
	w.w = dot(x3, x3);
	 
	w = max(0.6 - w, 0.0);
	 
	d.x = dot(random3(s), x);
	d.y = dot(random3(s + i1), x1);
	d.z = dot(random3(s + i2), x2);
	d.w = dot(random3(s + 1.0), x3);
	 
	w *= w;
	w *= w;
	d *= w;
	 
	return dot(d, vec4(52.0));
}

float snoiseFractal(vec3 m) {
	return   0.5333333* snoise(m)
				+0.2666667* snoise(2.0*m)
				+0.1333333* snoise(4.0*m)
				+0.0666667* snoise(8.0*m);
}


vec3 transform(inout vec3 position, vec3 T, vec4 R, vec3 S) {
    //applies the scale
  position *= S;
    //computes the rotation where R is a (vec4) quaternion
  position += 2.0 * cross(R.xyz, cross(R.xyz, position) + R.w * position);
    //translates the transformed 'blueprint'
  position += T;
    //return the transformed position
  return position;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 snoiseVec3( vec3 x ){

  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;

}

vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}

float remap(float value, float low1, float high1, float low2, float high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

void main() {
  vec4 data = texture2D(uFbo, vUv);
  vec3 normalData = texture2D(uNormals, vUv).rgb;
  vec3 initPosition = texture2D(uInitTexture, vUv).rgb;

  float lifeSpan = remap(rand(vUv), 0., 1., uLifeSpan.x, uLifeSpan.y);


  vec3 transformedPos = initPosition;
  transform(transformedPos, vec3(0.), uBurnDirection, vec3(1.));
  float fragX = transformedPos.x + snoiseFractal(initPosition * 0.3 + 20.) + 0.1;
  float endSize = 0.5;
  float edge = smoothstep(uProgress - endSize / 2., uProgress + endSize / 2., fragX);
  edge = smoothstep(0.4, 0.5, edge) - smoothstep(0.5, 0.6, edge);

  float lifeTime = data.a;
  vec3 position = data.rgb;

  if (lifeTime >= 0.) lifeTime = data.a + uDeltaTime / lifeSpan;
  if (edge > 0.3) lifeTime = 0.;

  if (lifeTime < 0.) {

  } else if (lifeTime > 1.) {
    lifeTime = -1.;
    position = initPosition;
  } else {
    vec3 p = mix((position * uNoiseScale) + lifeTime * 5., vec3(rand(vUv)), remap(lifeTime, 0., 1., 0.2, 1.));
    // vec3 p = position * uNoiseScale * remap(lifeTime, 0., 1., 5., 1.) + uTime * 0.5;
    // vec3 randomDirection = curlNoise(position * uNoiseScale + uTime * 0.5) * 2.;
    vec3 randomDirection = curlNoise(p) * 2.;
    float randomInfluence = remap(lifeTime, 0., 3., 0., 1.);
    vec3 nextDirection = mix(vec3(-1., 1., 0.), randomDirection, randomInfluence);
    nextDirection = mix(normalData + randomDirection, nextDirection, lifeTime);
    position += nextDirection * 0.01 * uSpeed;
  }

	gl_FragColor = vec4(position, lifeTime);
}
