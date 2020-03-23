<template>
  <div :class="['qux-container', cssClass]">
      <component v-for="child in element.children"
        :is="child.qtype"
        :key="child.id"
        :element="child"
        :model="model"
        :config="config"
        v-model="value"
        @qCallback="forwardCallback"
        @qClick="forwardClick"
        @qChange="forwardChange"
        @qKeyPress="forwardKeyPress"
        @qFocus="forwardFocus"
        @qBlur="forwardBlur"
        @qMouseOver="forwardMouseOver"
        @qMouseOut="forwardMouseOut"
        />

      <!-- some tricky thingy to get the justified contend right...
      <template v-if="justifyContent">
        <div class="qux-container-wrapper-placeholder" v-for="(p,i) in wrapperPlaceHolders" :key="i"/>
      </template>
      -->

      <template v-if="element.fixedChildren">
        <component v-for="child in element.fixedChildren"
          :is="child.qtype"
          :key="child.id"
          :element="child"
          :model="model"
          :config="config"
          v-model="value"
          @qCallback="forwardCallback"
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
import * as Util from '../core/ExportUtil'

export default {
  name: 'qContainer',
  mixins: [_Base],
  data: function () {
      return {
        debug: false
      }
  },
  computed: {
    justifyContent () {
      if (Util.isWrappedContainer(this.element) && this.config.css.justifyContentInWrapper) {
        return true
      }
      return false
    },
    wrapperPlaceHolders () {
      return [1,2,3,4,5,6,7,8]
    }
  },
  methods: {
    forwardClick (element, e, value) {
      this.$emit('qClick', element, e, value);
    },
    forwardChange (element, e, value) {
      this.$emit('qChange', element, e, value);
    },
    forwardFocus (element, e, value) {
      this.$emit('qFocus', element, e, value);
    },
    forwardBlur (element, e, value) {
      this.$emit('qBlur', element, e, value);
    },
    forwardMouseOver (element, e, value) {
      this.$emit('qMouseOver', element, e, value);
    },
    forwardMouseOut (element, e, value) {
      this.$emit('qMouseOut', element, e, value);
    },
    forwardKeyPress (element, e, value) {
      this.$emit('qKeyPress', element, e, value)
    },
    forwardCallback (element, e, value) {
      this.$emit('qCallback', element, e, value)
    }
  },
  mounted () {
     //console.debug('Container.mounted()', this.element.name, this.element.isColumn, this.element.isRow)
  }
}
</script>
