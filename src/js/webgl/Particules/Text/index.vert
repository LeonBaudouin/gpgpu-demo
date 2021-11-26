attribute vec3 position;
attribute vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  vec3 transformed = vec3( position );
  vec4 mvPosition = vec4( transformed, 1.0 );
  vec4 worldPosition = modelMatrix * mvPosition;
  // vec4 worldPosition = mvPosition;
  
  mvPosition = viewMatrix * modelMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;

	vViewPosition = - mvPosition.xyz;
	vWorldPosition = worldPosition.xyz;
  vNormal = normalMatrix * normal;
}
