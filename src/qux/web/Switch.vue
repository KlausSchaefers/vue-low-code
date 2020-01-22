<template>
  <div :class="['qux-switch', cssClass, {'qux-active': isActive}]" @click="toggle">
      <div :class="['qux-switch-cntr', {'qux-switch-cntr-thin': isThin}]">
        <div class="qux-switch-on"/>
        <div class="qux-switch-off"/>
      </div>
      <div class="qux-switch-handle"/>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-switch.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qSwitch',
  mixins: [_Base],
  data: function () {
      return {
          active: false
      }
  },
  computed: {
      isThin () {
          if (this.element && this.element.style.cssClass === 'MatcWidgetTypeSwitchThin') {
              return true;
          }
          return false
      },
      isActive () {
          if (this.element) {
            let input = this.dataBindingInput
            if (input) {
                return input === true
            }
          }
          return this.active
      }
  },
  methods: {
      toggle () {
        if (this.element) {
          let value = !this.isActive
          this.onValueChange(value, 'default')
          Logger.log(5, 'qSwitch.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.active = !this.active
          this.$emit('change', this.active)
          this.$emit('input', this.active)
          Logger.log(5, 'qSwitch.toggle() >' + this.active)
        }

      }
  },
  watch: {
    value (v) {
      Logger.log(5, 'qSwitch.watch(value) > enter', v)
      if (v === false || v === true) {
        this.active = v
      }
      this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qSwitch.mounted() enter')
    if (this.value === true || this.value === true) {
      this.active = this.value
    }
  }
}
</script>
