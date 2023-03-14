<template>
    <div class="qux">
    </div>
  </template>
  <script>
  import Logger from '../core/Logger'
  import Bus from '../core/Bus'
  export default {
    name: 'Validation',
    methods: {
  
      purgeValidationErrors () {
          Logger.log(3, 'Luisa.purgeValidationErrors() > ', screen)
          for (let id in this.validationErrors) {
              delete this.validationErrors[id]
          }
      },
  
      validateAllWidgets () {
        Logger.log(3, 'Luisa.validateAllWidgets() > ', screen)
        Bus.publish(Bus.TOPIC_LUISA_VALIDATION)
      }
    }
  
  }
  </script>
  