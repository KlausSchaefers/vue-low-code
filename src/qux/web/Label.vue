<template>
  <router-link :class="['qux-label', cssClass]" @click="onClick"  v-if="hasLink" :to="link" >
    <span class="qux-richtext" v-if="isRichText" v-html="richText">
    </span>
     <span class="qux-common-label" v-else-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </router-link>
  <label :class="['qux-label', cssClass]" @click="onClick" v-else>
    <span class="qux-richtext" v-if="isRichText" v-html="richText">
    </span>
     <span class="qux-common-label" v-else-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </label>
</template>
<style lang="scss">
    @import '../scss/qux-label.scss';
</style>
<script>

import _Base from './_Base.vue'
import {cleanInnerHTML} from './WebUtil.js'

export default {
  name: 'qLabel',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
    richText () {
      return cleanInnerHTML(this.dataBindingLabel.value)
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
