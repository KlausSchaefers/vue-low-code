<template>
  <div class="qux">

      <qContainer
            v-if="currentScreen"
            :class="['qux-screen', {'qux-screen-blurred': isBluredOverlay}]"
            :element="currentScreen"
            :model="model"
            :config="mergedConfig"
            @qCallback="onCallback"
            @qClick="onClick"
            @qChange="onChange"
            @qKeyPress="onKeyPress"
            @qFocus="onFocus"
            @qBlur="onBlur"
            @qMouseOver="onMouseOver"
            @qMouseOut="onMouseOut"
            v-model="value"/>
      <div v-else>
          {{msg}}
      </div>

      <div v-if="hasOverlay" :class="['qux-overlay-wrapper', {'qux-overlay-wrapper-fixed': isFixedOverlay}]" @mousedown="popOverlay" ref="overlayWrapper">
        <qContainer
                ref="overlayCntr"
                v-if="currentOverlay"
                :element="currentOverlay"
                :class="'qux-screen'"
                :model="model"
                :config="mergedConfig"
                @qCallback="onCallback"
                @qClick="onClick"
                @qChange="onChange"
                @qKeyPress="onKeyPress"
                @qFocus="onFocus"
                @qBlur="onBlur"
                @qMouseOver="onMouseOver"
                @qMouseOut="onMouseOut"
                v-model="value"/>
      </div>

  </div>
</template>
<style lang="scss">
    @import './scss/qux.scss';
</style>
<script>

import * as Util from './core/ExportUtil'
import Logger from './core/Logger'
import ModelTransformer from './core/ModelTransformer'
import CSSOptimizer from './core/CSSOptimizer'
import CSSFactory from './core/CSSFactory'
import CSSWriter from './core/CSSWriter'
import Vue from 'vue'

import Button from './web/Button.vue'
import Label from './web/Label.vue'
import Icon from './web/Icon.vue'
import TextBox from './web/TextBox.vue'
import Container from './web/Container.vue'
import Repeater from './web/Repeater.vue'
import Image from './web/Image.vue'
import CheckBox from './web/CheckBox.vue'
import CheckBoxGroup from './web/CheckBoxGroup.vue'
import RadioBox from './web/RadioBox.vue'
import RadioGroup from './web/RadioGroup.vue'
import Toggle from './web/Toggle.vue'
import Switch from './web/Switch.vue'
import DropDown from './web/DropDown.vue'
import TextArea from './web/TextArea.vue'
import Stepper from './web/Stepper.vue'
import Slider from './web/Slider.vue'
import qDate from './web/Date.vue'
import qDatePicker from './web/DatePicker.vue'
import Segment from './web/Segment.vue'
import Rating from './web/Rating.vue'
import IconToggle from './web/IconToggle.vue'
import Combo from './web/Combo.vue'
import Table from './web/Table.vue'
import Paging from './web/Paging.vue'
import Chart from './web/Chart.vue'
import Vector from './web/Vector.vue'
import Timeline from './web/Timeline.vue'
import Upload from './web/Upload.vue'
import ChildrenToggle from './web/ChildrenToggle.vue'

import Logic from './mixins/Logic.vue'
import Event from './mixins/Event.vue'
import JSONPath from './core/JSONPath'

