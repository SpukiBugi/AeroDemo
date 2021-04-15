<template>
  <div class="page-wrap">
    <Loader :page_ready="page_ready" @page-enter="pageEnter" />
    <Menu page_img="images/knk.png" />
    <div class="container" ref="container" />
  </div>
</template>

<script>
import * as THREE from "three";
import { gsap } from "gsap";

import Menu from "@/components/menu.vue";
import Loader from "@/components/Loader";

import fragmentShader from '@/assets/glsl/particles/fragmentShader.glsl';
import vertexShader from '@/assets/glsl/particles/vertexShader.glsl';

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
      image: "images/rin.png",
      music: "audio/secretG.mp3",

      music_ready: false,
      image_ready: false,
      animationFrame: "",
      clock: "",

      scene: "",
      camera: "",
      distance: 300,
      renderer: "",
      fovHeight: 0,

      mouse: {
        x: 0,
        y: 0,
      },

      container: new THREE.Object3D(),
      mapBass: 0,
      mapTremble: 0,
      mapMid: 0,
      mapLowMid: 0,
      mapHighMid: 0,
      waveForm: "",
      audio: "",
    };
  },

  computed: {
    page_ready() {
      return this.music_ready && this.image_ready;
    }
  },

  mounted() {
    this.initThree();
    this.initParticles();
    this.animate();
    this.resize();

    window.addEventListener("resize", this.updateSize);
    window.addEventListener("mousemove", this.updateMouse);
  },

  beforeDestroy() {
    cancelAnimationFrame(this.animationFrame);
    this.destroy();

    if (this.audio) {
      this.audio.pause();
    }

    window.removeEventListener("resize", this.updateSize);
    window.removeEventListener("mousemove", this.updateMouse);
  },

  methods: {
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      this.camera.position.z = this.distance;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.clock = new THREE.Clock(true);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);
    },

    pageEnter() {
      this.show();
      this.animate();
    },

    initParticles() {
      this.scene.add(this.container);
      this.init(this.image, this.music);
    },

    animate() {
      this.update();
      this.draw();

      this.animationFrame = requestAnimationFrame(this.animate);
    },

    draw() {
      this.renderer.render(this.scene, this.camera);
    },

    update() {
      if (!this.object3D) return;

      const delta = this.clock.getDelta();
      this.object3D.material.uniforms.uMouse.x = this.mouse.x,
      this.object3D.material.uniforms.uMouse.y = this.mouse.y,
      this.object3D.material.uniforms.uMusic.value = Math.max(1, this.mapMid);
      this.object3D.material.uniforms.uTime.value += delta;
    },

    updateMouse(e) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    },

    updateSize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    resize() {
      if (!this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.fovHeight =
        2 *
        Math.tan((this.camera.fov * Math.PI) / 180 / 2) *
        this.camera.position.z;

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.resize3D();
    },


    /** Particles */    

    init(image, music) {
        const loader = new THREE.TextureLoader();

        loader.load(image, (texture) => {
            this.texture = texture;
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.format = THREE.RGBFormat;
            this.width = texture.image.width;
            this.height = texture.image.height;
            this.initPoints(true);
            this.resize3D();
            this.hide();
            this.image_ready = true;
        });

        const s = (p) => {
            let fft;

            p.preload = () => {
                this.audio = p.loadSound(music, () => {
                  this.music_ready = true;
                });
            };

            p.setup = () => {
                fft = new p5.FFT();
            };

            p.draw = () => {
                fft.analyze();

                const bass = fft.getEnergy("bass");
                const treble = fft.getEnergy("treble");
                const lowMid = fft.getEnergy("lowMid");
                const mid = fft.getEnergy("mid");
                const highMid = fft.getEnergy("highMid");
                const waveForm = fft.waveform();
                this.mapBass = p.map(bass, 0, 255, 0, 2.0);
                this.mapTremble = p.map(treble, 0, 255, 0, 2.0);
                this.mapLowMid = p.map(lowMid, 0, 255, 0, 2.0);
                this.mapMid = p.map(mid, 0, 255, 0, 2.0);
                this.mapHighMid = p.map(highMid, 0, 255, 0, 2.0);
                this.waveForm = waveForm;
            };
        };

        new p5(s);
    },

    initPoints(discard) {
        this.numPoints = this.width * this.height;
        let numVisible = this.numPoints;
        let threshold = 0;
        let originalColors;

        if (discard) {
            // discard pixels darker than threshold #22
            numVisible = 0;
            threshold = 34;
            const img = this.texture.image;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = this.width;
            canvas.height = this.height;
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, 0, this.width, this.height * -1);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalColors = Float32Array.from(imgData.data);

            for (let i = 0; i < this.numPoints; i++) {
                if (originalColors[i * 4] > threshold) numVisible++;
            }
        }

        const uniforms = {
            uTime: { value: 0 },
            uRandom: { value: 1.0 },
            uDepth: { value: 100.0 },
            uSize: { value: 1.58 },
            uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
            uTexture: { value: this.texture },
            uMouse: { value: new THREE.Vector2() },

            // This variable was added to use audio values in the vertex shader
            uMusic: { value: null },
        };
        
        const material = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
            transparent: true,
        });
        const geometry = new THREE.InstancedBufferGeometry();

        // positions

        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
        positions.setXYZ(0, -0.5, 0.5, 0.0);
        positions.setXYZ(1, 0.5, 0.5, 0.0);
        positions.setXYZ(2, -0.5, -0.5, 0.0);
        positions.setXYZ(3, 0.5, -0.5, 0.0);
        geometry.setAttribute("position", positions);

        // uvs

        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
        uvs.setXYZ(0, 0.0, 0.0);
        uvs.setXYZ(1, 1.0, 0.0);
        uvs.setXYZ(2, 0.0, 1.0);
        uvs.setXYZ(3, 1.0, 1.0);
        geometry.setAttribute("uv", uvs);

        // index

        geometry.setIndex(
            new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1)
        );
        const indices = new Uint16Array(numVisible);
        const offsets = new Float32Array(numVisible * 3);
        const angles = new Float32Array(numVisible);

        for (let i = 0, j = 0; i < this.numPoints; i++) {
            if (discard && originalColors[i * 4] <= threshold) continue;

            offsets[j * 3] = i % this.width;
            offsets[j * 3 + 1] = Math.floor(i / this.width);
            indices[j] = i;
            angles[j] = Math.random() * Math.PI;
            j++;
        }

        geometry.setAttribute(
            "pindex",
            new THREE.InstancedBufferAttribute(indices, 1, false)
        );

        geometry.setAttribute(
            "offset",
            new THREE.InstancedBufferAttribute(offsets, 3, false)
        );

        geometry.setAttribute(
            "angle",
            new THREE.InstancedBufferAttribute(angles, 1, false)
        );
        this.object3D = new THREE.Mesh(geometry, material);
        this.container.add(this.object3D);
    },

    show(time = 4.0) {
        this.audio.loop();
        // reset
        gsap.fromTo(
            this.object3D.material.uniforms.uSize,
            { value: 0.5 },
            { value: 1.5, duration: time }
        );
        gsap.to(this.object3D.material.uniforms.uRandom, { value: 2.0, duration: time });
        gsap.fromTo(
            this.object3D.material.uniforms.uDepth,
            { value: 40.0 },
            { value: 4.0, duration: time }
        );
    },

    hide(_destroy, time = 0.8) {
        return new Promise((resolve, reject) => {
            gsap.to(this.object3D.material.uniforms.uRandom, {
                value: 5.0,
                duration: time,
                onComplete: () => {
                    if (_destroy) this.destroy();
                    resolve();
                },
            });
            gsap.to(this.object3D.material.uniforms.uDepth, {
                value: -20.0,
                ease: "power3.in",
                duration: time,
            });
            gsap.to(this.object3D.material.uniforms.uSize, {
                duration: time * 0.8,
                value: 0.0,
            });
        });
    },

    destroy() {
        if (!this.object3D) return;

        this.object3D.parent.remove(this.object3D);
        this.object3D.geometry.dispose();
        this.object3D.material.dispose();
        this.object3D = null;
    },
    
    resize3D() {
        if (!this.object3D) return;

        const scale = this.fovHeight / this.height;
        this.object3D.scale.set(scale, scale, 1);
    }
  },
};
</script>

<style lang='scss' scoped>
.container {
  margin: 0 auto;
  min-height: 100vh;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: black;
  // background-image: url('/images/rin.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>

<style lang="scss">
.p5Canvas,
#p5_loading {
  position: absolute;
  top: -10000px;
  left: -10000px;
}
</style>