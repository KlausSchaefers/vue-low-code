<template>
  <input
    :class="['qux-textbox qux-text-input', cssClass]"
    :placeholder="placeholder"
    :type="type"
    @focus="onFocus"
    @blur="onBlur"
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
import * as ValidationUtil from '../core/ValidationUtil'

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
      if (this?.element?.props?.validation?.type === 'int') {
        return 'number'
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
      if (this.element && this.element.isDesignSystemRoot) {
        return this.value
      }
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
     
      onBlur (e) {
        if (this.isValid()) {
          this.$emit('qBlur', this.element, e)
          this.fireParentDomEvent('blur', e)
        } else {
          Logger.log(-1, 'TextBox.onBlur() > Not valid ', this.element)
        }
      },
      validateInput (value) {
        const validation = this.element?.props?.validation
        if (!validation) {
          return true
        }  
        return ValidationUtil.validateText(validation, value)
      },
      onKeyPress (e) {
        let value = e.target.value
        this.onValueChange(value, 'default', e, false)
        this.$emit('qKeyPress', this.element, e, value)
        Logger.log(6, 'qTextBox.onKeyPress() > exit', value)
      },
      setFocus () {
        Logger.log(-1, 'qTextBox.setFocus() > enter', this?.config?.scrollIntoViewOnFocus)
        if (this.$el) {
          if (this?.config?.scrollIntoViewOnFocus === true) {
            this.$el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
            setTimeout(() => {
              this.$el.focus()
            }, 200)
          } else {
             this.$el.focus()
          }
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
