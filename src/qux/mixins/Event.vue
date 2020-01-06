<template>
  <div class="qux">
  </div>
</template>
<script>
import Logger from '../core/Logger'
import * as Util from '../core/ExportUtil'

export default {
  name: 'Event',
  methods: {
    onClick (element, e) {
        
        if (element.lines) {
            let line = Util.getClickLine(element)
            if (line) {
                let box = Util.getBoxById(line.to, this.model)
                if (box.type === 'Screen') {
                    let prefix = ''
                    if (this.config && this.config.router && this.config.router.prefix) {
                        prefix = this.config.router.prefix + '/'
                    }
                    let url = `#/${prefix}${box.name}.html`
                    location.hash = url
                }
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(2, 'QUX.onClick() > Go back')
                this.$router.go(-1)
                return
            }
        }
        if (element.props && element.props.callbacks) {
            let callback = element.props.callbacks.click
            if (callback) {
                Logger.log(2, 'QUX.onClick() > callback', callback)
                if (this.$parent) {
                    if (this.$parent[callback]) {
                        let func = this.$parent[callback]
                        if (func instanceof Function) {
                            func(this.value, element, e)
                            return;
                        } else {
                            console.warn('QUX.onClick() > Callback is not method ', callback)
                        }
                    } else {
                        console.warn('QUX.onClick() > no method in $parent with name ', callback)
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
