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
export function setAttributes(el, attrs = {}) {
    const { class: className, style } = attrs, otherAttrs = __rest(attrs, ["class", "style"]);
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
export function setStyle(el, styleName, styleValue) {
    //el.style.setProperty(styleName, styleValue);
    el.style[styleName] = styleValue;
}
export function removeStyle(el, styleName) {
    el.style[styleName] = null;
}
export function setAttribute(el, name, value) {
    if (value == null) {
        removeAttribute(el, name);
    }
    else {
        el[name] = value;
    }
}
export function removeAttribute(el, name) {
    el[name] = null;
    el.removeAttribute(name);
}
