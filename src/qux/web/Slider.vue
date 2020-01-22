<template>
    <div :class="['qux-slider', cssClass]">
        <input type="range" class="qux-slider-input" :min="1" :max="100" :value="sliderValue" @change="onChange"/>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-slider.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qStepper',
  mixins: [_Base],
  data: function () {
      return {
          count: 0
      }
  },
  computed: {
      sliderValue () {
        if (this.element) {
            let count = this.dataBindingInput
            if (!isNaN(count)) {
                return count
            }
        }
        return this.count
      }
  },
  methods: {
      onChange(e) {
        this.count = e.target.value
        if (this.element) { 
          this.onValueChange(this.count, 'default')
        } else {
          this.$emit('change', this.count)
          this.$emit('input', this.count)
        }
        Logger.log(0, 'qRadioGroup.onChange() exit > ', this.count)
      }
  },
  mounted () {
    if (this.element && this.element.props && this.element.props.value) {
        this.count = this.element.props.value
    }
  }
}
</script>
