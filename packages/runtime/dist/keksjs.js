function addEventListener(eventName, handler, el, hostComponent = null) {
    function boundHandler() {
        hostComponent ? handler.apply(hostComponent, arguments) : handler(...arguments);
    }
    el.addEventListener(eventName, boundHandler);
    return boundHandler;
}
function addEventListeners(listeners = {}, el, hostComponent = null) {
    const addedListeners = {};
    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el, hostComponent);
        addedListeners[eventName] = listener;
    });
    return addedListeners;
}
function removeEventListeners(listeners = {}, el) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler);
    });
}

var __classPrivateFieldSet$1 = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet$2 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ArrayWithOriginalIndices_array, _ArrayWithOriginalIndices_originalIndices, _ArrayWithOriginalIndices_equalsFn;
var ARRAY_DIFF_OP;
(function (ARRAY_DIFF_OP) {
    ARRAY_DIFF_OP["ADD"] = "add";
    ARRAY_DIFF_OP["REMOVE"] = "remove";
    ARRAY_DIFF_OP["MOVE"] = "move";
    ARRAY_DIFF_OP["NOOP"] = "noop";
})(ARRAY_DIFF_OP || (ARRAY_DIFF_OP = {}));
function withoutNulls(arr) {
    return arr.filter((item) => {
        return item != null;
    });
}
function arraysDiff(oldArray, newArray) {
    return {
        added: newArray.filter((item) => {
            if (!oldArray.includes(item)) {
                return item;
            }
        }),
        removed: oldArray.filter((item) => {
            if (!newArray.includes(item)) {
                return item;
            }
        })
    };
}
function filterOutWhitespaceNodes(element) {
    const childNodes = Array.from(element.childNodes);
    const nonWhitespaceNodes = [];
    for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE && /^\s*$/.test(node.nodeValue)) {
            continue;
        }
        nonWhitespaceNodes.push(node);
    }
    return nonWhitespaceNodes;
}
function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
    const sequence = [];
    const array = new ArrayWithOriginalIndices(oldArray, equalsFn);
    for (let i = 0; i < newArray.length; i++) {
        if (array.isRemoval(i, newArray)) {
            sequence.push(array.removeItem(i));
            i--;
            continue;
        }
        if (array.isNoop(i, newArray)) {
            sequence.push(array.noopItem(i));
            continue;
        }
        const item = newArray[i];
        if (array.isAddition(item, i)) {
            sequence.push(array.addItem(item, i));
            continue;
        }
        sequence.push(array.moveItem(item, i));
    }
    sequence.push(...array.removeItemsAfter(newArray.length));
    return sequence;
}
class ArrayWithOriginalIndices {
    constructor(array, equalsFn) {
        _ArrayWithOriginalIndices_array.set(this, []);
        _ArrayWithOriginalIndices_originalIndices.set(this, []);
        _ArrayWithOriginalIndices_equalsFn.set(this, void 0);
        __classPrivateFieldSet$1(this, _ArrayWithOriginalIndices_array, [...array], "f");
        __classPrivateFieldSet$1(this, _ArrayWithOriginalIndices_originalIndices, array.map((_, i) => i), "f");
        __classPrivateFieldSet$1(this, _ArrayWithOriginalIndices_equalsFn, equalsFn, "f");
    }
    get length() {
        return __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f").length;
    }
    isRemoval(index, newArray) {
        if (index >= this.length) {
            return false;
        }
        const item = __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[index];
        const indexInNewArray = newArray.findIndex((newItem) => {
            return __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, newItem);
        });
        return indexInNewArray === -1;
    }
    isNoop(index, newArray) {
        if (index >= this.length) {
            return false;
        }
        const item = __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[index];
        const newItem = newArray[index];
        return __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, newItem);
    }
    isAddition(item, fromIndex) {
        return this.findIndexFrom(item, fromIndex) === -1;
    }
    findIndexFrom(item, fromIndex) {
        for (let i = fromIndex; i < this.length; i++) {
            if (__classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[i])) {
                return i;
            }
        }
        return -1;
    }
    originalIndexAt(index) {
        return __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_originalIndices, "f")[index];
    }
    removeItem(index) {
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[index]
        };
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f").splice(index, 1);
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(index, 1);
        return operation;
    }
    noopItem(index) {
        return {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[index]
        };
    }
    addItem(item, index) {
        const operation = {
            op: ARRAY_DIFF_OP.ADD,
            index,
            item: item
        };
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f").splice(index, 0, item);
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(index, 0, -1);
        return operation;
    }
    moveItem(item, toIndex) {
        const fromIndex = this.findIndexFrom(item, toIndex);
        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f")[fromIndex]
        };
        const [_item] = __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f").splice(fromIndex, 1);
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_array, "f").splice(toIndex, 0, _item);
        const [originalIndex] = __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(fromIndex, 1);
        __classPrivateFieldGet$2(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(toIndex, 0, originalIndex);
        return operation;
    }
    removeItemsAfter(index) {
        const operations = [];
        while (this.length > index) {
            operations.push(this.removeItem(index));
        }
        return operations;
    }
}
_ArrayWithOriginalIndices_array = new WeakMap(), _ArrayWithOriginalIndices_originalIndices = new WeakMap(), _ArrayWithOriginalIndices_equalsFn = new WeakMap();

