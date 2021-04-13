<template>
  <div>
    <Loader />
    <CustomCursor />
    <Nuxt />
  </div>
</template>

<script>
import Loader from '~/components/layouts/Loader';
import CustomCursor from '~/components/layouts/CustomCursor.vue';

export default {
  components: {
    Loader,
    CustomCursor,
  },
}
</script>
