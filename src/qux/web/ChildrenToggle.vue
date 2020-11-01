<template>
  <div :class="['qux-children-toggle', cssClass, {'qux-active': isActive}]" @click="toggle">

       <template v-if="isActive" >
        <component v-for="child in element.children"
          :is="child.qtype"
          :key="child.id"
          :element="child"
          :model="model"
          :config="config"
          v-model="value"
          @qDesignSystemCallback="forwardDesignSystemCallback"
          @qCallback="forwardCallback"
          @qClick="forwardClick"
          @qChange="forwardChange"
          @qKeyPress="forwardKeyPress"
          @qFocus="forwardFocus"
          @qBlur="forwardBlur"
          @qMouseOver="forwardMouseOver"
          @qMouseOut="forwardMouseOut"
          />
       </template>


	</div>
</template>
<style lang="scss">
    @import '../scss/qux-toggle.scss';
</style>
<script>

import _Base from './_Base.vue'
import Logger from '../core/Logger'

export default {
  name: 'qChildrenToggle',
  mixins: [_Base],
  data: function () {
      return {
          active: true
      }
  },
  computed: {
      isActive () {
        if (this.element) {
          let input = this.dataBindingInput
          Logger.log(5, 'qChildrenToggle.toggle() >' + this.dataBindingInputPath, input)
          return input === true
        }
        return this.active
      }
  },
  methods: {
      toggle (e) {
        this.stopEvent(e)
        if (this.element) {
          let value = !this.isActive
          this.onValueChange(value, 'default')
          Logger.log(-1, 'qChildrenToggle.toggle() >' + this.dataBindingInputPath, value)
        } else {
          this.active = !this.active
          this.$emit('change', this.active)
          this.$emit('input', this.active)
          Logger.log(5, 'qChildrenToggle.toggle() >' + this.active)
        }
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
      },
      forwardDesignSystemCallback (element, e, type, callback) {
        this.$emit('qDesignSystemCallback', element, e, type, callback)
      }
  },
  watch: {
    value (v) {
      Logger.log(-1, 'qChildrenToggle.watch(value) > enter', v)
      if (v === false || v === true) {
        this.active = v
      }
      this.value = v
    }
  },
  mounted () {
    Logger.log(5, 'qChildrenToggle.mounted() enter')
    if (this.value === true || this.value === true) {
      this.active = this.value
    }
  }
}
</script>
