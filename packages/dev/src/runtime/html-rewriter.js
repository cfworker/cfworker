/// <reference types="@cloudflare/workers-types" />

import { htmlEncode } from './html-encode.js';

const encoder = new TextEncoder();
const parser = new DOMParser();

export class HTMLRewriter {
  /** @type {{selector: string; handler:ElementHandler;}[]} */
  _elements = [];

  /** @type {DocumentHandler[]} */
  _documents = [];

  /**
   * @param {string} selector
   * @param {ElementHandler} handler
   * @returns {HTMLRewriter}
   */
  on(selector, handler) {
    this._elements.push({ selector, handler });
    return this;
  }

  /**
   * @param {DocumentHandler} handler
   * @returns {HTMLRewriter}
   */
  onDocument(handler) {
    this._documents.push(handler);
    return this;
  }

  /**
   * @param {Response} response
   * @returns {Response}
   */
  transform(response) {
    const { readable, writable } = new TransformStream();
    this._transformInternal(response, writable);
    return new Response(readable, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  }

  /**
   * @param {Response} response
   * @param {WritableStream} writable
   */
  async _transformInternal(response, writable) {
    const writer = writable.getWriter();
    const html = await response.text();
    const document = parser.parseFromString(html, 'text/html');
    this._walk(document);
    await writer.write(encoder.encode(document.documentElement.outerHTML));
    await writer.close();
  }

  /**
   * @param {Document} document
   */
  _walk(document) {
    const whatToShow =
      NodeFilter.SHOW_DOCUMENT_TYPE |
      NodeFilter.SHOW_ELEMENT |
      NodeFilter.SHOW_COMMENT |
      NodeFilter.SHOW_TEXT;
    const walker = document.createTreeWalker(
      document.documentElement,
      whatToShow
    );
    /** @type {{ node: Element | Text; mutations: ElementMutations; }[]} */
    let toMutate = [];
    /** @type {Node|null} */
    let node = walker.currentNode;
    while (node) {
      switch (node.nodeType) {
        case Node.DOCUMENT_TYPE_NODE:
          break;
        case Node.COMMENT_NODE:
          let comment;
          for (const { selector, handler } of this._elements) {
            if (node.parentElement.matches(selector)) {
              if (handler.comments) {
                comment = comment || new CFText(node);
                handler.comments(comment);
              }
            }
          }
          if (comment && comment._mutations) {
            toMutate.push({ node, mutations: comment._mutations });
          }
          break;
        case Node.TEXT_NODE:
          let text;
          for (const { selector, handler } of this._elements) {
            if (node.parentElement.matches(selector)) {
              if (handler.text) {
                text = text || new CFText(node);
                handler.text(text);
              }
            }
          }
          if (text && text._mutations) {
            toMutate.push({ node, mutations: text._mutations });
          }
          break;
        case Node.ELEMENT_NODE:
          let element;
          for (const { selector, handler } of this._elements) {
            if (node.matches(selector)) {
              if (handler.element) {
                element = element || new CFElement(node);
                handler.element(element);
              }
            }
          }
          if (element && element._mutations) {
            toMutate.push({ node, mutations: element._mutations });
          }
          break;
        default:
          throw new Error(`Unexpected nodeType ${node.nodeType}`);
      }
      node = walker.nextNode();
    }
    for (const { node, mutations } of toMutate) {
      if (!node.parentElement) {
        continue;
      }
      if (mutations.before) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.before) {
          if (html) {
            if (node.nodeType === Node.TEXT_NODE) {
              const marker = document.createElement('span');
              node.before(marker);
              marker.insertAdjacentHTML('beforebegin', content);
              marker.remove();
            } else {
              node.insertAdjacentHTML('beforebegin', content);
            }
          } else {
            node.before(content);
          }
        }
      }
      if (mutations.after) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.after) {
          if (html) {
            if (node.nodeType === Node.TEXT_NODE) {
              const marker = document.createElement('span');
              node.after(marker);
              marker.insertAdjacentHTML('afterend', content);
              marker.remove();
            } else {
              node.insertAdjacentHTML('afterend', content);
            }
          } else {
            node.after(content);
          }
        }
      }
      if (mutations.remove) {
        node.remove();
        continue;
      }
      if (mutations.replace) {
        const {
          content,
          contentOptions: { html }
        } = mutations.replace[0];
        if (html) {
          if (node.nodeType === Node.TEXT_NODE) {
            const marker = document.createElement('span');
            node.before(marker);
            marker.insertAdjacentHTML('afterend', content);
            marker.remove();
          } else {
            node.insertAdjacentHTML('afterend', content);
          }
          node.remove();
        } else {
          node.replaceWith(content);
        }
        continue;
      }
      if (mutations.setInnerContent) {
        const {
          content,
          contentOptions: { html }
        } = mutations.setInnerContent[mutations.setInnerContent.length - 1];
        if (html) {
          node.innerHTML = content;
        } else {
          node.textContent = content;
        }
      }
      if (mutations.prepend) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.prepend) {
          node.insertAdjacentHTML(
            'afterbegin',
            html ? content : htmlEncode(content)
          );
        }
      }
      if (mutations.append) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.append) {
          node.insertAdjacentHTML(
            'beforeend',
            html ? content : htmlEncode(content)
          );
        }
      }
      if (mutations.removeAndKeepContent) {
        while (node.childNodes.length) {
          const child = node.childNodes.item(0);
          node.removeChild(child);
          node.parentElement.insertBefore(child, node);
        }
        node.remove();
        continue;
      }
    }
  }
}

