import Logger from '../core/Logger'
import JSONPath from '../core/JSONPath'
import AbstractAction from './AbstractAction'

const  defaultInline = (type, node) => `<span>type: ${type} id: ${node.data.target.sys.id}</span>`;

export default class ContentFul extends AbstractAction {

  constructor () {
    super()
    this.contentfulUrl = 'https://cdn.contentful.com'

    this.renderMark = {
      ['bold']: text => `<b>${text}</b>`,
      ['italic']: text => `<i>${text}</i>`,
      ['underline']: text => `<u>${text}</u>`,
      ['code']: text => `<code>${text}</code>`,
    };


    this.renderNode = {
      ['paragraph']: (node, next) => `<p>${next(node.content)}</p>`,
      ['heading-1']: (node, next) => `<h1>${next(node.content)}</h1>`,
      ['heading-2']: (node, next) => `<h2>${next(node.content)}</h2>`,
      ['heading-3']: (node, next) => `<h3>${next(node.content)}</h3>`,
      ['heading-4']: (node, next) => `<h4>${next(node.content)}</h4>`,
      ['heading-5']: (node, next) => `<h5>${next(node.content)}</h5>`,
      ['heading-6']: (node, next) => `<h6>${next(node.content)}</h6>`,
      ['embedded-entry-block']: (node, next) => `<div>${next(node.content)}</div>`,
      ['unordered-list']: (node, next) => `<ul>${next(node.content)}</ul>`,
      ['ordered-list']: (node, next) => `<ol>${next(node.content)}</ol>`,
      ['list-item']: (node, next) => `<li>${next(node.content)}</li>`,
      ['blockquote']: (node, next) => `<blockquote>${next(node.content)}</blockquote>`,
      ['hr']: () => '<hr/>',
      ['asset-hyperlink']: node => defaultInline('asset-hyperlink', node),
      ['entry-hyperlink']: node => defaultInline('entry-hyperlink', node),
      ['embedded-entry-inline']: node => defaultInline('embedded-entry-inline', node),
      ['hyperlink']: (node, next) => `<a href="${node.data.uri}">${next(node.content)}</a>`,
    };
  }

  async execute (step, viewModel) {
    Logger.log(-1, 'ContentFul.execute() > enter ')
    let config = step.config
    if (config.outputVariable) {
      try {
        let documents = await this._get(`${this.contentfulUrl}/spaces/${config.spaceId}/environments/${config.envId}/entries?access_token=${config.apiToken}`)
        if (documents) {
          let assets = await this._get(`${this.contentfulUrl}/spaces/${config.spaceId}/environments/${config.envId}/assets?access_token=${config.apiToken}`)
          let items = documents.items.map(i => this.mapContentFul(i, assets))
          JSONPath.set(viewModel, config.outputVariable, items)
          Logger.log(-1, 'ContentFul.execute() > exit ', items)
        }
      } catch (err) {
        Logger.warn('ContentFul.execute() > Error ', err)
      }
    }
  }


  mapContentFul (item, assets) {
    let fields = item.fields
    let result = {}
    for (let key in fields) {
      let value = fields[key]
      if (value.nodeType === 'document') {
        result[key] = {
          type: 'richtext',
          value: this.documentToHtmlString(value) // get rid of dependency
        }
      } else if (value.sys && value.sys.linkType === 'Asset') {
        let assetId = value.sys.id
        let asset = assets.items.find(a => a.sys.id === assetId)
        if (asset.fields.file) {
          result[key] = {
            url: 'https:'+ asset.fields.file.url
          }
        }
      } else {
        result[key] = value
      }
    }
    if (!result.id) {
      result.id = item.sys.id
    }
    return result
  }



  /**
   * Serialize a Contentful Rich Text `document` to an html string.
   */
  documentToHtmlString(richTextDocument, options = {}) {
    if (!richTextDocument || !richTextDocument.content) {
      return '';
    }

    return this.nodeListToHtmlString(richTextDocument.content, {
      renderNode: {
        ...this.defaultNodeRenderers,
        ...options.renderNode,
      },
      renderMark: {
        ...this.defaultMarkRenderers,
        ...options.renderMark,
      },
    });
  }

  nodeListToHtmlString(nodes) {
    return nodes.map(node => this.nodeToHtmlString(node)).join('');
  }

  nodeToHtmlString(node) {
    if (this.isText(node)) {
      const nodeValue = this.escape(node.value);
      if (node.marks.length > 0) {
        return node.marks.reduce((value, mark) => {
          if (!this.renderMark[mark.type]) {
            return value;
          }
          return this.renderMark[mark.type](value);
        }, nodeValue);
      }

      return nodeValue;
    } else {
      const nextNode = nodes => this.nodeListToHtmlString(nodes);
      if (!node.nodeType || !this.renderNode[node.nodeType]) {
        return '';
      }
      return this.renderNode[node.nodeType](node, nextNode);
    }
  }

  isText (node) {
    return node.nodeType === 'text';
  }

  escape (s) {
    return s
  }
}