var DOM_TYPES;
(function (DOM_TYPES) {
    DOM_TYPES["TEXT"] = "text";
    DOM_TYPES["ELEMENT"] = "element";
    DOM_TYPES["FRAGMENT"] = "fragment";
})(DOM_TYPES || (DOM_TYPES = {}));
({
    type: DOM_TYPES.ELEMENT
});
function j(tag, props = {}, children = []) {
    const entity = {
        tag: tag,
        props: props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    };
    return entity;
}
function jString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str
    };
}
function jFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes))
    };
}
function extractChildren(vdom) {
    if (vdom.children == null) {
        return [];
    }
    const children = [];
    for (const child of vdom.children) {
        if (child.type == DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child));
        }
        else {
            children.push(child);
        }
    }
    return children;
}
function mapTextNodes(children) {
    var filteredArray = children.map((child) => {
        if (typeof child === 'string') {
            return jString(child);
        }
        return child;
    });
    return filteredArray;
}
j('form', { class: 'login-form', action: 'login' }, [
    j('input', { type: 'text', name: 'user' }),
    j('input', { type: 'password', name: 'pass' }),
    j('button', { on: { click: 'login' } }, ['Login'])
]);
jFragment([
    j('h1', { class: 'title' }, ['My counter']),
    j('div', { class: 'container' }, [
        j('button', {}, ['decrement']),
        j('span', {}, ['0']),
        j('button', {}, ['increment']),
    ])
]);

function destroyDOM(vdom) {
    const { type } = vdom;
    switch (type) {
        case DOM_TYPES.TEXT: {
            removeTextNode(vdom);
            break;
        }
        case DOM_TYPES.ELEMENT: {
            removeElementNode(vdom);
            break;
        }
        case DOM_TYPES.FRAGMENT: {
            removeFragmentNodes(vdom);
            break;
        }
        default: {
            throw new Error(`Can't destroy DOM of type: ${type}`);
        }
    }
    delete vdom.el;
}
function removeTextNode(vdom) {
    const { el } = vdom;
    el.remove();
}
function removeElementNode(vdom) {
    const { el, children, listeners } = vdom;
    el.remove();
    children.forEach(child => {
        destroyDOM(child);
    });
    if (listeners) {
        removeEventListeners(listeners, el);
        delete vdom.listeners;
    }
}
function removeFragmentNodes(vdom) {
    const { children } = vdom;
    children.forEach(destroyDOM);
}

