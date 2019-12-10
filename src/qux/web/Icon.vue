<template>
  <span :class="['qux-icon', cssClass, icon]" @click="onClick">
  </span>
</template>
<style lang="scss">
    @import '../scss/qux-label.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qIcon',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
      icon () {
          return this.element.style.icon
      }
  },
  mounted () {
     //console.debug('Label.mounted()', this.label)
  }
}
</script>
