var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { DOM_TYPES } from './j';
import { setAttributes } from './attributes';
import { addEventListeners } from './events';
import { filterOutWhitespaceNodes } from './utils/arrays';
export function mountDOM(vdom, parentEl, index, hostComponent = null) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index);
            break;
        }
        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index, hostComponent);
            break;
        }
        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index, hostComponent);
            break;
        }
        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`);
        }
    }
}
function createTextNode(vdom, parentEl, index) {
    const { value } = vdom;
    const textNode = document.createTextNode(value);
    vdom.el = textNode;
    insert(textNode, parentEl, index);
}
function createFragmentNodes(vdom, parentEl, index, hostComponent) {
    const { children } = vdom;
    vdom.el = parentEl;
    children.forEach((child, i) => mountDOM(child, parentEl, index ? index + i : null, hostComponent));
}
function createElementNode(vdom, parentEl, index, hostComponent) {
    const { tag, props, children } = vdom;
    const element = document.createElement(tag);
    addProps(element, props, vdom, hostComponent);
    vdom.el = element;
    children.forEach((child, i) => mountDOM(child, element, null, hostComponent));
    insert(element, parentEl, index);
}
function addProps(el, props, vdom, hostComponent) {
    const { on: events } = props, attrs = __rest(props, ["on"]);
    vdom.listeners = addEventListeners(events, el, hostComponent);
    setAttributes(el, attrs);
}
function insert(el, parentEl, index) {
    if (index == null) {
        parentEl.append(el);
        return;
    }
    if (index < 0) {
        throw new Error(`Index must be a positive integer, got ${index}`);
    }
    const children = filterOutWhitespaceNodes(parentEl);
    if (index >= children.length) {
        parentEl.append(el);
    }
    else {
        parentEl.insertBefore(el, children[index]);
    }
}
