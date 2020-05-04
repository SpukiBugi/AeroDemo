<template>
  <div class="page-wrap">
    <Menu page_img="images/viper_icon.jpg" />
    <div class="container" ref="container">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from '@/assets/js/GLTFLoader.js';

import Menu from "@/components/menu.vue";
import { Vector3 } from 'three';

export default {

  components: {
    Menu,
  },

  data() {
    return {
      pause: false,
      /** Флаг сброса самолета */
      destroy_plane: false,
      /** Флаг входа самолета в поле видимости */
      entering: true,
      /** Флаг покидания самолета поля видимости */
      leaving: false,

      scene: "",
      camera: "",
      cam_frustum: "",
      clock: "",
      delta: "",

      plane: "",
      /** Флаги перемещения по осям самолета */
      endpoint: {
        x: 1,
        y: Math.ceil(Math.random() - 0.5),
        z: Math.ceil(Math.random() - 0.5)
      },
      /** Направления перемещения по осям самолета */
      signs: {
        x: Math.sign(Math.random() - 0.5),
        y: Math.sign(Math.random() - 0.5),
        z: Math.sign(Math.random() - 0.5)
      },
      smokeParticles: [],
      cubeSineDriver: 0,

      audio: "",
    }
  },

  mounted() {
    this.initThree();
    this.addText();
    this.addImage();
    this.addPlane();
    this.addSmoke();

    this.initMusic();

    window.addEventListener("resize", this.updateSize);
  },

  beforeDestroy() {
    this.audio.pause();
    window.removeEventListener("click", this.playMusic);
  },

  methods: {
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(90, 1, 1, 1000);
      // this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera.position.z = 1000;

      this.camera.updateMatrix();
      this.camera.updateMatrixWorld();
      this.cam_frustum = new THREE.Frustum();
      this.cam_frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)); 

      this.clock = new THREE.Clock();
      this.renderer = new THREE.WebGLRenderer( { alpha: true } );
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      this.scene.add( this.camera );

      /** Добавляем свет */
      let light = new THREE.DirectionalLight(0xffffff,0.5);
      light.position.set(-1,0,1);
      this.scene.add(light);
    },

    /** Добавляем текст */
    addText() {
      let textGeo = new THREE.PlaneGeometry(200,200);
      THREE.ImageUtils.crossOrigin = ''; //Need this to pull in crossdomain images from AWS
      let textTexture = THREE.ImageUtils.loadTexture('images/quickText.png');
      let textMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff, opacity: 1, map: textTexture, transparent: true, blending: THREE.AdditiveBlending})
      let text = new THREE.Mesh(textGeo,textMaterial);
      text.position.z = 800;
      this.scene.add(text);
    },

    addImage() {
      /** Добавляем изображение */
      let imgGeo = new THREE.PlaneGeometry(400, 400);
      let imgTexture = THREE.ImageUtils.loadTexture('images/viper.jpg');
      let imgMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff, opacity: 0.9, map: imgTexture, transparent: true, blending: THREE.AdditiveBlending})
      let img = new THREE.Mesh(imgGeo,imgMaterial);
      img.position.z = 800;
      this.scene.add(img);
    },

    /** Добавляем самолет */
    addPlane() {
      let gltf_loader = new GLTFLoader();
      gltf_loader.load("3d_models/plane3.gltf", (gltf) => {
        this.plane = gltf.scene.children[0];
        this.plane.scale.set(10, 10, 10);
        this.scene.add(gltf.scene);

        this.resetPlane();

        let light2 = new THREE.DirectionalLight(0xffffff, 1);
        this.scene.add(light2);
        light2.target = this.plane;

        this.$refs.container.appendChild(this.renderer.domElement);
        this.renderer.render( this.scene, this.camera );

        /** Запуск анимации */
        this.animate(); 
      });
    },

    addSmoke() {
      /** Добавляем дым */
      let smokeTexture = THREE.ImageUtils.loadTexture('images/Smoke-Element.png');
      let smokeMaterial = new THREE.MeshLambertMaterial({color: 0x00dddd, map: smokeTexture, transparent: true});
      let smokeGeo = new THREE.PlaneGeometry(100,100);

      for (let p = 0; p < 150; p++) {
        let particle = new THREE.Mesh(smokeGeo,smokeMaterial);
        particle.position.set(Math.random()*500-250,Math.random()*500-250,Math.random()*1000-100);
        particle.rotation.z = Math.random() * 360;
        this.scene.add(particle);
        this.smokeParticles.push(particle);
      }
    },

    animate() {
      this.delta = this.clock.getDelta(); 

      this.planeBehavior();
      this.evolveSmoke();
      this.render()

      requestAnimationFrame(this.animate);
    },

    planeBehavior() {
      // Проверка есть ли самолет на камере
      if (!this.destroy_plane || this.leaving) {
        /** Перемещение самолета в зависимости от того, выставлен ли флаг перемещения по оси */
        for (let key in this.endpoint) {
          if (this.endpoint[key]) {
            this.plane.position[key] += 1 * - this.signs[key];
          }
        }

        if (!this.cam_frustum.containsPoint(this.plane.position) && !this.leaving && !this.entering) {
          this.leaving = true;

          setTimeout(() => {
            this.leaving = false;
            this.destroy_plane = true;
          }, 3000);
        };
      } else {
        this.resetPlane();
      }
    },

    /** Выставляем новую позицию и поворот самолета */
    resetPlane() {
      this.entering = true;

      this.signs.x = Math.sign(Math.random() - 0.5);
      this.signs.y = Math.sign(Math.random() - 0.5);
      this.signs.z = Math.sign(Math.random() - 0.5);

      this.plane.position.z = 700 + Math.floor(Math.random() * 300);
      this.plane.position.x = this.signs.x * (1000 - this.plane.position.z) + this.signs.x * 10;
      this.plane.position.y = Math.random() * (1000 - this.plane.position.z) * this.signs.y;

      this.endpoint.y = Math.ceil(Math.random() - 0.5);
      this.endpoint.z = Math.ceil(Math.random() - 0.5);

      let view = new THREE.Vector3();
      view.copy(this.plane.position);

      for (let key in this.endpoint) {
        if (this.endpoint[key]) {
          view[key] += 1000 * -this.signs[key];
        }
      }
      this.plane.lookAt(view);
      this.destroy_plane = false;

      setTimeout(() => {
        this.entering = false;
      }, 2000);
    },
 
    evolveSmoke() {
      var sp = this.smokeParticles.length;
      while(sp--) {
        this.smokeParticles[sp].rotation.z += (this.delta * 0.2);
      }
    },

    render() {
      this.cubeSineDriver += .01;
      this.renderer.render( this.scene, this.camera );
    },


    updateSize() {
      // this.renderer.setSize( window.innerWidth, window.innerHeight );
      // this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    initMusic() {
      this.audio = new Audio('/audio/viper.mp3');
      // this.audio.play();

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
  background-color: #1f1f1f;
  background-image: url("/images/snow.png");
}

/deep/ .head-wrap {
  &:hover {
    .logo {
      transform: scale(1);
    }

    .triangle-1 {
      opacity: 0.2;
    }
  }
}

/deep/ .triangle-1 {
  opacity: 0;
}

/deep/ .logo {
  width: 130px;
  height: 130px;
  opacity: 0.6;
  transform: scale(2);
  transition: all .5s ease;
  // animation: popin 3s ease infinite alternate;
}

@keyframes popin {
  // 0%   {transform: scale(1)}
  // 100% {transform: scale(2.2)}
}

</style>
