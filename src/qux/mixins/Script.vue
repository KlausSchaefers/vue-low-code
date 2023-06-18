<template>
    <div>
    </div>
  </template>
  <script>
  import ScriptEngine from '../scripts/ScriptEngine'
  import * as ScriptToModel from '../scripts/ScriptToModel'
  import Logger from '../core/Logger'
  import * as ExportUtil from '../core/ExportUtil'
  
  export default {
    name: 'ScriptMixin',
    methods: {
  
      async initLoadScripts () {
          Logger.log(2,"Scripts.initLoadScripts","enter >" );
          if (this.doNotExecuteScripts) {
              Logger.log(2,"Scripts.initLoadScripts","exit > Do not run" );
              return
          }
          const widgets = this.getLoadScripts()
          for (let i=0; i< widgets.length; i++) {
              const widget = widgets[i]
              if (widget.props.script) {
                  Logger.log(-1,"Scripts.initLoadScripts","run >", widget.name );
                  await this.runScript(widget.props.script, widget)
              }
          }
          Logger.log(2,"Scripts.initLoadScripts","exit", this.dataBindingValues );
      },
  
      getLoadScripts () {
          return Object
              .values(this.model.widgets)
              .filter(w => w.type === 'Script' && w.props.trigger === 'load')
      },
  
      async initRepeatScripts () {
          Logger.log(2,"Scripts.initRepeatScripts","enter >" );
          if (this.doNotExecuteScripts) {
              Logger.log(2,"Scripts.initRepeatScripts","exit > Do not run" );
              return
          }
          const widgets = this.getRepeatScripts()
          this._repeatScriptIntervals = []
          for (let i=0; i< widgets.length; i++) {
              const widget = widgets[i]
              if (widget.props.script && widget.props.delay) {
                  let id = setInterval(() => {
                      Logger.log(-1,"Scripts.initRepeatScripts","run > ", widget.name );
                      this.runScript(widget.props.script, widget)
                  }, widget.props.delay * 1000)
                  this._repeatScriptIntervals.push(id)
              }
          }
          Logger.log(2,"Scripts.initRepeatScripts","exit", this.dataBindingValues );
      },
  
      cleanUpRepeatScripts () {
          Logger.log(-2,"Scripts.cleanUpRepeatScripts","enter" );
          if (this._repeatScriptIntervals) {
              this._repeatScriptIntervals.forEach(id => {
                  clearInterval(id)
              })
          }
      },
  
      getRepeatScripts () {
          return Object
              .values(this.model.widgets)
              .filter(w => w.type === 'Script' && w.props.trigger === 'repeat')
      },
   
  
      async executeDataScripts () {
          Logger.log(2,"Scripts.executeDataScripts","enter >" );
          if (this.doNotExecuteScripts) {
              Logger.log(2,"Scripts.executeDataScripts","exit > Do not run" );
              return
          }
          const widgets = this.getDataBindingScripts()
          for (let i=0; i< widgets.length; i++) {
              const widget = widgets[i]
              if (widget.props.script) {
                  await this.runScript(widget.props.script, widget)
              }
          }
          Logger.log(2,"Scripts.executeDataScripts","exit");
      },
  
      getDataBindingScripts () {
          if (!this._scriptsDataBinding) {
              this._scriptsDataBinding = Object
                  .values(this.model.widgets)
                  .filter(w => w.type === 'Script' && w.props.trigger === 'databinding')
          }
          return this._scriptsDataBinding
      },
  
      async executeScript (box, orginalLine) {
          Logger.log(-2,"Scripts.executeScript","enter >" + box.id);
          const widgetID = box.id
          const widget = this.model.widgets[widgetID]
          if (widget && widget.props.script) {
              const result = await this.runScript(widget.props.script, widget, orginalLine)
              return result
          } else {
              Logger.error("Scripts.executeScript","exit > could not find " + widgetID);
          }
      },
      async runScript (script, widget, orginalLine) {
          Logger.log(2,"Scripts.runScript","enter", widget?.name);
  
          const event = this.getScriptSourceEvent(orginalLine)
  
          return new Promise(async(resolve) => {
              const engine = new ScriptEngine()
              let result = await engine.run(script, this.model, this.modelValue, event).then()
              if (result.status === 'ok') {     
                  requestAnimationFrame( () => {
                      this.vibrate(result)
                      this.renderAppChanges(result)
                      this.renderScriptDataBinding(result)  
                      this.renderScriptTo(result, widget, orginalLine)
                      Logger.log(1,"Scripts.runScript","exit");
                      resolve(result)
                  })
              } else {
                  resolve(result)
              }
          }) 
      },
  
      vibrate(result) {
          if (result.vibratePattern) {
              Logger.log(-1,"Scripts.vibrate","enter", result.vibratePattern);
              try {
                  navigator.vibrate(result.vibratePattern)
              } catch (err) {
                  Logger.error("Scripts.vibrate","Err", err);
              }        
          }
      },
  
      getScriptSourceEvent (line) {
          const event = {
              type: 'None',
              widget:'',
              screen: ''
          }
          if (line) {
              event.type = line.event
              const widget = this.model.widgets[line.from]
              if (widget) {
                  event.widget = widget.name
              } else {
                  Logger.log(-1,"Scripts.getScriptSourceEvent","No widet with id ", line.from);
              }
  
              if (this.currentScreen) {
                  event.screen = this.currentScreen.name
              }  else {
                  Logger.log(-1,"Scripts.getScriptSourceEvent","No current screen ");
              }
          }
          Logger.log(2,"Scripts.getScriptSourceEvent","exit ", event);
          return event
      },
  
      renderAppChanges (result) {
          Logger.log(2,"renderAppChanges","enter >", result.appDeltas);
          if (result.appDeltas) {
              result.appDeltas.forEach(change => {
                  ScriptToModel.applyChange(this.model, change, this.renderFactory)
              });
          }
      },
        
      renderScriptDataBinding (result) {
          Logger.log(2,"Scripts.renderScriptDataBinding","enter >");
          if (result.viewModel) {
             this.replaceDataBinding(result.viewModel)
          }
      },

      replaceDataBinding (newValues) {
        for (let key in newValues) {
            this.modelValue[key] = newValues[key]
        }
      },

      renderScriptTo (result, widget, orginalLine) {
          Logger.log(2,"Scripts.renderScriptResult","enter >" ,  orginalLine);
          if (!this.currentScreen && result.to) {
              // FIXME: This happens when a load script fires returns
              // before the page was rendered. Maybe change the ordering??
              Logger.error("Scripts.renderScriptResult","no currentscreen");
              return
          }
          if (result.to) {
              const targetScreen = Object.values(this.model.screens).find(s => s.name === result.to)
              if (targetScreen) {
                  const tempLine = this.createTempLine(targetScreen.id, orginalLine)
                  if(targetScreen.style.overlay){
                      this.executeLine(tempLine);
                  } else {
                      this.executeLine(tempLine);
                  }
              } else {
                  Logger.log(1,"runScript","No screen with name  >" + result.to);
                  result.console.push({
                      type: 'error',
                      args: `Simulator: No screen with name '${result.to}'`
                  })
              }
          } else if (widget) {
              const lines = ExportUtil.getLines(widget, this.model);
              if (lines && lines.length === 1) {
                  const tempLine = this.createTempLine(lines[0].to, orginalLine)
                  this.executeLine(tempLine);
              }
          }
      },
  
      createTempLine (to, orginalLine) {
          const result =  {
              to: to
          }
          if (orginalLine) {
              result.animation = orginalLine.animation
              result.duration = orginalLine.duration
              result.easing = orginalLine.easing
              result.from = orginalLine.from
          }
          return result
      }
  
    }
  
  
  }
  </script>