uniform sampler2D uTexture;

void main() {
  vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

  float alpha = texture2D(uTexture, uv).r;

  gl_FragColor = vec4(vec3(1.), alpha);
}
