import Logger from '../core/Logger'
import {Layout} from '../core/Const'
import {getAutoPaddingHorizontal, isFixedHorizontal, isLayoutAutovertical} from '../core/ExportUtil'

export default class FigmaService {

  constructor (key, config = {}) {
    this.setAccessKey(key)
    this.baseURL = 'https://api.figma.com/v1/'
    this.vectorTypes = ['LINE', 'ELLIPSE', 'VECTOR']
    this.buttonTypes = ['RECTANGLE', 'TEXT', 'FRAME', 'GROUP', 'INSTANCE', 'COMPONENT', 'VARIANT_COMPONENT', 'COMPONENT_SET']
    this.ignoredTypes = [] // ['GROUP', 'INSTANCE']
    this.allAsVecor = false
    this.max_ids = 50
    this.pluginId = '858477504263032980'
    this.downloadVectors = true
    this.imageScaleFactor = 2
    this.throttleRequestThreshold = 10
    this.throttleRequestTimeout = 1000
    this.pinnRight = false
    this.errors = []
    this.autoLineHeightAsNormal = true
    this.fixed2Fill = true
    this.defaultFontFamily = 'Helvetica Neue,Helvetica,Arial,sans-serif'

    if (config.figma) {
      if (config.figma.throttleRequestThreshold) {
        this.throttleRequestThreshold = config.figma.throttleRequestThreshold
      }
      if (config.figma.throttleRequestTimeout) {
        this.throttleRequestTimeout = config.figma.throttleRequestTimeout
      }

      if (config.figma.throttleBatchSize) {
        this.max_ids = config.figma.throttleBatchSize
      }

      if (config.figma.pinnRight) {
        this.pinnRight = config.figma.pinnRight
      }

      if (config.figma.downloadVectors === false) {
        this.downloadVectors = false
      }

      if (config.figma.fixed2Fill === false) {
        this.fixed2Fill = false
      }

      if (config.figma.defaultFontFamily !== '') {
        this.defaultFontFamily = config.figma.defaultFontFamily
      }
    }

    if (config.css && config.css.autoLineHeightAsNormal === false) {
      Logger.log(-1, 'FigmaService.constructor () > Auto Line === 150%')
      this.autoLineHeightAsNormal = false
    }

 

    this.figmaAlignMapping = {
      MIN: 'flex-start',
      CENTER: 'center',
      MAX: 'flex-end',
      SPACE_BETWEEN: 'space-between'
    }

    // https://www.figma.com/plugin-docs/api/Trigger/
    this.figmaAnimationTypeMapping = {
      'ON_CLICK': 'click',
      'ON_HOVER': 'hover',
      'MOUSE_LEAVE': 'mouseleave',
      'MOUSE_ENTER': 'mouseenter',
      "MOUSE_UP": 'mouseup',
      "MOUSE_DOWN": "mousedown"
    }

    this.figmaAnimationEasingMapping = {
    }
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

  async getRaw (key) {
    return new Promise ((resolve, reject) => {
      let url = this.baseURL + 'files/' + key + '?geometry=paths&plugin_data=' + this.pluginId
      fetch(url, {
        method: 'get',
        credentials: "same-origin",
        headers: this._createDefaultHeader()
      }).then(resp => {
        resp.json().then(json => {
          try {
            resolve(json)
          } catch (e) {
            Logger.error('FigmaService.getRaw() > Error', e)
            resolve(null)
          }
        })
      }, err => {
        reject(err)
      })
    })
  }

  getPages (fModel) {
    Logger.log(-1, 'getPages() > enter')
    let pages = []
    let fDoc = fModel.document
    if (fDoc.children) {
      fDoc.children.forEach(page => {
        pages.push({
          id: page.id,
          value: page.id,
          label: page.name
        })
      })
    }
    Logger.log(-1, 'getPages() > exit', pages)
    return pages
  }

  async get (key, importChildren = true, allAsVecor = false, selectedPages= []) {
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
            let app = this.parse(key, json, importChildren, selectedPages)
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

  async parse (id, fModel, importChildren = true, selectedPages = []) {
    Logger.log(3, 'FigmaService.parse() > enter importChildren:' + importChildren, fModel)
    this.errors = []
    let model = this.createApp(id, fModel)
    let fDoc = fModel.document
    // add some lookup maps for speedy lookups later
    fModel._elementsById = {}
    fModel._elementsToWidgets = {}

    if (fDoc.children) {
      fDoc.children.forEach(page => {
        if (selectedPages.length === 0 || selectedPages.indexOf(page.name) >= 0) {
          Logger.log(1, 'FigmaService.parse() > parse page:' + page.name)
          if (page.children) {
            page.children.forEach(child => {
              if (!this.isInvisible(child)){
                if (this.isFrame(child)) {
                  this.parseScreen(child, model, fModel, importChildren, page)
                }
                if (this.isComponet(child) || this.isComponentSet(child)) {
                  this.parseComponent(child, model, fModel, importChildren, page)
                }
              }
            })
          }
        }
      })
    }


    /**
     * Set varients for designlets
     */
    this.setVarientComponents(model, fModel)

    /**
     * Fix the lines that are until now with figma ids
     */
    this.setLineTos(model, fModel)

    /**
     * now find the dynamic components
     */
    this.setDynamicComponents(model, fModel)

    /**
     * Get download images for all
     */
    await this.addBackgroundImages(id, model, importChildren)

    /**
     * TODO Add groups?
     */

    return model
  }


  setDynamicComponents (qModel, fModel) {
    Logger.log(2, 'FigmaService.setDynamicComponents() > enter')


    /**
     * 1) Check all component lines
     *
     * 2) Take the source
     *
     * 3) Check of teh target is a componnt
     *
     * 5) Find out of the target is in a componentSet
     *
     * 5) If so, make it a dynamic component, including references of the
     */
    Object.values(qModel.widgets).forEach(qWidget => {
      if (qWidget.fimgaTransitionNodeID && qWidget.figmaType === 'INSTANCE') {
        let target = fModel._elementsById[qWidget.fimgaTransitionNodeID]
        if (target && target._parent) {
          let parent = target._parent
          if (parent.type === 'COMPONENT_SET' && parent.children) {


            qWidget.type = this.getDynamicType(parent)
            qWidget.props.dynamicChildren = []
            qWidget.props.dynamicLines = []

            let parentWidgetId = fModel._elementsToWidgets[parent.id]
            qWidget.props.dynamicParent = parentWidgetId


            /**
             * Check if the children are all the same, so we can set the animation type to transform...
             */

            parent.children.forEach(fChild => {
              let childId = fModel._elementsToWidgets[fChild.id]
              if (childId) {
                let qChild = qModel.widgets[childId]
                qWidget.props.dynamicChildren.push(childId)
                if (fChild.id === qWidget.figmaComponentId) {
                  qWidget.props.dynamicStart = childId
                }

                let figmaLines = this.parseFigmaAnitions(qChild.props.figmaAnimation)

                if (figmaLines && figmaLines.length > 0) {
                  figmaLines.forEach(fLine => {
                    let targetId = fModel._elementsToWidgets[fLine.figmaTo]
                    if (targetId) {
                      console.debug('dynamic line', fLine.event, fLine.animation )
                      qWidget.props.dynamicLines.push({
                        from: childId,
                        to: targetId,
                        duration: fLine.duration,
                        animation: fLine.animation,
                        event: fLine.event
                      })
                    }

                  })


                } else if (fChild.transitionNodeID) {
                  let targetId = fModel._elementsToWidgets[fChild.transitionNodeID]
                  qWidget.props.dynamicLines.push({
                    from: childId,
                    to: targetId,
                    duration: fChild.transitionDuration,
                    animation: 'none',
                    event: 'click'
                  })
                }
              }
            })


            Logger.log(3, 'FigmaService.setDynamicComponents() > ' + qWidget.name, qWidget.props.dynamicStart, qWidget.props.dynamicChildren)
            Logger.log(3, 'FigmaService.setDynamicComponents() > ' + qWidget.name, qWidget.props.dynamicLines, qWidget.props.dynamicParent)
          }
        }
      }
    })

  }

  parseFigmaAnitions (figmaAnimations) {
    if (figmaAnimations) {
      let lines = figmaAnimations.map(anim => {

        let line = {}
        line.animation = 'none'
        line.duration = 200
        if (anim.trigger && anim.action) {
          let trigger = anim.trigger.type
          let action = anim.action
          if (this.figmaAnimationTypeMapping[trigger]) {
            line.event = this.figmaAnimationTypeMapping[trigger]
          }

          line.figmaTo = action.destinationId
          line.figmaFrom = ''

          if (action.transition) {
            let transition = action.transition
            if (transition.type === 'SMART_ANIMATE') {
              line.animation = 'transform'
            }

            if (transition.easing && this.figmaAnimationEasingMapping[transition.easing]) {
              line.easing = this.figmaAnimationEasingMapping[transition.easing]
            }

            line.duration = Math.round(transition.duration * 1000)

          }
          //console.debug(JSON.stringify(anim), JSON.stringify(line))
          return line
        }
      })
      return lines
    }

    return null
  }

  getDynamicType (fComponentSet) {
    Logger.log(3, 'FigmaService.getDynamicType()', fComponentSet.name)
    return 'DynamicContainer'
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
  }


  parseVariant (str) {
    let result = {}

    /**
     * Figma somehpw changed the name of the varient...
     */
    if (str.indexOf('-') >= 0) {
      str.split('-').map(s => s.split('=')).filter(pair => pair.length > 1).forEach(pair => result[pair[0].trim()]=pair[1].trim())
    } else {
      str.split(',').map(s => s.split('=')).filter(pair => pair.length > 1).forEach(pair => result[pair[0].trim()]=pair[1].trim())
    }
    Logger.log(2, 'FigmaService.addBackgroundImages() > parseVariant', str, result)
    return result
  }

  getParentVarientComponent (widget, widgetsByFigmaID, qModel) {
    let parent = widgetsByFigmaID[widget.figmaComponentId]
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
      if (screenMapping[line.figmaTo]) {
        line.to = screenMapping[line.figmaTo]
      }
      if (widgetMapping[line.figmaTo]) {
        line.to = widgetMapping[line.figmaTo]
        line.isComponentLine = true
      }
    })
  }

