precision mediump float;

void main() {
  // current coordinates
  vec4 coord = gl_FragCoord;
  // sets the color
  gl_FragColor = vec4(coord.x/800.0,coord.y/600.0, 0.0, 1.0);
}