<template>
  <div :class="['qux-stepper qux-common-no-select', cssClass]">
    <div class="qux-stepper-minus" @click="onMinus">
        <span class="qux-stepper-label">-</span>
    </div>
    <div class="qux-stepper-plus" @click="onPlus">
        <span class="qux-stepper-label">
            +
        </span>
    </div>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-stepper.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qStepper',
  mixins: [_Base],
  data: function () {
      return {
          count: 0
      }
  },
  methods: {
      getCount () {
        if (this.element) {
            let count = this.dataBindingInput
            if (!isNaN(count)) {
                return count
            }
        }
        return this.count
      },
      onMinus (e) {
        let count = this.getCount()
        this.count = count - 1
        this.change()
        this.onClick(e)
      },
      onPlus (e) {
        let count = this.getCount()
        this.count = count + 1
        this.change()
        this.onClick(e)
      },
      change() {
        if (this.element) {
          this.onValueChange(this.count, 'default')
        } else {
          this.$emit('change', this.count)
          this.$emit('input', this.count)
        }
      }
  },
  mounted () {
    if (this.element && this.element.props && this.element.props.value) {
        this.count = this.element.props.value
    }
  }
}
</script>
