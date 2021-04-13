<template>
  <div
    class="loader"
    :class="[{ _ready: page_ready, _entered: entered }, load_color]"
    @click="enterPage"
  >
    <div class="icon cursor-pointer">
      <svg class="circular" viewBox="25 25 50 50">
        <circle
          class="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-width="1"
          stroke-miterlimit="10"
        ></circle>
      </svg>

      <svg
        class="play"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 490 490"
      >
        <path
          d="M0.665,0v490l488.669-245L0.665,0z M15.977,24.806L455.183,245L15.977,465.208V24.806z"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    load_color: {
      type: String,
      default: '_blue'
    },

    page_ready: {
      type: Boolean,
      default: false
    },
  },

  data() {
    return {
      entered: false,
    };
  },

  methods: {

    enterPage() {
      if (!this.page_ready) return;

      this.entered = true;
      this.$emit('page-enter');
    },
  },
};
</script>

<style lang="scss" scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgb(6, 0, 22);
  z-index: 100;
  transition: all 0.4s ease;

  &._green {
    .play {
      fill: #008744;
    }

    .circular {
        animation: dash 2s ease-in-out infinite, color 1s ease-in-out infinite alternate-reverse,
      rotate 2s linear infinite;
    }

    &._ready {
      .circular {
        stroke: #008744;
      }
    } 
  }

  &._ready {
    .play {
      opacity: 1;
    }

    .circular {
      animation-iteration-count: 1;
      stroke-dasharray: 125, 200;
      stroke-dashoffset: 0;
      stroke: #0057e7;
    }
  }

  &._entered {
    opacity: 0;
    pointer-events: none;
  }
}

.icon {
  position: relative;
  width: 100px;
  height: 100px;
}

.circular {
  stroke-dasharray: 125, 200;
  stroke-dashoffset: 0;
  animation: dash 2s ease-in-out infinite, color 1s ease-in-out infinite alternate,
    rotate 2s linear infinite;
  stroke-linecap: round;
  transition: all 0.3s ease;
}

.play {
  position: absolute;
  top: 50%;
  left: 53%;
  width: 30px;
  height: 30px;
  transform: translate(-50%, -50%);
  opacity: 0;
  fill: #0057e7;
  transition: all 0.5s ease;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 125, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
  50.1% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 125, 200;
    stroke-dashoffset: 0;
  }
}

@keyframes color {
  0% {
    stroke: #0057e7;
  }
  100% {
    stroke: #008744;
  }
}
</style>
