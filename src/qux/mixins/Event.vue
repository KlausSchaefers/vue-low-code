<template>
  <div class="qux">
  </div>
</template>
<script>
import Logger from '../core/Logger'
import * as Util from '../core/ExportUtil'
import JSONPath from '../core/JSONPath'
import MetaWriter from '../core/MetaWriter'

export default {
  name: 'Event',
  methods: {

    onViewModelChange (element, path, value) {
        Logger.log(3, 'Event.onViewModelChange() > ' + path, value)
        this.executeDataScripts()
    },

    onDesignLoaded () {
        Logger.log(3, 'Event.onScreenLoaded() > ', screen)
        this.initLoadRest()
        this.initRepeatRest()
        this.initLoadScripts()
        this.initRepeatScripts()
    },

    onScreenLoaded (screen) {
        Logger.log(3, 'Event.onScreenLoaded() > ', screen)
        this.setSystemVariable('screen', screen.name)
        this.purgeValidationErrors()
        this.$emit('qScreenLoad', {
            value: this.modelValue,
            element: screen,
            screen: screen,
            viewModel: this.modelValue,
            luisa: this
        })      
        this.dispatchCallback(screen, null, 'load', null)
        this.dispatchScreenAnimation(screen)
        MetaWriter.write(screen)
    },

    /**
     * This event come from now from the table. The event 'e'
     * contains the callback and the data of the row as 'params'.
     */
    async onCallback (element, e) {
        Logger.log(1, 'Event.onCallback() > ' + element.name, e.callback)
        let executor = this.getMethodExcutor()
        if (executor) {
            if (executor[e.callback]) {
                let func = executor[e.callback]
                if (func instanceof Function) {
                    let result = await func({
                        value: null,
                        element: element,
                        viewModel: this.modelValue,
                        luisa: this,
                        params: e.params,
                        event: e
                    })

                    /**
                     * Since 0.4 we check if we can dispatch the result to a screen.
                     */
                   this.handleCallbackResult(result, e.callback)
                    return;
                } else {
                    console.warn('Event.onCallback() > Callback is not method ', e.callback)
                }
            } else {
                console.warn('Event.onCallback() > no method in executor with name ', e.callback)
            }
        }
    },

    onEnter (element, e, value) {
        Logger.log(4, 'Event.onEnter() > enter', element)

        if (element.lines) {
            let line = Util.getLineByType(element, 'KeyboardEnter')
            if (line) {
                this.executeLine(line, value)
                this.stopEvent(e)
            }
        }
    },

    onClick (element, e, value) {
        Logger.log(4, 'Event.onClick() > enter', element)
        if (Logger.logLevel > 10) {
            Logger.log(10, 'Event.onClick()', e.target)
        }
        if (element.lines) {
            let line = Util.getClickLine(element)
            if (line) {
                this.executeLine(line, value)
                this.stopEvent(e)
            }
        }

        if (element.action) {
            if (element.action.type === 'back') {
                Logger.log(1, 'Event.onClick() > Go back')
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
        this.$emit('qClick', this.getBaseEvent(element, e))
    },

    stopEvent (e) {
        if (e) {
            e.stopPropagation()
        }
    },

    executeLine(line, value) {
        Logger.log(-1, 'Event.executeLine() > enter', line, value)
   
        if (line) {
            if (line && line.validation) {
                this.validateAllWidgets()
                if (Object.values(this.validationErrors).length > 0) {
                    Logger.log(-1, 'Event.executeLine() > exit because of validation errors', line, value)
                    return
                }                
            }
            const box = Util.getBoxById(line.to, this.model)    
            if (box.type === 'Screen') {
                this.navigateToScreen(box, line, value)
                return
            } else if (box.type === 'Rest') {
                this.executeRest(box, line)
                return
            } else if (box.type === 'LogicOr') {
                this.executeLogic(box, line)
                return
            } else if (box.type === 'Script') {
                this.executeScript(box, line)
                return
            } else {
                if (!line.isComponentLine) {
                    Logger.warn('Event.executeLine() > Not supported line target', box)
                }
            }
        } else {
            Logger.error('Event.executeLine() > ERROR. Null passed', line)
        }
    },

    dispatchScreenAnimation (scrn) {
     
        // sometimes this is not the tree model!!
        if (!scrn.lines) {
            const found = this.treeModel.screens.find(s => s.id === scrn.id)
            if (found) {
                scrn = found
            }     
        }

        if (scrn.lines) {  
            const line = Util.getLineByType(scrn, 'timer')
            if (line) {
                Logger.log(-1, 'Event.dispatchScreenAnimation() > move to > ', line)
                setTimeout(() => {
                    this.executeLine(line)
                }, line.timer * 1000)
            }
            const loadedLine = Util.getLineByType(scrn, 'loaded')
            if (loadedLine) {
                Logger.log(-1, 'Event.dispatchScreenAnimation() > Loaded line > ', loadedLine)            
                this.executeLine(loadedLine)             
            }
        } 
    },

    async dispatchCallback (element, e, type, value) {
        Logger.log(4, 'Event.dispatchCallback() > enter > ' + type, element,)
        if (element.props && element.props.callbacks) {
            const callback = element.props.callbacks[type]
            if (callback) {
                Logger.log(2, 'Event.dispatchCallback() > callback > ' + type, callback)

                if (this.actionEngine && this.actionEngine.hasAction(callback)) {
                    Logger.log(-1, 'Event.dispatchCallback() > action engine: ', callback)
                    let result = await this.actionEngine.executeAction(this.app, callback, this.modelValue)
                    this.handleCallbackResult(result, callback)
                    return
                }

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
                                viewModel: this.modelValue,
                                luisa: this,
                                event: e
                            })

                            this.handleCallbackResult(result, callback)
                            return;
                        } else {
                            console.warn('Event.dispatchCallback() > Callback is not method ', callback)
                        }
                    } else {
                        console.warn('Event.dispatchCallback() > no method in $parent with name ', callback)
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
            Logger.log(-1, 'Event.handleCallbackResult() > callback > ' + callback, result)
            let nextScreen = Object.values(this.model.screens).find(s => s.name === result)
            if (nextScreen) {
                this.setScreen(result)
                this.scrollToTop()
            } else {
                Logger.warn('Event.handleCallbackResult() > no screen with name > ' + result)
            }
        }
    },

    navigateToScreen (screen, line, value) {
        if (screen.style && screen.style.overlay === true) {
            Logger.log(1, 'Event.navigateToScreen() > Overlay', screen.name)
            this.overlayScreenIds.push(screen.id)
        } else {
            Logger.log(1, 'Event.navigateToScreen() > Link', screen.name)
            this.overlayScreenIds = []
            this.setScreen(screen.name, this.getValueQuery(value))
            if (!line || line.scroll !== true) {
                this.scrollToTop()
            } else {
                Logger.log(1, 'Event.navigateToScreen() > Do not scroll')
                this.ignoreNextScroll = true
            }
        }
    },

    getValueQuery (value) {
        /**
         * We have here the magic *id* property that can come from a repeater!
         */
        if (value && value.id) {
            return `id=${value.id}`
        }
    },

    scrollToTop () {
        Logger.log(2, 'Event.scrollToTop()', this.mergedConfig.scrollToTopAfterNavigation)
        if (this.ignoreNextScroll) {
            Logger.log(-1, 'Event.scrollToTop() > ignore')
            delete this.ignoreNextScroll
            return
        }
        if (this.mergedConfig.scrollToTopAfterNavigation) {
            window.scrollTo(0, 0)
        }
        this.$emit('qScrollTop', {
            screen: this.currentScreen
        })
    },

    popOverlay (e) {
        /**
         * Only pop of the screen background was hit.
         */
        if (this.$refs.overlayCntr && e && e.target === this.$refs.overlayCntr.$el) {
            Logger.log(4, 'Event).popOverlay()')
            this.removeLastOverlay()
        }
    },

    removeLastOverlay () {
        Logger.log(4, 'Event).removeLastOverlay()')
        if (this.overlayScreenIds.length > 0) {
            this.overlayScreenIds.pop()
        }
    },

    closeAllOverlays () {
        Logger.log(4, 'Event).closeAllOverlays()')
        this.overlayScreenIds = []
    },

    onChange (element, e, value) {
        Logger.log(1, 'Event).onChange() > ', value)
        this.$emit('qChange', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'change', value)
        if (element.lines) {
            let line = Util.getLineByType(element, 'InputChange')
            if (line) {
                this.executeLine(line, value)
                this.stopEvent(e)
            }
        }
    },

    onKeyPress (element, e, value) {
        Logger.log(2, 'Event).onKeyPress() > ', e.keyCode, value)
        this.$emit('qKeyPress', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'change', value)
        if (e.keyCode === 13) {
            this.onEnter(element, e, value)
        }
    },

    onFocus (element, e, value) {
        this.$emit('qFocus', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'focus', value)
    },

    onBlur (element, e, value) {
        this.$emit('qBlur', this.getBaseEvent(element, e))
        this.dispatchCallback(element, e, 'blur', value)
    },

    onMouseOver (element, e) {
        this.$emit('qMouseOver', this.getBaseEvent(element, e))
    },

    onMouseOut (element, e) {
        this.$emit('qMouseOut', this.getBaseEvent(element, e))
    },

    setSystemVariable (key, value) {
        JSONPath.set(this.modelValue, '_qux.' + key, value)
    },

    getBaseEvent (element, e) {
        return {
            element: element,
            event:e,
            screen: this.currentScreen,
            viewModel: this.modelValue,
            luisa: this
        }
    }
  }
}
</script>
