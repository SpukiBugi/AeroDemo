<template>
  <div class="page-wrap">
    <Loader :page_ready="page_ready" @page-enter="pageEnter" />
    <Menu page_img="images/knk.png" />
    <div class="container" :class="{'_hide-canvas': hideCanvas}" ref="container" />
    <div class="controls">
      <div class="control-btn cursor-pointer" @click="changeAssets('rin')">demo_1</div>
      <div class="control-btn cursor-pointer" @click="changeAssets('garden')">demo_2</div>
      <div class="control-btn cursor-pointer" @click="changeAssets('viper')">demo_3</div>
      <div class="control-create" ref="create_drop">
        <div class="control-btn cursor-pointer" @click="openCreate()">
          Create
        </div>
        <div class="create-add" :class="{'_open': create_visible}">
          <label for="upload-image" class="create-item cursor-pointer add-image" :class="{'_done': input_image}">
            Image
            <input id="upload-image" class="input-file" type="file" @change="uploadFile($event, 'input_image')" accept="image/*" />
            <IconCheck class="upload-check" />
          </label>
          <label for="upload-music" class="create-item cursor-pointer add-music" :class="{'_done': input_music}">
            Music
            <input id="upload-music" class="input-file" type="file" @change="uploadFile($event, 'input_music')" accept="audio/*" />
            <IconCheck class="upload-check" />
          </label>
          <div class="create-item create-alpha">
            <p>Alpha:</p>
            <input id="alpha-threshold" class="cursor-text input-alpha" v-mask="'##?#'" v-model="input_threshold" type="text">
          </div>
          
          <div class="create-item create-finish" :class="{'_active': input_image && input_music}" @click="finishCreate">Finish</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { gsap } from "gsap";

import Menu from "@/components/menu.vue";
import Loader from "@/components/Loader";

import fragmentShader from "@/assets/glsl/particles/fragmentShader.glsl";
import vertexShader from "@/assets/glsl/particles/vertexShader.glsl";
import IconCheck from '~/components/icons/IconCheck.vue';

