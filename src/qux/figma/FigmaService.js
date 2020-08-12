import Logger from '../core/Logger'

export default class FigmaService {

  constructor (key) {
    this.setAccessKey(key)
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT', 'FRAME', 'GROUP', 'INSTANCE']
    this.ignoredTypes = [] // ['GROUP', 'INSTANCE']
    this.allAsVecor = false
    this.max_ids = 50
    this.pluginId = '858477504263032980'
    this.downloadVectors = true
  }

  setAccessKey (key) {
    this.key = key
  }

  setDownloadVectors (value) {
    this.downloadVectors = value
  }

  _createDefaultHeader() {

    let headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Figma-Token': this.key
    })
    return headers
  }

  async get (key, importChildren = true, allAsVecor = false) {
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
            let app = this.parse(key, json, importChildren)
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
      let url = this.baseURL + 'images/' + key + '?format=png&scale=2&ids=' + ids
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
      return Object.values(model.widgets).filter(widget => widget.props.isVector)
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
        this.parseElement(child, qScreen, fScreen, model, fModel)
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

  parseElement (element, qScreen, fScreen, model, fModel) {
    Logger.log(5, 'FigmaService.parseElement() > enter: ' + element.name, element.type)

    let widget = null
    if (!this.isIgnored(element) && !this.isInsisible(element)) {
      let pos = this.getPosition(element)
      widget = {
        id: 'w' + this.getUUID(model),
        figmaId: element.id,
        name: this.getFigmaName(element),
        type: this.getType(element),
        figmaType: element.type,
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

      model.widgets[widget.id] = widget
      qScreen.children.push(widget.id)

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
       * We do nit go down on vector elemenets
       */
      if (!this.isVector(element)) {
        element.children.forEach(child => {
          if (child.visible !== false) {
            child._parent = element
            Logger.log(3, 'FigmaService.parseElement() > go recursive', element)
            this.parseElement(child, qScreen, fScreen, model, fModel)
          }
        })
      } else {
        Logger.log(6, 'FigmaService.parseElement() > No recursive: ' + element.name, element.type)
      }
    }

    this.addTempLine(element, model)
    return widget
  }

  getFigmaName (element) {
    /**
     * FIXME: Check if teh name is tool long or has spaces or shit...
     */
    let name = element.name
    return name.replace('#', '').replace('/', '-')
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

  getPluginData (element, widget, fModel) {
    if (element.pluginData && element.pluginData[this.pluginId]) {
      let pluginData = element.pluginData[this.pluginId]
      if (pluginData.quxType) {
        Logger.log(3, 'FigmaService.getPluginData() > quxType : ', pluginData.quxType, element.name)
        widget.type = pluginData.quxType
        widget.props.placeholder = true
      }
      if (pluginData.quxDataBindingDefault) {
        Logger.log(3, 'FigmaService.getPluginData() > quxDataBindingDefault : ', pluginData.quxDataBindingDefault, element.name)
        widget.props.databinding = {
          'default': pluginData.quxDataBindingDefault
        }
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
        Logger.log(-1, 'FigmaService.getPluginData() > quxOnChangeCallback: ', pluginData.quxOnChangeCallback, element.name)
        if (!widget.props.callbacks) {
          widget.props.callbacks = {}
        }
        widget.props.callbacks.change = pluginData.quxOnChangeCallback
      }


      if (pluginData.quxStyleHoverBackground) {
        this.addDynamicStyle(element, widget, 'hover', 'background', pluginData.quxStyleHoverBackground, fModel)
      }

      if (pluginData.quxStyleHoverBorder) {
        this.addDynamicStyle(element, widget, 'hover', 'borderColor', pluginData.quxStyleHoverBorder, fModel)
      }

      if (pluginData.quxStyleHoverFont) {
        this.addDynamicStyle(element, widget, 'hover', 'color', pluginData.quxStyleHoverFont, fModel)
      }

      if (pluginData.quxStyleHoverFont) {
        this.addDynamicStyle(element, widget, 'hover', 'color', pluginData.quxStyleHoverFont, fModel)
      }

      if (pluginData.quxTypeCustom) {
        Logger.log(-1, 'FigmaService.getPluginData() > quxTypeCustom: ', pluginData.quxOnChangeCallback, element.name)
        widget.props.customComponent = pluginData.quxTypeCustom
      }

    }

    return widget
  }


  addDynamicStyle (/*element, widget, type, key, fStyleId, fModel */) {
    /*
    if (!widget[type]) {
      widget[type] = {}
    }
   // console.debug('addDynamicStyle', widget.name, key, fStyleId, element)
    // cut off s:
    fStyleId = fStyleId.substring(2, fStyleId.length-1)
    let fStyle = Object.values(fModel.styles).find(s => s.key == fStyleId)
    if (fStyle) {
      console.debug(fStyle)
    } else {
      Logger.warn('FigmaService.addDynamicStyle() > No Style ', fStyleId)
    }
    */
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
    return props
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

  isButton (element) {
    if (this.buttonTypes.indexOf(element.type) >=0 ){
      return  !this.isTooComplexStyle(element)
    }
    return false
  }

  isTooComplexStyle (element) {
    if (element.fills && element.fills.length > 1) {
      return true
    }
    if (element.fills && element.fills.length === 1) {
      let fill = element.fills[0]
      return fill.type !== 'SOLID'
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
          /*
          * https://github.com/KarlRombauts/Figma-SCSS-Generator
          */
          // console.debug('gradient', element.name, element.id, element.fills)
          if (!this.isLabel(widget)) {
            let start = fill.gradientHandlePositions[0]
            let end = fill.gradientHandlePositions[1]

            let xDiff = start.x - end.x;
            let yDiff = start.y - end.y;
            let dir = Math.atan2(yDiff, xDiff) * 180 / Math.PI;


            let gradientStops = fill.gradientStops
            let colors = gradientStops.map(stop => {
                return {
                  c: this.getColor(stop.color),
                  p: stop.position * 100
                }
            })
            style.background = {
              direction: dir,
              colors: colors
            }
          } else {
            Logger.log(1, 'getStyle() > gradients not supported...')
          }
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
        style.lineHeight = fStyle.lineHeightPercent / 100
        style.letterSpacing = fStyle.letterSpacing
        if (fStyle.textAlignHorizontal) {
          style.textAlign = fStyle.textAlignHorizontal.toLowerCase()
        }
        if (fStyle.textAlignVertical) {
          style.verticalAlign = fStyle.textAlignVertical.toLowerCase()
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

  getColor (c, element) {
    let a = c.a
    if (element && element.opacity < 1) {
      a = element.opacity
    }
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`
  }

  getPosition (element) {
    if (element.absoluteBoundingBox) {
      let pos = {
        x: element.absoluteBoundingBox.x,
        y: element.absoluteBoundingBox.y,
        w: element.absoluteBoundingBox.width,
        h: element.absoluteBoundingBox.height
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