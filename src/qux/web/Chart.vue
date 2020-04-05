<template>
  <div :class="['qux-chart', cssClass, 'qux-chart-' + chartType]">
    <img :src="chartImage">
  </div>
</template>
<style lang="scss">
    @import '../scss/qux-chart.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qBarCHart',
  mixins: [_Base],
  data: function () {
      return {
          scaleFactor: 1
      }
  },
  computed: {
    chartType () {
      if (this.element) {
        return this.element.type
      }
      return ''
    },
    chartImage () {
      if (this.element) {
        let url =  this.render(this.element, this.element.style, this.chartData, this.chartValue)
        return url
      }
      return ''
    },
    chartData () {
      if (this.element && this.element.props) {
        return this.element.props.data
      }
      return []
    },
    chartValue () {
      if (this.element && this.element.props) {
        return this.element.props.value
      }
      return 0
    }
  },
  methods: {
    render (model, style, data, value) {

      if (model.type == "BarChart") {

					if (model.props.isHorizontal){
						return this.renderHorizontal(model, style, data, value);
					} else if(model.props.isLine){
						return this.renderLine(model, style, data, value);
					} else {
						return this.renderVertical(model, style, data, value);
					}

			} else if (model.type == "RingChart") {

					return this.renderRing(model, style, data, value);

			} else if (model.type == "MultiRingChart") {

          let r = Math.round(Math.min(model.w, model.h) / 2) ;
          let width = Math.min(r, style.lineWidth * this.scaleFactor);
          return this.renderPie(model, style, data, width);

			} else if (model.type == "PieChart") {

					let width = Math.min(model.w,model.h) / 2
          return this.renderPie(model, style, data, width);

      } else {
        console.warn("render() > Not supported type : " + model.type);
      }
    },

		renderRing (model, style, data, p){

      if (p > 1) {
        p = p / 100
      }

      let w = model.w * this.scaleFactor;
      let h = model.h * this.scaleFactor;
      let canvas= document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;
      // let n = 0.5;
      let x = Math.round(Math.min(w,h) / 2) ;
      let width = Math.min(x, style.lineWidth * this.scaleFactor);

      let ctx = canvas.getContext("2d");

      ctx.beginPath();
      let s = this.degreesToRadians(p * 360);
      let e = this.degreesToRadians(360);
      ctx.arc(x,x, (x-width/2), s, e );
      ctx.strokeStyle= style.background;
      ctx.lineWidth=width;
      ctx.stroke();

      ctx.beginPath();
      s = this.degreesToRadians(0);
      e = this.degreesToRadians(360 * p);
      ctx.arc(x,x, (x- width/2), s, e );
      ctx.strokeStyle = style.color;
      ctx.lineWidth = width;
      ctx.stroke();

      return canvas.toDataURL("image/png")
    },

    renderPie (model, style, data, width){

      let w = model.w * this.scaleFactor;
      let h = model.h * this.scaleFactor;
      let canvas= document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;
      let x = Math.round(Math.min(w,h) / 2) ;

      /**
       * ToDo: Check if array of arrays or simple array
       */
      let row = data[0];
      let sum = 0;
      for (let i=0; i< row.length; i++){
        sum += row[i]*1;
      }

      let ctx = canvas.getContext("2d");
      let lastP = 0;
      for(let i=0; i< row.length; i++){
        let v = row[i];
        let p = (v/ sum) +lastP;

        ctx.beginPath();
        let s = this.degreesToRadians(lastP* 360);
        let e = this.degreesToRadians(360 * p);
        ctx.arc(x,x, (x- width/2), s, e );

        if(style["background" + i]){
          ctx.strokeStyle= style["background" + i];
        }
        ctx.strokeStyle = style.color;
        ctx.lineWidth = width;
        ctx.stroke();
        lastP += (v/ sum);
      }
      return canvas.toDataURL("image/png")
    },


    degreesToRadians  (degrees) {
      return (degrees * (Math.PI/180)) - Math.PI / 2;
    },


    renderLine (model, style, data){
      data = this.flip(data);

      let w = model.w * this.scaleFactor;
      let h = model.h * this.scaleFactor;
      let canvas= document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;
      let n=0.5;

      let ctx = canvas.getContext("2d");

      /**
       * Render lines
       */
      for(let r =0; r< data.length; r++){
        let row = data[r];
        let step =  Math.round(w / (row.length -1)) ;

        ctx.beginPath();

        let y =0;
        for(let c=0; c < row.length; c++){
          let v = row[c];
          y = h - Math.round((v*1 / this.max) * h) ;
          if(c ==0){
            ctx.moveTo(n,y +n);
          } else {
            ctx.lineTo(c*step +n, y +n);
          }
        }

        if(model.has && model.has.fill){
          ctx.lineTo(w+n, y +n);
          ctx.lineTo(w+n, h +n);
          ctx.lineTo(n, h+n);
          ctx.closePath();
        }

        if(style.lineWidth){
          ctx.lineWidth = style.lineWidth * this.scaleFactor
        }

        if(style["background" + r]){
          ctx.strokeStyle= style["background" + r];
          if(model.has && model.has.fill){
            ctx.fillStyle = style["background" + r];
            ctx.fill();
          }
        }
        ctx.stroke();
      }
      return canvas.toDataURL("image/png")
    },

    renderVertical (model, style, data){

      let w = model.w * this.scaleFactor;
      let h = model.h * this.scaleFactor;
      let canvas= document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;

      let ctx = canvas.getContext("2d");
      let summary = this.summary(data)
      let groupWidth = w / summary.groups

      for(let r =0; r < data.length; r++){
        let group = data[r];

        let barWidth = Math.floor(groupWidth / (group.length + 1))
        if (barWidth === 100) {
            barWidth = 50;
        }
        let groupOffSet = groupWidth * r + barWidth / 2
        for (let c=0; c < group.length; c++){
          let v = group[c];
          let barHeight = Math.round(h * (v / summary.max))
          let y = Math.round(groupOffSet + c * barWidth)

          ctx.beginPath();
          ctx.lineWidth = "4";
          ctx.strokeStyle = "green";
          if(style["background" + c]) {
            ctx.fillStyle = style["background" + c]
          }
          ctx.fillRect(y , h - barHeight , barWidth, barHeight);
          ctx.stroke();
        }
      }

      return canvas.toDataURL("image/png")
    },


    renderHorizontal (model, style, data){ //
      //console.debug(model, style, data)
      let w = model.w * this.scaleFactor;
      let h = model.h * this.scaleFactor;
      let canvas= document.createElement("canvas");
      canvas.width=w;
      canvas.height=h;

      let ctx = canvas.getContext("2d");
      let summary = this.summary(data)
      let groupHeight = w / summary.groups

      for(let r =0; r < data.length; r++){
        let group = data[r];

        let barHeight = Math.floor(groupHeight / (group.length + 1))
        if (barHeight === 100) {
            barHeight = 50;
        }
        let groupOffSet = groupHeight * r + barHeight / 2
        for (let c=0; c < group.length; c++){
          let v = group[c];
          let barWidth = Math.round(h * (v / summary.max))
          let x = Math.round(groupOffSet + c * barHeight)

          ctx.beginPath();
          ctx.lineWidth = "4";
          ctx.strokeStyle = "green";
          if(style["background" + c]) {
            ctx.fillStyle = style["background" + c]
          }
          ctx.fillRect(0, x , barWidth, barHeight);
          ctx.stroke();
        }
      }

      return canvas.toDataURL("image/png")
    },

		summary (data){
      let result = {
        max: -10000000,
        groups: data.length,
      }
      for(let r =0; r < data.length; r++){
        let row = data[r];
        for(let c = 0; c < row.length; c++){
          result.max = Math.max(result.max, row[c]);
        }
      }
      return result;
    },

    flip (data){
      this.max = -10000000;
      this.groups = 0;
      this.count = 0;
      let flipped = [];
      for(let r =0; r < data.length; r++){
        let row = data[r];

        for(let c=0; c < row.length; c++){
          if(!flipped[c]){
            flipped[c] = [];
          }
          flipped[c][r] = row[c];
          this.max = Math.max(this.max, row[c]);

          this.count++;
        }
      }
      return flipped;
    },


    /**
     * Can be overwritten by children to have proper type conversion
     */
    _setDataBindingValue (v) {

      let data = this.model.props.data
      let value = this.model.props.value

      if (this.type == "ring") {
        let v2 = v * 1
        if (!isNaN (v2)) {
          value = v2
        } else {
          console.warn('Chart._setDataBindingValue() > Wrong value for ring', v)
          return
        }
      } else if (this.type === 'pie') {
        /**
         * Expects array with one element of array
         */
        data = [this.objectToArray(v)]
      } else {
        /**
         * Expect columns wise array of arrays
         * [ [1,2], [11, 22]...]
         */
        data = []
        let temp = this.objectToArray(v)
        for (let r in temp) {
          let row = this.objectToArray(temp[r])
          for (let c in row){
            if (!data[c]) {
              data[c] = []
            }
            data[c].push(row[c])
          }
        }		}

      this.renderChart(this.model, this.style, data, value)
      this.setValue(v);
    },

    objectToArray (v) {
      let result = []
      for (let key in v) {
        result.push(v[key])
      }
      return result
    }
  },
  mounted () {
     //console.debug('Button.mounted()')
  }
}
</script>
