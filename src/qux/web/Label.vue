<template>
  <a :class="['qux-label', cssClass]" @click="onClick"  v-if="hasLink" :href="link" >
     <span class="qux-common-label" v-if="dataBindingLabel && !hasSlot">
      {{dataBindingLabel}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </a>
  <label :class="['qux-label', cssClass]" @click="onClick" v-else>
     <span class="qux-common-label" v-if="dataBindingLabel && !hasSlot">
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

export default {
  name: 'qLabel',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  mounted () {
  }
}
</script>
