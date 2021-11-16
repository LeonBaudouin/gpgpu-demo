attribute vec2 aPixelPosition;

uniform sampler2D uPosTexture;
uniform float uSize;

varying vec4 vData;

void main() {

  vec4 data = texture2D(uPosTexture, aPixelPosition);
  vec3 offset = data.rgb;
  float lifeTime = 1. - abs(data.a);

  // vec4 mvPosition = modelViewMatrix * vec4((position + offset), 1.0);
  vec4 mvPosition = modelViewMatrix * vec4((position + offset), 1.0);

  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  gl_PointSize = uSize * lifeTime * (sign(data.a)/2.+0.5);
  // gl_PointSize = uSize;
  gl_PointSize *= (1.0 / - mvPosition.z);

  vData = data;
}
