<template>
  <div :class="['qux-label', cssClass]" @click="onClick">
      {{dataBindingLabel}}
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-label.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qLabel',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  mounted () {
    // console.debug('Label.mounted()', this.element)
  }
}
</script>