export default {
  components: {
    Menu,
    Loader,
    IconCheck,
  },

  head() {
    return {
      title: "Visualizer",
    };
  },

  data() {
    return {
      assets: {
        rin: {
          image: "images/rin.png",
          music: "audio/secretG.mp3",
          threshold: 34,
        },
        garden: {
          image: "images/back.png",
          music: "audio/garden.m4a",
          threshold: 34,
        },
        viper: {
          image: "images/viper.jpg",
          music: "audio/viper.mp3",
          threshold: 34,
        },
        custom: {
          image: "",
          music: "",
          threshold: 34,
        }
      },
      currentAsset: "rin",

      music_ready: false,
      image_ready: false,
      need_reinit: false,
      hideCanvas: false,
      create_visible: false,
      input_image: "",
      input_music: "",
      input_threshold: 34,
      animationFrame: "",
      clock: "",

      scene: "",
      camera: "",
      distance: 300,
      renderer: "",
      scale: 1,
      backgroundPosition: "cover",

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
    },
  },

  watch: {
    page_ready(val) {
      if (this.need_reinit && val) {
        this.show();
        this.need_reinit = false;
      }
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
    window.removeEventListener('click', this.closeCreate);
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
      this.init(
        this.assets[this.currentAsset].image,
        this.assets[this.currentAsset].music
      );
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
      this.object3D.material.uniforms.uMusic.value = Math.max(1, this.mapMid);
      this.object3D.material.uniforms.uTime.value += delta;
    },

    updateMouse(e) {
      gsap.to(this.camera.rotation, {
        x: (0.5 - e.clientY / window.innerHeight) * 0.15,
        y: (0.5 - e.clientX / window.innerWidth) * 0.15,
        duration: 2,
        ease: "power1.easeOut",
      });
    },

    updateSize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    resize() {
      if (!this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.resize3D();
    },

    changeAssets(asset) {
      this.image_ready = false;
      this.music_ready = false;
      this.need_reinit = true;
      this.currentAsset = asset;
      this.hide(true).then(() => {
        this.init(
          this.assets[this.currentAsset].image,
          this.assets[this.currentAsset].music
        );
      });
    },

    openCreate() {
      this.create_visible = true;
      window.addEventListener('click', this.closeCreate);
    },

    closeCreate(e) {
      const dropdown = this.$refs.create_drop;
      if (!dropdown) return;

      if ((dropdown !== e.target) && !dropdown.contains(e.target)) {
        this.create_visible = false
      }
    },

    uploadFile(e, field) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        this[field] = reader.result;
      }, false);

      reader.readAsDataURL(file);
    },

    finishCreate() {
      this.closeCreate({});
      this.assets.custom.image = this.input_image;
      this.assets.custom.music = this.input_music;
      this.assets.custom.threshold = this.input_threshold;
      this.changeAssets('custom');
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
        threshold = this.assets[this.currentAsset].threshold;
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
        uDepth: { value: 40.0 },
        uSize: { value: 0.5 },
        uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
        uTexture: { value: this.texture },

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
      this.hideCanvas = false
      this.audio.loop();
      // reset
      gsap.fromTo(
        this.object3D.material.uniforms.uSize,
        { value: 0.5 },
        { value: 1.5, duration: time }
      );
      gsap.to(this.object3D.material.uniforms.uRandom, {
        value: 2.0,
        duration: time,
      });
      gsap.fromTo(
        this.object3D.material.uniforms.uDepth,
        { value: 40.0 },
        { value: 4.0, duration: time }
      );
    },

    hide(_destroy, time = 0.8) {
      if (this.audio) {
        this.audio.pause();
      }

      return new Promise((resolve, reject) => {
        gsap.to(this.object3D.material.uniforms.uRandom, {
          value: 1.0,
          duration: time,
          onComplete: () => {
            if (_destroy) {
              this.hideCanvas = true;
              this.destroy();
            }
            resolve();
          },
        });
        gsap.to(this.object3D.material.uniforms.uDepth, {
          value: 40.0,
          ease: "power3.in",
          duration: time,
        });
        gsap.to(this.object3D.material.uniforms.uSize, {
          duration: time,
          value: 0.5,
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

      if (this.backgroundPosition === "contain") {
        const vFOV = (this.camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * this.distance;
        const relative_h = visibleHeight / this.height;

        this.scale = relative_h;
      } else {
        const vFOV = (this.camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFOV / 2) * this.distance;
        const visibleWidth = visibleHeight * this.camera.aspect;

        const relative_w = visibleWidth / this.width;
        const relative_h = visibleHeight / this.height;

        this.scale = Math.max(relative_w, relative_h);
      }

      this.object3D.scale.set(this.scale, this.scale, 1);
    },
  },
};
</script>

<style lang='scss' scoped>
.page-wrap {
  background-color: black;
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  &:before {
    content: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }

  &._hide-canvas {
    &:before {
      content: '';
    }
  }
}

.controls {
  position: absolute;
  top: 0;
  right: 20px;
  display: flex;
  color: white;
}

.control-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  padding: 4px 0;
}

.control-create {
  position: relative;
}

.create-add {
  position: absolute;
  top: 100%;
  right: 0;
  display: flex;
  flex-direction: column;
  transform-origin: top;
  transform: scaleY(0);
  opacity: 0;
  transition: all .3s ease;

  &._open {
    transform: scaleY(1);
    opacity: 1;
  }
}

.create-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  padding: 8px 0;
  color: white;
  text-align: center;
  transition: all .3s ease;

  &._done {
    color: #008200;

    .upload-check {
      opacity: 1;
    }
  }
}

.input-file {
  display: none;
}

.input-alpha {
  color: white;
  width: 23px;
  margin-left: 5px;
}

.upload-check {
  position: absolute;
  right: 0;
  width: 10px;
  height: 10px;
  fill: #008200;
  stroke: #008200;
  stroke-width: 4px;
  opacity: 0;
  transition: all .3s ease;
}

.create-alpha {
  display: flex;
}

.create-finish {
  opacity: 0;
  pointer-events: none;
  transition: all .3s ease;

  &._active {
    opacity: 1;
    pointer-events: all;
  }
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