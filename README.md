# Luisa - Framework (former vue-low-code)
The Luisa framework is an open-source project that turns [Figma](https://figma.com) and [Quant-UX](https://quant-ux.com)
designs into fully functional *VUE3* applications. By ensuring that the
design stays the single source of truth, Vue-Low-Code reduces the need for design
hand-offs and front-end code significantly.

## Documentation

You can find the documentation at [Luisa.cloud](https://luisa.cloud/help.html).

## Examples-And-Links
- [Quant-UX](https://quant-ux.com)
- [Template project VUE2] (https://github.com/KlausSchaefers/luisa-vue2-starter)
- [Template project VUE3] (https://github.com/KlausSchaefers/luisa-vue3-starter)
- [Low Code Example](https://github.com/KlausSchaefers/qux-low-code-example)
- [Figma Plugin](https://www.figma.com/community/plugin/858477504263032980/Figma-Low-Code)
- [Figma-Low-Code](https://github.com/KlausSchaefers/figma-low-code)
- [Figma-Low-Code Design System Example](https://github.com/KlausSchaefers/figma-design-system-example)
- [Some motivation for the project](https://uxdesign.cc/figma-low-code-a-new-way-to-tackle-design-hand-offs-a72cb109a455)



## Contact-and-Support

If you want to reach out please use the [Contact](https://quant-ux.com/#/contact.html) page or [Discord](https://discord.gg/TQBpfAAKmU)


## Minimal documentation (Deprecated!)


### The handoff problem
A constant pain point during the development of an application is the hand-off between the design and the development team.
Often this process is not frictionless. The design team creates a set of graphics and prototypes,
which serve as the source of truth and specification for the development team.
The development team implements the visual design in the desired technology, which
includes the translation of the design into front-end code and business logic, as well as
the wiring between the two. As the development evolves, the implementation becomes a second source of truth,
and keeping the design and the code base in sync can be a painful exercise.

### Solution

The core of the solution is the Luisa component which reads the visual design and creates
the front-end automatically on the fly. As a result, changes in the design are immediately updated in the
application. The wiring between the front-end component and the business logic is achieved through
method and data binding, which is defined in a Figma [plugin](https://www.figma.com/community/plugin/858477504263032980)
or a dedicated view in Quant-UX.

As a result, Developers can focus on business logic and backend connectivity, while the design team
can iterate fast through different ideas, without impacting the development team.

![Luisa architecture](assets/SimpleArchitecture.png "Luisareduces front end code")

In summary, the Luisaproject provides the following benfefits:

1. Zero Code rendering of visual design and animations
2. Clear separation of UI and business logic
3. Developers can focus on code
4. Developers can use the tools and frameworks of their choice.
5. Designers can use the powerful visual design tool
6. Easy extension with custom callback functions
7. Full support of VUE data binding.
8. Extension with custom components
9. Extension with custom CSS
10. Rich library of stylable components.

More information can be found [here](https://uxdesign.cc/figma-low-code-a-new-way-to-tackle-design-hand-offs-a72cb109a455)

### Guide

Table of contents

1. [Installation](#How-to-install-Luisa)
2. [Register Luisa to Vue](#Register-Luisa-to-Vue)
4. [Defintion of Bindings in Quant-UX](#Define-data-binding-and-callbacks)
5. [Responsive Rendering](#Responsive-Rendering)
6. [Low Code Workflow](#Low-Code-Workflow)
7. [Example & Links](#Examples-And-Links)
8. [Development Setup](#Dev-Setup)
9. [Contact & Support](#Contact-and-Support)


### How to install Luisa

First, you have to install the Luisa package via NPM

```bash
npm i luisa-vue@3
```


### Register Luisa to Vue
In the full mode the <QUX> or <Figma> component are used to render the entire front end. The first step is top register these components in Vue. The following section will use Quant-UX design as an example. For Figma, please check the [Figma-Low-Code](https://github.com/KlausSchaefers/figma-low-code) repo.


```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import luisa from 'luisa-vue'

const app = createApp(App)
app.use(router).mount('#app')
app.use(luisa)
```

### Place the QUX component.

Now you can start including the component, for instance in your home components. You have to pass your Quant-UX prototype
to the component, so it knows what to render. You can either pass a **javascrit object** or a **share key**

```vue
<Luisa :design="app"/>
```

You can optain the share key from the http://quant-ux.com website by clicking share in the canvas menu. In general the
share key is best for development. Updates in Quant-UX will be immediatly visible after a page reload. However, for production you should pass an app object. You can download the app json with the luisa command line interface:

```bash
npm install luisa-util
```

Now you can call quant-ux on the command line. Please pass the **share key** and select download. The json file will be loaded and
all images will be stored in the public folder

```bash
npm run download
```

Please note that home component should be wrapped by a router-view, otherwise navigation will not work. If you use VUE-CLI to bootrap the project, everything will be configured out of the box.

```vue
 <div id="app">
    <router-view/>
  </div>
```



### Update Router

Last, you have to update your router to delegate all routes to home.

```javascript
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  },
  {
    path: '/:screenName.html',
    name: 'qux',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  }
]
```

The default paramter QUX will look for is 'screenName'.

### Configure luisa

You can configure certain parameters, e.g. the routing rules. To do so, pass a config object to the
qux component.

```vue
<QUX :design="app" :config="config"/>
```

The config object can have the following properties and hsould be defined in the data section of the home component.

```javascript
    config: {
        css: {
          grid: true, // Use CSS grid to align objects. False will use CSS-Flex.
          justifyContentInWrapper: true // In justifz or left align content in wrapped elements
        },
        router: {
          key: 'id', // alternative routing parameter
          prefix: 'qux' // path prefix that will be used when rendering links
        }
    }
```


### Data Binding

QUX-LowCode supports VUE data binding. You have to pass a v-model to the QUX component. The databindings for the
widgets must be defined in the Quant-UX canvas.

```vue
<Luisa :design="app" v-model="view-model"/>
```

### Method Binding

In the Quant-UX canvas you can define javascript callbacks for the widgets.
Place the methods in the parent compoent of QUX.
The method will have the following signature:

```javascript
myMethod (value, element, e) {
 ...
}
```

If a method returns a string, matching a screen name, the QUX will navigate to this screen.

```javascript
myMethod (value, element, e) {
 ...
 // navigate to screen 2
 return 'Screen2'
}
```


### Custom components and rendering

Sometimes you want to render a certain part of the UI by your self, or replace existing widgets with custom implementations.
These components will be used at the specified screen
location instead of the default QUX component. This approach allows you to fully manage certain parts of the UI. Data is passed
as a **value** property and follows default VUE practices.

```vue
<Luisa :design="app" :config="config"/>
...

import MyWidget from 'src/myWidget'

...

config = {
    components: {
      'myCustomComponent': MyWidget
    }
}
```

You can set the name of the custom component in the data view in Quant-UX.

### Selecting sub areas of the prototype

Sometimes you might not want to render the entire prototype, but just a small subsection, e.g. a dialog. You can do this by using
the 'selected' property. Enter the name of the component to show. Please make sure, that the **name is unique**. You can also
use several instances if the QUX component in your template.

```vue
    <Luisa
      :design="app"
      :config="config"
      v-model="viewModel"
      selected="LoginBox"
      />


    <Luisa
      :design="app"
      :config="config"
      v-model="viewModel"
      selected="SignupBox"
      />
```


### MDI Icons

If you are using the Quant-UX icons components, you have to install the mdi-font package.

```
npm install @mdi/font
```

Afterwards import the icons in the App.vue

```
import '@mdi/font/css/materialdesignicons.css'
```


### Define data binding and callbacks.

You can define the data binding and the callbacks in the normal Quant-UX designer. Before you start,
you have to enable the Beta features. To do so:

1. Login at http://www.quant-ux.com
2. Open the prototype
3. Click on the menu and select "Settings"
4. Select "Enable Beta Features"
5. In the upper right corner you can now toggle between "Design" and "Data & Code" view

![Open the settings and tick the beta feature checkbox](assets/Settings.png "Enable Beta features")

To set the code properties perform the following steps:

1. Click on "Data & Code" in the upper right corner
2. The canvas will turn gray now.
3. Select a widget.
4. In the properties panel you can now define method name to be called.
5. If the widet supports data binding, you can also configure the data binding variable
here. Please note, that Quant-UX supports JSON Path, so a variable name can be "person.name"

![Open the settings and tick the beta feature checkbox](assets/Code.png "Enable Beta features")

### Responsive Rendering

Vue-Low-Code apps are to some degree responsive, depending on the constraints that affre defined in Quant-UX or Figma.
In addtion you can define min and max widths, and determine the flow of child components (Grid vs Flex).

However, sometimes this is not enough and one needs different UIs for different devices. Vue-Low-Code allows you to specify
for each device type a different app. By doing this, you have to complete freedom
to design for each device type, without worrying too much about the responsive behavior. Also, this approahc allows
you to provide completly different navigation patters, e.g. a hamburger menu on mobile and a central navbar on desktop.

To enable the responsive behavior do:

```vue
<Luisa :design="apps"/>

...
let apps = {
    mobile: <key or object>,
    tablet: <key or object>
    desktop: <key or object>
}

```

You can pass weather the **share key** or the downloaded **app json**. Again, the share key is great for development, but
for production you should download the artifacts.



### Low Code Workflow

We envision the following workflow to enable painless collaboration between designers and developers:

![The QUX low code workflow](assets/Workflow.png "QUX LowCode workflow")

1. The designer creates an initial design in Quant-UX or Figma
2. The developer adds data binding and method callbacks in Quant-UX using a dedicated view or the Figma Plugin
3. The developer sets up a new project (Vue.js for now) and includes the QUX (or Figma) component
4. The developer loads the design from Quant-UX and creates the required methods and fills them with business logic.
5. The QUX component renders the design and invokes the callbacks in clicks.
6. Changes in the design are transparent to the developer, he just reloads the design from Quant-UX.

## Luisa vue component emits availability

You can also use some **Vue emits** (event listeners) that are propagated to the Luisa vue component parent by its childrens created with Quant-UX or Figma

### Emits

The `qContainer` component emits several events that can be used to handle interactions and changes within the component. Below is a list of available emits along with their descriptions and parameters.

#### Event List

- **`qClick`**
  - **Description**: Emitted when a click event occurs on the component.
  - **Parameters**:
    - `element`: The element that was clicked.
    - `e`: The original event object.
    - `value`: The value associated with the click event.

- **`qChange`**
  - **Description**: Emitted when a change event occurs (e.g., input change).
  - **Parameters**:
    - `element`: The element that triggered the change.
    - `e`: The original event object.
    - `value`: The new value after the change.

- **`qFocus`**
  - **Description**: Emitted when the component gains focus.
  - **Parameters**:
    - `element`: The element that received focus.
    - `e`: The original event object.
    - `value`: The value associated with the focused element.

- **`qBlur`**
  - **Description**: Emitted when the component loses focus.
  - **Parameters**:
    - `element`: The element that lost focus.
    - `e`: The original event object.
    - `value`: The value associated with the blurred element.

- **`qMouseOver`**
  - **Description**: Emitted when the mouse pointer enters the component.
  - **Parameters**:
    - `element`: The element that the mouse is over.
    - `e`: The original event object.
    - `value`: The value associated with the mouse over event.

- **`qMouseOut`**
  - **Description**: Emitted when the mouse pointer leaves the component.
  - **Parameters**:
    - `element`: The element that the mouse left.
    - `e`: The original event object.
    - `value`: The value associated with the mouse out event.

- **`qKeyPress`**
  - **Description**: Emitted when a key is pressed while the component is focused.
  - **Parameters**:
    - `element`: The element that received the key press.
    - `e`: The original event object.
    - `value`: The value associated with the key press event.

- **`qCallback`**
  - **Description**: Emitted for custom callback actions.
  - **Parameters**:
    - `element`: The element that triggered the callback.
    - `e`: The original event object.
    - `value`: The value associated with the callback.

- **`qViewModelChange`**
  - **Description**: Emitted when the view model changes.
  - **Parameters**:
    - `element`: The element associated with the view model change.
    - `path`: The path to the changed property.
    - `value`: The new value of the property.

### Usage

You can listen to these emits events in the Luisa parent component like so:
**example**

```javascript
<Luisa
  :design="design" :config="config" v-model="viewModel"
  @qClick="handleClick"
  @qChange="handleChange"
  @qFocus="handleFocus"
  @qBlur="handleBlur"
  @qMouseOver="handleMouseOver"
  @qMouseOut="handleMouseOut"
  @qKeyPress="handleKeyPress"
  @qCallback="handleCallback"
  @qViewModelChange="handleViewModelChange"
/>
...
methods: {
  handleClick(element, event, value) {
    if(element.element.name != 'Screen') {
      console.log("name: " + element.element.name)  // name: Button1
      console.log("label: " + element.element.props.label). // label: Order Now
      console.log("databinding: " + element.element.props.databinding.default)  //databinding: Screen.Button1
      console.log(event)
      console.log(value)
    }
    // the you can add some business logic here based on name, label, or databinding
  }
  ....
  other handling methods
}
...
```

## Dev Setup

For fixes and improvements please clone the repository and submit pull requests.

```
npm install
```

Build:
```
npm run export
```
