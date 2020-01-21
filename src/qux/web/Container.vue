<template>
  <div :class="['qux-container', cssClass]">
      <component v-for="child in element.children" 
        :is="child.qtype" 
        :key="child.id" 
        :element="child" 
        :model="model"
        :config="config"
        v-model="value"
        @qClick="forwardClick"
        @qChange="forwardChange"
        @qKeyPress="forwardKeyPress"
        @qFocus="forwardFocus"
        @qBlur="forwardBlur"
        @qMouseOver="forwardMouseOver"
        @qMouseOut="forwardMouseOut"
        />

      <template v-if="element.fixedChildren">
        <component v-for="child in element.fixedChildren" 
          :is="child.qtype" 
          :key="child.id" 
          :element="child" 
          :model="model"
          :config="config"
          v-model="value"
          @qClick="forwardClick"
          @qChange="forwardChange"
          @qKeyPress="forwardKeyPress"
          @qFocus="forwardFocus"
          @qBlur="forwardBlur"
          @qMouseOver="forwardMouseOver"
          @qMouseOut="forwardMouseOut"
          />
      </template>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-container.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qContainer',
  mixins: [_Base],
  data: function () {
      return {
        debug: false
      }
  },
  methods: {
    forwardClick (element, e) {
      this.$emit('qClick', element, e);
    },
    forwardChange (element, e) {
      this.$emit('qChange', element, e);
    },
    forwardFocus (element, e) {
      this.$emit('qFocus', element, e);
    },
    forwardBlur (element, e) {
      this.$emit('qBlur', element, e);
    },
    forwardMouseOver (element, e) {
      this.$emit('qMouseOver', element, e);
    },
    forwardMouseOut (element, e) {
      this.$emit('qMouseOut', element, e);
    },
    forwardKeyPress (element, e) {
      this.$emit('qKeyPress', element, e)
    } 
  },
  mounted () {
     //console.debug('Container.mounted()', this.element.name, this.element.isColumn, this.element.isRow)
  }
}
</script>
