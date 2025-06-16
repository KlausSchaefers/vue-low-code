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

import Icon from './web/Icon.vue'
import IconToggle from './web/IconToggle.vue'
import CheckBox from './web/CheckBox.vue'
import CheckBoxGroup from './web/CheckBoxGroup.vue'
import RadioBox from './web/RadioBox.vue'
import RadioGroup from './web/RadioGroup.vue'
import Toggle from './web/Toggle.vue'
import Switch from './web/Switch.vue'
import Stepper from './web/Stepper.vue'
import Slider from './web/Slider.vue'
import qDate from './web/Date.vue'
import qDatePicker from './web/DatePicker.vue'
import Segment from './web/Segment.vue'
import Rating from './web/Rating.vue'
import Combo from './web/Combo.vue'
import Table from './web/Table.vue'
import Paging from './web/Paging.vue'
import Chart from './web/Chart.vue'
import Timeline from './web/Timeline.vue'
import Upload from './web/Upload.vue'
import Camera from './web/Camera.vue'
import UploadPreview from './web/UploadPreview.vue'
import Spinner from './web/Spinner.vue'

// const Icon from './web/Icon.vue'
// const IconToggle from './web/IconToggle.vue'
// const CheckBox from './web/CheckBox.vue'
// const CheckBoxGroup from './web/CheckBoxGroup.vue'
// const RadioBox from './web/RadioBox.vue'
// const RadioGroup from './web/RadioGroup.vue'
// const Toggle from './web/Toggle.vue'
// const Switch from './web/Switch.vue'
// const Stepper from './web/Stepper.vue'
// const Slider from './web/Slider.vue'
// const qDate from './web/Date.vue'
// const qDatePicker from './web/DatePicker.vue'
// const Segment from './web/Segment.vue'
// const Rating from './web/Rating.vue'
// const Combo from './web/Combo.vue'
// const Table from './web/Table.vue'
// const Paging from './web/Paging.vue'
// const Chart from './web/Chart.vue'
// const Timeline from './web/Timeline.vue'
// const Upload from './web/Upload.vue'
// const Camera from './web/Camera.vue'
// const UploadPreview from './web/UploadPreview.vue'
// const Spinner from './web/Spinner.vue'


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
        app.component('qLabeledCheckBox', CheckBox)
        app.component('qRadioBox', RadioBox)
        app.component('qRadioBox2', RadioBox)
        app.component('qLabeledRadioBox', RadioBox)
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