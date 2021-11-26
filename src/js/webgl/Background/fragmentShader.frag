precision mediump float;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPositionW;

uniform vec3 uInsideColor;
uniform vec3 uOutsideColor;

uniform vec3 uCameraPosition;

uniform float uGradientStart;
uniform float uGradientEnd;
uniform vec2 uScreenResolution;


float random(float n){return fract(sin(n) * 43758.5453123);}

float random(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}

void main()
{
	vec2 uv = gl_FragCoord.xy / uScreenResolution;
    // // Adjust to ratio
    // uv.x /= uScreenResolution.y / uScreenResolution.x;
    // // Center 0.5, 0.5 point
    // uv += vec2(
    //     (1. - uScreenResolution.x / uScreenResolution.y),
    //     -.5
    // );

    // uv *= vec2(1., 1.5);

    float df = length(uv - vec2(.5));
    float dist = cremap(df, uGradientStart, uGradientEnd, 0., 1.);
    float mixValue = dist + (random(uv * 100.) - .5) / 5.;
    vec3 color = mix(uInsideColor, uOutsideColor, mixValue);
    // gl_FragColor = vec4(vec3(step(df, .5)), 1.);
    gl_FragColor = vec4(color, 1.);
}
