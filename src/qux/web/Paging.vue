<template>
  <div :class="['qux-paging qux-common-no-select', cssClass]">
   
      <span :class="'qux-paging-item ' + valign" v-if="hasBack" @click="onBack">
          <span :class="'qux-common-label'">
              <span :class="backIcon" />
          </span>
      </span>

      <span :class="['qux-paging-item', {'qux-paging-item-active': isChecked(page)}, valign]" v-for="page in pages" :key="page.value" @click="onSelect(page)">
          <span :class="'qux-common-label '">
                {{page.label}}
          </span>
      </span>

       <span :class="'qux-paging-item ' + valign"  v-if="hasNext" @click="onNext">
          <span :class="'qux-common-label  '">
                <span :class="nextIcon" />
          </span>
      </span>

  </div>
</template>
<style lang="scss">
    @import '../scss/qux-paging.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
//import Vue from 'vue'

export default {
  name: 'qStepper',
  mixins: [_Base],
  data: function () {
      return {
          selected: 0,
          offset: 0,
      }
  },
  computed: {
      selectedValue () {
          if (this.element) {
            let dataBindig = this.dataBinding
            if (dataBindig && dataBindig.output) {
                return JSONPath.get(this.value, dataBindig.output)
            }
          }
          return this.selected
      },
      maxValue () {
        let dataBindig = this.dataBinding
        if (dataBindig && dataBindig.elements) {
            return JSONPath.get(this.value, dataBindig.elements)
        }
        if (this.element) {
            return this.element.props.max
        }
        return 0
      },
      hasBack () {
          return this.offset > 0
      },
      backIcon () {
          if (this.element) {
              return this.element.props.iconBack
          }
          return ''
      },
      nextIcon () {
          if (this.element) {
              return this.element.props.iconNext
          }
          return ''
      },
      hasNext () {
          return this.numberofVisibleElements + this.offset < this.maxValue
      },
      numberofVisibleElements () {
          if (this.element) {
              return this.getNumberOfVisibleElements(this.element, this.element.style, this.element.w)
          }
          return 0
      },
      valign () {
        if (this.element.style && this.element.style.verticalAlign) {
            return `qux-valign-${this.element.style.verticalAlign} `
        }
        return ''
      },
      pages () {
        let pages = []
        for (var i = 0; i < this.numberofVisibleElements; i++) {
           pages.push({
               value: this.offset + i,
               label:  this.offset + i + 1
           })
        }
        return pages
      }
  },
  methods: {
      onBack () {
        Logger.log(0, 'QPaging', 'onBack')
        this.offset -= this.numberofVisibleElements
        if (this.offset < 2) {
            this.offset = 0
        }
      },
      onNext () {
        Logger.log(0, 'QPaging', 'onNext')
        this.offset += this.numberofVisibleElements
        if (this.offset > this.maxValue - this.numberofVisibleElements) {
            this.offset = this.maxValue - this.numberofVisibleElements
        }
      },
      onSelect (page) {
        Logger.log(0, 'QPaging', 'onSelect', page.value)
        this.onValueChange(page.value, 'output')
        this.selected = page.value
      },
      isChecked (page) {
        return page.value === this.selectedValue
      },
      getNumberOfVisibleElements (model, style, width) {
        // keep in szyn
        let elementWidth = style.fontSize * 2
        let numberofVisibleElements = Math.round((width * 0.9) / elementWidth) - 1
        numberofVisibleElements = Math.min(numberofVisibleElements, model.props.max);
        if (model.props.maxVisisble > 1) {
            numberofVisibleElements = Math.min(numberofVisibleElements, model.props.maxVisisble);
        }
        if (this.offset > 0 ) {
            numberofVisibleElements--
        }
        return numberofVisibleElements
    }
  },
  mounted () {
    Logger.log(0, 'QPaging', 'mounterd')
  }
}
</script>
