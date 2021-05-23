<template>
  <a :class="['qux-rich-text', cssClass]" @click="onClick"  v-if="hasLink" :href="link" >
     <span class="qux-common-label">
      <span v-for="(child,i) in children" :key="i" :class="'qux-rich-text-child-' + i">{{child}}</span>
    </span>
  </a>
  <label :class="['qux-rich-text', cssClass]" @click="onClick" v-else>
     <span class="qux-common-label">
      <span v-for="(child,i) in children" :key="i" :class="'qux-rich-text-child-' + i">{{child}}</span>
    </span>
  </label>
</template>
<style lang="scss">
    @import '../scss/qux-rich-text.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qRichText',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
    children () {
      if (this.element && this.element.props && this.element.props.richTextLabel) {
        let children = this.element.props.richTextLabel.map(t => t.label)
        return children
      }
      return []
    }
  },
  mounted () {
  }
}
</script>
