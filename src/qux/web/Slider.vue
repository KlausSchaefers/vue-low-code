<template>
    <div :class="['qux-slider', cssClass]" @click="onSliderClick">
        <div class="qux-slider-track">
            <div class="qux-slider-progress" :style="{'width': progress + '%'}">
            </div>
        </div>
        <div class="qux-slider-handle-cntr">
          <div class="qux-slider-handle" :style="{'left': left}" @mousedown="onHandleDown">
          </div>
        </div>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-slider.scss';
</style>
<script>

import _Base from './_Base.vue'
import _DND from './_DND.vue'
import Logger from '../core/Logger'

export default {
  name: 'qSlider',
  mixins: [_Base, _DND],
  data: function () {
      return {
          count: 0
      }
  },
  computed: {
      domPos () {
        return this.position(this.$el)
      },
      handleWidth () {
          if (this.element) {
            return this.element.style.handleWidth
          }
          return 40
      },
      minValue () {
        if (this.element && this.element.props) {
          return this.element.props.min
        }
        return 0
      },
      maxValue () {
        if (this.element && this.element.props) {
          return this.element.props.max
        }
        return 100
      },
      left () {
        let offSet = this.handleWidth / 2
        let left =  this.sliderValue / (this.maxValue - this.minValue)
        left = Math.min(1, left)
        left = Math.max(0, left)
        return `calc(${left * 100}% - ${offSet}px)`
      },
      progress () {
        return this.sliderValue
      },
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
      onSliderClick (e) {
        this.setByMouse(e)
        this.onClick(e)
      },
      onHandleDown (e) {
         this.startDND(e, (move, e) => this.setByMouse(e))
      },
      setByMouse (e) {
        let pos = this.domPos
        let mouse = this.mouse(e)
        let left = (mouse.x - pos.x) / pos.w
        left = Math.min(1, left)
        left = Math.max(0, left)
        let value = (this.maxValue - this.minValue) * left
        this.onChange(value)
      },
      onChange(value) {
        this.count = Math.round(value)
        if (this.element) {
          this.onValueChange(this.count, 'default')
          this.$emit('qChange', this.element, null, this.count)
        } else {
          this.$emit('change', this.count)
          this.$emit('input', this.count)
        }
        Logger.log(5, 'qSlider.onChange() exit > ', this.count)
      }
  },
  mounted () {
    if (this.element && this.element.props && this.element.props.value) {
        this.count = this.element.props.value
    }
  }
}
</script>
