precision highp float;

uniform sampler2D uTexture;
varying vec4 vData;

float remap(float value, float low1, float high1, float low2, float high2) {
  return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}
float cremap(float value, float low1, float high1, float low2, float high2) {
  return clamp(remap(value, low1, high1, low2, high2), min(low2, high2), max(low2, high2));
}


void main()
{
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

  float lifeTime = clamp(vData.a, 0., 1.);
  if (vData.a < 0.) lifeTime = 1.;

  float lifeAlpha = cremap(lifeTime, .6, 1., 1., 0.) - cremap(lifeTime, 0., .3, 1., 0.);

	float alpha = texture2D(uTexture, uv).r;
  alpha *= lifeAlpha * 1.5;

  // (1. - lifeTime)
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vec3(1.), alpha);
}
