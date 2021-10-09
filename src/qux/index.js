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
import Camera from './web/Camera.vue'
import UploadPreview from './web/UploadPreview.vue'
import ChildrenToggle from './web/ChildrenToggle.vue'
import Spinner from './web/Spinner.vue'
import DynamicContainer from './web/DynamicContainer.vue'
import RichText from './web/RichText.vue'
import QUX from './QUX.vue'
import Figma from './figma/Figma.vue'

export default {
    install: (app) => {
        app.component('QUX', QUX);
        app.component('Figma', Figma)
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
    }
}