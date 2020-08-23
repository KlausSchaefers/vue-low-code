<template>

  <div :class="['qux-timeline', cssClass]" @click="onClick">
		<div class="qux-timeline-line" />
    <div :class="['qux-timeline-element', {'qux-timeline-element-selected': isChecked(opt)}]" v-for="opt in options" :key="opt">
      <div class="qux-timeline-circle" />
      <label class="qux-timeline-label" >
        {{opt}}
      </label>
		</div>
	</div>
</template>
<style lang="scss">
    @import '../scss/qux-timeline.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qTimeline',
  mixins: [_Base],
  data: function () {
      return {
          checked: false
      }
  },
  computed: {

  },
  methods: {
    isChecked (value) {
      if (this.element) {
        let input = this.dataBindingInput
        if (input !== undefined && input != null) {
            if (isNaN(input)) {
              return input === value
            }
            let option = this.options[input]
            return option === value
        }
        if (this.element.props) {
          return this.element.props.selected === value
        }
      }
      return false
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
