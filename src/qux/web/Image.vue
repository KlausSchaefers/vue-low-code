<template>
  <div :class="['qux-image', cssClass, {'qux-image-icon-back': hasIcon}]" @click="onClick">
    <span v-if="hasIcon" class="mdi mdi-image-outline">

    </span>
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
  computed: {
    hasIcon() {
      if (this.element?.style?.backgroundImage) {
        return false
      }
      if (this.element?.has?.iconPlaceholder) {
        return true
      }
      return false
    }
  },
  /**
   * FIXME: add here some stuff for image uploads
   */
  mounted () {
     Logger.log(4, 'qImage.mounted()')
  }
}
</script>
