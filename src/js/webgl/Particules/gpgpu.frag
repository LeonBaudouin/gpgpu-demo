precision mediump float;

uniform sampler2D uFbo;
uniform sampler2D uInitFbo;
uniform vec3 uColorToAdd;
uniform float uStepSize;
uniform bool uReset;

varying vec2 vUv;


void main() {
  vec4 data = texture2D(uFbo, vUv);
  vec4 initData = texture2D(uInitFbo, vUv);

  vec3 position = data.rgb + uColorToAdd * uStepSize;
  if (uReset) {
    position = initData.rgb;
  }

	gl_FragColor = vec4(position, 1.);
}
