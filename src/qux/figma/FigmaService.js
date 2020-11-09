import Logger from '../core/Logger'

export default class FigmaService {

  constructor (key) {
    this.setAccessKey(key)
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT', 'FRAME', 'GROUP', 'INSTANCE', 'COMPONENT', 'VARIANT_COMPONENT', 'COMPONENT_SET']
    this.ignoredTypes = [] // ['GROUP', 'INSTANCE']
    this.allAsVecor = false
    this.max_ids = 50
    this.pluginId = '858477504263032980'
    this.downloadVectors = true
    this.imageScaleFactor = 1
    /**
     * TODO: update with config
     */
    this.varientComponentHoverKey = 'hover'
    this.varientComponentFocusKey = 'focus'
  }

  setImageScaleFactor(factor) {
    this.imageScaleFactor = factor
    return this
  }

  setAccessKey (key) {
    this.key = key
    return this
  }

  setDownloadVectors (value) {
    this.downloadVectors = value
    return this
  }

  setBackgroundImages (app) {
    Logger.log('FigmaService.setBackgroundImages()')
    Object.values(app.screens).forEach(screen => this.setBackgroundImage(screen))
    Object.values(app.widgets).forEach(widget => this.setBackgroundImage(widget))
    return app
  }

  setBackgroundImage (element) {
    if (element.props.figmaImage) {
      element.style.backgroundImage = {
        url: element.props.figmaImage
      }
    }
  }

