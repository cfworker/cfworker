/// <reference types="@cloudflare/workers-types" />

import { htmlEncode } from './html-encode';

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
    /** @type {{ element: Element; mutations: ElementMutations; }[]} */
    let toMutate = [];
    /** @type {Node|null} */
    let node = walker.currentNode;
    while (node) {
      switch (node.nodeType) {
        case Node.DOCUMENT_TYPE_NODE:
        case Node.COMMENT_NODE:
        case Node.TEXT_NODE:
          // todo: implement
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
            toMutate.push({ element: node, mutations: element._mutations });
          }
          break;
        default:
          throw new Error(`Unexpected nodeType ${node.nodeType}`);
      }
      node = walker.nextNode();
    }
    for (const { element, mutations } of toMutate) {
      if (!element.parentElement) {
        continue;
      }
      if (mutations.before) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.before) {
          element.insertAdjacentHTML(
            'beforebegin',
            html ? content : htmlEncode(content)
          );
        }
      }
      if (mutations.after) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.after) {
          element.insertAdjacentHTML(
            'afterend',
            html ? content : htmlEncode(content)
          );
        }
      }
      if (mutations.remove) {
        element.remove();
        continue;
      }
      if (mutations.replace) {
        const {
          content,
          contentOptions: { html }
        } = mutations.replace[0];
        element.insertAdjacentHTML(
          'afterend',
          html ? content : htmlEncode(content)
        );
        element.remove();
        continue;
      }
      if (mutations.setInnerContent) {
        const {
          content,
          contentOptions: { html }
        } = mutations.setInnerContent[mutations.setInnerContent.length - 1];
        if (html) {
          element.innerHTML = content;
        } else {
          element.textContent = content;
        }
      }
      if (mutations.prepend) {
        for (const {
          content,
          contentOptions: { html }
        } of mutations.prepend) {
          element.insertAdjacentHTML(
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
          element.insertAdjacentHTML(
            'beforeend',
            html ? content : htmlEncode(content)
          );
        }
      }
      if (mutations.removeAndKeepContent) {
        while (element.childNodes.length) {
          const child = element.childNodes.item(0);
          element.removeChild(child);
          element.parentElement.insertBefore(child, element);
        }
        element.remove();
        continue;
      }
    }
  }
}

class CFElement {
  /** @type {ElementMutations | undefined} */
  _mutations = undefined;

  /**
   * @param {Element} element
   */
  constructor(element) {
    this._element = element;
  }

  get tagName() {
    return this._element.tagName;
  }
  get attributes() {
    return this._element.attributes;
  }
  get namespaceURI() {
    return this._element.namespaceURI;
  }
  get removed() {
    if (this._element.removed === true) {
      return true;
    }
    let el = this._element.parentNode;
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
    return this._element[method].call(this._element, ...args);
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

for (const method of mutationMethods) {
  /**
   * @param {string} content
   * @param {ContentOptions} contentOptions
   * @this {CFElement}
   */
  function mutate(content, contentOptions = { html: false }) {
    switch (method) {
      case 'replace':
        this._element.removed = true;
        break;
      case 'setInnerContent':
        this._element.keepContent = false;
        break;
      case 'remove':
        this._element.removed = true;
        this._element.keepContent = false;
        break;
      case 'removeAndKeepContent':
        this._element.removed = true;
        this._element.keepContent = true;
        break;
    }
    this._mutations = this._mutations || {};
    this._mutations[method] = this._mutations[method] || [];
    this._mutations[method].push({ content, contentOptions });
  }
  CFElement.prototype[method] = mutate;
}

/** @typedef {'before' | 'after' | 'prepend' | 'append' | 'replace' | 'setInnerContent' | 'remove'| 'removeAndKeepContent'} ElementMutationType */
/** @typedef {{ content: string; contentOptions: ContentOptions; }} ElementMutation */
/** @typedef {Record<ElementMutationType, ElementMutation[]>} ElementMutations */
