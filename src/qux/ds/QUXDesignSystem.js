import Logger from "../core/Logger"
import * as Util from "../core/ExportUtil"
import Vue from 'vue'

import Button from '../web/Button.vue'
import Label from '../web/Label.vue'
import Icon from '../web/Icon.vue'
import TextBox from '../web/TextBox.vue'
import Container from '../web/Container.vue'
import Repeater from '../web/Repeater.vue'
import Image from '../web/Image.vue'
import CheckBox from '../web/CheckBox.vue'
import CheckBoxGroup from '../web/CheckBoxGroup.vue'
import RadioBox from '../web/RadioBox.vue'
import RadioGroup from '../web/RadioGroup.vue'
import Toggle from '../web/Toggle.vue'
import Switch from '../web/Switch.vue'
import DropDown from '../web/DropDown.vue'
import TextArea from '../web/TextArea.vue'
import Stepper from '../web/Stepper.vue'
import Slider from '../web/Slider.vue'
import qDate from '../web/Date.vue'
import qDatePicker from '../web/DatePicker.vue'
import Segment from '../web/Segment.vue'
import Rating from '../web/Rating.vue'
import IconToggle from '../web/IconToggle.vue'
import Combo from '../web/Combo.vue'
import Table from '../web/Table.vue'
import Paging from '../web/Paging.vue'
import Chart from '../web/Chart.vue'
import Vector from '../web/Vector.vue'
import Timeline from '../web/Timeline.vue'
import Upload from '../web/Upload.vue'
import Camera from '../web/Camera.vue'
import UploadPreview from '../web/UploadPreview.vue'
import ChildrenToggle from '../web/ChildrenToggle.vue'
import ComponentSet from '../web/ComponentSet.vue'


import ModelTransformer from '../core/ModelTransformer'
import CSSOptimizer from '../core/CSSOptimizer'
import CSSFactory from '../core/CSSFactory'
import CSSWriter from '../core/CSSWriter'


// Make here a lightweight version of QUX

// makle clear distrinction between single qwidget and container... maybe in DeisgnSystem I have to decide
// make support for slots???
// map certain properties, like options etc to child

import Config from '../core/Config'

class QUXDesignSystem {

  constructor () {
    this.server = 'https://quant-ux.com'
  }

	async register(app, config = {}, hasComponentSet = false) {
    Logger.log(2, "QUXDesignSystem.register()", app)

		if (app.substring) {
      config.imageFolder = `${this.server}/rest/images/${app}/`
      app = await this.loadAppByKey(app)
    }

    config.addDefaultDatabinding = false
		this.onAppLoaded(app, Config.merge(Config.getDefault(), config), hasComponentSet)
  }

  onAppLoaded (app, config, hasComponentSet) {
    Logger.log(3, "QUXDesignSystem.onAppLoaded() > enter", app, config)
    let start = new Date().getTime()

    let prefix = config.designletPrefix ? config.designletPrefix : ''
    /**
     * Build tree
     */
    let transformer = new ModelTransformer(app, config)
    let tree = transformer.transform()

    /**
     * Make nicer css. Also add here a parametert to convert
     * vertAlign to padding
     */
    tree = new CSSOptimizer(config).runTree(tree, true)

    /**
     * Register all qWidget to VUE. This oculd be still smarter...
     */
    this.initComponents()

    let cssFactory = new CSSFactory(config, config.imageFolder)

    /**
     * Take all first level screen children
     */
    tree.screens.forEach(screen => {
      screen.children.forEach(widget => {
        this.registerElement(app, widget, config, cssFactory, hasComponentSet, prefix)
      })
    })

    /**
     * ToDO: Create all templates
     */



    let stop = new Date().getTime()
    Logger.log(-1, "DesignSystem.onAppLoaded() > exit", stop - start)
  }

  registerElement (app, element, config, cssFactory, hasComponentSet, prefix) {
    Logger.log(-1, "QUXDesignSystem.registerElement() > enter", `<${prefix}${element.name}>/`)

    let props = ['label', 'value', 'options', 'href']

    if (hasComponentSet && Util.isComponentSet(element)) {
      this.fixComponentSet(element, props)
    }

    /**
      * Set flag for special handling and reset the cssSelectors
      */
    element.isDesignSystemRoot = true
    /**
     * Here we create dynamicaly the qWidget that is needed! we also map our internal
     * property names to nice onces, like 'lbl' => 'label'
     */
    Vue.component(prefix + element.name, {
      props: props,
      data: function () {
        return {
          count: 0
        }
      },
      render (createElement) {
        return createElement(element.qtype, {
          props: {
            element: element,
            model: app,
            lbl: this.label,
            value: this.value,
            url: this.href,
            optionList: this.options
          }
        }, this.$slots.default)
      }
    })

    this.createCSS(app, element, config, cssFactory)
  }

  fixComponentSet (element, props) {
    element.qtype = 'qComponentSet'
    element.type = 'ComponentSet'
    if (element.children && element.children.length > 0) {
      let child = element.children[0]
      if (child.variant) {
        Object.keys(child.variant).forEach(key => {
          if (props.indexOf(key) === -1) {
            props.push(key)
          }
        })
      }
      Logger.log(3, "QUXDesignSystem.fixComponentSet() > component set", `<${element.name} >/`, props)
    }
  }


  createCSS (app, element, config, cssFactory) {
    Logger.log(4, "QUXDesignSystem.createCSS() > register", element.name)


    /**
     * Reset all css selectord
     */
    Util.setCSSClassNames(element, element.cssClass)
    element.cssSelector = '.' + element.cssClass


    let classes = cssFactory.generateDesignSystemRoot(element)
    let css = []
    css = Object.values(classes).flatMap(element => {
        return element.map(e => {
            return e.code
        })
    });
    css = css.join('\n')
    CSSWriter.write(css, app.id + '-' + element.id)
  }

	async loadAppByKey(key) {
		Logger.log(2, "QUXDesignSystem.loadAppByKey() > enter", key)
		let url = `${this.server}/rest/invitation/${key}/app.json`
		let start = new Date().getTime()
		const response = await fetch(url)
		if (response.status === 200) {
			let app = await response.json()
			Logger.log(-1, "QUXDesignSystem.loadAppByKey() > exit", new Date().getTime() - start)
			return app
		} else {
			Logger.error("QUXDesignSystem.loadAppByKey() > Could not load")
		}
  }

  mergeConfig (conf) {
    if (!conf.imageFolder) {
      conf.imageFolder = '/img/'
    }
    return conf
  }

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
      Vue.component('qCamera', Camera)
      Vue.component('qChildrenToggle', ChildrenToggle)
      Vue.component('qUploadPreview', UploadPreview)
      Vue.component('qComponentSet', ComponentSet)
  }
}
export default new QUXDesignSystem()