  _createDefaultHeader() {

    let headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Figma-Token': this.key
    })
    return headers
  }

  async get (key, importChildren = true, allAsVecor = false, setVariantsAsHover = true) {
    this.allAsVecor = allAsVecor
    return new Promise ((resolve, reject) => {
      let url = this.baseURL + 'files/' + key + '?geometry=paths&plugin_data=' + this.pluginId
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            let app = this.parse(key, json, importChildren, setVariantsAsHover)
            resolve(app)
          } catch (e) {
            Logger.error('FigmaService.get() > Error', e)
            resolve(null)
          }
        })
      }, err => {
        reject(err)
      })
    })

  }

  getImages (key, ids) {
    return new Promise ((resolve, reject) => {
      /**
       * Get in double resolution
       */
      let url = this.baseURL + 'images/' + key + `?format=png&scale=${this.imageScaleFactor}&ids=` + ids
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            resolve(json)
          } catch (err) {
            Logger.error('FigmaService.getImages() > Error', err)
            reject(err)
          }
        })
      }, err => {
        reject(err)
      })
    })
  }

  async parse (id, fModel, importChildren) {
    Logger.log(3, 'FigmaService.parse() > enter importChildren:' + importChildren,fModel)
    let model = this.createApp(id, fModel)
    let fDoc = fModel.document
    fModel._elementsById = {}

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (page.children) {
          page.children.forEach(screen => {
            this.parseScreen(screen, model, fModel, importChildren)
          })
        }
      })
    }

    /**
     * Set hover styles and mark the elements as DesignLets
     */
    this.setVarientComponents(model, fModel)

    /**
     * Fix the lines that are until now with figma ids
     */
    this.setLineTos(model, fModel)

    /**
     * Get download images for all
     */
    await this.addBackgroundImages(id, model, importChildren)

    /**
     * TODO Add groups?
     */

    return model
  }

  /**
   * Set for each instance the id to the parent. Why??
   */
  setVarientComponents (qModel) {
    // console.debug('setInstanceComponents')


    /**
     * Mark all elements of a variant as a component for the
     * design lets
     */
    let varientComponents = {}
    Object.values(qModel.widgets).forEach(widget => {
      let parent = qModel.widgets[widget.parentId]
      if (parent && parent.figmaType === 'COMPONENT_SET') {
        widget.props.isComponet = true
        widget.props.isVaraint = true
        widget.variant = this.parseVariant(widget.name)
        if (!varientComponents[widget.parentId]){
          varientComponents[widget.parentId] = []
        }
        varientComponents[widget.parentId].push(widget)
        /**
         * Give a better na,e other wise css will fail
         */
        widget.name = parent.name + '-' + Object.values(widget.variant).join('-')
      }
    })


    /**
     * 1) get all varient_components
     *
     * 2) check if they have a hover style
     *
     * 3) Set the .hover for all styles with the same config for the other props
     */
    Object.values(varientComponents).forEach(children => {
      // console.debug('varient', children)
      /**
       * Make this smarter in and check for a plugin flag
       */
      let hoverChildren = children.filter(c => c.name.toLowerCase().indexOf('=' + this.varientComponentHoverKey) > 0)
      if (hoverChildren.length === 1) {
        let hoverChild = hoverChildren[0]

        /**
         * lets find out which key actually mactched hover.
         *
         * TODO: what if the pluginFlag was used?
         */
        let others = this.getOtherVarants(children, hoverChild, this.varientComponentHoverKey)
        console.debug(hoverChild.name, others)
      }
    })

    /**
     * 4) Go through all widget,s check if we have a component with the hover, and copy the hover over.
     */
  }

  getOtherVarants (children, selected, valueToIgnore) {
    let variantToMatch = Object.entries(selected.variant).filter(e => {
      let value = e[1]
      if (value && value.toLowerCase) {
        value = value.toLowerCase()
      }
      return value !== valueToIgnore
    })
    console.debug(variantToMatch)

  }

  parseVariant (str) {
    let result = {}
    str.split(',').map(s => s.split('=')).forEach(pair => result[pair[0].trim()]=pair[1].trim())
    return result
  }

  getParentVarientComponent (widget, widgetsByFigmaID, qModel) {
    let parent = widgetsByFigmaID[widget.figmaComponentId]
    console.debug('...', parent ? parent.id + ' ' + parent.parentId : 'X' )
    while (parent && parent.figmaType !== 'VARIANT_COMPONENT') {
      parent = qModel.widgets[parent.parentId]
    }
    return parent
  }

  setLineTos (model) {
    let widgetMapping = {}
    Object.values(model.widgets).forEach(w => {
      widgetMapping[w.figmaId] = w.id
    })

    let screenMapping = {}
    Object.values(model.screens).forEach(s => {
      screenMapping[s.figmaId] = s.id
    })

    Object.values(model.lines).forEach(line => {
      line.from = widgetMapping[line.figmaFrom]
      line.to = screenMapping[line.figmaTo]
    })
  }

  async addBackgroundImages(id, model, importChildren) {

    if (this.downloadVectors) {
      let vectorWidgets = this.getElementsWithBackgroundIMage(model, importChildren)
      if (vectorWidgets.length > 0) {
        Logger.log(-1, 'FigmaService.addBackgroundImages() > vectors', vectorWidgets.length)
        let batches = this.getChunks(vectorWidgets, this.max_ids)

        let promisses = batches.map((batch,i) => {
          return this.addBackgroundImagesBatch(id, batch, i)
        })
        await Promise.all(promisses)
      }
    } else {
      Logger.log(3, 'FigmaService.addBackgroundImages() > Skip')
    }
    Logger.log(3, 'FigmaService.addBackgroundImages() > exit')
  }

  getElementsWithBackgroundIMage (model, importChildren) {
    if (importChildren) {
      return Object.values(model.widgets).filter(widget => widget.props.isVector || widget.hasBackgroundImage)
    } else {
      return Object.values(model.screens)
    }
  }

  async addBackgroundImagesBatch(id, batch, i) {
    Logger.log(3, 'FigmaService.addBackgroundImagesBatch() > start', i)
    return new Promise((resolve, reject) => {
      let vectorWidgetIds = batch.map(w => w.figmaId).join(',')
      this.getImages(id, vectorWidgetIds).then(imageResponse => {
        if (imageResponse.err === null) {
          Logger.log(3, 'FigmaService.addBackgroundImagesBatch () > end', i)
          let images = imageResponse.images
          batch.forEach(w => {
            let image = images[w.figmaId]
            if (image) {
              w.props.figmaImage = image
            }
            resolve(batch)
          })
        } else {
          Logger.error('FigmaService.addBackgroundImagesBatch () > Could not get images', imageResponse)
          reject(imageResponse.err)
        }
      }, err => {
        Logger.error('FigmaService.addBackgroundImagesBatch() > Could not get images', err)
        reject(err)
      })
    })
  }

  getChunks (array, size) {
    let result = []
    for (let i = 0; i < array.length; i += size) {
        let chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    return result;
  }

  parseScreen (fScreen, model, fModel) {
    Logger.log(3, 'FigmaService.parseScreen()', fScreen.name)
    let pos = this.getPosition(fScreen)
    let qScreen = {
      id: 's' + this.getUUID(model),
      figmaId: fScreen.id,
      name: fScreen.name,
      type: 'Screen',
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      props: {},
      children: [],
      style: this.getStyle(fScreen)
    }

    this.getPluginData(fScreen, qScreen, fModel)

    if (fScreen.children) {
      fScreen.children.forEach(child => {
        child._parent = fScreen
        this.parseElement(child, qScreen, fScreen, model, fModel, qScreen.id)
      })
    }

    /**
     * Or check prototypeDevice
     */
    model.screenSize.w = model.screenSize.w === -1 ? pos.w : Math.max(model.screenSize.w, pos.w)
    model.screenSize.h = model.screenSize.h === -1 ? pos.h : Math.max(model.screenSize.h, pos.h)
    model.screens[qScreen.id] = qScreen

    Logger.log(4, 'FigmaService.parseScreen() exit ', fScreen.name, qScreen.id)
    return qScreen
  }

  parseElement (element, qScreen, fScreen, model, fModel, qParentId) {
    Logger.log(5, 'FigmaService.parseElement() > enter: ' + element.name, element.type)

    let widget = null
    if (!this.isIgnored(element) && !this.isInsisible(element)) {
      let pos = this.getPosition(element)
      widget = {
        id: 'w' + this.getUUID(model),
        parentId: qParentId,
        name: this.getFigmaName(element),
        type: this.getType(element),
        figmaId: element.id,
        figmaType: element.type,
        figmaComponentId: this.getFigmaComponentId(element),
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        z: this.getZ(element, model)
      }

      widget.style = this.getStyle(element, widget)
      widget.props = this.getProps(element, widget)
      widget.has = this.getHas(element, widget)
      widget = this.getPluginData(element, widget, fModel)

      fModel._elementsById[element.id] = element
      model.widgets[widget.id] = widget
      qScreen.children.push(widget.id)

      /**
       * Update the parent id, so we can have the correct hierachy
       */
      qParentId = widget.id
    } else {
      Logger.log(4, 'FigmaService.parseElement() >Ignore: ' + element.name, element.type)
      /**
       * What if we have defined the callbacks and on a compomemt?
       */
    }

    /**
     * Go down recursive...
     */
    if (element.children) {
      /**
       * We do not go down on vector elemenets
       */
      if (!this.isVector(element)) {
        element.children.forEach(child => {
          if (child.visible !== false) {
            child._parent = element
            Logger.log(3, 'FigmaService.parseElement() > go recursive', element)
            this.parseElement(child, qScreen, fScreen, model, fModel, qParentId)
          }
        })
      } else {
        Logger.log(6, 'FigmaService.parseElement() > No recursive: ' + element.name, element.type)
      }
    }

    this.addTempLine(element, model)
    return widget
  }

  getFigmaComponentId (fElement) {
    if (fElement.type === 'INSTANCE') {
      return fElement.componentId
    }
    if (fElement.id.indexOf('I') === 0) {
      let parts = fElement.id.split(';')
      if (parts.length === 2) {
        return parts[1]
      }
    }
  }


  getFigmaName (element) {
    /**
     * FIXME: Check if teh name is tool long or has spaces or shit...
     */
    let name = element.name
    return name.replace('#', '').replace('/', '-').replace('&', '')
  }

  addTempLine (element,  model) {
    Logger.log(4, 'FigmaService.addLine() > enter', element.name, 'transition :' + element.transitionNodeID, element)

    if (element.transitionNodeID) {
      let clickChild = this.getFirstNoIgnoredChild(element)
      Logger.log(6, 'addLine() >  : ', element.name, clickChild)
      let line = {
        id: 'l' + this.getUUID(model),
        from : null,
        to: null,
        figmaFrom: clickChild.id,
        figmaTo: element.transitionNodeID,
        points : [ ],
        event: "click",
        animation: "",
        duration : element.transitionDuration
      }
      model.lines[line.id] = line
    }
  }

  getFirstNoIgnoredChild (element) {
    /**
     * We do not render instance wrappers, so we take the first child.
     */
    if (this.isIgnored(element) && element.children.length > 0) {
      Logger.log(5, 'FigmaService.getFirstNoIgnoredChild() >  take child ', element.name)
      return this.getFirstNoIgnoredChild(element.children[0])
    }
    return element
  }

  getPluginData (element, widget) {

    if (element.pluginData && element.pluginData[this.pluginId]) {
      let pluginData = element.pluginData[this.pluginId]
      if (pluginData.quxType) {
        Logger.log(3, 'FigmaService.getPluginData() > quxType : ', pluginData.quxType, element.name)
        widget.type = pluginData.quxType
        widget.props.placeholder = true

        /**
         * SmartContainer has a subType
         */
        if (pluginData.quxType === 'SmartContainer' && pluginData.quxSmartContainerType) {
          Logger.log(-1, 'FigmaService.getPluginData() > quxSmartContainerType : ', pluginData.quxSmartContainerType, element.name)
          widget.type = pluginData.quxSmartContainerType
          widget.smartContainerType = pluginData.quxSmartContainerType
        }

      }

      if (pluginData.quxTypeCustom) {
        Logger.log(-1, 'FigmaService.getPluginData() > quxTypeCustom: ', pluginData.quxOnChangeCallback, element.name)
        widget.props.customComponent = pluginData.quxTypeCustom
      }

      if (pluginData.quxDataBindingDefault) {
        Logger.log(3, 'FigmaService.getPluginData() > quxDataBindingDefault : ', pluginData.quxDataBindingDefault, element.name)
        if (!widget.props.databinding) {
          widget.props.databinding = {}
        }
        widget.props.databinding['default'] = pluginData.quxDataBindingDefault
      }
      if (pluginData.quxDataBindingOutput) {
        Logger.log(3, 'FigmaService.getPluginData() > quxDataBindingOutput : ', pluginData.quxDataBindingOutput, element.name)
        if (!widget.props.databinding) {
          widget.props.databinding = {}
        }
        widget.props.databinding['output'] = pluginData.quxDataBindingOutput
      }
      if (pluginData.quxOnClickCallback) {
        Logger.log(3, 'FigmaService.getPluginData() > quxOnClickCallback: ', pluginData.quxOnClickCallback, element.name)
        if (!widget.props.callbacks) {
          widget.props.callbacks = {}
        }
        widget.props.callbacks.click = pluginData.quxOnClickCallback
      }
      if (pluginData.quxOnLoadCallback) {
        Logger.log(3, 'FigmaService.getPluginData() > quxOnLoadCallback: ', pluginData.quxOnLoadCallback, element.name)
        if (!widget.props.callbacks) {
          widget.props.callbacks = {}
        }
        widget.props.callbacks.load = pluginData.quxOnLoadCallback
      }
      if (pluginData.quxOnChangeCallback) {
        Logger.log(3, 'FigmaService.getPluginData() > quxOnChangeCallback: ', pluginData.quxOnChangeCallback, element.name)
        if (!widget.props.callbacks) {
          widget.props.callbacks = {}
        }
        widget.props.callbacks.change = pluginData.quxOnChangeCallback
      }

      /**
       * Hover
       */
      if (pluginData.quxStyleHoverBackground) {
        this.addDynamicStyle(widget, 'hover', 'background', pluginData.quxStyleHoverBackground)
      }

      if (pluginData.quxStyleHoverBorder) {
        this.addDynamicStyle(widget, 'hover', 'borderColor', pluginData.quxStyleHoverBorder)
      }

      if (pluginData.quxStyleHoverColor) {
        this.addDynamicStyle(widget, 'hover', 'color', pluginData.quxStyleHoverColor)
      }

      /**
       * Focus
       */
      if (pluginData.quxStyleFocusBackground) {
        this.addDynamicStyle(widget, 'focus', 'background', pluginData.quxStyleFocusBackground)
      }

      if (pluginData.quxStyleFocusBorder) {
        this.addDynamicStyle(widget, 'focus', 'borderColor', pluginData.quxStyleFocusBorder)
      }

      if (pluginData.quxStyleFocusColor) {
        this.addDynamicStyle(widget, 'focus', 'color', pluginData.quxStyleFocusColor)
      }

      /**
       * Style stuff
       */

      if (pluginData.quxFixedHorizontal === 'true') {
        Logger.log(3, 'FigmaService.getPluginData() > quxFixedHorizontal: ', pluginData.quxFixedHorizontal, element.name)
        if (!widget.props.resize) {
          widget.props.resize = {}
        }
        widget.props.resize.fixedHorizontal = true
      }

      if (pluginData.quxFixedVertical === 'true') {
        Logger.log(3, 'FigmaService.getPluginData() > quxFixedVertical: ', pluginData.quxFixedVertical, element.name)
        if (!widget.props.resize) {
          widget.props.resize = {}
        }
        widget.props.resize.fixedVertical = true
      }

      /**
       * Screen stuff
       */
      if (pluginData.quxStartScreen === 'true') {
        Logger.log(1, 'FigmaService.getPluginData() > quxStartScreen: ', pluginData.quxStartScreen, element.name)
        widget.props.start = true
      }

      if (pluginData.quxOverlayScreen === 'true') {
        Logger.log(4, 'FigmaService.getPluginData() > quxOverlayScreen: ', pluginData.quxOverlayScreen, element.name)
        widget.style.overlay = true
      }

      if (pluginData.quxHasOverlayBackground === 'true') {
        Logger.log(4, 'FigmaService.getPluginData() > quxHasOverlayBackground: ', pluginData.quxHasOverlayBackground, element.name)
        widget.style.hasBackground = true
      }

      /**
       * Breakpoints
       */
      if (pluginData.quxBreakpointMobile === 'true') {
        if (!widget.props.breakpoints) {
          widget.props.breakpoints = {}
        }
        Logger.log(4, 'FigmaService.getPluginData() > quxBreakpointMobile: ', pluginData.quxBreakpointMobile, element.name)
        widget.props.breakpoints.mobile = true
      }

      if (pluginData.quxBreakpointTablet === 'true') {
        if (!widget.props.breakpoints) {
          widget.props.breakpoints = {}
        }
        Logger.log(4, 'FigmaService.getPluginData() > quxBreakpointTablet: ', pluginData.quxBreakpointTablet, element.name)
        widget.props.breakpoints.tablet = true
      }

      if (pluginData.quxBreakpointDesktop === 'true') {
        if (!widget.props.breakpoints) {
          widget.props.breakpoints = {}
        }
        Logger.log(4, 'FigmaService.getPluginData() > quxBreakpointDesktop: ', pluginData.quxBreakpointDesktop, element.name)
        widget.props.breakpoints.desktop = true
      }

      if (pluginData.quxStyleDisplay) {
        Logger.log(4, 'FigmaService.getPluginData() > quxStyleDisplay: ', pluginData.quxStyleDisplay, element.name)
        widget.style.display = pluginData.quxStyleDisplay
      }

      if (pluginData.quxStyleCursor) {
        Logger.log(4, 'FigmaService.getPluginData() > quxStyleCursor: ', pluginData.quxStyleCursor, element.name)
        widget.style.cursor = pluginData.quxStyleCursor
      }

      if (pluginData.quxStyleMaxWidth) {
        Logger.log(4, 'FigmaService.getPluginData() > quxStyleMaxWidth: ', pluginData.quxStyleMaxWidth, element.name)
        widget.style.maxWidth = pluginData.quxStyleMaxWidth
      }

      if (pluginData.quxStyleMinWidth) {
        Logger.log(4, 'FigmaService.getPluginData() > quxStyleMinWidth: ', pluginData.quxStyleMinWidth, element.name)
        widget.style.minWidth = pluginData.quxStyleMinWidth
      }
      /**
       * FIXME
          quxChildLayout: '',
       */

    }

    return widget
  }


  addDynamicStyle (widget, type, key, value) {
    if (!widget[type]) {
      widget[type] = {}
    }
    widget[type][key] = value

  }

  getProps (element, widget) {
    let props = {}
    if (this.isVector(element)) {
      //console.debug('FigmaService.getProps() > make vector', element)
      props.paths = element.strokeGeometry
      props.relativeTransform = element.relativeTransform
      props.isVector = true
    }
    if (widget.type === 'Label') {
      if (element.characters) {
        props.label = element.characters
      } else {
        props.label = element.name
      }
    }

    /**
     * Add here constraints
     */
    props.resize = {
      right: true,
      left: true,
      up: false,
      down: false,
      fixedHorizontal: false,
      fixedVertical: false
    }

    /**
     * FIXME: Should come only after plugin data...
     */
    this.setContraints(element, props)

    return props
  }

  setContraints (element, props) {

    if (element.constraints) {
      let horizontal = element.constraints.horizontal
      switch (horizontal) {

        case 'RIGHT':
          props.resize.left = false
          props.resize.right = true
          break;

        //case 'LEFT_RIGHT':
        //  Logger.log(-1, 'FigmaService.setContraints() > LEFT_RIGHT', element.name)
        //  props.resize.left = true
        //  props.resize.right = true
        //  break;

        default:
          break;
      }
    }
  }

  isIgnored (element) {
    // FIXME: check for empty frames
    return this.ignoredTypes.indexOf(element.type) >= 0
  }

  isInsisible (element) {
    if (element.visible === false) {
      Logger.log(5, 'FigmaService.isInsisible() > exit (visible): ' + element.name, element.type)
      return true
    }
    if (element.opacity <= 0) {
      Logger.log(5, 'FigmaService.isInsisible() > exit (opacity): ' + element.name, element.type)
      return true
    }
    return false
  }

  isVector (element) {
    return this.allAsVecor || !this.isButton(element)
  }

  isLabel (widget) {
    return widget && widget.type === 'Label'
  }

  /**
   * We map to a button / box iff it is not rectangle kind of
   * element (as defined in buttonTypes) and the style is not too
   * complex
   */
  isButton (element) {
    if (this.buttonTypes.indexOf(element.type) >=0 ){
      return  !this.isTooComplexStyle(element)
    }
    return false
  }

  isVariantContainer (fElement) {
    return fElement.type === 'VARIANT_COMPONENT'
  }

  isTooComplexStyle (element) {
    if (element.fills && element.fills.length > 1) {
      return true
    }
    if (element.fills && element.fills.length === 1) {
      /**
       * FIXME: Some times elements have iamge fills. They should be containers,
       * but for now there is a weird layout bug
       */
      let fill = element.fills[0]
      return fill.type !== 'SOLID' && fill.type !== 'GRADIENT_LINEAR' && fill.type !== 'GRADIENT_RADIAL' // && fill.type !== 'IMAGE'
    }
    if (element.effects && element.effects.length > 1) {
      return true
    }
    if (element.strokes && element.strokes.length > 1) {
      return true
    }
    return false
  }


  getHas (element, widget) {
    if (widget.type === 'Label') {
      return {
        label: true,
        padding : true,
        advancedText: true
      }
    }
    if (widget.type === 'Button') {
      return {
        label: true,
        backgroundColor : true,
        border: true,
        onclick: true,
        padding: true
      }
    }
    return {}
  }

  getStyle (element, widget) {
    let style = {
      fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
      borderBottomWidth: 0,
			borderTopWidth: 0,
			borderLeftWidth: 0,
			borderRightWidth: 0,
    }
    /**
     * How is this rendered. Which has priority
     */
    if (element.backgroundColor) {
      style.backgroundColor =  this.getColor(element.backgroundColor, element)
    }

    if (element.isFixed) {
      style.fixed = true
      this.setAllChildrenFixed(element)
    }

    if (element.fills) {
      if (element.fills.length === 1) {
        let fill = element.fills[0]

        if (fill.type === 'SOLID') {
          if (this.isLabel(widget)) {
            style.color = this.getColor(fill.color, fill)
          } else {
            style.backgroundColor = this.getColor(fill.color, fill)
          }
        }
        if (fill.type === 'GRADIENT_LINEAR') {
          if (!this.isLabel(widget)) {
            style.background = this.getLinearGradient(fill)
          } else {
            Logger.log(1, 'getStyle() > gradients not supported fotr labels...')
          }
        }
        if (fill.type === 'GRADIENT_RADIAL') {
          if (!this.isLabel(widget)) {
            style.background = this.getRadialGradient(fill)
          } else {
            Logger.log(1, 'getStyle() > gradients not supported for labels...')
          }
        }

        if (fill.type === 'IMAGE') {
          // Logger.warn('getStyle() > elements with background images cannot have children. all will be rendered as PNG')
          // for now this stuff will be handled as a vector, which cannot have children.
          // maybe we have to change this at some point
          // widget.hasBackgroundImage = true
        }
      }
    }

    if (element.cornerRadius) {
      style.borderBottomLeftRadius = element.cornerRadius
      style.borderTopLeftRadius = element.cornerRadius
      style.borderBottomRightRadius = element.cornerRadius
      style.borderTopRightRadius = element.cornerRadius
    }

    if (element.rectangleCornerRadii) {
      style.borderTopLeftRadius = element.rectangleCornerRadii[0]
      style.borderTopRightRadius = element.rectangleCornerRadii[1]
      style.borderBottomRightRadius = element.rectangleCornerRadii[2]
      style.borderBottomLeftRadius = element.rectangleCornerRadii[3]
    }

    /**
     * The border stuff we just do for rects and text
     */
    if (!this.isVector(element)) {
      if (element.strokes && element.strokes.length > 0) {
        let stroke = element.strokes[0]
        style.borderBottomColor = this.getColor(stroke.color, element)
        style.borderTopColor = this.getColor(stroke.color, element)
        style.borderLeftColor = this.getColor(stroke.color, element)
        style.borderRightColor = this.getColor(stroke.color, element)

        if (element.strokeWeight) {
          style.borderBottomWidth = element.strokeWeight
          style.borderTopWidth = element.strokeWeight
          style.borderLeftWidth = element.strokeWeight
          style.borderRightWidth = element.strokeWeight
        }

        if (element.strokeAlign !== 'INSIDE' && element.strokeWeight) {
          widget.x -= element.strokeWeight
          widget.w += element.strokeWeight * 2
          widget.y -= element.strokeWeight
          widget.h += element.strokeWeight * 2
        }
      }

      if (element.effects) {
        element.effects.forEach(effect => {
          if (effect.type === 'DROP_SHADOW') {
            style.boxShadow = {
              v: effect.offset.y,
              h: effect.offset.x,
              b: effect.radius,
              s: 0,
              i: false,
              c: this.getColor(effect.color, element)
            }
          }
          if (effect.type === 'INNER_SHADOW') {
            style.boxShadow = {
              v: effect.offset.y,
              h: effect.offset.x,
              b: effect.radius,
              s: 0,
              i: true,
              c: this.getColor(effect.color, element)
            }
          }
        })
      }

      if (element.style) {
        let fStyle = element.style
        style.fontSize = fStyle.fontSize
        style.fontSize = fStyle.fontSize
        style.fontWeight = fStyle.fontWeight
        style.lineHeight = fStyle.lineHeightPercent / 100 // this has a different weird formular! https://help.figma.com/text/line-height
        style.letterSpacing = fStyle.letterSpacing
        if (fStyle.textAlignHorizontal) {
          style.textAlign = fStyle.textAlignHorizontal.toLowerCase()
        }
        if (fStyle.textAlignVertical) {
          const textAlignVertical = fStyle.textAlignVertical
          switch (textAlignVertical) {
            case 'CENTER':
              style.verticalAlign = 'middle'
              break;
            case 'TOP':
                style.verticalAlign = 'top'
                break;
            case 'BOTTOM':
                style.verticalAlign = 'bottom'
                break;
              default:
                break;
          }
        }
      }
    }

    /**
     * Labels with constraints can be vertical middle
     */
    if (this.isLabel(widget) && style.verticalAlign !== 'bottom') {
      if (element.constraints) {
        let constraints = element.constraints
        if (constraints.vertical === 'TOP_BOTTOM') {
          style.verticalAlign = 'middle'
        }
      }
    }

    return style
  }

  setAllChildrenFixed (element) {
    if (element.children) {
      element.children.forEach(c => {
        c.isFixed = true
        this.setAllChildrenFixed(c)
      })
    }
  }

  getType (element) {
    if (this.isVector(element)) {
      return 'Vector'
    }
    if (element.type === 'TEXT') {
      return 'Label'
    }
    return 'Button'
  }

  getLinearGradient (fill) {
    Logger.log(3, 'getLinearGradient() > enter', fill)
    let start = fill.gradientHandlePositions[0]
    let end = fill.gradientHandlePositions[1]

    let xDiff = start.x - end.x;
    let yDiff = start.y - end.y;
    let dir = Math.round((Math.atan2(yDiff, xDiff) * 180 / Math.PI) + 270) % 360;

    let gradientStops = fill.gradientStops
    let colors = gradientStops.map(stop => {
        return {
          c: this.getColor(stop.color),
          p: stop.position * 100
        }
    })
    return {
      direction: dir,
      colors: colors
    }
  }

  getRadialGradient (fill) {
    Logger.log(3, 'getLinearGradient() > enter', fill)

    let gradientStops = fill.gradientStops
    let colors = gradientStops.map(stop => {
        return {
          c: this.getColor(stop.color),
          p: stop.position * 100
        }
    })
    return {
      radial: true,
      colors: colors
    }
  }

  calculateAngle(startHandle, endHandle) {
      const radians = Math.atan(this.calculateGradient(startHandle, endHandle))
      return parseInt(this.radToDeg(radians).toFixed(1))
  }

  calculateGradient(startHandle, endHandle){
      return (endHandle.y - startHandle.y) / (endHandle.x - startHandle.x) * -1
  }

  radToDeg(radian){
      return (180 * radian) / Math.PI;
  }

  getColor (c, element) {
    if (element && element.visible === false) {
      return ''
    }
    let a = c.a
    if (element && element.opacity < 1) {
      a = element.opacity
    }
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`
  }

  getPosition (element) {
    if (element.absoluteBoundingBox) {
      let pos = {
        x: Math.round(element.absoluteBoundingBox.x),
        y: Math.round(element.absoluteBoundingBox.y),
        w: Math.round(element.absoluteBoundingBox.width),
        h: Math.round(element.absoluteBoundingBox.height)
      }
      /**
       * We can ignore transformMatrix because absolutePositon gives the right values
       */
      return pos
    }
    Logger.warn('FigmaService.getPosition() > No abs pos', element)
    return {}
  }

  getTransformParent (element) {
    if (element._parent) {
      if (element._parent.type === 'FRAME') {
        return element._parent
      }
    }
    return
  }

  getZ (element, model) {
    model.lastZ++
    return model.lastZ
  }

  createApp (id, data) {
    return {
      version: 2.1,
      figmaId: id,
			name: data.name,
			description: '',
			screenSize: {
        "w" : -1,
        "h" : -1
      },
			type: 'smartphone',
			screens: {},
      widgets: {},
      lines: {},
      groups: {},
      lastUUID: 10000,
      lastZ: 1,
			lastUpdate: 0,
			created: 0,
			startScreen: "",
			grid: {
				w: 8,
				h: 8,
				style: "line",
				color: "#cecece",
				visible: false,
				enabled: false
			}
    }
  }

  getUUID (model){
		var uuid = model.lastUUID++ + "";
		return uuid
	}

}