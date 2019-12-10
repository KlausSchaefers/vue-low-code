<template>
  <div class="qux">
      
      <qContainer 
            v-if="currentScreen" 
            :class="'qux-screen'" 
            :element="currentScreen" 
            :model="model" 
            :config="mergedConfig"
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
    

  </div>
</template>
<style lang="scss">
    @import './scss/qux.scss';
</style>
<script>
import '@mdi/font/css/materialdesignicons.css'
import * as Util from './core/ExportUtil'
import Logger from './core/Logger'
import ModelTransformer from './core/ModelTransformer'
import CSSOptimizer from './core/CSSOptimizer'
import CSSFactory from './core/CSSFactory'
import CSSWriter from './core/CSSWriter'
import Vue from 'vue'

import Button from './web/Button'
import Label from './web/Label'
import Icon from './web/Icon'
import TextBox from './web/TextBox'
import Container from './web/Container'
import Repeater from './web/Repeater'

import Event from './mixins/Event'

export default {
  mixins:[Event],
  name: 'QUX',
  props: {
      'app': {
        type: Object
      },
      'screen': {
          type: String
      },
      'debug': {
          type: String
      },
      'value': {
          type: Object
      },
      'showDebug': {
        type: Boolean
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
        selectedScreenId: null,
        msg: 'Loading...',
        mergedConfig: {
            debug: {
                logLevel: 0
            },
            css: {
                grid: true,
                justifyContentInWrapper: false
            },
            router: {
                key: 'screenName',
                prefix: ''
            }
        }
      }
  },
  computed: {
      treeModel () {
          if (this.model) {
              let transformer = new ModelTransformer(this.model, this.config)
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
            return screen
          } else {
            let screen = this.treeModel.screens.find(screen => screen.props.start === true)
            if (!screen) {
                screen = this.treeModel.screens[0]
            }
            return screen
          }
      }
  },
  methods: {
    setGlobalCSS (tree) {
        let compressed = new CSSOptimizer(this.config).runTree(tree)
        let classes = new CSSFactory(this.config).generate(compressed)
        let css = []
        css = Object.values(classes).flatMap(element => {
            return element.map(e => {
                return e.code
            })
        });
        css = css.join('\n')
        CSSWriter.write(css)
    },
    setApp (app) {
        this.model = app
    },
    async loadAppByKey (key) {
        let url = `${this.server}/rest/invitation/${key}/app.json`
        const response = await fetch(url);
        if (response.status === 200) {
            const result = await response.json();
            this.setApp(result)
        } else {
            this.msg = 'The debug id is wrong!'
        }
    },
    setScreenByName (name) {
        // console.debug('QUX.setScreenByName() > enter ', name)
        if (this.model) {
        let screen = Object.values(this.model.screens).find(s => s.name === name)
        if (screen) {
            this.selectedScreenId = screen.id
        } else {
            this.msg = `404 - No Screen with name ${this.msg}`
            Logger.warn('QUX.setScreenByName() > No screen with name', name)
        }
        } else {
            Logger.warn('QUX.setScreenByName() > No Model')
        }
    },
    setScreenByRouter () {
        let key = 'screenName'
        if (this.config && this.config.router && this.config.router.key) {
            key = this.config.router.key
        }
        let screenName = this.$route.params[key]
        if (screenName) {
            Logger.log(2, 'QUX.setScreenByRoute() > exit ', screenName, `(${key})`)
            this.setScreenByName(screenName)
        } else {
            Logger.warn('QUX.setScreenByRoute() > No param in router ', key)
        }
    },
    setConfig (c) {
        if (c.css) {
            this.mergedConfig.css = Util.mixin(this.mergedConfig.css, c.css)
        }
        if (c.router) {
            this.mergedConfig.router = Util.mixin(this.mergedConfig.router, c.router)
        }
        if (c.debug) {
            this.mergedConfig.debug = Util.mixin(this.mergedConfig.debug, c.debug)
        }
        Logger.setLogLevel(this.mergedConfig.debug.logLevel)
        Logger.log(0, 'QUX.setConfig()', JSON.stringify(this.mergedConfig))
    },
    initComponents () {
        Vue.component('qButton', Button);
        Vue.component('qLabel', Label);
        Vue.component('qContainer', Container)
        Vue.component('qIcon', Icon)
        Vue.component('qTextBox', TextBox)
        Vue.component('qRepeater', Repeater)
    }
  },
  watch: {
    '$route' () {
        Logger.log(3, 'QUX.watch(router) > enter')
        this.setScreenByRouter()
    },
    'screen' (v) {
        Logger.log(3, 'QUX.watch(screen) > enter')
        this.setScreenByName(v)
    },
    'value' (v) {
        Logger.log(3, 'QUX.watch(value) > enter', v)
        this.value = v
    }
  },
  async mounted () {
      Logger.log(2, 'QUX.mounted() >', this.value)
      this.initComponents()
      if (this.config) {
          this.setConfig(this.config)
      }
      if (this.app) {
          this.setApp(this.app)
      }
      if (this.debug) {
          await this.loadAppByKey(this.debug)
      }
      if (this.screen) {
          this.setScreenByName(this.screen)
      } else {
        this.setScreenByRouter()
      }
  },
  beforeDestroy () {
      // destroy the css
  }
}
</script>
