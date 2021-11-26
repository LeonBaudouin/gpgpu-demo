attribute vec2 aPixelPosition;
attribute vec2 aUvOffset;

uniform sampler2D uFbo;
uniform sampler2D uPreviousFbo;
uniform float uSize;

varying vec2 vUvOffset;
varying vec4 vData;
varying vec2 vUv;
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
vec4 quaternionLookRotation(vec3 fw, vec3 up) {
    vec3 forward = normalize(fw);
    vec3 vector = normalize(forward);
    vec3 vector2 = normalize(cross(up, vector));
    vec3 vector3 = cross(vector, vector2);
    float m00 = vector2.x;
    float m01 = vector2.y;
    float m02 = vector2.z;
    float m10 = vector3.x;
    float m11 = vector3.y;
    float m12 = vector3.z;
    float m20 = vector.x;
    float m21 = vector.y;
    float m22 = vector.z;
    float num8 = (m00 + m11) + m22;
    vec4 quaternion;
    if (num8 > 0.) {
        float num = sqrt(num8 + 1.);
        quaternion.w = num * 0.5;
        num = 0.5 / num;
        quaternion.x = (m12 - m21) * num;
        quaternion.y = (m20 - m02) * num;
        quaternion.z = (m01 - m10) * num;
        return quaternion;
    }
    if ((m00 >= m11) && (m00 >= m22)) {
        float num7 = sqrt(((1. + m00) - m11) - m22);
        float num4 = 0.5 / num7;
        quaternion.x = 0.5 * num7;
        quaternion.y = (m01 + m10) * num4;
        quaternion.z = (m02 + m20) * num4;
        quaternion.w = (m12 - m21) * num4;
        return quaternion;
    }
    if (m11 > m22) {
        float num6 = sqrt(((1. + m11) - m00) - m22);
        float num3 = 0.5 / num6;
        quaternion.x = (m10+ m01) * num3;
        quaternion.y = 0.5 * num6;
        quaternion.z = (m21 + m12) * num3;
        quaternion.w = (m20 - m02) * num3;
        return quaternion;
    }
    float num5 = sqrt(((1. + m22) - m00) - m11);
    float num2 = 0.5 / num5;
    quaternion.x = (m20 + m02) * num2;
    quaternion.y = (m21 + m12) * num2;
    quaternion.z = 0.5 * num5;
    quaternion.w = (m01 - m10) * num2;
    return quaternion;
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
  vec4 data = texture2D(uFbo, aPixelPosition);
  vec4 previousData = texture2D(uPreviousFbo, aPixelPosition);
  vec3 offset = data.rgb;

  vec4 rotation = quaternionLookRotation(normalize(data.rgb - previousData.rgb), vec3(1., 0., 0.));
  float scale = uSize * step(0., data.a);
  vec3 pos = position + (vec3((rand(uv + aPixelPosition) - 0.5), (rand(uv - aPixelPosition) - 0.5), 0.)) * 0.002;
  transform(pos, offset, rotation, vec3(scale));

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPosition;

  // Size attenuation
  // gl_PointSize = uSize;
  // gl_PointSize *= (1.0 / - mvPosition.z);
  // gl_PointSize = max(gl_PointSize, 2.);
  vUvOffset = aUvOffset;
  vData = data;
  vUv = uv;
}
