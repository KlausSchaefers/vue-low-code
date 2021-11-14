import Logger from './Logger'
class CSSWriter {

    constructor () {
        this.styleElement = {}
    }

    write (css, id = 'default') {       
        let head = document.head || document.getElementsByTagName('head')[0];
        if (this.styleElement[id]) {
            /**
             * This can lead to errors when the hash is changed.
             * This is edge case for development (I hope)
             */
            Logger.log(5, 'CSSWriter.write() > Clean up old', id)
            head.removeChild(this.styleElement[id])
        }

        let style = document.createElement('style');
        style.type = 'text/css';
        style.qux = true
        style.setAttribute('qux', id)
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
        this.styleElement[id] = style
    }
}
export default new CSSWriter()