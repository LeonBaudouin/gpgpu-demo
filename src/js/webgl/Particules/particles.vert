attribute vec2 aPixelPosition;

uniform sampler2D uFbo;
uniform float uSize;

varying vec4 vData;

void main() {
  vec4 data = texture2D(uFbo, aPixelPosition);
  vec3 offset = data.rgb - 0.5;

  vec4 mvPosition = modelViewMatrix * vec4((position + offset), 1.0);

  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  gl_PointSize = uSize;
  gl_PointSize *= (1.0 / - mvPosition.z);

  vData = data;
}
