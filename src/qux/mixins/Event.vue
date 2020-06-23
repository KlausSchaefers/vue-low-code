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

    onScreenLoaded (screen) {
        Logger.log(3, 'QUX.onScreenLoaded() > ', screen)
        this.dispatchCallback(screen, null, 'load', null)
    },
    /**
     * This event come from now from the table. The event 'e'
     * contains the callback and the data of the row as 'params'.
     */
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

    onClick (element, e, value) {
        if (element.lines) {
            let line = Util.getClickLine(element)
            if (line) {
                this.executeLine(line)
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(0, 'QUX.onClick() > Go back')
                if (this.overlayScreenIds.length > 0) {
                    this.removeLastOverlay()
                } else {
                    this.$router.go(-1)
                }
                return
            }
        }
        this.dispatchCallback(element, e, 'click', value)
    },

    executeLine(line) {
        Logger.log(0, 'QUX.executeLine() > enter', line)
        let box = Util.getBoxById(line.to, this.model)
        if (box.type === 'Screen') {
            this.navigateToScreen(box)
            return
        } else if (box.type === 'Rest') {
            this.executeRest(box, line)
            return
        } else {
            Logger.warn('QUX.executeLine() > Not supported line target', box)
        }
    },

    dispatchCallback (element, e, type, value) {
         if (element.props && element.props.callbacks) {
            let callback = element.props.callbacks[type]
            if (callback) {
                Logger.log(2, 'QUX.dispatchCallback() > callback > ' + type, callback)
                if (this.$parent) {
                    if (this.$parent[callback]) {
                        let func = this.$parent[callback]
                        if (func instanceof Function) {
                            /**
                             * This is crucial. we need to keep this signature the same.
                             */
                            func({
                                value: value,
                                element: element,
                                viewModel: this.value,
                                qux: this,
                                event: e
                            })
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

    navigateToScreen (screen) {
        if (screen.style && screen.style.overlay === true) {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Overlay', screen.name)
            this.overlayScreenIds.push(screen.id)
        } else {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Link', screen.name)
            this.overlayScreenIds = []
            this.setScreen(screen.name)
        }
    },

    popOverlay (e) {
        /**
         * Only pop of the screen background was hit.
         */
        if (this.$refs.overlayCntr && e && e.target === this.$refs.overlayCntr.$el) {
            Logger.log(4, 'Qux(Event).popOverlay()')
            this.removeLastOverlay()
        }
    },

    removeLastOverlay () {
        Logger.log(4, 'Qux(Event).removeLastOverlay()')
        if (this.overlayScreenIds.length > 0) {
            this.overlayScreenIds.pop()
        }
    },

    closeAllOverlays () {
        Logger.log(4, 'Qux(Event).closeAllOverlays()')
        this.overlayScreenIds = []
    },

    onChange (element, e, value) {
        Logger.log(2, 'Qux(Event).onChange() > ', value)
        this.$emit('qChange', element, e)
        this.dispatchCallback(element, e, 'change', value)
    },

    onKeyPress (element, e, value) {
        Logger.log(5, 'Qux(Event).onKeyPress() > ', value)
        this.$emit('qKeyPress', element, e)
        this.dispatchCallback(element, e, 'change', value)
    },

    onFocus (element, e, value) {
        this.$emit('qFocus', element, e)
        this.dispatchCallback(element, e, 'focus', value)
    },

    onBlur (element, e, value) {
        this.$emit('qBlur', element, e)
        this.dispatchCallback(element, e, 'blur', value)
    },

    onMouseOver (element, e) {
        this.$emit('qMouseOver', element, e)
    },

    onMouseOut (element, e) {
        this.$emit('qMouseOut', element, e)
    }
  }
}
</script>
