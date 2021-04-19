<template>
  <div>
    <div :class="['custom-cursor', classes]" :style="positionStyle">
      <div class="custom-cursor__circle"></div>

      <transition name="fade">
        <div v-if="isResize" class="custom-cursor__arrow">
          <IconResize />
        </div>
      </transition>

      <transition name="fade">
        <div v-if="isText" class="custom-cursor__arrow">
          <IconText />
        </div>
      </transition>
    </div>

    <div class="custom-cursor__dot" :style="dotStyle"></div>
  </div>
</template>

<script>
import IconResize from "../icons/IconResize";
import IconText from "../icons/IconText.vue";

export default {
  components: {
    IconResize,
    IconText,
  },

  data() {
    return {
      clientX: -100,
      clientY: -100,
      circleX: -100,
      circleY: -100,
      isCursorVisible: true,
      isHovered: false,
      isResize: false,
      isText: false,

      hoverElements: [],
      resizeElements: [],
      clickedElements: [],
    };
  },

  computed: {
    classes() {
      return {
        "is-visible": this.isCursorVisible,
        "is-hovered": this.isHovered,
        "is-resize": this.isResize,
        "is-text": this.isText,
      };
    },

    positionStyle() {
      return `transform: translate3d(${this.circleX}px, ${this.circleY}px, 0)`;
    },

    dotStyle() {
      return `transform: translate3d(${this.clientX}px, ${this.clientY}px, 0)`;
    },
  },

  mounted() {
    document.addEventListener("mousemove", this.detectCursor);
    document.addEventListener("mouseleave", this.onCursorLeave);
    document.addEventListener("mouseenter", this.onCursorEnter);
    this.initHovers();
  },

  beforeDestroy() {
    document.removeEventListener("mousemove", this.detectCursor);
    document.removeEventListener("mouseleave", this.onCursorLeave);
    document.removeEventListener("mouseenter", this.onCursorEnter);
  },

  methods: {
    detectCursor(event) {
      if (this.circleX === -100 || this.circleY === -100) {
        this.circleX = event.clientX;
        this.circleY = event.clientY;
      }

      this.clientX = event.clientX;
      this.clientY = event.clientY;
      let cursor_x = event.clientX;
      let cursor_y = event.clientY;
      this.interpolate(
        this.$data,
        ["circleX", "circleY"],
        [cursor_x, cursor_y]
      );
    },

    /** Интерполяция значения позиции мыши
     * @param - Объект содержащий значение
     * @param - Названия значений в объекте
     * @param - Целевые значения
     */
    interpolate(object, name_array, target_array) {
      cancelAnimationFrame(this.animation);

      let progress = 0;
      /** Регулятор скорости анимации(число особого смысла не имеет) */
      const speed = 0.3;

      const start_array = [];

      name_array.forEach((element) => {
        start_array.push(object[element]);
      });

      function easeOutSine(x) {
        return Math.sin((x * Math.PI) / 2);
      }

      const tick = () => {
        let step = 0.1 * speed;
        let ease = easeOutSine(progress);

        progress += step;

        name_array.forEach((element, key) => {
          object[element] =
            start_array[key] + (target_array[key] - start_array[key]) * ease;
        });

        if (progress < 1) {
          this.animation = requestAnimationFrame(tick);
        }
      };

      tick();
    },

    onCursorEnter() {
      this.isCursorVisible = true;
    },

    onCursorLeave() {
      this.isCursorVisible = false;
    },

    initHovers() {
      this.addListeners();

      setInterval(() => {
        this.removeListeners();
        this.addListeners();
      }, 500);
    },

    removeListeners() {
      this.hoverElements.forEach((item) => {
        item.removeEventListener("mouseenter", this.handleMouseEnter);
        item.removeEventListener("mouseleave", this.handleMouseLeave);
      });
      this.clickedElements.forEach((item) => {
        item.removeEventListener("click", this.handleMouseLeave);
      });
    },

    addListeners() {
      const hoverElements = [
        ...document.querySelectorAll(".cursor-pointer"),
        ...document.querySelectorAll(".cursor-resize"),
        ...document.querySelectorAll(".cursor-text"),
      ];
      const clickedElements = document.querySelectorAll(".cursor-clicked");

      hoverElements.forEach((item) => {
        item.addEventListener("mouseenter", this.handleMouseEnter);
        item.addEventListener("mouseleave", this.handleMouseLeave);
      });
      clickedElements.forEach((item) => {
        item.addEventListener("click", this.handleMouseLeave);
      });

      this.hoverElements = hoverElements;
      this.clickedElements = clickedElements;
    },

    handleMouseEnter(e) {
      [...e.target.classList].forEach((cls) => {
        switch (cls) {
          case "cursor-resize":
            this.isResize = true;
            this.isHovered = true;
            break;
          case "cursor-text":
            this.isText = true;
            this.isHovered = true;
            break;
          default:
            this.isHovered = true;
        }
      });
    },

    handleMouseLeave(e) {
      this.isHovered = false;
      this.isResize = false;
      this.isText = false;
    },
  },
};
</script>

<style lang="scss">
.custom-cursor {
  position: fixed;
  top: -22px;
  left: -22px;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  opacity: 0;
  border-radius: 50%;
  cursor: none;
  pointer-events: none;
  border: 1px solid rgba($CLR_GRAY_BORDER, 0.2);
  transition: border 0.4s ease-in-out;

  &.is-hovered {
    border-color: transparent;
  }

  &.is-visible {
    opacity: 1;
  }

  &.is-hovered {
    .custom-cursor__circle {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.34);
    }
  }

  &.is-resize,
  &.is-text {
    & + .custom-cursor__dot {
      opacity: 0;
    }
  }
}

.custom-cursor__dot {
  position: fixed;
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 101;
  background-color: $CLR_GRAY_BORDER;
  pointer-events: none;
}

.custom-cursor__circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%) scale(1);
  border-radius: 50%;
  opacity: 0;
  will-change: transform, opacity;
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out,
    background-color 0.4s ease-in-out;
  background-color: rgba($CLR_GRAY_BORDER, 0.2);
}

.custom-cursor__arrows {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 68px;

  & svg {
    width: 8px;
    height: 5px;

    &:first-child {
      transform: rotate(180deg);
      transform-origin: center;
    }

    fill: white;
  }
}

.custom-cursor__arrow {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  & svg {
    fill: white;
  }
}
</style>
