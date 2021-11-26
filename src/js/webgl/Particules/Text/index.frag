precision highp float;

uniform sampler2D uMatcap;
uniform vec4 uBurnDirection;
uniform float uProgress;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;

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

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

  vec4 matcap = texture2D( uMatcap, uv );

  vec3 pos = vWorldPosition;
  transform(pos, vec3(0.), uBurnDirection, vec3(1.));
  float fragX = pos.x
    + snoiseFractal(vWorldPosition * 0.3 + 20.) * 1.
    + snoiseFractal(vWorldPosition * 7. + 20.) * 0.1;
  float endSize = 0.3;
  float end = smoothstep(uProgress - endSize / 2., uProgress + endSize / 2., fragX);
  float alpha = step(0.1, end);
  float burn = smoothstep(.3, 0., end);

  vec3 color = mix(vec3(0.), matcap.rgb, end);
  color = mix(color, vec3(0.9255, 0.2941, 0.0), burn);

  gl_FragColor = vec4(color, alpha);
  if (gl_FragColor.a < 0.1) discard;
}
