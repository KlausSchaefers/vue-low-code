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
    onCallback (element, e) {
        Logger.log(5, 'QUX.onCallback() > ' + element.name, e)
        if (this.$parent) {
            if (this.$parent[e.callback]) {
                let func = this.$parent[e.callback]
                if (func instanceof Function) {
                    func(this.value, element, e.params)
                    return;
                } else {
                    console.warn('QUX.onCallback() > Callback is not method ', e.callback)
                }
            } else {
                console.warn('QUX.onCallback() > no method in $parent with name ', e.callback)
            }
        }
    },
    onClick (element, e) {
        
        if (element.lines) {
            let line = Util.getClickLine(element)
            if (line) {
                let box = Util.getBoxById(line.to, this.model)
                if (box.type === 'Screen') {
                   this.naivateToScreen(box)
                   return
                }
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(2, 'QUX.onClick() > Go back')
                if (this.overlayScreenIds.length > 0) {
                    this.popOverlay()
                } else {
                    this.$router.go(-1)
                }
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
    naivateToScreen (screen) {
        if (screen.style && screen.style.overlay === true) {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Overlay', screen.name)
            this.overlayScreenIds.push(screen.id)
        } else {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Link', screen.name)
            this.overlayScreenIds = []
            let prefix = ''
            if (this.config && this.config.router && this.config.router.prefix) {
                prefix = this.config.router.prefix + '/'
            }
            let url = `#/${prefix}${screen.name}.html`
            location.hash = url
        }
    },
    popOverlay () {
        Logger.log(1, 'Qux(Event).popOverlay()')
        if (this.overlayScreenIds.length > 0) {
            this.overlayScreenIds.pop()
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
