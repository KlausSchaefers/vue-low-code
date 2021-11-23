<template>
  <div :class="['qux-toggle', cssClass, {'qux-active': isActive}]" @click="toggle">
        <span class="qux-common-label">
            {{label}}
        </span>
	</div>
</template>
<style lang="scss">
    @import '../scss/qux-toggle.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qToggle',
  mixins: [_Base],
  data: function () {
      return {
          active: false
      }
  },
  computed: {
      isActive () {
          if (this.element) {
            let input = this.dataBindingInput
            return input === true
          }
          return this.active
      }
  },
  methods: {
      toggle () {
        if (this.element) {
          let value = !this.isActive
          this.onValueChange(value, 'default')
          Logger.log(5, 'qToggle.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.active = !this.active
          this.$emit('change', this.active)
          this.$emit('update:modelValue', this.active)
          Logger.log(5, 'qToggle.toggle() >' + this.active)
        }

      }
  },
  watch: {
    value (v) {
      Logger.log(5, 'qToggle.watch(value) > enter', v)
      if (v === false || v === true) {
        this.active = v
      }
      this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qToggle.mounted() enter')
    if (this.value === true || this.value === true) {
      this.active = this.value
    }
  }
}
</script>
