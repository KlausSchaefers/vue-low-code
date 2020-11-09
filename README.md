# Vue-Low-Code
Vue-Low-Code is an open-source project that turns [Figma](https://figma.com) and [Quant-UX](https://quant-ux.com)
designs into fully functional VUE applications. By ensuring that the
design stays the single source of truth, Vue-Low-Code reduces the need for design
hand-offs and front-end code significantly.

## The handoff problem
A constant pain point during the development of an application is the hand-off between the design and the development team.
Often this process is not frictionless. The design team creates a set of graphics and prototypes,
which serve as the source of truth and specification for the development team.
The development team implements the visual design in the desired technology, which
includes the translation of the design into front-end code and business logic, as well as
the wiring between the two. As the development evolves, the implementation becomes a second source of truth,
and keeping the design and the code base in sync can be a painful exercise.

## Solution

The core of the solution is the Vue-Low-Code component which reads the visual design and creates
the front-end automatically on the fly. As a result, changes in the design are immediately updated in the
application. The wiring between the front-end component and the business logic is achieved through
method and data binding, which is defined in a Figma [plugin](https://www.figma.com/community/plugin/858477504263032980)
or a dedicated view in Quant-UX.

As a result, Developers can focus on business logic and backend connectivity, while the design team
can iterate fast through different ideas, without impacting the development team.

![Vue-Low-Code architecture](assets/SimpleArchitecture.png "Vue-Low-Code reduces front end code")

In summary, the Vue-Low-Code project provides the following benfefits:

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


# Two ways of using Vue-Low-Code

Vue-Low-Code provides two modes of operation.
1. The first mode is the 'Full' low code mode. The Figma or Quant-UX design is entirely rendered and wired to the
business logic. The front-end developers will usually do little UI customization and  focus on backend connectivity and business logic.
2. The second mode is the so called 'DesignLet' mode, which turn your design system into Vue components that can be used as normal components Vue-Low-Code.
Vuw-Low-Code will generate custom VUE components on the fly and register them. The developers will develop the mayority of the application by hand and use design system components for certain
elements such as buttons or input fields.


![Vue-Low-Code architecture](assets/LowCodeModes.png "Vue-Low-Code support to modes of operations")

The full mode will in general result to a faster development experience, however the developers have less control over the front end. The
'DesignLet' speeds up development and helps to implement design systems. Please note, that both approaches will maintain the Figma or Quant-UX
design as the single source of truth. Design channges will be instantly visible in the application.


# Development Guide

Table of contents

1. [Installation](#How-to-install-Vue-Low-Code)
2. [Full Lets Mode](#Full-Mode)
3. [Design Lets Mode](#Designlet-Mode)
4. [Defintion of Bindings in Quant-UX](#Define-data-binding-and-callbacks)
5. [Responsive Rendering](#Low-Code-Workflow)
5. [Low Code Workflow](#Low-Code-Workflow)


## How to install Vue-Low-Code

First, you have to install the QUX-LowCode package via NPM

```bash
npm i vue-low-code
```


## Full Mode
In the full mode the <QUX> or <Figma> component are used to render the entire front end. The first step is top register these components in Vue. The following section will use Quant-UX design as an example. For Figma, please check the [Figma-Low-Code](https://github.com/KlausSchaefers/figma-low-code) repo.


```javascript
import Vue from "vue";
import QUX from 'vue-low-code'
Vue.use(QUX);
```

### Place the QUX component.

Now you can start including the component, for instance in your home components. You have to pass your Quant-UX prototype
to the component, so it knows what to render. You can either pass a **javascrit object** or a **share key**

```vue
<QUX :app="app"/>
```

You can optain the share key from the http://quant-ux.com website by clicking share in the canvas menu. In general the
share key is best for development. Updates in Quant-UX will be immediatly visible after a page reload. However, for production you should pass an app object. You can download the app json with the quant-ux command line interface:

```bash
npm install -g quant-ux-cli
```

Now you can call quant-ux on the command line. Please pass the **share key** and select download. The json file will be loaded and
all images will be stored in the public folder

```bash
quant-ux
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

### Configure qux-lowcode

You can configure certain parameters, e.g. the routing rules. To do so, pass a config object to the
qux component.

```vue
<QUX :app="app":config="config"/>
```

The config object can have the following properties and hsould be defined in the data section of the home component.

```vue
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
<QUX :app="app" v-model="view-model"/>
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
<QUX :app="app" :config="config"/>
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
    <QUX
      :app="app"
      :config="config"
      v-model="viewModel"
      selected="LoginBox"
      />


    <QUX
      :app="app"
      :config="config"
      v-model="viewModel"
      selected="SignupBox"
      />
```


## MDI Icons

If you are using the Quant-UX icons components, you have to install the mdi-font package.

```
npm install @mdi/font
```

Afterwards import the icons in the App.vue

```
import '@mdi/font/css/materialdesignicons.css'
```

## Designlet Mode

The DesignLet allows to turn your design system into Vue components that can be used as normal components. DesignLets are not limited to
simple components like buttons or text, but can also be compplex components like forms, dialogs and so on. The first step is
to *globally* register the designlets before any template is parsed. The easiest way is to register the designlets in the `main.js`file:

```javascript
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import * as VueLowCode from 'vue-low-code'
import figmaDesign from './views/figma-design-system.json'
import quxDesign from './views/qux-design-system.json'

Vue.config.productionTip = false

/*
 * Make sure the design is registered before the App is mounted
 */
async function init () {
    // for live debuging use Figma.createFigmaDesignlets(<FileID>, <AccessKey>)
  await VueLowCode.createFigmaDesignlets(figmaDesign)
  // for live debuging use Figma.createFigmaDesignlets(<sharekey>)
  await VueLowCode.createQUXDesignlets(quxDesign)

  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')
}

init()

```

The Vue-Low-Code package provides a method for Figma (`createFigmaDesignlets`) and for Quant-UX (`createQUXDesignlets`). For Figma design systems,
you use your [API token](https://www.figma.com/developers/api#access-tokens) and file if, or you can download the Figma design using the *download.js* script

```bash
node download.js <api token> <file id>
```

For Quant-UX you can use share key or download the file with the *QuantUX-CLI*:

```bash
npm install -g quant-ux-cli
quant-ux
```


### Using designlets

Once the designlets are registered, they can be used within any template in the application. Suppose there is primary button defined in the design system. This can be invoked be simple using a tag with the corresponding name. Please make sure that the design system names do not clash with standard HTML elements, or other
components in your code base.

```vue
<PrimaryButton/>
```

For simple elements like boxes, rectangles or labels one can use the wrapped notion to replace the inner elements. An alternative is to use the label property

```vue
<PrimaryButton>Hello World</PrimaryButton>
<PrimaryButton label="Hello World"/>
```

For input elements, also the v-model element works. In addtion a placeholder and options element is supported

```vue
<PrimaryField v-model="user.name" placeholder="Enter a name"/>
<PrimaryDropDown v-model="user.job" :options="job" />
...
jobs = [
  {label: 'Developer', value:'deverloper'},
  {label: 'Designer', value:'designer'},
]

```

### Data and Method Binding

For complex designlets such as dialogs, one has to use data and method binding ([Details](##define-data-binding-and-callbacks)). The relevant
elements have to be wired to the right data and the right actions have to be defined. For instance in a login dialog, the email field needs to be
wired to the `email` variable and the password field to the `password` variable. The button needs to get a method binding for the `login` method. When the
user clicks in the button, and 'login' event will be fired, which can be used using the standard '@' notation. Please note, that when a component consist out of more than one shapes, it is not possible infer where the label text should be shown. One has to
specify a magic data binding (`$label`). The wiring of the login dialog would look like

![A complex designlet with data and method binding](assets/DesignletDataBinding.png "Data and Method binding for designlets")

The code would be

```vue
<LoginDialog v-model="loginData" label="Enter your credentials" @login="myLoginMethod">

...
loginData = {
  email: '',
  password: ''
}

....

myLoginMethod () {
  // your code
}
```




## Define data binding and callbacks.

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
<QUX :app="apps"/>

...
let apps = {
    mobile: <key or object>,
    tablet: <key or object>
    desktop: <key or object>
}

```

You can pass weather the **share key** or the downloaded **app json**. Again, the share key is great for development, but
for production you should download the artifacts.



## Low Code Workflow

We envision the following workflow to enable painless collaboration between designers and developers:

![The QUX low code workflow](assets/Workflow.png "QUX LowCode workflow")

1. The designer creates an initial design in Quant-UX or Figma
2. The developer adds data binding and method callbacks in Quant-UX using a dedicated view or the Figma Plugin
3. The developer sets up a new project (Vue.js for now) and includes the QUX (or Figma) component
4. The developer loads the design from Quant-UX and creates the required methods and fills them with business logic.
5. The QUX component renders the design and invokes the callbacks in clicks.
6. Changes in the design are transparent to the developer, he just reloads the design from Quant-UX.

A detail descriptiobn how to use Figma and Vue-Low-Code can be found [here](https://github.com/KlausSchaefers/figma-low-code)




# Examples & Links
https://github.com/KlausSchaefers/qux-low-code-example
https://www.figma.com/community/plugin/858477504263032980/Figma-Low-Code
https://github.com/KlausSchaefers/figma-low-code
https://uxdesign.cc/figma-low-code-a-new-way-to-tackle-design-hand-offs-a72cb109a455

# Dev Setup

```
npm install
```

Build:
```
npx bili --bundle-node-modules
```