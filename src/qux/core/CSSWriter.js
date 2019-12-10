class CSSWriter {

    constructor () {
        this.styleElement = null
    }

    write (css) {
        let head = document.head || document.getElementsByTagName('head')[0];
        if (this.styleElement) {
            head.removeChild(this.styleElement)
        }
  
        let style = document.createElement('style');
        style.type = 'text/css';
        style.qux = true
        style.appendChild(document.createTextNode(css));   
        head.appendChild(style);
        this.styleElement = style
    }
}
export default new CSSWriter()