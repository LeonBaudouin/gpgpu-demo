attribute vec2 aPixelPosition;

uniform sampler2D uFbo;
uniform float uSize;

void main() {
  vec4 data = texture2D(uFbo, aPixelPosition);
  vec3 offset = data.rgb;

  vec4 mvPosition = modelViewMatrix * vec4((position + offset), 1.0);

  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  gl_PointSize = uSize;
  gl_PointSize *= (1.0 / - mvPosition.z);
}
