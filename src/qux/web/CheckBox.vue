<template>
  <div :class="['qux-checkbox', cssClass, {'qux-checkbox-checked': isChecked}]" @click="toggle">
		<div class="qux-checkbox-cntr">
			<span class="qux-checkbox-hook">
			</span>
		</div>
		<span class="qux-checkbox-label" v-if="label">{{label}}</span>
	</div>
</template>
<style lang="scss">
    @import '../scss/qux-checkbox.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qCheckBox',
  mixins: [_Base],
  data: function () {
      return {
          checked: false
      }
  },
  computed: {
      isChecked () {
        if (this.isDesignSystemRoot) {
          return this.value
        }
        if (this.element) {
          let input = this.dataBindingInput
              return input === true
        }
        return this.checked
      }
  },
  methods: {
      toggle () {
        if (this.element) {
          let value = !this.isChecked
          this.onValueChange(value, 'default')
          Logger.log(-1, 'qCheckBox.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.checked = !this.checked
          this.$emit('change', this.checked)
          this.$emit('input', this.checked)
          Logger.log(5, 'qCheckBox.toggle() >' + this.checked)
        }
      }
  },
  watch: {
    value (v) {
      Logger.log(5, 'qCheckBox.watch(value) > enter', v)
      if (v === false || v === true) {
        this.checked = v
      }
      this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qCheckBox.mounted() enter')
    if (this.value === true || this.value === true) {
      this.checked = this.value
    }
  }
}
</script>
