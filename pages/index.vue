<template>
  <div class="page-wrap">
    <Loader :page_ready="page_ready" @page-enter="pageEnter" />
    <Menu page_img="images/knk.png" />
    <div class="container" ref="container">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';

import Menu from "@/components/menu.vue";
import Loader from '@/components/Loader';

export default {
  components: {
    Menu,
    Loader,
  },

  head() {
    return {
      title: 'Garden'
    }
  },

  data() {
    return {
      page_ready: false,
      animationFrame: "",

      distance: 500,
      image: "images/back.png",
      image2: "images/smoke.png",
      scene: "",
      camera: "",

      rains: [],
      rain_directions: [],
      rain_cloud_count: 5,
      rain_count: 2000,
      max_rain_count: 50000,

      img_w: Number,
      img_h: Number,
      img_mesh: "",

      flash: "",
      flash_frequency: 3,

      audio: "",

      gui: "",
    }
  },

  mounted() {
    this.initThree();
    this.addLight();
    this.addThunder();
    this.drawRain();
    this.addTexture();
    this.initMusic();

    if (process.client) {
      this.initGUI();
    };

    window.addEventListener("resize", this.updateSize);
  },

  beforeDestroy() {
    cancelAnimationFrame(this.animationFrame);

    window.removeEventListener("resize", this.updateSize);
    
    if (this.audio) {
      this.audio.pause();
      window.removeEventListener("click", this.playMusic);
    }

    if (process.client) {
      this.gui.destroy();
    };
  },
  
  methods: {
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera.position.z = this.distance;

      this.renderer = new THREE.WebGLRenderer( { alpha: true } );
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);
    },

    addLight() {
      let ambient = new THREE.AmbientLight(0x555555);
      this.scene.add(ambient);

      let directionalLight = new THREE.DirectionalLight(0xffeedd);
      directionalLight.position.set(0,0,1);
      this.scene.add(directionalLight);
    },

    addThunder() {
      this.flash = new THREE.PointLight(0x021031, this.intensity, 10000 ,1.7);
      this.scene.add(this.flash);
    },

    drawRain() {
      const positions = [];

      const initCloud = () => {
        for (let i = 0; i < this.max_rain_count; i++) {
          positions[i * 3] = Math.random() * window.innerWidth - window.innerWidth / 2;
          positions[i * 3 + 1] = Math.random() * window.innerHeight - window.innerHeight / 2;
          positions[i * 3 + 2] = Math.random() * 1000 - 500;
        }

        let rain_geo = new THREE.BufferGeometry();
        rain_geo.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(positions), 3 ) );
        rain_geo.setDrawRange( 0, this.rain_count / this.rain_cloud_count );
        rain_geo.dynamic = true;

        let rain_mat = new THREE.PointsMaterial({
          color: 0xaaaaaa,
          size: 0.1,
          transparent: true
        });

        let rain = new THREE.Points(rain_geo, rain_mat);

        this.rains.push(rain);
        this.scene.add(rain);
      }

      for (let i = 0; i < this.rain_cloud_count; i++) {
        initCloud();
        this.rain_directions.push(Math.sign(0.5 - Math.random()));
      }
    },

    addTexture() {
      let loader = new THREE.TextureLoader();

      loader.load(this.image, (texture) => {
        this.img_w = texture.image.width;
        this.img_h = texture.image.height;
        
        var vFOV = this.camera.fov * Math.PI / 180;        // convert vertical fov to radians

        const visibleHeight = 2 * Math.tan( vFOV / 2 ) * this.distance;
        const visibleWidth = visibleHeight * this.camera.aspect;

        let relative_w = visibleWidth / this.img_w;
        let relative_h = visibleHeight / this.img_h;

        let cover_ratio = Math.max(relative_w, relative_h);

        let img_geo_h, img_geo_w;

        img_geo_w = this.img_w * cover_ratio;
        img_geo_h = this.img_h * cover_ratio;

        let tex_geo = new THREE.PlaneBufferGeometry(img_geo_w, img_geo_h);
        let tex_mat = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true
        });

        this.img_mesh = new THREE.Mesh(tex_geo,tex_mat);
        this.img_mesh.material.opacity = 0.9;
        this.scene.add(this.img_mesh);

        this.page_ready = true;
      });
    },

    pageEnter() {
      this.animate();
    },

    animate() {
      this.rains.forEach((element, key) => {
        element.rotation.x += 0.001 + (0.5 - Math.random()) * 0.001;
        element.rotation.z += 0.001 +  Math.random() * 0.001;
      });
  
      if (Math.random() > (1 - 0.01 * this.flash_frequency) || this.flash.power > 100) {
        if (this.flash.power < 100) {
          this.flash.position.set(
            0,
            0,
            100
          );
        }
        this.flash.power = 50 + Math.random() * 500;
      }
      this.renderer.render(this.scene, this.camera);

      this.animationFrame = requestAnimationFrame(this.animate);
    },

    updateSize() {
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    initMusic() {
      this.audio = new Audio('audio/garden.m4a');
      this.audio.loop = true;

      window.addEventListener("click", this.playMusic);
    },

    playMusic() {
      this.audio.play();
      window.removeEventListener("click", this.playMusic);
    },

    initGUI() {
      this.gui = new dat.GUI();
      let snowController = this.gui.add({snow: this.rain_count}, 'snow', 1, this.max_rain_count, 1);
      snowController.onChange((value) => {
        this.changeRain(value);
      })

      let stormController = this.gui.add({storm: this.flash_frequency}, 'storm', 0, 10, 1);
      stormController.onChange((value) => {
        this.changeStorm(value);
      })
    },

    changeRain(value) {
      this.rains.forEach(element => {
        element.geometry.setDrawRange( 0, value / this.rain_cloud_count );
      });
    },

    changeStorm(value) {
      this.flash_frequency = value;
    }
  },
}
</script>

<style lang='scss' scoped>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
