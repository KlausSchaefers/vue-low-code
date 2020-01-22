<template>
  <textarea 
    :class="['qux-textarea', cssClass]" 
    :placeholder="placeholder"
    :type="type"
    @click="onClick"
    @change="onChange"
    @keyup="onKeyPress"
    :value="dataBindingInput" 
    />
</template>
<style lang="scss">
    @import '../scss/qux-textarea.scss';
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
  computed: {
    type () {
      if (this.element && this.element.type === 'Password') {
        return 'password'
      }
      return 'text'
    },
    placeholder () {
      if (this.element && this.element.props && this.element.props.placeholder) {
        return this.element.props.label
      }
      return ''
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