export default {
  mixins:[Event, Logic],
  name: 'QUX',
  props: {
      'app': {
      },
      'screen': {
          type: String
      },
      'debug': {
          type: String
      },
      'value': {
          type: Object,
          default: function () {
            return {
            }
          }
      },
      'executor': {
        type: Object
      },
      'config' : {
        type: Object,
        default: function () {
            return {
            }
        }
      }
  },
  data: function () {
      return {
        server: 'https://quant-ux.com',
        model: null,
        mobileModel: null,
        tabletModel: null,
        desktoModel: null,
        selectedScreenId: null,
        overlayScreenIds: [],
        hash: false,
        msg: 'Loading...',
        mergedConfig: {
            debug: {
                logLevel: 0
            },
            css: {
                grid: true,
                justifyContentInWrapper: false,
                pinnedLeft: false,
                pinnedRight: false,
                fixedHorizontal: false,
                attachLabels: true
            },
            router: {
                key: 'screenName',
                prefix: ''
            },
            databinding: {
                default: ''
            },
            imageFolder: '/img',
            responsive: {
                mobile: {
                    min: 0,
                    max: 400
                },
                tablet: {
                    min: 401,
                    max: 1200
                },
                desktop: {
                    min: 1201,
                    max: 1000000
                }
            }
        }
      }
  },
  computed: {
      treeModel () {
          if (this.model) {
              let transformer = new ModelTransformer(this.model, this.mergedConfig)
              let tree = transformer.transform()
              this.setGlobalCSS(tree)
              return tree
          }
          return {
            screens: []
          }
      },
      currentScreen () {
        if (this.selectedScreenId) {
            let screen = this.treeModel.screens.find(screen => screen.id === this.selectedScreenId)
            if (screen) {
                return screen
            }
        }
        return this.getDefaultScreen()
      },
      imagePrefix () {
          if (this.hash) {
            return `${this.server}/rest/images/${this.hash}/`
          }
          return this.mergedConfig.imageFolder
      },
      hasOverlay () {
        return this.overlayScreenIds.length > 0
      },
      currentOverlay () {
          let overlayId = this.overlayScreenIds[this.overlayScreenIds.length -1]
          let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
          return overlay
      },
      isFixedOverlay () {
          let overlayId = this.overlayScreenIds[this.overlayScreenIds.length -1]
          let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
          if (overlay) {
              return overlay.style.fixed
          }
          return false
      },
      isBluredOverlay () {
          let overlayId = this.overlayScreenIds[this.overlayScreenIds.length -1]
          let overlay = this.treeModel.screens.find(screen => screen.id === overlayId)
          if (overlay) {
              return overlay.style.blur
          }
          return false
      }
  },
  methods: {
    setGlobalCSS (tree) {
        let compressed = new CSSOptimizer(this.mergedConfig).runTree(tree)
        let classes = new CSSFactory(this.mergedConfig, this.imagePrefix).generate(compressed)
        let css = []
        css = Object.values(classes).flatMap(element => {
            return element.map(e => {
                return e.code
            })
        });
        css = css.join('\n')
        CSSWriter.write(css)
    },
    async setApp (app) {
        if (app.substring) {
            let model = await this.loadAppByKey(app)
            this.model = model
            this.hash = app
        } else if (app.mobile || app.desktop) {
            Logger.log(1, 'QUX.setApp() > reponsive', app)
            if (app.mobile) {
                if (app.mobile.substring) {
                    this.mobileModel = await this.loadAppByKey(app.mobile)
                } else {
                    this.mobileModel = app.mobile
                }
            }
            if (app.tablet) {
                if (app.tablet.substring) {
                    this.tabletModel = await this.loadAppByKey(app.tablet)
                } else {
                    this.tabletModel = app.tablet
                }
            }
            if (app.desktop) {
                if (app.desktop.substring) {
                    this.desktoModel = await this.loadAppByKey(app.desktop)
                } else {
                    this.desktoModel = app.desktop
                }
            }
            this.onResize()
        } else {
            this.model = app
        }
        this.initViewModel()
    },
    async loadAppByKey (key) {
        Logger.log(1, 'QUX.loadAppByKey() > enter', key)
        let url = `${this.server}/rest/invitation/${key}/app.json`
        let start = new Date().getTime()
        const response = await fetch(url);
        if (response.status === 200) {
            let app = await response.json();
            Logger.log(-1, 'QUX.setApp() > exit', new Date().getTime() - start)
            return app
        } else {
            this.msg = 'The debug id is wrong!'
        }
    },
    setScreen (screenName) {
        Logger.log(-1, 'QUX.setScreen() > ', screenName)
        // Update url, which will trigger watcher, which will call setScreenByRouter() which will call loadScreen()
        let prefix = ''
        if (this.config && this.config.router && this.config.router.prefix) {
            prefix = this.config.router.prefix + '/'
        }
        let url = `#/${prefix}${screenName}.html`
        location.hash = url
    },
    loadScreen (name) {
        Logger.log(1 , 'QUX.loadScreen() >', name)
        this.closeAllOverlays()
        if (this.model) {
            /**
             * FIXME: Use here tree model
             */
            let screen = Object.values(this.model.screens).find(s => s.name === name)
            if (screen) {
                // make here somethink like: use router? and updat ethe url as well?
                this.selectedScreenId = screen.id
                this.onScreenLoaded(screen)
            } else {
                Logger.warn('QUX.loadScreen() > No screen with name', name)
                let startScreen = this.getDefaultScreen()
                if (startScreen) {
                    this.selectedScreenId = startScreen.id
                    this.onScreenLoaded(startScreen)
                } else {
                    this.msg = `404 - No Screen with name ${this.msg}`
                }
            }
        } else {
            Logger.warn('QUX.loadScreen() > No Model')
        }
    },
    getDefaultScreen () {
        Logger.log(1, 'QUX.getDefaultScreen() > enter')
        let screen = this.treeModel.screens.find(screen => screen.props.start === true)
        if (!screen) {
            screen = this.treeModel.screens[0]
        }
        return screen
    },
    setStartScreen () {
        Logger.log(5, 'QUX.setStartScreen() > enter ')
        let startScreen = this.getDefaultScreen()
        if (startScreen) {
            this.selectedScreenId = startScreen.id
            this.onScreenLoaded(startScreen)
        } else {
            this.selectedScreenId = null
        }
    },
    setScreenByRouter () {
        Logger.log(5, 'QUX.setScreenByRoute() > enter ', this.$route)
        let key = 'screenName'
        if (this.config && this.config.router && this.config.router.key) {
            key = this.config.router.key
        }
        let screenName = this.$route.params[key]
        if (screenName) {
            Logger.log(-1, 'QUX.setScreenByRoute() > exit ', screenName, `(${key})`)
            this.loadScreen(screenName)
        } else {
            Logger.log(-1, 'QUX.setScreenByRoute() > exit > set start')
            this.setStartScreen()
        }
    },
    setConfig (c) {
        if (c.css) {
            this.mergedConfig.css = Util.mixin(this.mergedConfig.css, c.css)
        }
        if (c.router) {
            this.mergedConfig.router = Util.mixin(this.mergedConfig.router, c.router)
        }
        if (c.databinding) {
            this.mergedConfig.databinding = Util.mixin(this.mergedConfig.databinding, c.databinding)
        }
        if (c.components) {
            this.mergedConfig.components = c.components
            this.initCustomComponents(this.mergedConfig.components)
        }
        if (c.imageFolder) {
            this.mergedConfig.imageFolder = c.imageFolder
        }
        if (c.debug) {
            this.mergedConfig.debug = Util.mixin(this.mergedConfig.debug, c.debug)
        }
        Logger.setLogLevel(this.mergedConfig.debug.logLevel)
        Logger.log(-1, 'QUX.setConfig()', JSON.stringify(this.mergedConfig))
    },
    initCustomComponents (components) {
        Logger.log(1, 'QUX.initCustomComponents()')
        for (let key in components) {
            let c = components[key]
            Vue.component(key, c);
        }
    },
    initComponents () {
        Vue.component('qHotSpot', Button);
        Vue.component('qButton', Button);
        Vue.component('qBox', Button)
        Vue.component('qLabel', Label);
        Vue.component('qContainer', Container)
        Vue.component('qIcon', Icon)
        Vue.component('qTextBox', TextBox)
        Vue.component('qPassword', TextBox)
        Vue.component('qTextArea', TextArea)
        Vue.component('qRepeater', Repeater)
        Vue.component('qImage', Image)
        Vue.component('qCheckBox', CheckBox)
        Vue.component('qRadioBox', RadioBox)
        Vue.component('qRadioBox2', RadioBox)
        Vue.component('qRadioGroup', RadioGroup)
        Vue.component('qCheckBoxGroup', CheckBoxGroup)
        Vue.component('qToggleButton', Toggle)
        Vue.component('qSwitch', Switch)
        Vue.component('qDropDown', DropDown)
        Vue.component('qMobileDropDown', DropDown)
        Vue.component('qStepper', Stepper)
        Vue.component('qHSlider', Slider)
        Vue.component('qDate', qDate)
        Vue.component('qDateDropDown', qDatePicker)
        Vue.component('qSegmentButton', Segment)
        Vue.component('qRating', Rating)
        Vue.component('qIconToggle', IconToggle)
        Vue.component('qLabeledIconToggle', IconToggle)
        Vue.component('qTypeAheadTextBox', Combo)
        Vue.component('qTable', Table)
        Vue.component('qPaging', Paging)
        Vue.component('qBarChart', Chart)
        Vue.component('qPieChart', Chart)
        Vue.component('qMultiRingChart', Chart)
        Vue.component('qRingChart', Chart)
        Vue.component('qVector', Vector)
        Vue.component('qTimeline', Timeline)
        Vue.component('qUpload', Upload)
        Vue.component('qChildrenToggle', ChildrenToggle)
    },
    initViewModel () {
        Logger.log(5, 'QUX.initViewModel > enter')
        if (this.value && this.model) {
            /**
             * Fix screen names
             */
            Object.values(this.model.screens).forEach(screen => {
                screen.name = Util.getFileName(screen.name)
            })

            /**
             * Add default databinding if needed. This might have consequences on
             * reactiveness. In general it is not advided to do this.
             */
            let dataBindings = Object.values(this.model.widgets).flatMap(widget => {
                if (widget.props && widget.props.databinding) {
                    return Object.values(widget.props.databinding)
                }
                return []
            })
            dataBindings.sort((a, b) => {
                return a.localeCompare(b)
            })
            let value = this.mergedConfig.databinding.default
            dataBindings.forEach(databinding => {
                /**
                 * At some point we should have default values in the model...
                 *
                 * FIXME: This should be more intelligent and add arrays and so if needed
                 */
                let has = JSONPath.has(this.value, databinding)
                if (!has) {
                    Logger.log(4, 'QUX.initViewModel > Missing data in view model', databinding)
                    JSONPath.set(this.value, databinding, value)
                }
            })
        }
    },
    initReziseListener () {
        window.addEventListener("resize", this.onResize);
    },
    onResize () {
        let w = window.outerWidth
        let conf = this.mergedConfig.responsive
        if (w < conf.mobile.max && this.mobileModel) {
            Logger.log(2, 'QUX.onResize > exit mobile', w)
            this.model = this.mobileModel
            return
        }
        if (w < conf.tablet.max && this.tabletModel) {
            Logger.log(2, 'QUX.onResize > exit tablet', w)
            this.model = this.tabletModel
            return
        }
        if (this.desktoModel) {
            Logger.log(2, 'QUX.onResize > exit desktop', w)
            this.model = this.desktoModel
            return
        }
        this.initViewModel()
    },
    getMethodExcutor () {
        Logger.log(3, 'QUX.getMethodExcutor() > ')
        if (this.executor) {
            return this.executor
        }
        return this.$parent
    },
  },
  watch: {
    '$route' () {
        Logger.log(3, 'QUX.watch(router) > enter')
        this.setScreenByRouter()
    },
    'screen' (v) {
        Logger.log(3, 'QUX.watch(screen) > enter')
        this.setScreen(v)
    },
    'value' (v) {
        Logger.log(3, 'QUX.watch(value) > enter', v)
        this.value = v
        this.initViewModel()
    },
    'app' (v) {
        Logger.log(3, 'QUX.watch(app) > enter', v)
        this.app = v
        this.setApp(this.app)
    }
  },
  async mounted () {
      Logger.log(0, 'QUX.mounted()', this.value)
      this.initComponents()
      if (this.config) {
          this.setConfig(this.config)
      }
      if (this.app) {
          await this.setApp(this.app)
      }
      if (this.debug) {
          console.warn('QUX > debug property is decrecated. Use "app" instead.')
          await this.loadAppByKey(this.debug)
      }
      if (this.screen) {
          this.loadScreen(this.screen)
      } else {
        this.setScreenByRouter()
      }
      this.initReziseListener()
  },
  beforeDestroy () {
      window.removeEventListener("resize", this.onResize);
  }
}
</script>
