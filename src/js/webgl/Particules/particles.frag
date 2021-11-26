uniform sampler2D uTexture;
uniform sampler2D uRamp;
varying vec2 vUv;

varying vec4 vData;
varying vec2 vUvOffset;

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

void main() {
  // vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
  vec2 uv = vUv;
  float lifeTime = vData.a;
      
  float p = remap(lifeTime, 0., 1., 1., 20.);
  
  vec2 n = texture2D(uTexture, uv * 0.02 + vUvOffset).rb;
  n.x = remap(n.x, 0., 1., -0.7, 0.7);
  n.y = remap(n.y, 0., 1., -0.7, 0.7);
  n -= 0.1;
  vec2 stz = uv + n;
  float b = smoothstep(-p, 0., sdBox((stz - .5), vec2(0.43)));
  float dist = pow(b, 100.);
  float alpha = (1. - dist);


  vec3 color = texture2D(uRamp, vec2(1. - b, 0.)).rgb;

  gl_FragColor = vec4(color, 1.);
  if (alpha < 0.2) discard;
}
