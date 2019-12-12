<template>
  <div :class="['qux-image', cssClass]" @click="onClick">
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-image.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qImage',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  /**
   * FIXME: add here some stuff for image uploads
   */
  mounted () {
     Logger.log(0, 'qImage.mounted()')
  }
}
</script>
