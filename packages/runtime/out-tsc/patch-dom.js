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
import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { areNodesEqual } from "./nodes-equal";
import { DOM_TYPES, extractChildren } from './j';
import { objectsDiff } from "./utils/objects";
import { removeAttribute, setAttribute, removeStyle, setStyle } from './attributes';
import { ARRAY_DIFF_OP, arraysDiff, arraysDiffSequence, filterOutWhitespaceNodes } from './utils/arrays';
import { isNotBlankOrEmptyString } from "./utils/string";
import { addEventListener } from "./events";
export function patchDOM(oldVdom, newVdom, parentEl, hostComponent = null) {
    if (!areNodesEqual(oldVdom, newVdom)) {
        const index = Array.from(filterOutWhitespaceNodes(parentEl)).indexOf(oldVdom.el);
        destroyDOM(oldVdom);
        mountDOM(newVdom, parentEl, index, hostComponent);
        return newVdom;
    }
    newVdom.el = oldVdom.el;
    switch (newVdom.type) {
        case DOM_TYPES.TEXT: {
            patchText(oldVdom, newVdom);
            return newVdom;
        }
        case DOM_TYPES.ELEMENT: {
            patchElement(oldVdom, newVdom, hostComponent);
            break;
        }
    }
    patchChildren(oldVdom, newVdom, hostComponent);
    return newVdom;
}
function patchText(oldVdom, newVdom) {
    const el = oldVdom.el;
    const { value: oldText } = oldVdom;
    const { value: newText } = newVdom;
    if (oldText !== newText) {
        el.nodeValue = newText;
    }
}
function patchElement(oldVdom, newVdom, hostComponent) {
    const el = oldVdom.el;
    const _a = oldVdom.props, { class: oldClass, style: oldStyle, on: oldEvents } = _a, oldAttrs = __rest(_a, ["class", "style", "on"]);
    const _b = newVdom.props, { class: newClass, style: newStyle, on: newEvents } = _b, newAttrs = __rest(_b, ["class", "style", "on"]);
    const { listeners: oldListeners } = oldVdom;
    patchAttrs(el, oldAttrs, newAttrs);
    patchClasses(el, oldClass, newClass);
    newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents, hostComponent);
    patchStyles(el, oldStyle, newStyle);
}
function patchAttrs(el, oldAttrs = {}, newAttrs = {}) {
    const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);
    for (const attr of removed) {
        removeAttribute(el, attr);
    }
    for (const attr of added.concat(updated)) {
        setAttribute(el, attr, newAttrs[attr]);
    }
}
function patchClasses(el, oldClass, newClass) {
    const oldClasses = toClassList(oldClass);
    const newClasses = toClassList(newClass);
    const { added, removed } = arraysDiff(oldClasses, newClasses);
    if (removed.length > 0) {
        el.classList.remove(...removed);
    }
    if (added.length > 0) {
        el.classList.add(...added);
    }
}
function toClassList(classes = '') {
    return Array.isArray(classes) ? classes.filter(isNotBlankOrEmptyString) : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}
function patchStyles(el, oldStyle = {}, newStyle = {}) {
    const { added, removed, updated } = objectsDiff(oldStyle, newStyle);
    for (const style of removed) {
        removeStyle(el, style);
    }
    for (const style of added.concat(updated)) {
        setStyle(el, style, newStyle[style]);
    }
}
function patchEvents(el, oldListeners = {}, oldEvents = {}, newEvents = {}, hostComponent) {
    const { removed, added, updated } = objectsDiff(oldEvents, newEvents);
    for (const eventName of removed.concat(updated)) {
        el.removeEventListener(eventName, oldListeners[eventName]);
    }
    const addedListeners = {};
    for (const eventName of added.concat(updated)) {
        const listener = addEventListener(eventName, newEvents[eventName], el, hostComponent);
        addedListeners[eventName] = listener;
    }
    return addedListeners;
}
function patchChildren(oldVdom, newVdom, hostComponent) {
    var _a;
    const oldChildren = extractChildren(oldVdom);
    const newChildren = extractChildren(newVdom);
    const parentEl = oldVdom.el;
    const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);
    for (const operation of diffSeq) {
        const { originalIndex, index, from, item } = operation;
        const offset = (_a = hostComponent === null || hostComponent === void 0 ? void 0 : hostComponent.offset) !== null && _a !== void 0 ? _a : 0;
        switch (operation.op) {
            case ARRAY_DIFF_OP.ADD: {
                mountDOM(item, parentEl, index + offset, hostComponent);
                break;
            }
            case ARRAY_DIFF_OP.REMOVE: {
                destroyDOM(item);
                break;
            }
            case ARRAY_DIFF_OP.MOVE: {
                const oldChild = oldChildren[originalIndex];
                const newChild = newChildren[index];
                const el = oldChild.el;
                const elAtTargetIndex = filterOutWhitespaceNodes(parentEl)[index + offset];
                parentEl.insertBefore(el, elAtTargetIndex);
                patchDOM(oldChild, newChild, parentEl, hostComponent);
                break;
            }
            case ARRAY_DIFF_OP.NOOP: {
                patchDOM(oldChildren[originalIndex], newChildren[index], parentEl, hostComponent);
                break;
            }
        }
    }
}
