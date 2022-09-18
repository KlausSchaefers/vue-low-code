<template>
  <div :class="['qux', {'qux-component-screen': isComponentScreen}]">

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
            />
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
            />
      </div>

  </div>
</template>
<style lang="scss">
    @import './scss/qux.scss';
</style>
<script>

import * as Util from './core/ExportUtil'
import Config from './core/Config'
import Logger from './core/Logger'
import ModelTransformer from './core/ModelTransformer'
import CSSOptimizer from './core/CSSOptimizer'
import CSSFactory from './core/CSSFactory'
import CSSWriter from './core/CSSWriter'
//import ActionEngine from './actions/ActionEngine'
import FontWriter from './core/FontWriter'
import FigmaService from './figma/FigmaService'

import Logic from './mixins/Logic.vue'
import Event from './mixins/Event.vue'

import JSONPath from './core/JSONPath'

export default {
  mixins:[Event, Logic],
  name: 'Luisa',
  emits: ['update:modelValue', 'qScreenLoad', 'qClick', 'click', 'qChange', 'change', 'qKeyPress', 'qFocus', 'qBlur', 'qDesignSystemCallback', 'qScrollTop'],
  props: {
      'app': {
          default: false
      },
      'design': {
      },
      'screen': {
          type: String
      },
      'selected': {
          type: String
      },
      'debug': {
          type: String
      },
      'modelValue': {
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
      },
      'actions': {
        type: Array
      }
  },
  provide() {
    return {
      viewModel: this.modelValue
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
        mergedConfig: Config.getDefault(),
        deviceType: ''
      }
  },
  computed: {
      treeModel () {
          if (this.model) {
              let model = this.responsiveModel
              let transformer = new ModelTransformer(model, this.mergedConfig, this.selected)
              let tree = transformer.transform()
              this.setGlobalCSS(tree, this.selected)
              this.setGlobalFonts(model, this.mergedConfig)
              return tree
          }
          return {
            screens: []
          }
      },
      responsiveModel () {
        let model = this.model
        if (this.mergedConfig.responsive) {
            model = this.getResponsiveModel(model, this.mergedConfig.responsive)
        }
        return model
      },
      currentScreen () {
        if (this.selectedScreenId) {
            let screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true).find(screen => screen.id === this.selectedScreenId)
            if (screen) {
                return screen
            }
        }
        return this.getDefaultScreen()
      },
      isComponentScreen () {
          let s = this.currentScreen
          return s ? s.isComponentScreen : false
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
    getResponsiveModel (model, responsive) {
        Logger.log(-1, 'Luisa.getResponsiveModel() > enter >', responsive)
        let pagesWithTypes = responsive.filter(t => t.types.length > 0)

        /**
         * Makre sure we have some configuration
         */
        if (pagesWithTypes.length > 0) {
            this.setDeviceType()
            model = Util.clone(model)
            let pages = this.mergedConfig.responsive.filter(t => t.types.indexOf(this.deviceType) > -1).map(t => t.page)
            Logger.log(2, 'Luisa.getResponsiveModel() > Pages >' + this.deviceType, pages.join(','))
            let filteredScreens = {}
            Object.values(model.screens).forEach(s => {
                if (pages.indexOf(s.pageName) > -1) {
                    filteredScreens[s.id] = s
                }
            })

            if (Object.values(filteredScreens).length > 0) {
                Logger.log(-1, 'Luisa.getResponsiveModel() > exit :', this.deviceType)
                model.screens = filteredScreens
                return model
            }

        }
        return model
    },
    setGlobalFonts (model, config) {
        FontWriter.write(model, config)
    },
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
        CSSWriter.write(css, tree.id)
    },
    async setFigma (figma) {
       Logger.log(-1, 'Luisa.setFigma()', this.pages)
        const figmaService = new FigmaService(figma.figmaAccessKey, this.mergedConfig)
        const selectedPages = this.pages ? this.pages : []
        let app = await figmaService.get(figma.figmaFile, true, false, selectedPages)
        app = figmaService.setBackgroundImages(app)
        return app
    },
    async setDesign(design) {
        Logger.log(-1, 'Luisa.setApp() > setDesign', design)

        if (this.config) {
          this.setConfig(this.config, design)
        }
        if (design.figmaFile && design.figmaAccessKey) {
            const app = await this.setFigma(design)
            await this.setQUX(app)
        } else {
            await this.setQUX(design)
        }
    },
    setConfig (c, design) {
        if (design.figmaId || design.figmaFile && design.figmaAccessKey) {
            Logger.log(1, 'Luisa.setConfig() > Set Figma')
            this.mergedConfig.css = Config.getFigmaCSS()
        }
        this.mergedConfig = Config.merge(this.mergedConfig, c)
        this.initCustomComponents(this.mergedConfig.components)
        Logger.setLogLevel(this.mergedConfig.debug.logLevel)
        //Logger.log(5, 'Luisa.setConfig()', JSON.stringify(this.mergedConfig, null, 2))
    },
    async setQUX (app) {
        if (app.substring) {
            let model = await this.loadAppByKey(app)
            this.model = model
            this.hash = app
        } else {
            this.model = app
        }
        this.initViewModel()
    },
    async loadAppByKey (key) {
        Logger.log(3, 'Luisa.loadAppByKey() > enter', key)
        let url = `${this.server}/rest/invitation/${key}/app.json`
        let start = new Date().getTime()
        const response = await fetch(url);
        if (response.status === 200) {
            let app = await response.json();
            Logger.log(-1, 'Luisa.loadAppByKey() > exit', new Date().getTime() - start)
            return app
        } else {
            this.msg = 'The debug id is wrong!'
        }
    },
    setScreen (screenName, query) {
        Logger.log(-1, 'Luisa.setScreen() > ', screenName, query)
        
        if (this.mergedConfig.router.disabled === true) {
            this.loadScreen(screenName)
            Logger.log(-1, 'Luisa.setScreen() > router disabled', screenName)
            return
        }
        // Update url, which will trigger watcher, which will call setScreenByRouter() which will call loadScreen()
        let prefix = ''
        if (this.config && this.config.router && this.config.router.prefix) {
            prefix = this.config.router.prefix + '/'
        }
        let url = `/${prefix}${screenName}.html`
        if (query) {
            url += '?' + query
        }
        /**
         * In history mode we have to set the entire URL
         */        
        this.$router.push(url)
    },
    loadScreen (name) {
        Logger.log(2 , 'Luisa.loadScreen() >', name)
        this.closeAllOverlays()
        if (this.model) {
            /**
             * FIXME: Use here tree model.
             */
            const model = this.responsiveModel
            const screen = Object.values(model.screens).find(s => s.name === name)
            Logger.log(2, 'Luisa.loadScreen() > Found ', screen)
            if (screen) {
                // make here somethink like: use router? and update the url as well?
                this.selectedScreenId = screen.id
                this.onScreenLoaded(screen)
            } else {
                Logger.warn('Luisa.loadScreen() > No screen with name', name)
                let startScreen = this.getDefaultScreen()
                if (startScreen) {
                    this.selectedScreenId = startScreen.id
                    this.onScreenLoaded(startScreen)
                } else {
                    this.msg = `404 - No Screen with name ${this.msg}`
                }
            }
        } else {
            Logger.warn('Luisa.loadScreen() > No Model')
        }
    },
    getDefaultScreen () {
        Logger.log(1, 'Luisa.getDefaultScreen() > enter') 
        let screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true).find(screen => screen.props.start === true)
        if (!screen) {
            screen = this.treeModel.screens.filter(screen => screen.isComponentScreen !== true)[0]
        }
        return screen
    },
    setStartScreen () {
        Logger.log(5, 'Luisa.setStartScreen() > enter ')
        const startScreen = this.getDefaultScreen()
        if (startScreen) {
            this.selectedScreenId = startScreen.id
            this.onScreenLoaded(startScreen)
        } else {
            this.selectedScreenId = null
        }
    },
    setScreenByRouter () {
        Logger.log(2, 'Luisa.setScreenByRoute() > enter ', this.$route)
        let key = 'screenName'
        if (this.config && this.config.router && this.config.router.key) {
            key = this.config.router.key
        }
        let screenName = this.$route.params[key]
        if (screenName) {
            Logger.log(1, 'Luisa.setScreenByRoute() > exit ', screenName, `(${key})`)
            this.loadScreen(screenName)
        } else {
            Logger.log(1, 'Luisa.setScreenByRoute() > exit > set start')
            this.setStartScreen()
        }
    },
   
    initCustomComponents (components) {
        Logger.log(1, 'Luisa.initCustomComponents()', components)
        //for (let key in components) {
        //    let c = components[key]
        //    //Vue.component(key, c);
        //}
    },
    initViewModel () {
        Logger.log(3, 'Luisa.initViewModel > enter')
        if (this.modelValue && this.model) {
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
                let has = JSONPath.has(this.modelValue, databinding)
                if (!has) {
                    Logger.log(-1, 'Luisa.initViewModel > Missing data in view model', databinding)
                    JSONPath.set(this.modelValue, databinding, value)
                }
            })
        }
    },
    initReziseListener () {
        window.addEventListener("resize", this.onScreenSizeChange);
    },
    onScreenSizeChange () {
        Logger.log(-1, 'Luisa.onScreenSizeChange > enter')
        this.setDeviceType()
        this.setScreenByRouter()
    },
    setDeviceType () {
        Logger.log(1, 'Luisa.setDeviceType > enter')
        let w = window.outerWidth
        let breakpoints = this.mergedConfig.breakpoints
        if (breakpoints) {
            if (w < breakpoints.mobile.max) {
                Logger.log(-1, 'Luisa.setDeviceType > exit mobile', w)
                this.deviceType = 'mobile'
                return
            }
            if (w < breakpoints.tablet.max) {
                Logger.log(-1, 'Luisa.setDeviceType > exit tablet', w)
                this.deviceType = 'tablet'
                return
            }

            Logger.log(-1, 'Luisa.setDeviceType > exit desktop', w)
            this.deviceType = 'desktop'
            return
        }
    },
    getMethodExcutor () {
        Logger.log(3, 'Luisa.getMethodExcutor() > ')
        if (this.executor) {
            return this.executor
        }
        return this.$parent
    },
  },
  watch: {
    '$route' () {
        Logger.log(3, 'Luisa.watch(router) > enter')
        if (this.mergedConfig.router.disabled === true) {
            Logger.log(-1, 'Luisa.watch(router) > Diabled')
            return
        }
        this.setScreenByRouter()
        this.scrollToTop()
    },
    'screen' (v) {
        Logger.log(3, 'Luisa.watch(screen) > enter')
        this.setScreen(v)
    },
    'value' (v) {
        Logger.error('Luisa.watch(value) > enter', v)
        //this.value = v
        //this.initViewModel()
    },
    'design' (v) {
        Logger.error('Luisa.watch(design) > enter', v)
        //this.app = v
        //this.setApp(this.app)
    }
  },
  beforeMount () {
  },
  async mounted () {
      Logger.log(0, 'Luisa.mounted()', this.value)

      if (this.design) {
          await this.setDesign(this.design)
      }
      if (this.app) {
          Logger.error('Luisa.mounted () > APP is depcreated')
          await this.setDesign(this.app)
      }
      if (this.debug) {
          console.warn('QUX > debug property is decrecated. Use "app" instead.')
          await this.loadAppByKey(this.debug)
      }
      if (!this.selected) {
        if (this.screen) {
          this.loadScreen(this.screen)
        } else {
            this.setScreenByRouter()
        }
      } else {
          Logger.log(-1, 'Luisa.mounted() > Selected:', this.selected, this.app)
      }

      if (this.$router && this.$router.mode === 'history') {
        Logger.log(-1, 'Luisa.mounted() > Launch router with history', this.$router)
      }

      this.initReziseListener()
  },
  beforeUnmount () {
      window.removeEventListener("resize", this.onResize);
  }
}
</script>
