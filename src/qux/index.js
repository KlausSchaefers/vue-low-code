import { defineAsyncComponent } from 'vue';

import RichText from './web/RichText.vue'
import Link from './web/Link.vue'
import Luisa from './Luisa.vue'
import Container from './web/Container.vue'
import Repeater from './web/Repeater.vue'
import Button from './web/Button.vue'
import Label from './web/Label.vue'
import Image from './web/Image.vue'
import DropDown from './web/DropDown.vue'
import TextArea from './web/TextArea.vue'
import ChildrenToggle from './web/ChildrenToggle.vue'
import DynamicContainer from './web/DynamicContainer.vue'
import TextBox from './web/TextBox.vue'
import Vector from './web/Vector.vue'

const Icon = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Icon.vue'))
const IconToggle = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/IconToggle.vue'))
const CheckBox = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/CheckBox.vue'))
const CheckBoxGroup = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/CheckBoxGroup.vue'))
const RadioBox = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/RadioBox.vue'))
const RadioGroup = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/RadioGroup.vue'))
const Toggle = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Toggle.vue'))
const Switch = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Switch.vue'))
const Stepper = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Stepper.vue'))
const Slider = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Slider.vue'))
const qDate = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Date.vue'))
const qDatePicker = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/DatePicker.vue'))
const Segment = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Segment.vue'))
const Rating = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Rating.vue'))
const Combo = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Combo.vue'))
const Table = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Table.vue'))
const Paging = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Paging.vue'))
const Chart = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Chart.vue'))
const Timeline = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Timeline.vue'))
const Upload = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Upload.vue'))
const Camera = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Camera.vue'))
const UploadPreview = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/UploadPreview.vue'))
const Spinner = defineAsyncComponent(() => import(/* webpackChunkName: "widgets" */ './web/Spinner.vue'))


export default {
    install: (app) => {
        app.component('Luisa', Luisa);
        //app.component('Figma', Figma)
        app.component('qHotSpot', Button);
        app.component('qButton', Button);
        app.component('qBox', Button)
        app.component('qLabel', Label);
        app.component('qContainer', Container)
        app.component('qIcon', Icon)
        app.component('qTextBox', TextBox)
        app.component('qPassword', TextBox)
        app.component('qTextArea', TextArea)
        app.component('qRepeater', Repeater)
        app.component('qImage', Image)
        app.component('qCheckBox', CheckBox)
        app.component('qRadioBox', RadioBox)
        app.component('qRadioBox2', RadioBox)
        app.component('qRadioGroup', RadioGroup)
        app.component('qCheckBoxGroup', CheckBoxGroup)
        app.component('qToggleButton', Toggle)
        app.component('qSwitch', Switch)
        app.component('qDropDown', DropDown)
        app.component('qMobileDropDown', DropDown)
        app.component('qStepper', Stepper)
        app.component('qHSlider', Slider)
        app.component('qDate', qDate)
        app.component('qDateDropDown', qDatePicker)
        app.component('qSegmentButton', Segment)
        app.component('qRating', Rating)
        app.component('qIconToggle', IconToggle)
        app.component('qLabeledIconToggle', IconToggle)
        app.component('qTypeAheadTextBox', Combo)
        app.component('qTable', Table)
        app.component('qPaging', Paging)
        app.component('qBarChart', Chart)
        app.component('qPieChart', Chart)
        app.component('qMultiRingChart', Chart)
        app.component('qRingChart', Chart)
        app.component('qVector', Vector)
        app.component('qTimeline', Timeline)
        app.component('qUpload', Upload)
        app.component('qCamera', Camera)
        app.component('qChildrenToggle', ChildrenToggle)
        app.component('qUploadPreview', UploadPreview)
        app.component('qSpinner', Spinner)
        app.component('qDynamicContainer', DynamicContainer)
        app.component('qRichText', RichText)
        app.component('qLink', Link)
    }
}