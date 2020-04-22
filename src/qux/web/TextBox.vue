<template>
  <input
    :class="['qux-textbox', cssClass]"
    :placeholder="placeholder"
    :type="type"
    @click="onClick"
    @change="onChange"
    @keyup="onKeyPress"
    :value="selectedValue"
     />
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
    },
    selectedValue () {
       if (this.element) {
            let input = this.dataBindingInput
            if (input) {
              if (!input.toLowerCase) {
                if (isNaN(input)) {
                  try {
                    input = JSON.stringify(input)
                  } catch (e) {
                    Logger.warn('TextBox.selectedValue() > Can stringify ', input)
                  }
                }
              }
            }
            return input
       }
       return ''
    }
  },
  methods: {
      onKeyPress (e) {
        let value = e.target.value
        this.onValueChange(value, 'default')
        this.$emit('qKeyPress', this.element, e, value)
        Logger.log(6, 'qTextBox.onKeyPress() > exit', value)
      },
      setFocus () {
        Logger.log(0, 'qTextBox.setFocus() > enter')
        if (this.$el) {
          this.$el.focus()
        }
      }
  },
  mounted () {
    Logger.log(5, 'qTextBox.mounted() enter')
    if (this.element && this.element.props && this.element.props.focus) {
      setTimeout(this.setFocus, 100)
    }
  }
}
</script>
