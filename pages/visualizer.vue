<template>
  <div class="page-wrap">
    <!-- <Loader :page_ready="page_ready" @page-enter="pageEnter" /> -->
    <Menu page_img="images/knk.png" />
    <!-- <div class="container" ref="container"></div> -->
    <div>
      <button type="button" aria-label="toggle-music">
        <svg id="pause" xmlns="http://www.w3.org/2000/svg" height="327pt" viewBox="-45 0 327 327" width="327pt">
          <path
            d="m158 0h71c4.417969 0 8 3.582031 8 8v311c0 4.417969-3.582031 8-8 8h-71c-4.417969 0-8-3.582031-8-8v-311c0-4.417969 3.582031-8 8-8zm0 0" />
          <path
            d="m8 0h71c4.417969 0 8 3.582031 8 8v311c0 4.417969-3.582031 8-8 8h-71c-4.417969 0-8-3.582031-8-8v-311c0-4.417969 3.582031-8 8-8zm0 0" />
        </svg>
        <svg id="play" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
          viewBox="0 0 494.148 494.148" style="enable-background:new 0 0 494.148 494.148;" xml:space="preserve">
          <path
            d="M405.284,201.188L130.804,13.28C118.128,4.596,105.356,0,94.74,0C74.216,0,61.52,16.472,61.52,44.044v406.124    c0,27.54,12.68,43.98,33.156,43.98c10.632,0,23.2-4.6,35.904-13.308l274.608-187.904c17.66-12.104,27.44-28.392,27.44-45.884    C432.632,229.572,422.964,213.288,405.284,201.188z" />
        </svg>
      </button>
      <section>
        <div class="frame full-height">
          <div class="container" ref="container">
            <img src="images/back.png" alt="Gandalf" />
            <button id="allow-music">
              <span class="loading">Loading...</span>
              <span class="after-loading"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFF"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="feather feather-volume-2"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path
                    d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                  />
                </svg>
                Enter the experience</span
              >
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";

import Particles from "@/assets/js/classes/Particles";

import Menu from "@/components/menu.vue";
import Loader from "@/components/Loader";

export default {
  components: {
    Menu,
    Loader,
  },

  head() {
    return {
      title: "Visualizer",
    };
  },

  data() {
    return {
      image: "images/back.png",

      page_ready: false,
      animationFrame: "",
      clock: "",

      webgl: {},
      particles: "",

      distance: 300,

      gui: "",
    };
  },

  mounted() {
    this.initThree();
    this.initParticles();
    this.animate();
    this.resize();

    // if (process.client) {
    //   this.initGUI();
    // }

    this.page_ready = true;

    window.addEventListener("resize", this.updateSize);
  },

  beforeDestroy() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.updateSize);

    // if (process.client) {
    //   this.gui.destroy();
    // }
  },

  methods: {
    initThree() {
      this.webgl.scene = new THREE.Scene();
      this.webgl.camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      this.webgl.camera.position.z = this.distance;

      this.webgl.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.clock = new THREE.Clock(true);
      this.webgl.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.webgl.renderer.domElement);
    },

    // pageEnter() {
    //   this.animate();
    // },

    initParticles() {
      this.particles = new Particles(this.webgl);
      this.webgl.scene.add(this.particles.container);
      this.particles.init(this.image);
    },

    animate() {
      this.update();
      this.draw();

      this.animationFrame = requestAnimationFrame(this.animate);
    },

    draw() {
      this.webgl.renderer.render(this.webgl.scene, this.webgl.camera);
    },

    update() {
      const delta = this.clock.getDelta();
      if (this.particles) this.particles.update(delta);
    },

    updateSize() {
      this.webgl.renderer.setSize(window.innerWidth, window.innerHeight);
      this.webgl.camera.aspect = window.innerWidth / window.innerHeight;
    },

    initGUI() {
      this.gui = new dat.GUI();
    },

    resize() {
      if (!this.webgl.renderer) return;
      this.webgl.camera.aspect = window.innerWidth / window.innerHeight;
      this.webgl.camera.updateProjectionMatrix();

      this.webgl.fovHeight =
        2 *
        Math.tan((this.webgl.camera.fov * Math.PI) / 180 / 2) *
        this.webgl.camera.position.z;

      this.webgl.renderer.setSize(window.innerWidth, window.innerHeight);

      if (this.interactive) this.interactive.resize();
      if (this.particles) this.particles.resize();
    }
  },
};
</script>

<style lang='scss' scoped>
// .container {
//   margin: 0 auto;
//   min-height: 100vh;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   text-align: center;
// }
</style>

<style lang="scss">
body {
  background-color: #000;
  margin: 0;
}

.full-height {
  min-height: 100vh;
}

.hide-bg {
  background-color: black;
}

:root {
  --mapBass: 0;
  --mapTremble: 0;
  --mapLowMid: 0;
  --mapMid: 0;
  --mapHighMid: 0;
}

