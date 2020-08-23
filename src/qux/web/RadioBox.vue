<template>
  <div :class="['qux-radiobox', cssClass, {'qux-radiobox-checked': isChecked}]" @click="toggle">
		<div class="qux-radiobox-cntr">
			<span class="qux-radiobox-hook">
			</span>
		</div>
		<span class="qux-radiobox-label" v-if="label">{{label}}</span>
	</div>
</template>
<style lang="scss">
    @import '../scss/qux-radiobox.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qRadio',
  mixins: [_Base],
  data: function () {
      return {
          checked: false
      }
  },
  computed: {
      isChecked () {
        if (this.element) {
          let input = this.dataBindingInput
          return input === this.element.name
        }
        Logger.log(5, 'qRadioBox.isChecked() >' + this.lbl, this.checked)
        return this.checked
      }
  },
  methods: {
      toggle () {
        if (this.element) {
          let value = !this.isChecked ? this.element.name : null
          this.onValueChange(value, 'default')
          Logger.log(5, 'qRadioBox.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.checked = !this.checked
          this.$emit('change', this.checked)
          this.$emit('input', this.checked)
          Logger.log(5, 'qRadioBox.toggle() >' + this.checked)
        }
      }
  },
  watch: {
    value (v) {
        Logger.log(5, 'qRadioBox.watch(value) > enter ' + this.lbl, v)
        if (v === false || v === true) {
          this.checked = v
        }
        this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qRadioBox.mounted() enter')
     if (this.value === true || this.value === true) {
        this.checked = this.value
      }
  }
}
</script>
