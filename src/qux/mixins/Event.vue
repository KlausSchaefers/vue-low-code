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
        this.$emit('qScreenLoad', {
            value: this.value,
            element: screen,
            viewModel: this.value,
            qux: this
        })
        this.dispatchCallback(screen, null, 'load', null)
    },

    /**
     * This event come from now from the table. The event 'e'
     * contains the callback and the data of the row as 'params'.
     */
    async onCallback (element, e) {
        Logger.log(5, 'QUX.onCallback() > ' + element.name, e.callback)
        let executor = this.getMethodExcutor()
        if (executor) {
            if (executor[e.callback]) {
                let func = executor[e.callback]
                if (func instanceof Function) {
                    let result = await func({
                        value: this.value,
                        element: element,
                        viewModel: this.value,
                        qux: this,
                        params: e.params,
                        event: e
                    })

                    /**
                     * Since 0.4 we check if we can dispatch the result to a screen.
                     */
                   this.handleCallbackResult(result, e.callback)
                    return;
                } else {
                    console.warn('QUX.onCallback() > Callback is not method ', e.callback)
                }
            } else {
                console.warn('QUX.onCallback() > no method in executor with name ', e.callback)
            }
        }
    },

    onClick (element, e, value) {
        Logger.log(4, 'QUX.onClick() > enter', element)
        if (Logger.logLevel > 10) {
            Logger.log(10, 'QUX.onClick()', e.target)
        }
        if (element.lines) {
            let line = Util.getClickLine(element)
            if (line) {
                this.executeLine(line)
                this.stopEvent(e)
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(0, 'QUX.onClick() > Go back')
                this.stopEvent(e)
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

    stopEvent (e) {
        if (e) {
            e.stopPropagation()
        }
    },

    executeLine(line) {
        Logger.log(0, 'QUX.executeLine() > enter', line)
        let box = Util.getBoxById(line.to, this.model)
        if (box.type === 'Screen') {
            this.navigateToScreen(box, line)
            return
        } else if (box.type === 'Rest') {
            this.executeRest(box, line)
            return
        } else if (box.type === 'LogicOr') {
            this.executeLogic(box, line)
            return
        } else {
            Logger.warn('QUX.executeLine() > Not supported line target', box)
        }
    },

    async dispatchCallback (element, e, type, value) {
         if (element.props && element.props.callbacks) {
            let callback = element.props.callbacks[type]
            if (callback) {
                Logger.log(2, 'QUX.dispatchCallback() > callback > ' + type, callback)
                let executor = this.getMethodExcutor()
                if (executor) {
                    if (executor[callback]) {
                        let func = executor[callback]
                        if (func instanceof Function) {
                            this.stopEvent(e)
                            /**
                             * This is crucial. we need to keep this signature the same.
                             */
                            let result = await func({
                                value: value,
                                element: element,
                                viewModel: this.value,
                                qux: this,
                                event: e
                            })

                            this.handleCallbackResult(result, callback)
                            return;
                        } else {
                            console.warn('QUX.dispatchCallback() > Callback is not method ', callback)
                        }
                    } else {
                        console.warn('QUX.dispatchCallback() > no method in $parent with name ', callback)
                    }
                }
            }
        }
    },

    handleCallbackResult (result, callback) {
         /**
         * Since 0.4 we check if we can dispatch the result to a screen.
         */
        if (result) {
            Logger.log(-1, 'QUX.handleCallbackResult() > callback > ' + callback, result)
            let nextScreen = Object.values(this.model.screens).find(s => s.name === result)
            if (nextScreen) {
                this.setScreen(result)
                this.scrollToTop()
            } else {
                Logger.warn('QUX.handleCallbackResult() > no screen with name > ' + result)
            }
        }
    },

    navigateToScreen (screen, line) {
        if (screen.style && screen.style.overlay === true) {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Overlay', screen.name)
            this.overlayScreenIds.push(screen.id)
        } else {
            Logger.log(1, 'Qux(Event).navigateToScreen() > Link', screen.name)
            this.overlayScreenIds = []
            this.setScreen(screen.name)
            if (!line || line.scroll !== true) {
                this.scrollToTop()
            }
        }
    },

    scrollToTop () {
        Logger.log(4, 'Qux(Event).scrollToTop()')
        this.$emit('qScrollTop', {})
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
        Logger.log(1, 'Qux(Event).onChange() > ', value)
        this.$emit('qChange', element, e)
        this.dispatchCallback(element, e, 'change', value)
    },

    onKeyPress (element, e, value) {
        Logger.log(2, 'Qux(Event).onKeyPress() > ', value)
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
