<template>
    <div :class="['qux-spinner qux-noselect ', cssClass]" @mousedown="onStartDnd">
        <div :class="['qux-spinner-option-cntr', {'qux-spinner-option-cntr-animated': isAnimating}]" :style="'top: ' +  top">
            <div
                v-for="(option,i) in visibleOption"
                :key="i"
                :class="['qux-spinner-option qux-valign-middle', {'qux-spinner-option-selected' : option.value === selectedValue}]">
                <span class="qux-common-label">
                  {{option.label}}
                </span>
            </div>
        </div>
        <div class="qux-spinner-border"></div>
    </div>
</template>
<style lang="scss">
    @import '../scss/qux-spinner.scss';
</style>
<script>

import _Base from './_Base.vue'
import _DND from './_DND.vue'
import Logger from '../core/Logger'

export default {
  name: 'qSpinner',
  mixins: [_Base, _DND],
  data: function () {
      return {
        selected: 0,
        offset: 0,
        isAnimating: false
      }
  },
  computed: {
      optionsAsKeyValue () {
        if (this.element) {
         return this.options.map(o => {
              if (o.toLowerCase || typeof o === 'number') {
                  return {
                      label: o,
                      value: o
                  }
              }
              return o
          })
        }
        return []
      },
      selectedIndex () {
          let value = this.selectedValue
          let options = this.optionsAsKeyValue
          let index = options.findIndex(o => o.value === value)
          return index
      },
      visibleOption () {
       if (this.element) {
          let options = this.optionsAsKeyValue
          let index = this.selectedIndex
          let result = []
          let length = this.length
          for (let i = index-length;  i < index + length +1; i++) {
            let pos = (i + options.length) % options.length
            let v = options[pos]
            result.push(v)
          }
          return result
        }
        return []
      },
      selectedValue () {
        if (this.element) {
            let selected = this.dataBindingInput
            if (selected) {
                return selected
            }
        }
        return this.selected
      },
      top () {
        return (-33 * (this.length -1) ) + this.offset + '%' //'calc(-66%  + ' + this.offset + 'px)'
      },
      length () {
        return 4
      },
      domPos () {
        return this.position(this.$el)
      },
  },
  methods: {
      onStartDnd (e) {
        let pos = this.domPos
        let mouse = this.mouse(e)
        let y = mouse.y - pos.y
        let p = y / pos.h
        this._startP = p
        this.startDND(e, (move, e) => this.onMove(move, e), (up, e) => this.onEnd(up, e))
      },
      onMove (move, e) {
        let pos = this.domPos
        let mouse = this.mouse(e)
        if (mouse.y > pos.y && mouse.y < pos.y + pos.h) {
          this.offset = (move.y / pos.h) * 100
        }
      },
      onEnd (up, e) {
        /**
         * Get selected index from
         */
        let pos = this.domPos
        let p = (up.y / pos.h * 100)
        let steps = Math.round(p/33)
        if (steps === 0) {
            let mouse = this.mouse(e)
            console.debug(mouse.y)
            let p = ((mouse.y - pos.y) / pos.h)
            console.debug(p)
            if (p < 0.33) {
              steps = 1
            }
            if (p > 0.66) {
              steps = -1
            }
        }
        let newIndex = ((this.selectedIndex - steps) + this.options.length) % this.options.length
        let newValue = this.options[newIndex]



        // animate to steps * 33.3
        console.debug(steps, newValue, this.offset)
        this.offset = steps * 33.3
        this.isAnimating = true

        setTimeout(() => {
          this.isAnimating = false
          this.offset = 0
          this.onChange(newValue)
        }, 330)


        //this.onChange(newValue)

        // animate and count offset to



        //this.offset = 0
      },
      onChange(value) {
        this.selected = value
        if (this.element) {
          this.onValueChange(this.selected, 'default')
          this.$emit('qChange', this.element, null, this.selected)
        } else {
          this.$emit('change', this.selected)
          this.$emit('input', this.selected)
        }
        Logger.log(5, 'qSpinner.onChange() exit > ', this.selected)
      }
  },
  mounted () {
    if (this.element && this.element.props && this.element.props.value) {
        this.count = this.element.props.value
    }
  }
}
</script>
