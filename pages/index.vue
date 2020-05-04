<template>
  <div class="page-wrap">
    <Menu page_img="/images/knk.png" />
    <div class="container" ref="container">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';

import Menu from "@/components/menu.vue";

export default {

  components: {
    Menu,
  },

  data() {
    return {
      image: "/images/back.png",
      image2: "/images/smoke.png",
      scene: "",
      camera: "",

      rain: "",
      rain_geo: "",
      rain_mat: "", 

      img_w: Number,
      img_h: Number,
      img_mesh: "",

      flash: "",

      audio: "",
    }
  },

  mounted() {
    this.initThree();
    this.addLight();
    this.addThunder();
    this.drawRain();

    // Внутри запуск анимации
    this.addTexture();

    this.initMusic();

    window.addEventListener("resize", this.updateSize);
  },
  
  methods: {
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera.position.z = 1000;

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
      this.flash = new THREE.PointLight(0x021031, 30, 10000 ,1.7);
      this.scene.add(this.flash);
    },

    drawRain() {
      let rain_count = 2000;
      this.rain_geo = new THREE.Geometry();

      for (let i = 0; i < rain_count; i++) {
        let rain_drop = new THREE.Vector3(
          Math.random() * window.innerWidth - window.innerWidth / 2,
          Math.random() * window.innerHeight - window.innerHeight / 2,
          Math.random() * 1000 - 500
        );
        rain_drop.velocity = {};
        rain_drop.velocity = 0;

        this.rain_geo.vertices.push(rain_drop);
      }

      this.rain_mat = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.1,
        transparent: true
      });

      this.rain = new THREE.Points(this.rain_geo, this.rain_mat);
      this.scene.add(this.rain);
    },

    addTexture() {
      let loader = new THREE.TextureLoader();

      loader.load(this.image, (texture) => {
        this.img_w = texture.image.width;
        this.img_h = texture.image.height;

        let relative_w = this.img_w / window.innerWidth;
        let relative_h = this.img_h / window.innerHeight;

        let cover_ratio = Math.max(relative_w, relative_h);
        let img_geo_w = this.img_w * cover_ratio;
        let img_geo_h = this.img_h * cover_ratio;

        let tex_geo = new THREE.PlaneBufferGeometry(img_geo_w, img_geo_h);
        let tex_mat = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true
        });

        this.img_mesh = new THREE.Mesh(tex_geo,tex_mat);
        this.img_mesh.material.opacity = 0.9;
        this.scene.add(this.img_mesh);

        // Запуск анимации
        this.animate();
      });
    },

    animate() {
      this.rain_geo.vertices.forEach(p => {
        p.velocity -= 0.001 + Math.random() * 0.001;
        p.y += p.velocity;
        if (p.y < -window.innerHeight / 2) {
          p.y = window.innerHeight / 2 + 10;
          p.velocity = 0;
        }
      });
      this.rain_geo.verticesNeedUpdate = true;
      this.rain.rotation.y +=0.002;
  
      if (Math.random() > 0.96 || this.flash.power > 100) {
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

      requestAnimationFrame(this.animate);
    },

    updateSize() {
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    initMusic() {
      this.audio = new Audio('/audio/garden.m4a');
      this.audio.play();

      window.addEventListener("click", this.playMusic);
    },

    playMusic() {
      this.audio.play();
      window.removeEventListener("click", this.playMusic);
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
