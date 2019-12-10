<template>
  <div class="qux">
  </div>
</template>
<script>
import Logger from '../core/Logger'

export default {
  name: 'Event',
  methods: {
    onClick (element, e) {
          if (element.action) {
              if (element.action.type === 'back') {
                  Logger.log(1, 'QUX.onClick() > Go back')
                  this.$router.go(-1)
              }
              if (element.action.type === 'js' && element.action.callbacks) {
                  let callback = element.action.callbacks.find(c => c.event === 'click')
                  if (callback) {
                      Logger.log(3, 'QUX.onClick() > callback', callback)
                      if (this.$parent) {
                          if (this.$parent[callback.method]) {
                              let func = this.$parent[callback.method]
                              if (func instanceof Function) {
                                  func(this.value, element, e)
                              } else {
                                   console.warn('QUX.onClick() > Callback is not method ', callback)
                              }
                          } else {
                              console.warn('QUX.onClick() > no method in $parent with name ', callback)
                          }
                      }
                  }
              }
          }
    },
    onChange (e) {
        this.$emit('qChange', this.element, e)
    },
    onKeyPress (e) {
        this.$emit('qKeyPress', this.element, e)
    },
    onFocus (e) {
        this.$emit('qFocus', this.element, e)
    },
    onBlur (e) {
        this.$emit('qBlur', this.element, e)
    },
    onMouseOver (e) {
        this.$emit('qMouseOver', this.element, e)
    },
    onMouseOut (e) {
        this.$emit('qMouseOut', this.element, e)
    }
  }
}
</script>