var __rest$3 = (undefined && undefined.__rest) || function (s, e) {
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
function setAttributes(el, attrs = {}) {
    const { class: className, style } = attrs, otherAttrs = __rest$3(attrs, ["class", "style"]);
    if (className) {
        setClass(el, className);
    }
    if (style) {
        Object.entries(style).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value);
    }
}
function setClass(el, className) {
    el.className = '';
    if (typeof className === 'string') {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
}
function setStyle(el, styleName, styleValue) {
    el.style[styleName] = styleValue;
}
function removeStyle(el, styleName) {
    el.style[styleName] = null;
}
function setAttribute(el, name, value) {
    if (value == null) {
        removeAttribute(el, name);
    }
    else {
        el[name] = value;
    }
}
function removeAttribute(el, name) {
    el[name] = null;
    el.removeAttribute(name);
}

var __rest$2 = (undefined && undefined.__rest) || function (s, e) {
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
function mountDOM(vdom, parentEl, index, hostComponent = null) {
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
    const { on: events } = props, attrs = __rest$2(props, ["on"]);
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

function areNodesEqual(nodeOne, nodeTwo) {
    if (nodeOne.type !== nodeTwo.type) {
        return false;
    }
    if (nodeOne.type === DOM_TYPES.ELEMENT) {
        const { tag: tagOne } = nodeOne;
        const { tag: tagTwo } = nodeTwo;
        return tagOne === tagTwo;
    }
    return true;
}

function objectsDiff(oldObj, newObj) {
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);
    return {
        added: newKeys.filter((key) => {
            if (!(key in oldObj)) {
                return key;
            }
        }),
        removed: oldKeys.filter((key) => {
            if (!(key in oldObj)) {
                return key;
            }
        }),
        updated: newKeys.filter((key) => {
            if (key in oldObj && oldObj[key] !== newObj[key]) {
                return key;
            }
        })
    };
}
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isNotEmptyString(value) {
    return value !== '';
}
function isNotBlankOrEmptyString(value) {
    return isNotEmptyString(value.trim());
}

var __rest$1 = (undefined && undefined.__rest) || function (s, e) {
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
function patchDOM(oldVdom, newVdom, parentEl, hostComponent = null) {
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
    const _a = oldVdom.props, { class: oldClass, style: oldStyle, on: oldEvents } = _a, oldAttrs = __rest$1(_a, ["class", "style", "on"]);
    const _b = newVdom.props, { class: newClass, style: newStyle, on: newEvents } = _b, newAttrs = __rest$1(_b, ["class", "style", "on"]);
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

var __classPrivateFieldGet$1 = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
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
function defineComponent(_a) {
    var _Component_instances, _Component_isMounted, _Component_vdom, _Component_hostEl, _Component_patch;
    var { render, state } = _a, methods = __rest(_a, ["render", "state"]);
    class Component {
        constructor(props = {}) {
            _Component_instances.add(this);
            _Component_isMounted.set(this, false);
            _Component_vdom.set(this, null);
            _Component_hostEl.set(this, null);
            this.props = null;
            this.state = null;
            this.props = props;
            this.state = state ? state(props) : {};
        }
        get elements() {
            if (__classPrivateFieldGet$1(this, _Component_vdom, "f") == null) {
                return [];
            }
            if (__classPrivateFieldGet$1(this, _Component_vdom, "f").type === DOM_TYPES.FRAGMENT) {
                return extractChildren(__classPrivateFieldGet$1(this, _Component_vdom, "f")).map((child) => child.el);
            }
            return [__classPrivateFieldGet$1(this, _Component_vdom, "f").el];
        }
        get firstElement() {
            return this.elements[0];
        }
        get offset() {
            var _a;
            if (__classPrivateFieldGet$1(this, _Component_vdom, "f").type === DOM_TYPES.FRAGMENT) {
                return Array.from((_a = __classPrivateFieldGet$1(this, _Component_hostEl, "f")) === null || _a === void 0 ? void 0 : _a.children).indexOf(this.firstElement);
            }
            return 0;
        }
        updateState(state) {
            this.state = Object.assign(Object.assign({}, this.state), state);
            __classPrivateFieldGet$1(this, _Component_instances, "m", _Component_patch).call(this);
        }
        render() {
            return render.call(this);
        }
        mount(hostEl, index = null) {
            if (__classPrivateFieldGet$1(this, _Component_isMounted, "f")) {
                throw new Error('Component is already mounted');
            }
            __classPrivateFieldSet(this, _Component_vdom, this.render(), "f");
            mountDOM(__classPrivateFieldGet$1(this, _Component_vdom, "f"), hostEl, index, this);
            __classPrivateFieldSet(this, _Component_hostEl, hostEl, "f");
            __classPrivateFieldSet(this, _Component_isMounted, true, "f");
        }
        unmount() {
            if (!__classPrivateFieldGet$1(this, _Component_isMounted, "f")) {
                throw new Error('Component is not mounted');
            }
            destroyDOM(__classPrivateFieldGet$1(this, _Component_vdom, "f"));
            __classPrivateFieldSet(this, _Component_vdom, null, "f");
            __classPrivateFieldSet(this, _Component_hostEl, null, "f");
            __classPrivateFieldSet(this, _Component_isMounted, false, "f");
            this.props = null;
            this.state = null;
        }
    }
    _Component_isMounted = new WeakMap(), _Component_vdom = new WeakMap(), _Component_hostEl = new WeakMap(), _Component_instances = new WeakSet(), _Component_patch = function _Component_patch() {
        if (!__classPrivateFieldGet$1(this, _Component_isMounted, "f")) {
            throw new Error('Component is not mounted');
        }
        const vdom = this.render();
        patchDOM(__classPrivateFieldGet$1(this, _Component_vdom, "f"), vdom, __classPrivateFieldGet$1(this, _Component_hostEl, "f"), this);
        __classPrivateFieldSet(this, _Component_vdom, Object.assign({}, vdom), "f");
    };
    for (const methodName in methods) {
        if (hasOwnProperty(Component, methodName)) {
            throw new Error(`Method ${methodName}() already exists in the component. Can't override existing methods`);
        }
        Component.prototype[methodName] = methods[methodName];
    }
    return Component;
}

var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Dispatcher_subs, _Dispatcher_afterHandlers;
class Dispatcher {
    constructor() {
        _Dispatcher_subs.set(this, new Map());
        _Dispatcher_afterHandlers.set(this, []);
    }
    subscribe(commandName, handler) {
        if (!__classPrivateFieldGet(this, _Dispatcher_subs, "f").has(commandName)) {
            __classPrivateFieldGet(this, _Dispatcher_subs, "f").set(commandName, []);
        }
        const handlers = __classPrivateFieldGet(this, _Dispatcher_subs, "f").get(commandName);
        if (handlers.includes(handler)) {
            return () => { };
        }
        handlers.push(handler);
        return () => {
            const idx = handlers.indexOf(handler);
            handlers.splice(idx, 1);
        };
    }
    afterEveryCommand(handler) {
        __classPrivateFieldGet(this, _Dispatcher_afterHandlers, "f").push(handler);
        return () => {
            const idx = __classPrivateFieldGet(this, _Dispatcher_afterHandlers, "f").indexOf(handler);
            __classPrivateFieldGet(this, _Dispatcher_afterHandlers, "f").splice(idx, 1);
        };
    }
    dispatch(commandName, payload) {
        if (__classPrivateFieldGet(this, _Dispatcher_subs, "f").has(commandName)) {
            __classPrivateFieldGet(this, _Dispatcher_subs, "f").get(commandName).forEach((handler) => {
                handler(payload);
            });
        }
        else {
            console.warn(`No handlers for command: ${commandName}`);
        }
        __classPrivateFieldGet(this, _Dispatcher_afterHandlers, "f").forEach((handler) => handler());
    }
}
_Dispatcher_subs = new WeakMap(), _Dispatcher_afterHandlers = new WeakMap();

function createApp({ state, view, reducers }) {
    let parentEl = null;
    let vdom = null;
    let isMounted = false;
    const dispatcher = new Dispatcher();
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)];
    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload);
    }
    for (const actionName in reducers) {
        const reducer = reducers[actionName];
        if (Array.isArray(reducer)) {
            reducer.forEach(action => {
                const subs = dispatcher.subscribe(actionName, (payload) => {
                    state = action(state, payload);
                    subscriptions.push(subs);
                });
            });
        }
        else {
            const subs = dispatcher.subscribe(actionName, (payload) => {
                state = reducer(state, payload);
            });
            subscriptions.push(subs);
        }
    }
    function renderApp() {
        const newVdom = view(state, emit);
        vdom = patchDOM(vdom, newVdom, parentEl);
    }
    return {
        mount(_parentEl) {
            if (isMounted) {
                throw new Error('The application is already mounted');
            }
            parentEl = _parentEl;
            vdom = view(state, emit);
            mountDOM(vdom, parentEl, null);
            isMounted = true;
        },
        unmount() {
            destroyDOM(vdom);
            vdom = null;
            subscriptions.forEach((unsubscribe) => { unsubscribe(); });
            isMounted = false;
        }
    };
}

export { createApp, defineComponent, j, jFragment, jString };
