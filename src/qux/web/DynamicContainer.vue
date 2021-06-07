
<template>
  <div :class="['qux-dynamic-container', cssClass + ' ' + cssComponentClasses]" @mouseenter="onMouseHover" @mouseleave="onMouseOut">

      <template v-if="selectedChild">
        <component
          :is="selectedChild.qtype"
          :key="selectedChild.id"
          :element="selectedChild"
          :model="model"
          :config="config"
          v-model="value"
          @qDesignSystemCallback="forwardDesignSystemCallback"
          @qCallback="forwardCallback"
          @qClick="onClick"
          @qChange="forwardChange"
          @qKeyPress="forwardKeyPress"
          @qFocus="forwardFocus"
          @qBlur="forwardBlur"
          @qMouseOver="onMouseOver"
          @qMouseOut="forwardMouseOut"
          />
      </template>
      <template v-else>
          {{qErrorMessage}}
      </template>

  </div>
</template>
<style lang="scss">
    @import '../scss/qux-dynamic-container.scss';
</style>
<script>

import _Base from './_Base.vue'
import * as Util from '../core/ExportUtil'
import Logger from '../core/Logger'

export default {
  name: 'qDynamicContainer',
  mixins: [_Base],
  data: function () {
      return {
        selectedValue: null,
        selectedChildIndex: 0,
        dynamicLines:[],
        dynamicChildValues: [],
        qErrorMessage: 'Nothing'
      }
  },
  computed: {
    selectedChild () {
      if (this.element) {
        let dataBindingInput = this.dataBindingInput
        if (dataBindingInput !== undefined) {
          let index = this.dynamicChildValues.indexOf(dataBindingInput)
          if (index >=0 && index < this.element.children.length) {
              let child = this.element.children[index]
              return child
          }
        }
        return this.element.children[this.selectedChildIndex]
      }
      return null
    }
  },
  methods: {
    onClick (element, e, value) {
      let fromLine = this.dynamicLines.find(line => line.from === element.id && line.event === 'click')
      Logger.log(1, 'DynamicContainer.onClick() > ', fromLine)
      this.executeDynamicLine(fromLine)
      this.$emit('qClick', element, e, value);
    },
    onMouseHover () {
      let element = this.selectedChild
      let fromLine = this.dynamicLines.find(line => line.from === element.id && line.event === 'hover')
      if (!fromLine) {
        fromLine = this.dynamicLines.find(line => line.from === element.id && line.event === 'mouseenter')
      }
      Logger.log(1, 'DynamicContainer.onMouseOver() > ', fromLine)
      this.executeDynamicLine(fromLine)
    },
    onMouseOut () {
      let element = this.selectedChild
      let fromLine = this.dynamicLines.find(line => line.from === element.id && line.event === 'mouseleave')
      Logger.log(-1, 'DynamicContainer.onMouseOut() > ', fromLine)
      this.executeDynamicLine(fromLine)
    },
    executeDynamicLine (fromLine) {
      if (this.element && this.element.children && fromLine) {
        let toIndex = this.element.children.findIndex(c => c.id === fromLine.to)
        if (toIndex >= 0) {
          Logger.log(1, 'DynamicContainer.executeDynamicLine() > select ', fromLine.to, toIndex )
          this.selectedChildIndex = toIndex
          this.emitDynamicDataBinding(toIndex)
          return
        }
      }
    },
    emitDynamicDataBinding (index) {
      let value = this.dynamicChildValues[index]
      this.onValueChange(value)
      Logger.log(1, 'DynamicContainer.emitDynamicDataBinding() > ', value )
    },
    forwardClick (element, e, value) {
      this.$emit('qClick', element, e, value);
    },
    forwardChange (element, e, value) {
      this.$emit('qChange', element, e, value);
    },
    forwardFocus (element, e, value) {
      this.$emit('qFocus', element, e, value);
    },
    forwardBlur (element, e, value) {
      this.$emit('qBlur', element, e, value);
    },
    forwardMouseOver (element, e, value) {
      this.$emit('qMouseOver', element, e, value);
    },
    forwardMouseOut (element, e, value) {
      this.$emit('qMouseOut', element, e, value);
    },
    forwardKeyPress (element, e, value) {
      this.$emit('qKeyPress', element, e, value)
    },
    forwardCallback (element, e, value) {
      this.$emit('qCallback', element, e, value)
    }
  },
  mounted () {
    Logger.log(-1, 'DynamicComponent.mounted()', this.element )
    if (this.element && this.element.props) {
      if (this.element.props.dynamicLines) {
        this.dynamicLines = this.element.props.dynamicLines
      }
    }

    let childDataValues = []
    if (this.element.children) {
      this.element.children.forEach((child, index) => {
        if (child.props) {
          let dataValue = child.props.dataValue
          if (dataValue !== undefined) {
            dataValue = Util.stringToType(dataValue)
          } else {
            dataValue = index
          }
          childDataValues[index] = dataValue
        }
      })
    }
    this.dynamicChildValues = childDataValues
    Logger.log(1, 'DynamicComponent.mounted() > dataValues', this.dynamicChildValues )
  }
}
</script>
