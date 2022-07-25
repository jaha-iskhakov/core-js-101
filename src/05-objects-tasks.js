/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => width * height;
  // throw new Error('Not implemented');
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
  // throw new Error('Not implemented');
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const params = JSON.parse(json);
  const values = Object.values(params);
  return new proto.constructor(...values);
  // throw new Error('Not implemented');
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class SelectorBuilder {
  constructor() {
    this.cssSelectors = {};
    this.combination = [];
  }

  element(value) {
    this.isUnique('type');
    this.cssSelectors.type = value;
    this.isRightOrder();
    return this;
  }

  id(value) {
    this.isUnique('id');
    this.cssSelectors.id = `#${value}`;
    this.isRightOrder();
    return this;
  }

  class(value) {
    this.hasSelector('class');
    this.cssSelectors.class.push(`.${value}`);
    this.isRightOrder();
    return this;
  }

  attr(value) {
    this.hasSelector('attribute');
    this.cssSelectors.attribute.push(`[${value}]`);
    this.isRightOrder();
    return this;
  }

  pseudoClass(value) {
    this.hasSelector('pseudoClass');
    this.cssSelectors.pseudoClass.push(`:${value}`);
    this.isRightOrder();
    return this;
  }

  pseudoElement(value) {
    this.isUnique('pseudoElement');
    this.cssSelectors.pseudoElement = `::${value}`;
    this.isRightOrder();
    return this;
  }

  hasSelector(selector) {
    if (!Object.keys(this.cssSelectors).includes(selector)) this.cssSelectors[selector] = [];
  }

  isUnique(selector) {
    if (Object.keys(this.cssSelectors).includes(selector)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  isRightOrder() {
    const selectors = ['type', 'id', 'class', 'attribute', 'pseudoClass', 'pseudoElement'];
    const rightOrder = selectors.filter((item) => Object.keys(this.cssSelectors).includes(item));
    const currentOrder = Object.keys(this.cssSelectors);
    for (let i = 0; i < currentOrder.length; i += 1) {
      if (currentOrder[i] !== rightOrder[i]) {
        throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
      }
    }
  }

  combine(selector1, combinator, selector2) {
    this.combination.push(
      Object.values(selector1.cssSelectors),
      ` ${combinator} `,
      Object.values(selector2.cssSelectors),
      Object.values(selector2.combination),
    );
    return this;
  }

  stringify() {
    if (this.combination.length > 0) return this.combination.flat(Infinity).join('');
    return Object.values(this.cssSelectors).flat(Infinity).join('');
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new SelectorBuilder().element(value);
  },

  id(value) {
    return new SelectorBuilder().id(value);
  },

  class(value) {
    return new SelectorBuilder().class(value);
  },

  attr(value) {
    return new SelectorBuilder().attr(value);
  },

  pseudoClass(value) {
    return new SelectorBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new SelectorBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new SelectorBuilder().combine(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
