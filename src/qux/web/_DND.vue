<template>
  <div class="qux-dnd">
  </div>
</template>
<script>

import Logger from '../core/Logger'

export default {
  name: '_DND',
  props: {
  },
  computed: {
  },
  methods: {
    on (node, event, callback) {
        if (node && node.toLowerCase) {
            node = document.getElementById(node)
        }
        if (node && node.addEventListener) {
            node.addEventListener(event, callback)
            return {
                'callback': callback,
                'node': node,
                'event': event,
                'remove': function () {
                    this.node.removeEventListener(this.event, this.callback)
                }
            }
        } else {
            Logger.warn('_DNDN.on() > Pass a node of valid id')
        }
    },
    body () {
        return document.getElementsByTagName("BODY")[0]
    },
    position (node) {
        let ret = node.getBoundingClientRect();
		ret = {x: ret.left, y: ret.top, w: ret.right - ret.left, h: ret.bottom - ret.top};
		return ret; 
    },
    mouse (e){
      var result = {x: 0, y: 0};
      if (e) {
		if (e.touches && e.touches.length > 0) {
          e = e.touches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0 ) {
          e = e.changedTouches[0]
          result.x = e.clientX;
          result.y = e.clientY;
        } else {
          result.x = e.pageX;
          result.y = e.pageY;
        }
      } 
      return result;
    },
    startDND (e, move, up) {
        this._dndStartPos = this.mouse(e)
        this._dndMouseUpListener = this.on(this.body(), 'mouseup', upEvent => {
            this.endDND(upEvent, up)
        })
        this._dndMouseMoveListener = this.on(this.body(), 'mousemove', moveEvent => {
            this.moveDND(moveEvent, move)
        })
    },
    moveDND (e, move) {
        if (move) {
            try {
                let currentPos = this.mouse(e)
                let delta = this.getMouseDelta(this._dndStartPos, currentPos)
                move(delta, e)
            } catch (err) {
                Logger.error('_DND.moveDND()', err)
                this.cleanDND()
            }
        }

    },
    endDND (e, up) {
        if (up) {
            try {
                let currentPos = this.mouse(e)
                let delta = this.getMouseDelta(this._dndStartPos, currentPos)
                up(delta, e)
            } catch (err) {
                Logger.error('_DND.endDND()', err)
            }
        }
        this.cleanDND()
    },
    getMouseDelta (start, end) {
        return {
            x: end.x - start.x,
            y: end.y - start.y
        }
    },
    cleanDND () {
        if (this._dndMouseUpListener) {
            this._dndMouseUpListener.remove()
            delete this._dndMouseUpListener
        }
        if (this._dndMouseMoveListener) {
            this._dndMouseMoveListener.remove()
            delete this._dndMouseMoveListener
        }
        delete this._dndStartPos
    }
  },
  destroyed () {
      this.cleanDND()
  }
}
</script>
