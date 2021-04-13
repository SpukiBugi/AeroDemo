<template>
  <div>
    <Loader :key="page_ready" :page_ready="page_ready" :color_rev="color_rev" />
    <CustomCursor />
    <Nuxt />
  </div>
</template>

<script>
import Loader from '@/components/layouts/Loader';
import CustomCursor from '@/components/layouts/CustomCursor.vue';

export default {
  components: {
    Loader,
    CustomCursor,
  },

  data() {
    return {
      page_ready: false,
      color_rev: false,
    }
  },

  watch: {
      $route(to, from) {
        if (to.params.loaderColor === 'reverse') {
          this.color_rev = true;
        } else {
          this.color_rev = false;
        }

        this.page_ready = false;
      },
  },

  mounted() {
    this.$root.$on('page-ready', () => {
      this.page_ready = true;
    });

  },
}
</script>
