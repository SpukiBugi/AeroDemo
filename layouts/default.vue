<template>
  <div>
    <client-only>
      <CustomCursor v-if="!isMobile" />
    </client-only>
    <Nuxt />
  </div>
</template>

<script>
import CustomCursor from '@/components/layouts/CustomCursor.vue';

export default {
  components: {
    CustomCursor,
  },

  computed: {
    isMobile() {
      return this.$mq === 'xs' || this.$mq === 'sm'
    }
  }
}
</script>
