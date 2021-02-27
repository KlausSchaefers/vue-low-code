import Logger from '../core/Logger'
import Mail from './Mail'
import ContentFul from './ContentFul'

export default class ActionEngine {

  constructor (actions) {
    Logger.log(-1, 'ActionEngine()', actions)
    this.actions = actions
    this.engines = {
      'mail': new Mail(),
      'contentful': new ContentFul()
    }
  }

  hasAction (actionName) {
    let filter = this.actions.filter(a => a.id === actionName)
    return filter.length === 1
  }

  async executeAction (app, actionName, viewModel) {
    Logger.log(-1, 'ActionEngine.executeAction()', actionName, viewModel)
    try {
      let action = this.actions.find(a => a.id === actionName)
      if (action && action.steps) {
        action.steps.forEach(async (step) => {
          await this.executeStep(step, viewModel, actionName)
        })
      } else {
        Logger.warn('ActionEngine.executeAction() > No action with id', actionName)
      }
    } catch (err) {
      Logger.error('ActionEngine.executeAction() > Error during execution', err)
    }
  }

  async executeStep (step, viewModel, actionName) {
    if (this.engines[step.type]) {
      await this.engines[step.type].execute(step, viewModel)
    } else {
      Logger.error('ActionEngine.executeStep() > No method for step', 'execute_' + step.type, actionName)
    }
  }





}