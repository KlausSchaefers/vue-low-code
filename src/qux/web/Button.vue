<template>
  <a :class="['qux-button', cssClass]" v-if="hasLink" :href="link" @click="onClick">
    <span class="qux-common-label" v-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </a>
  <div :class="['qux-button', cssClass]" v-else @click="onClick">
    <span class="qux-common-label" v-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux.scss';
    @import '../scss/qux-button.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qButton',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  mounted () {
  }
}
</script>
