<template>
    <div :class="['qux-icon-toggle', cssClass, {'qux-icon-toggle-selected': isSelected}]" @click="toggle">
        <span :class="['qux-icon', icon]">
        </span>
        <span class="qux-icon-toggle-label" v-if="label">{{label}}</span>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-icon-toggle.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qIconToggle',
  mixins: [_Base],
  data: function () {
      return {
        checked: false
      }
  },
  computed: {
      isSelected () {
        if (this.element) {
            let input = this.dataBindingInput
            return input
          }
          return this.checked
      },
      icon () {
         if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                return this.element.props.activeIcon
            } else {
                return this.element.props.passiveIcon
            }
          }
          return ''
      },
  },
  methods: {
      toggle () {
        if (this.element) {
          let value = !this.isSelected
          this.onValueChange(value, 'default')
          Logger.log(1, 'qIconToggle.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.checked = !this.checked
          this.$emit('change', this.checked)
          this.$emit('update:modelValue', this.checked)
          Logger.log(5, 'qIconToggle.toggle() >' + this.checked)
        }
      }
  },
  mounted () {
  }
}
</script>
