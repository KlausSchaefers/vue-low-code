<template>
  <div :class="['qux-vector', cssClass]" @click="onClick">
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-vector.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qVector',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  /**
   * FIXME: add here some stuff for image uploads
   */
  mounted () {
     Logger.log(4, 'qVector.mounted()')
  }
}
</script>
