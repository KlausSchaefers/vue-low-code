import Luisa from "./qux/Luisa.vue";
import Figma from "./qux/figma/Figma.vue";
import FigmaService from "./qux/figma/FigmaService";
import Logger from "./qux/core/Logger";

import ModelTransformer from './qux/core/ModelTransformer'
import CSSOptimizer from './qux/core/CSSOptimizer'
import CSSFactory from './qux/core/CSSFactory'
import CSSWriter from './qux/core/CSSWriter'

import Button from './qux/web/Button.vue'
import Label from './qux/web/Label.vue'
import Icon from './qux/web/Icon.vue'
import TextBox from './qux/web/TextBox.vue'
import Container from './qux/web/Container.vue'
import Repeater from './qux/web/Repeater.vue'
import Image from './qux/web/Image.vue'
import CheckBox from './qux/web/CheckBox.vue'
import CheckBoxGroup from './qux/web/CheckBoxGroup.vue'
import RadioBox from './qux/web/RadioBox.vue'
import RadioGroup from './qux/web/RadioGroup.vue'
import Toggle from './qux/web/Toggle.vue'
import Switch from './qux/web/Switch.vue'
import DropDown from './qux/web/DropDown.vue'
import TextArea from './qux/web/TextArea.vue'
import Stepper from './qux/web/Stepper.vue'
import Slider from './qux/web/Slider.vue'
import qDate from './qux/web/Date.vue'
import qDatePicker from './qux/web/DatePicker.vue'
import Segment from './qux/web/Segment.vue'
import Rating from './qux/web/Rating.vue'
import IconToggle from './qux/web/IconToggle.vue'
import Combo from './qux/web/Combo.vue'
import Table from './qux/web/Table.vue'
import Paging from './qux/web/Paging.vue'
import Chart from './qux/web/Chart.vue'
import Vector from './qux/web/Vector.vue'
import Timeline from './qux/web/Timeline.vue'
import Upload from './qux/web/Upload.vue'
import Camera from './qux/web/Camera.vue'
import UploadPreview from './qux/web/UploadPreview.vue'
import ChildrenToggle from './qux/web/ChildrenToggle.vue'
import Spinner from './qux/web/Spinner.vue'
import DynamicContainer from './qux/web/DynamicContainer.vue'
import RichText from './qux/web/RichText.vue'

import FigmaDesignSystem from './qux/ds/FigmaDesignSystem'
import QUXDesignSystem from './qux/ds/QUXDesignSystem'

export default {
 install(Vue) {
  Logger.log('Luisa.install() > enter')
  Vue.component("Luisa", Luisa);
  Vue.component("QUX", Luisa);
  Vue.component("LowCode", Luisa);
  Vue.component("Figma", Figma)

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
  Vue.component('qSpinner', Spinner)
  Vue.component('qDynamicContainer', DynamicContainer)
  Vue.component('qRichText', RichText)
 }
};

export function createFigmaService (key) {
    return new FigmaService(key)
}

export function createModelTransformer (app, config = {}, selected = null) {
    return new ModelTransformer(app, config, selected)
}

export function createCSSOptimizer () {
    return new CSSOptimizer()
}

export function createCSSFactory (config = {}, imagePrefix='') {
    return new CSSFactory(config, imagePrefix)
}

export function createCSSWriter (css, id = 'default') {
    return new CSSWriter(css, id)
}


export function setLogLevel (level) {
    Logger.setLogLevel(level)
}

export async function createFigmaDesignlets (figmaFile, figmaAcessKey, config) {
  return FigmaDesignSystem.register(figmaFile, figmaAcessKey, config)
}

export async function createFigmaDesignSystem (figmaFile, figmaAcessKey, config) {
    return FigmaDesignSystem.register(figmaFile, figmaAcessKey, config)
}


export async function createQUXDesignlets (app, config) {
    return QUXDesignSystem.register(app, config)
}

export async function createQUXDesignSystem (app, config) {
    return QUXDesignSystem.register(app, config)
}


export function getDesignSystem () {
    return QUXDesignSystem
}