[aria-label="toggle-music"] {
  -webkit-appearance: none;
  background-color: transparent;
  border: 0;
  width: 3rem;
  height: 3rem;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  padding: 1rem;
}

[aria-label="toggle-music"] svg {
  width: 1rem;
  height: 1rem;
  fill: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#play {
  opacity: 0;
  visibility: hidden;
}
.frame {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;
}

.frame .container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* @media (max-width: 48rem) {
	.frame .container canvas {
		transform: scale(0.75);
	}
} */

.container img {
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  width: auto;
}

#allow-music span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.25rem;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
}
#allow-music span svg {
  margin-right: 0.5rem;
}
#allow-music:hover,
#allow-music:focus {
  background-color: #2c0063;
}
#allow-music {
  -webkit-appearance: none;
  background: none;
  background-color: #6800ed;
  border: 0;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: visible;
  width: 13rem;
  height: 4rem;
  margin-top: 1rem;
  transition: all 150ms ease-out;
}

#defaultCanvas0,
#p5_loading {
  display: none;
}

.enabled-after-click {
  min-height: 100vh;
}

.content__wrapper {
  padding: 5%;
}

.full-height.black {
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 1);
}
.full-height.white {
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 1);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  transition: all 300ms ease-in-out;
}
::-webkit-scrollbar-button {
  width: 0;
  height: 0;
  transition: all 300ms ease-in-out;
}
::-webkit-scrollbar-thumb {
  background: rgb(
    calc(var(--mapLowMid) * 55),
    calc(var(--mapTremble) * 66),
    calc(var(--mapBass) * 125)
  );
  border: 0 none #ffffff;
  border-radius: 0;
  transition: all 300ms ease-in-out;
}
::-webkit-scrollbar-thumb:hover {
  background: #6800ed;
}
::-webkit-scrollbar-thumb:active {
  background: #000000;
}
::-webkit-scrollbar-track {
  background: #222;
  border-radius: 0;
  transition: all 300ms ease-in-out;
}
::-webkit-scrollbar-track:hover {
  background: #666666;
}
::-webkit-scrollbar-track:active {
  background: #333333;
}
::-webkit-scrollbar-corner {
  background: transparent;
  transition: all 300ms ease-in-out;
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
nav,
section,
summary {
  display: block;
}
audio,
canvas,
video {
  display: inline-block;
}
audio:not([controls]) {
  display: none;
  height: 0;
}
[hidden] {
  display: none;
}
html {
  font-family: "Bebas Neue", sans-serif;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
}
a:active,
a:hover,
a:focus {
  outline: 0;
}
h1 {
  font-size: 2em;
  margin: 0.67em 0;
}
abbr[title] {
  border-bottom: 1px dotted;
}
b,
strong {
  font-weight: bold;
}
dfn {
  font-style: italic;
}
hr {
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  height: 0;
}
mark {
  background: #ff0;
  color: #000;
}
code,
kbd,
pre,
samp {
  font-family: monospace, serif;
  font-size: 1em;
}
pre {
  white-space: pre-wrap;
}
q {
  quotes: "\201C""\201D""\2018""\2019";
}
small {
  font-size: 80%;
}
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}
sup {
  top: -0.5em;
}
sub {
  bottom: -0.25em;
}
img {
  border: 0;
}
svg:not(:root) {
  overflow: hidden;
}
figure {
  margin: 0;
}
fieldset {
  border: 1px solid #c0c0c0;
  margin: 0 2px;
  padding: 0.35em 0.625em 0.75em;
}
legend {
  border: 0;
  padding: 0;
}
button,
input,
select,
textarea {
  font-family: inherit;
  font-size: 100%;
  margin: 0;
}
button,
input {
  line-height: normal;
}
button,
select {
  text-transform: none;
}
button,
html input[type="button"],
input[type="reset"],
input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
}
button[disabled],
html input[disabled] {
  cursor: default;
}
input[type="checkbox"],
input[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}
input[type="search"] {
  -webkit-appearance: textfield;
  -moz-box-sizing: content-box;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
}
input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}
button::-moz-focus-inner,
input::-moz-focus-inner {
  border: 0;
  padding: 0;
}
textarea {
  overflow: auto;
  vertical-align: top;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
*,
*::after,
*::before {
  box-sizing: border-box;
}

:root {
  font-size: 16px;
}

body {
  --color-text: #fff;
  --color-bg: #0e0e0f;
  --color-link: #ee9a00;
  --color-link-hover: #8e5c00;
  color: var(--color-text);
  background-color: var(--color-bg);
  font-family: "Bebas Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  text-decoration: none;
  color: var(--color-link);
  outline: none;
  transition: all 150ms ease-out;
  -webkit-tap-highlight-color: transparent;
}

a:hover,
a:focus {
  color: var(--color-link-hover);
  outline: none;
}

button:focus {
  outline: 0;
  -webkit-tap-highlight-color: transparent;
}
</style>