/**
* Menu
*/
<template>
  <div class="head-wrap">
    <svg class="svg" height="200" width="200" viewBox="0 0 350 350">
      <image class="logo" :href="page_img" x="15" y="15" height="100" width="100"/>

      <mask id="myMask">
        <polygon points="350,0 0,350 350,350" class="triangle-2" fill="white"  />
      </mask>

      <polygon points="0,0 350,0 0,350" class="triangle-1" />

      <g mask="url(#myMask)">
        <rect class="mask-rect" x="0" y="0" width="100%" height="100%" fill="#64a0df" />
      </g>
	  </svg>

    <div class="links-hider">
      <div class="links">
        <nuxt-link @click.native="$event.stopPropagation" :to="{ name: 'aero', params: { loaderColor: 'reverse' }}" class="cursor-pointer link-text">Aero</nuxt-link>
        <nuxt-link @click.native="$event.stopPropagation" :to="{ name: 'index'}" class="cursor-pointer link-text">Garden</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Menu',

  props: {
    page_img: String,
  },
}
</script>

<style lang='scss' scoped>
.head-wrap {
  position: absolute;
  width: 200px;
  height: 200px;

  &:hover {
    .triangle-1 {
      opacity: 0.2;
    }

    .mask-rect {
      transform: translateY(0);
    }

    .links-hider {
      height: 200px;
    }
  }
}

.svg {
  position: absolute;
}

.triangle-1 {
  fill: #f3f3f3;
  opacity: 0.1;
  transition: all .3s ease;
}

.mask-rect {
  opacity: 0.3;
  transform: translateY(-100%);
  transition: all .3s ease;
}

.links-hider {
  position: relative;
  height: 0;
  width: 100%;
  overflow: hidden;
  transition: all .3s ease;
}

.links {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 200px;
  padding-right: 20px;
  padding-bottom: 20px;
  transition: all .3s ease;
}

.link-text {
  color: black;
  font-size: 15px;
  text-decoration: none;
  text-align: right;
  transition: all .3s ease;

  &:hover {
    color: #191a63;
  }
}

// Medium screens
@media only screen and (min-width: 641px) {
}
// Large screens
@media only screen and (min-width: 1024px) {
}
// XLarge screens
@media only screen and (min-width: 1441px) {
}
</style>
