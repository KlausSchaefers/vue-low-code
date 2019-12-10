<template>
  <input 
    :class="['qux-textbox', cssClass]" 
    @click="onClick"
    @change="onChange"
    @keyup="onKeyPress"
    :value="dataBindingInput" 
    :placeholder="dataBindingInput" />
</template>
<style lang="scss">
    @import '../scss/qux-textbox.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qTestBox',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  methods: {
      onKeyPress (e) {
        let value = e.target.value
        this.onValueChange(value, 'default')
        this.$emit('qKeyPress', this.element, e)
        Logger.log(3, 'qTextBox.onKeyPress() > exit', value)
      }
  },
  mounted () {
    Logger.log(5, 'qTextBox.mounted() enter')
  }
}
</script>