  async addBackgroundImages(id, model, importChildren) {
    Logger.log(1, 'FigmaService.addBackgroundImages() > importChildren', importChildren)
    if (this.downloadVectors) {
      let vectorWidgets = this.getElementsWithBackgroundIMage(model, importChildren)

      if (vectorWidgets.length > 0) {
        Logger.log(-1, 'FigmaService.addBackgroundImages() > vectors', vectorWidgets.length)
        let batches = this.getChunks(vectorWidgets, this.max_ids)
        let promisses = batches.map((batch,i) => {
          return this.addBackgroundImagesBatch(id, batch, i, batches.length)
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

  async addBackgroundImagesBatch(id, batch, i, totalNumberOfBatches) {
    Logger.log(1, 'FigmaService.addBackgroundImagesBatch() > start', i)
    return new Promise((resolve, reject) => {
      setTimeout( () => {
        let vectorWidgetIds = batch.map(w => w.figmaId).join(',')
        this.getImages(id, vectorWidgetIds).then(imageResponse => {
          if (imageResponse.err === null) {
            Logger.log(3, 'FigmaService.addBackgroundImagesBatch () > end', i)
            let images = imageResponse.images
            batch.forEach(w => {
              let image = images[w.figmaId]
              if (image) {
                w.props.figmaImage = image
              } else {
                Logger.error('FigmaService.addBackgroundImagesBatch() > Cannot get image for ', w)
                this.errors.push({
                  type: 'ImageGetError',
                  data: w
                })
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
      }, this.getImageTimeout(i, totalNumberOfBatches))
    })
  }

  getImageTimeout (i, totalNumberOfBatches) {
    if (totalNumberOfBatches > this.throttleRequestThreshold) {
      Logger.warn(`igmaService.getImageTimeout () > Throttle requests. Delay request ${i} by ${(i * this.throttleRequestTimeout)} ms` )
      return i * this.throttleRequestTimeout
    }
    return 0
  }

  getChunks (array, size) {
    let result = []
    for (let i = 0; i < array.length; i += size) {
        let chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    return result;
  }

  parseComponent (fElement, qModel, fModel, importChildren, page) {
    Logger.log(3, 'FigmaService.parseComponent()', fElement.name)

    /**
     * We create a wrapper screen!
     */
    let pos = this.getPosition(fElement)
    let qScreen = {
      id: 's' + this.getUUID(qModel),
      figmaId: fElement.id,
      pageName: page.name ,
      name: fElement.name +'Wrapper',
      isComponentScreen: true,
      type: 'Screen',
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      props: {},
      children: [],
      style: {
        background: 'transparent'
      }
    }
    qModel.screens[qScreen.id] = qScreen

    this.getPluginData(fElement, qScreen, fModel)

    this.parseElement(fElement, qScreen, fElement, qModel, fModel, qScreen.id)


  }

  parseScreen (fScreen, model, fModel, importChildren, page) {
    Logger.log(3, 'FigmaService.parseScreen()', fScreen.name)
    let pos = this.getPosition(fScreen)
    let qScreen = {
      id: 's' + this.getUUID(model),
      figmaId: fScreen.id,
      pageName: page.name,
      name: fScreen.name,
      type: 'Screen',
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      props: {},
      children: [],
      layout: {},
      style: this.getStyle(fScreen)
    }
    qScreen = this.getLayout(fScreen, qScreen)

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

  parseElement (element, qScreen, fScreen, model, fModel, qParentId, qParent) {
    Logger.log(5, 'FigmaService.parseElement() > enter: ' + element.name, element.type)

    let widget = null
    if (!this.isIgnored(element) && !this.isInvisible(element)) {
      let pos = this.getPosition(element)
      let qID = 'w' + this.getUUID(model)
      widget = {
        id: qID,
        parentId: qParentId,
        name: this.getFigmaName(element, qID),
        type: this.getType(element),
        figmaId: element.id,
        figmaType: element.type,
        figmaComponentId: this.getFigmaComponentId(element),
        fimgaTransitionNodeID: element.transitionNodeID,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        layout: {},
        z: this.getZ(element, model)
      }

      widget.style = this.getStyle(element, widget)
      widget.props = this.getProps(element, widget)
      widget.has = this.getHas(element, widget)
      widget = this.getPluginData(element, widget, fModel)
      widget = this.getLayout(element, widget, qParent)

      fModel._elementsById[element.id] = element
      fModel._elementsToWidgets[element.id] = qID
      model.widgets[widget.id] = widget
      qScreen.children.push(widget.id)

      /**
       * Update the parent id, so we can have the correct hierachy
       */
      qParentId = widget.id
      qParent = widget
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
       * We do not go down on vector elements and hidden elements.
       */
      if (!this.isVector(element) && !this.isInvisible(element) && !this.isCustomVector(element)) {
        element.children.forEach(child => {
          if (child.visible !== false) {
            child._parent = element
            Logger.log(3, 'FigmaService.parseElement() > go recursive', element)
            this.parseElement(child, qScreen, fScreen, model, fModel, qParentId, qParent)
          }
        })
      } else {
        Logger.log(6, 'FigmaService.parseElement() > No recursive: ' + element.name, element.type)
      }
    }

    this.addTempLine(element, model, widget)
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


  getFigmaName (element,qID) {
    /**
     * FIXME: Check if teh name is tool long or has spaces or shit...
     */
    let name = element.name
    if (name.length > 50) {
      name = qID
    }

    return name.replace(/#/g, '').replace(/\//g, '-').replace(/&/g, '').replace(/,/g, '-')
  }

  addTempLine (fElement,  model, widget) {
    Logger.log(4, 'FigmaService.addLine() > enter', fElement.name, 'transition :' + fElement.transitionNodeID, fElement)


    if (fElement.transitionNodeID) {
      let clickChild = this.getFirstNoIgnoredChild(fElement)
      Logger.log(6, 'addLine() >  : ', fElement.name, clickChild)
      let line = {
        id: 'l' + this.getUUID(model),
        from : null,
        to: null,
        figmaFrom: clickChild.id,
        figmaTo: fElement.transitionNodeID,
        points : [ ],
        event: "click",
        animation: "",
        duration : fElement.transitionDuration
      }

      if (widget && widget.props.figmaAnimation) {
        // add animation stuff and easing...
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
        Logger.log(2, 'FigmaService.getPluginData() > quxType : ', pluginData.quxType, element.name)
        widget.type = pluginData.quxType
        widget.props.placeholder = true

        /**
         * SmartContainer has a subType
         */
        if (pluginData.quxType === 'SmartContainer' && pluginData.quxSmartContainerType) {
          Logger.log(2, 'FigmaService.getPluginData() > quxSmartContainerType : ', pluginData.quxSmartContainerType, element.name)
          widget.type = pluginData.quxSmartContainerType
          widget.smartContainerType = pluginData.quxSmartContainerType
        }

        if (pluginData.quxType === 'Image' && pluginData.quxDataBindingDefault) {
          widget.type = 'UploadPreview'
        }

        if (pluginData.quxType === 'Vector') {
          widget.props.isVector = true
        }


      }

      if (pluginData.quxMetaDescription) {
        Logger.log(3, 'FigmaService.getPluginData() > quxMetaDescription: ', pluginData.quxMetaDescription, element.name)
        if (!widget.meta) {
          widget.meta = {}
        }
        widget.meta.description = pluginData.quxMetaDescription
      }

      if (pluginData.quxMetaKeyWords) {
        Logger.log(3, 'FigmaService.getPluginData() > quxMetaKeyWords: ', pluginData.quxMetaKeyWords, element.name)
        if (!widget.meta) {
          widget.meta = {}
        }
        widget.meta.keywords = pluginData.quxMetaKeyWords
      }

      if (pluginData.quxDataValue) {
        Logger.log(3, 'FigmaService.getPluginData() > quxDataValue: ', pluginData.quxDataValue, element.name)
        widget.props.dataValue = pluginData.quxDataValue
      }

      if (pluginData.quxLinkUrl) {
        Logger.log(3, 'FigmaService.getPluginData() > quxLinkUrl: ', pluginData.quxLinkUrl, element.name)
        widget.props.url = pluginData.quxLinkUrl
      }

      if (pluginData.quxTypeCustom) {
        Logger.log(3, 'FigmaService.getPluginData() > quxTypeCustom: ', pluginData.quxOnChangeCallback, element.name)
        widget.props.customComponent = pluginData.quxTypeCustom
      }

      if (pluginData.quxAnimationProps) {
        Logger.log(3, 'FigmaService.getPluginData() > quxAnimationProps: ', pluginData.quxAnimationProps, element.name)
        try {
          widget.props.figmaAnimation = JSON.parse(pluginData.quxAnimationProps)
        } catch (err) {
          Logger.error('FigmaService.getPluginData() > quxAnimationProps Could not parse ', pluginData.quxAnimationProps)
        }
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
      if (pluginData.quxDataBindingOptions) {
        Logger.log(3, 'FigmaService.getPluginData() > quxDataBindingOptions : ', pluginData.quxDataBindingOptions, element.name)
        if (!widget.props.databinding) {
          widget.props.databinding = {}
        }
        widget.props.databinding['options'] = pluginData.quxDataBindingOptions
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

      if (pluginData.quxOptions) {
        Logger.log(3, 'FigmaService.getPluginData() > quxOptions: ', pluginData.quxOptions, element.name)
        widget.props.options = pluginData.quxOptions.split(';')
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
       * DropDown
       */
      if (pluginData.quxStyleDropDownColor) {
        this.addDynamicStyle(widget, 'style', 'popupColor', pluginData.quxStyleDropDownColor)
      }

      if (pluginData.quxStyleDropDownBackground) {
        this.addDynamicStyle(widget, 'style', 'popupBackground', pluginData.quxStyleDropDownBackground)
      }

      if (pluginData.quxStyleDropDownBorder) {
        this.addDynamicStyle(widget, 'style', 'popupBorder', pluginData.quxStyleDropDownBorder)
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
        Logger.warn('FigmaService.getPluginData() > DEPRECTAED quxFixedHorizontal: ', pluginData.quxFixedHorizontal, element.name)
        //this.setFixedHozontal(widget, true)
      }

      if (pluginData.quxFixedVertical === 'true') {
        Logger.log('FigmaService.getPluginData() > DEPRECTAED quxFixedVertical: ', pluginData.quxFixedVertical, element.name)
        // this.setFixedVertical(widget)
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

      if (pluginData.quxWrapContent) {
        Logger.log(-1, 'FigmaService.getPluginData() > quxWrapContent: ', pluginData.quxWrapContent, element.name)
        widget.style.layout = 'Wrap'
      }

    }

    return widget
  }

  setFixedHozontal (widget, value = true) {
    if (!widget.props.resize) {
      widget.props.resize = {}
    }
    widget.props.resize.fixedHorizontal = value
  }

  setHugHozontal (widget, value = true) {
    if (!widget.props.resize) {
      widget.props.resize = {}
    }
    widget.props.resize.hugHorizontal = value
  }


  setFixedVertical (widget, value = true) {
    if (!widget.props.resize) {
      widget.props.resize = {}
    }
    widget.props.resize.fixedVertical = value
  }

  setHugVertical (widget, value = true) {
    if (!widget.props.resize) {
      widget.props.resize = {}
    }
    widget.props.resize.hugVertical = value
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
    if (this.isLabel(widget)) {
      if (element.characters) {
        props.label = element.characters
      } else {
        props.label = element.name
      }
    }

    if (widget.type === 'RichText') {
      props.richTextLabel = this.getRichText(element, props.label)
    }

    /**
     * Add here constraints.
     * Since 0.5 keep the normaal figma constraints and make elements fixed and not pinned right
     */
    if (this.pinnRight) {
      props.resize = {
        right: true,
        left: true,
        up: false,
        down: false,
        fixedHorizontal: false,
        fixedVertical: false
      }
    } else {
      props.resize = {
        right: false,
        left: true,
        up: false,
        down: false,
        fixedHorizontal: true,
        fixedVertical: false
      }
    }


    /**
     * FIXME: Should come only after plugin data...
     */
    this.setContraints(element, props)

    return props
  }

  getRichText (fElement, label)  {
    Logger.log(2, 'FigmaService.getRichText() >', fElement.name, label)

    let children = []
    let characterStyleOverrides = fElement.characterStyleOverrides
    let currentChild = {}
    let lastOverride = -1
    for (let i=0; i < label.length; i++) {
      // ending zeros are not added
      let override = characterStyleOverrides[i] !== undefined ? characterStyleOverrides[i] : 0 +''
      if (override !== lastOverride) {
        currentChild = {
          label: '',
          style: this.getRichTextStyle(fElement.styleOverrideTable[override])
        }
        children.push(currentChild)
      }
      currentChild.label += label[i]
      lastOverride = override
    }

    return children
  }

  getRichTextStyle (fStyle) {
    if (fStyle) {
      let result = {}
      if (fStyle.fills) {
        if (fStyle.fills.length === 1) {
          let fill = fStyle.fills[0]
          if (fill.type === 'SOLID') {
            result.color = this.getColor(fill.color, fill)
          }
        }
      }
      this.setTextStyle(fStyle, result)
      return result
    }
    return undefined
  }

  getLayout (fElement, qElement, qParentElement) {

    if (fElement.layoutMode === 'HORIZONTAL') {
      qElement.layout.type = Layout.AutoHorizontal
      qElement.layout.justifyContent = this.mapAlign(fElement.primaryAxisAlignItems)
      qElement.layout.alignItems = this.mapAlign(fElement.counterAxisAlignItems)
    }

    if (fElement.layoutMode === 'VERTICAL') {
      qElement.layout.type = Layout.AutoVertical
      qElement.layout.justifyContent = this.mapAlign(fElement.primaryAxisAlignItems)
      qElement.layout.alignItems = this.mapAlign(fElement.counterAxisAlignItems)
    }


    if (fElement.itemSpacing !== undefined) {
      qElement.layout.itemSpacing = fElement.itemSpacing
    }


    /**
     * FXIME: This fucks up the reponsive ness
     */
    if (fElement.layoutGrow === 0.0) {
      this.setFixedHozontal(qElement, true)
    }

    if (fElement.layoutGrow === 1) {
      this.setFixedHozontal(qElement, false)
    }

    /**
     * We set also hug, as the absense of FIXED in a auto layout parent
     */
    if (fElement._parent) {
      if (fElement._parent.layoutMode === 'HORIZONTAL') {        
        if (fElement.primaryAxisSizingMode !== "FIXED" && fElement.layoutGrow === 0 && this.hasFigmaChildren(fElement)) {
          // FIXME: We should set hug only on 
          this.setHugHozontal(qElement, true) 
        }
      }
      if (fElement._parent.layoutMode === 'VERTICAL') {        
        if (fElement.primaryAxisSizingMode !== "FIXED" && fElement.layoutGrow === 0 && this.hasFigmaChildren(fElement)) { 
          this.setHugVertical(qElement, true) 
        }
      }
    }


    if (fElement.layoutAlign !== undefined) {
      if (fElement.layoutAlign === 'STRETCH' ) { // FIXME: here is some werid figma behavior fElement.layoutGrow === 0.0
        this.setFixedHozontal(qElement, false)
      }
      qElement.layout.align = fElement.layoutAlign
    }

    /** 
     * I am not sure what this means
    if (fElement.primaryAxisSizingMode === "FIXED") {
      this.setFixedHozontal(qElement, true)
    }
    */

    qElement.layout.grow = fElement.layoutGrow

    /**
     * We have to substract borders, because of the outer border of Figma
     */
    qElement.layout.paddingLeft = this.mapPadding(fElement.paddingLeft, qElement.style.borderLeftWidth)
    qElement.layout.paddingRight = this.mapPadding(fElement.paddingRight, qElement.style.borderRightWidth)
    qElement.layout.paddingTop = this.mapPadding(fElement.paddingTop, qElement.style.borderTopWidth)
    qElement.layout.paddingBottom = this.mapPadding(fElement.paddingBottom, qElement.style.borderBottomWidth)

    if (this.isFixedChildInAutoParentWithSameWidth(qElement, qParentElement)) {	
      this.setFixedHozontal(qElement, false)
    }

    return qElement
  }

  hasFigmaChildren (fElement) {
    return fElement.children && fElement.children.length > 0
  }

  isFixedChildInAutoParentWithSameWidth (qElement, qParentElement) {
		if (this.fixed2Fill && qParentElement && isFixedHorizontal(qElement) && isLayoutAutovertical(qParentElement)) {
			let parentPaddingHorizontal = getAutoPaddingHorizontal(qParentElement)	
			let dif = Math.abs(qParentElement.w - parentPaddingHorizontal) - qElement.w
			if (dif < 1) {
				Logger.log(-1, "FigmaService.isFixedChildInAutoParentWithSameWidth() > fix " + qElement.name, dif)
				return true
			}
		}
		return false
	}



  mapPadding(padding, border) {
    let p = padding ? padding : 0
    let b = border ? border : 0
    return p- b
  }

  mapAlign (v) {
    if (this.figmaAlignMapping[v]) {
      return this.figmaAlignMapping[v]
    }
    // default is start
    return 'flex-start'
  }



  setContraints (element, props) {

    if (element.constraints) {
      let horizontal = element.constraints.horizontal
      switch (horizontal) {

        case 'RIGHT':
          props.resize.left = false
          props.resize.right = true
          props.resize.fixedHorizontal = false
          break;

        case 'LEFT_RIGHT':
          Logger.log(2, 'FigmaService.setContraints() > LEFT_RIGHT', element.name)
          props.resize.left = true
          props.resize.right = true
          props.resize.fixedHorizontal = false
          break; 

        default:
          break;
      }

      let vertical = element.constraints.vertical
      switch (vertical) {
        case 'TOP_BOTTOM':
          Logger.log(2, 'FigmaService.setContraints() > TOP_BOTTOM', element.name)
          props.resize.up = true
          props.resize.down = true
          props.resize.fixedVertical = false
          break;
        
        case 'BOTTOM':
            Logger.log(2, 'FigmaService.setContraints() > BOTTOM', element.name)
            props.resize.up = false
            props.resize.down = true
            break;

        default:
          break;

      }
    }


   

  }

  isIgnored (element) {
    // FIXME: check for empty frames
    return this.ignoredTypes.indexOf(element.type) >= 0
  }

  isInvisible (element) {
    if (element.visible === false) {
      Logger.log(5, 'FigmaService.isInvisible() > exit (visible): ' + element.name, element.type)
      return true
    }
    if (element.opacity <= 0) {
      Logger.log(5, 'FigmaService.isInvisible() > exit (opacity): ' + element.name, element.type)
      return true
    }
    return false
  }

  isFrame (element) {
    return element.type === 'FRAME'
  }

  isComponet (element) {
    return element.type === 'COMPONENT'
  }

  isComponentSet (element) {
    return element.type === 'COMPONENT_SET'
  }

  isVector (element) {
    return this.allAsVecor || !this.isButton(element)
  }

  isCustomVector (fElement) {
    if (fElement.pluginData) {
      let pluginData = fElement.pluginData[this.pluginId]
      if (pluginData && pluginData.quxType === 'Vector') {
        return true
      }
    }
    return false
  }


  isLabel (widget) {
    return widget && (widget.type === 'Label' || widget.type === 'RichText')
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
      fontFamily: this.defaultFontFamily,
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
            style.backgroundColor = 'transparent'
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
        if (stroke.color) {
          style.borderBottomColor = this.getColor(stroke.color, element)
          style.borderTopColor = this.getColor(stroke.color, element)
          style.borderLeftColor = this.getColor(stroke.color, element)
          style.borderRightColor = this.getColor(stroke.color, element)
        }


        if (element.strokeWeight) {
          style.borderBottomWidth = element.strokeWeight
          style.borderTopWidth = element.strokeWeight
          style.borderLeftWidth = element.strokeWeight
          style.borderRightWidth = element.strokeWeight
        }

        // FIXME: add here something about stroke geometry to get 

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
        this.setTextStyle(element.style, style)
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

  setTextStyle (fStyle, style) {

    style.fontFamily = fStyle.fontFamily
    style.fontSize = fStyle.fontSize
    style.fontWeight = fStyle.fontWeight

    this.setLineHeight(style, fStyle)

    style.letterSpacing = fStyle.letterSpacing

    if (fStyle.textCase === 'UPPER') {
      style.textTransform = 'uppercase'
    }
    if (fStyle.textCase === 'LOWER') {
      style.textTransform = 'lowercase'
    }
    if (fStyle.textCase === 'TITLE') {
      style.textTransform = 'capitalize'
    }

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


  setLineHeight (style, fStyle) {
    /**
     * If we have pixel line height, everything is easy.
     */
    if (fStyle.lineHeightUnit === 'PIXELS') {
      style.lineHeightPX = fStyle.lineHeightPx
      return
    }

    /**
     * we might have 'normal', which seems 150%. We set as pixel, because
     * Figma inspect gives the same values.
     */
    if (fStyle.lineHeightUnit === 'INTRINSIC_%' && fStyle.lineHeightPercent) {
      if (this.autoLineHeightAsNormal) {
        style.lineHeight = 'normal'
      } else {
        style.lineHeightPX = Math.round(style.fontSize * 1.5)
      }
      return
    }

    /**
     * For % we have to take the lineHeightPercentFontSize
     */
    if (fStyle.lineHeightUnit === 'FONT_SIZE_%') {
      style.lineHeight = fStyle.lineHeightPercentFontSize / 100
      return
    }


    /**
     * Defautl is line-heigth in percentage
     */
    style.lineHeight = fStyle.lineHeightPercent / 100
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

    /**
     * FIXME: We could have somehow super complex nested shapes that should be handled as a vector...
     */

    if (element.type === 'TEXT') {
      if (element.characterStyleOverrides && element.characterStyleOverrides.length > 0 && element.styleOverrideTable) {
        return 'RichText'
      }
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
      id: id,
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
