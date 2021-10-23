<template>
  <a :class="['qux-label', cssClass]" @click="onClick" :href="linkURL" >
    <span class="qux-richtext" v-if="dataBindingLabel && dataBindingLabel.type === 'richtext'" v-html="dataBindingLabel.value">
    </span>
     <span class="qux-common-label" v-else-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </a>
</template>
<style lang="scss">
    @import '../scss/qux-link.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qLink',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
    linkURL () {
        if (this.element && this.element.props && this.element.props.url) {
            return this.element.props.url
        }
        return ''
    },
    isRichText () {
      let label = this.dataBindingLabel
      if (label && label.type === 'richtext') {
        return true
      }
      return false
    }
  },
  mounted () {
  }
}
</script>
