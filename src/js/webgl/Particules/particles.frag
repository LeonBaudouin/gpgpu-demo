varying vec4 vData;
uniform bool uDebugColor;

void main() {

  vec3 color = vec3(1.);
  if (uDebugColor) color = vData.rgb;

  gl_FragColor = vec4(color, 1.);
}
