uniform sampler2D uTexture;
uniform sampler2D uRamp;
varying vec2 vUv;

varying vec4 vData;
varying vec2 vUvOffset;

float exponentialOut(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}
float exponentialIn(float t) {
  return t == 0.0 ? t : pow(2.0, 10.0 * (t - 1.0));
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float sdTriangle( in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2 )
{
    vec2 e0 = p1-p0, e1 = p2-p1, e2 = p0-p2;
    vec2 v0 = p -p0, v1 = p -p1, v2 = p -p2;
    vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
    vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
    vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
    float s = sign( e0.x*e2.y - e0.y*e2.x );
    vec2 d = min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)),
                     vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))),
                     vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
    return -sqrt(d.x)*sign(d.y);
}

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
      
  vec2 m = vec2(0.920,0.550);
  vec2 offset = vec2(0.3);
  
  // float p = remap(exponentialIn(lifeTime), 0., 1., 0.1, 20.);
  // float dist = pow(distance(m, uv) * p, .5);
  // float noise = texture2D(uTexture, (uv * .02) + offset).r * 10.;
  // float a = 1. - clamp(noise * dist + dist * 0.9, 0., 1.);
  
  vec2 p1 = vec2(0.020,0.960);
  vec2 p2 = vec2(0.890,0.480);
  vec2 p3 = vec2(0.160,0.040);
  vec2 p4 = vec2(0.000,0.120);

  // float b = sdTriangle(uv, p1, p2, p3);
  // b = smoothstep(0.01, -0.01, b);

  
  float p = remap(lifeTime, 0., 1., 1., 20.);
  
  vec2 n = texture2D(uTexture, uv * 0.02 + vUvOffset).rb;
  n.x = remap(n.x, 0., 1., -0.7, 0.7);
  n.y = remap(n.y, 0., 1., -0.7, 0.7);
  n -= 0.1;
  vec2 stz = uv + n;
  // float dist = pow(distance(m, st) * p, .5);
  float b = smoothstep(-p, 0., sdBox((stz - .5), vec2(0.43)));
  float dist = pow(b, 100.);
  // float dist = pow(smoothstep(-p, 0., sdTriangle(stz, p1, p2, p3) - 0.1), 100.);
  // float a = 1. - clamp(noise * dist + dist * 0.9, 0., 1.);
  // float a = mix(noise, (dist), 0.5);
  float a = (1. - dist);


  // float alpha = step(0., lifeTime) * texture2D(uTexture, uv).r * cubicOut(1. - lifeTime);
  // float alpha = exponentialOut(a);
  float alpha = a;
  // float alpha = exponentialOut(b * a);
  // float alpha = b * a;
  // float alpha = 1.;
  // vec3 color = texture2D(uRamp, vec2(vData.a, 0.)).rgb;
  // vec3 color = texture2D(uRamp, vec2(vData.a, 0.)).rgb;
  // vec3 color = mix(vec3(0.9255, 0.1373, 0.0), vec3(0.), exponentialOut(lifeTime));
  vec3 color = texture2D(uRamp, vec2(1. - b, 0.)).rgb;

  gl_FragColor = vec4(color, 1.);
  // gl_FragColor = vec4(vec3(alpha), 1.);
  // if (gl_FragColor.a < remap(clamp(lifeTime, 0., 1.), 0., 1., 0.5, 1.)) discard;
  // if (alpha < remap(clamp(lifeTime, 0., 1.), 0., 1., 0.5, 1.)) discard;
  if (alpha < 0.2) discard;
  // if (gl_FragColor.a < clamp(lifeTime, 0., 1.)) discard;
}
