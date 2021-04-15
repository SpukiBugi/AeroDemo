<template>
  <div class="page-wrap">
    <Loader :page_ready="page_ready" load_color="_green" @page-enter="pageEnter" />
    <Menu page_img="images/viper_icon.jpg" color='_green' />
    <div class="container" ref="container">
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { GLTFLoader } from '@/assets/js/GLTFLoader.js';

import Menu from "@/components/menu.vue";
import Loader from '@/components/Loader';

export default {
  components: {
    Menu,
    Loader,
  },

  head() {
    return {
      title: 'Aero'
    }
  },

  data() {
    return {
      page_ready: false,
      animationFrame: "",

      scene: "",
      camera: "",
      renderer: "",
      cam_frustum: "",
      clock: "",
      delta: "",

      /** Массив самолетов
       * Самолет: {
       *  object: {} - 3д объект самолета на сцене
       *  destroy_pane: Boolean - Флаг сброса самолета
       *  entering: Boolean - Флаг входа самолета в поле видимости
       *  leaving: Boolean - Флаг покидания самолета поля видимости
       *  endpoint: {
            x: 1,
            y: Math.ceil(Math.random() - 0.5),
            z: Math.ceil(Math.random() - 0.5)
       *  } - Флаги перемещения по осям самолета

          signs: {
            x: Math.sign(Math.random() - 0.5),
            y: Math.sign(Math.random() - 0.5),
            z: Math.sign(Math.random() - 0.5)
          } - Направления перемещения по осям самолета (положительный/отрицательный знак)
       * }
       */
      planes: [],

      smokeParticles: [],
      smokeTexture: "",
      smokeMaterial: "",
      smokeGeo: "",
      cubeSineDriver: 0,

      audio: "",
      pause: false,

      gui: "",
    }
  },

  mounted() {
    this.initThree();
    this.initElements();

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

    async initElements() {
      this.addText();
      this.addImage();
      await this.addPlane();
      this.addSmoke();

      /** Запуск анимации */
      this.$refs.container.appendChild(this.renderer.domElement);
      this.renderer.render( this.scene, this.camera );

      this.initMusic();

      this.page_ready = true;
    },

    initGUI() {
      this.gui = new dat.GUI();
      let planesController = this.gui.add({planes: 1}, 'planes', 1, 10, 1);
      planesController.onChange((value) => {
        this.changePlaneNumber(value);
      })

      let smokeController = this.gui.add({blaze_meter: 150}, 'blaze_meter', 1, 420, 1);
      smokeController.onChange((value) => {
        this.changeSmoke(value);
      })
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
    async addPlane() {
      return new Promise((resolve, reject) => {
        let gltf_loader = new GLTFLoader();

        gltf_loader.load("3d_models/plane3.gltf", (gltf) => {
          let plane = {
            scene_id: gltf.scene.id,
            destroy_plane: false,
            entering: true,
            leaving: false,

            endpoint: {
              x: 1,
              y: Math.ceil(Math.random() - 0.5),
              z: Math.ceil(Math.random() - 0.5)
            },
            signs: {
              x: Math.sign(Math.random() - 0.5),
              y: Math.sign(Math.random() - 0.5),
              z: Math.sign(Math.random() - 0.5)
            },
          };

          plane.object = gltf.scene.children[0];
          plane.object.scale.set(10, 10, 10);
          this.scene.add(plane.object);

          this.resetPlane(plane);

          let light2 = new THREE.DirectionalLight(0xffffff, 1);
          this.scene.add(light2);
          light2.target = plane.object;

          this.planes.push(plane);

          resolve('success');
        });
      });
    },

    addSmoke() {
      /** Добавляем дым */
      this.smokeTexture = THREE.ImageUtils.loadTexture('images/Smoke-Element.png');
      this.smokeMaterial = new THREE.MeshLambertMaterial({color: 0x00dddd, map: this.smokeTexture, transparent: true});
      this.smokeGeo = new THREE.PlaneGeometry(200,200);

      for (let p = 0; p < 150; p++) {
        let particle = new THREE.Mesh(this.smokeGeo, this.smokeMaterial);
        particle.position.set(Math.random()*500-250,Math.random()*500-250,Math.random()*1000-100);
        particle.rotation.z = Math.random() * 360;
        this.scene.add(particle);
        this.smokeParticles.push(particle);
      }
    },

    changeSmoke(number) {
      let current = this.smokeParticles.length;

      if (number > current) {
        for (let i = 0; i < number - current; i++) {
          let particle = new THREE.Mesh(this.smokeGeo, this.smokeMaterial);
          particle.position.set(Math.random()*500-250,Math.random()*500-250,Math.random()*1000-100);
          particle.rotation.z = Math.random() * 360;
          this.scene.add(particle);
          this.smokeParticles.push(particle);
        }
      } else {
        for (let i = 0; i < current - number; i++) {
          let target = this.smokeParticles[this.smokeParticles.length - 1];
          this.scene.remove(this.scene.getObjectById(target.id));
          this.smokeParticles.pop();
        }
      }
    },

    planeBehavior(plane) {
      // Проверка есть ли самолет на камере
      if (!plane.destroy_plane || plane.leaving) {
        /** Перемещение самолета в зависимости от того, выставлен ли флаг перемещения по оси */
        for (let key in plane.endpoint) {
          if (plane.endpoint[key]) {
            plane.object.position[key] += 1 * - plane.signs[key];
          }
        }

        if (!this.cam_frustum.containsPoint(plane.object.position) && !plane.leaving && !plane.entering) {
          plane.leaving = true;

          setTimeout(() => {
            plane.leaving = false;
            plane.destroy_plane = true;
          }, 3000);
        };
      } else {
        this.resetPlane(plane);
      }
    },

    /** Выставляем новую позицию и поворот самолета */
    resetPlane(plane) {
      plane.entering = true;

      plane.signs.x = Math.sign(Math.random() - 0.5);
      plane.signs.y = Math.sign(Math.random() - 0.5);
      plane.signs.z = Math.sign(Math.random() - 0.5);

      plane.object.position.z = 700 + Math.floor(Math.random() * 300);
      plane.object.position.x = plane.signs.x * (1000 - plane.object.position.z) + plane.signs.x * 50;
      plane.object.position.y = Math.random() * (1000 - plane.object.position.z) * plane.signs.y;

      plane.endpoint.x = 1;
      plane.endpoint.y = Math.ceil(Math.random() - 0.5);
      plane.endpoint.z = Math.ceil(Math.random() - 0.5);

      let view = new THREE.Vector3();
      view.copy(plane.object.position);

      for (let key in plane.endpoint) {
        if (plane.endpoint[key]) {
          view[key] += 1000 * -plane.signs[key];
        }
      }
      plane.object.lookAt(view);
      plane.destroy_plane = false;

      setTimeout(() => {
        plane.entering = false;
      }, 5000);
    },

    changePlaneNumber(number) {
      let current = this.planes.length;

      if (number > current) {
        for (let i = 0; i < number - current; i++) {
          this.addPlane();
        }
      } else {
        for (let i = 0; i < current - number; i++) {
          let target = this.planes[this.planes.length - 1];
          this.scene.remove(this.scene.getObjectById(target.object.id));
          this.planes.pop();
        }
      }
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

    pageEnter() {
      this.animate();
    },

    animate() {
      this.delta = this.clock.getDelta(); 

      this.planes.forEach(plane => {
        this.planeBehavior(plane);
      });

      this.evolveSmoke();
      this.render()

      this.animationFrame = requestAnimationFrame(this.animate);
    },

    updateSize() {
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.camera.aspect = window.innerWidth / window.innerHeight;
    },

    initMusic() {
      this.audio = new Audio('audio/viper.mp3');
      this.audio.loop = true;

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
  
  .triangle-1 {
    opacity: 0;
  }
}

/deep/ .logo {
  width: 130px;
  height: 130px;
  opacity: 0.6;
  transform: scale(2);
  transition: all .5s ease;
}
</style>