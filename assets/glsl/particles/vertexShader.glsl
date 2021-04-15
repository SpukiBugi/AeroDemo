precision highp float;
attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Create music variable

uniform float music;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTouch;
varying vec2 vPUv;
varying vec2 vUv;

#pragma glslify: snoise = require(glsl-noise/simplex/2d)

float random(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main() {
    vUv = uv;

    // particle uv

    vec2 puv = offset.xy / uTextureSize;
    vPUv = puv;

    // pixel color

    vec4 colA = texture2D(uTexture, puv);
    float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;

    // displacement

    vec3 displaced = offset;

    // randomise and utilize music variable

    displaced.xy += vec2(random(pindex) - 0.25, random(offset.x + pindex) - 0.25) * uRandom * (music * 0.2);
    float rndz = (random(pindex) + snoise(vec2(pindex * 0.1, music * 0.1)));
    displaced.z += rndz * (random(pindex) * uDepth) * (music * 6.0);

    // center

    displaced.xy -= uTextureSize * 0.5;

    // touch

    float t = texture2D(uTouch, puv).r;
    displaced.z += t * 20.0 * rndz;
    displaced.x += cos(angle) * t * 20.0 * rndz;
    displaced.y += sin(angle) * t * 20.0 * rndz;

    // particle size

    float psize = (snoise(vec2(uTime* music, pindex) * 0.5) + 2.0) * music * 0.5;
    psize *= max(grey, 0.2);
    psize *= uSize;

    // final position

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    mvPosition.xyz += position * psize;
    vec4 finalPosition = projectionMatrix * mvPosition;
    gl_Position = finalPosition;
}