class CFText {
  /** @type {ElementMutations | undefined} */
  _mutations = undefined;

  /**
   * @param {Text} text
   */
  constructor(text) {
    this._node = text;
  }

  get removed() {
    if (this._node.removed === true) {
      return true;
    }
    let node = this._node.parentNode;
    while (node) {
      if (node.keepContent === false) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  get text() {
    return this._node.textContent;
  }

  get lastInTextNode() {
    return (
      !this._node.nextSibling ||
      this._node.nextSibling.nodeType !== Node.TEXT_NODE
    );
  }
}

class CFElement {
  /** @type {ElementMutations | undefined} */
  _mutations = undefined;

  /**
   * @param {Element} element
   */
  constructor(element) {
    this._node = element;
  }

  get tagName() {
    return this._node.tagName.toLowerCase();
  }
  get attributes() {
    const length = this._node.attributes.length;
    const arr = [];
    for (let i = 0; i < length; i++) {
      const attr = this._node.attributes.item(i);
      arr.push([attr.name, attr.value]);
    }
    return arr;
  }
  get namespaceURI() {
    return this._node.namespaceURI;
  }
  get removed() {
    if (this._node.removed === true) {
      return true;
    }
    let el = this._node.parentNode;
    while (el) {
      if (el.keepContent === false) {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  }
}

for (const action of ['get', 'has', 'set', 'remove']) {
  const method = `${action}Attribute`;
  /**
   * @param  {...string} args
   * @this {CFElement}
   */
  function attribute(...args) {
    return this._node[method].call(this._node, ...args);
  }
  CFElement.prototype[method] = attribute;
}

/** @type {ElementMutationType[]} */
const mutationMethods = [
  'before',
  'after',
  'prepend',
  'append',
  'replace',
  'setInnerContent',
  'remove',
  'removeAndKeepContent'
];

/** @type {ElementMutationType[]} */
const textMutationMethods = ['before', 'after', 'replace', 'remove'];

for (const method of mutationMethods) {
  /**
   * @param {string} content
   * @param {ContentOptions} contentOptions
   * @this {CFElement}
   */
  function mutate(content, contentOptions = { html: false }) {
    switch (method) {
      case 'replace':
        this._node.removed = true;
        break;
      case 'setInnerContent':
        this._node.keepContent = false;
        break;
      case 'remove':
        this._node.removed = true;
        this._node.keepContent = false;
        break;
      case 'removeAndKeepContent':
        this._node.removed = true;
        this._node.keepContent = true;
        break;
    }
    this._mutations = this._mutations || {};
    this._mutations[method] = this._mutations[method] || [];
    this._mutations[method].push({ content, contentOptions });
  }
  CFElement.prototype[method] = mutate;
  if (textMutationMethods.includes(method)) {
    CFText.prototype[method] = mutate;
  }
}

/** @typedef {'before' | 'after' | 'prepend' | 'append' | 'replace' | 'setInnerContent' | 'remove'| 'removeAndKeepContent'} ElementMutationType */
/** @typedef {{ content: string; contentOptions: ContentOptions; }} ElementMutation */
/** @typedef {Record<ElementMutationType, ElementMutation[]>} ElementMutations */
