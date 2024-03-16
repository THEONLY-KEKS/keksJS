var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
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
import { patchDOM } from "./patch-dom";
import { DOM_TYPES, extractChildren } from "./j";
import { hasOwnProperty } from "./utils/objects";
export function defineComponent(_a) {
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
            if (__classPrivateFieldGet(this, _Component_vdom, "f") == null) {
                return [];
            }
            if (__classPrivateFieldGet(this, _Component_vdom, "f").type === DOM_TYPES.FRAGMENT) {
                return extractChildren(__classPrivateFieldGet(this, _Component_vdom, "f")).map((child) => child.el);
            }
            return [__classPrivateFieldGet(this, _Component_vdom, "f").el];
        }
        get firstElement() {
            return this.elements[0];
        }
        get offset() {
            var _a;
            if (__classPrivateFieldGet(this, _Component_vdom, "f").type === DOM_TYPES.FRAGMENT) {
                return Array.from((_a = __classPrivateFieldGet(this, _Component_hostEl, "f")) === null || _a === void 0 ? void 0 : _a.children).indexOf(this.firstElement);
            }
            return 0;
        }
        updateState(state) {
            this.state = Object.assign(Object.assign({}, this.state), state);
            __classPrivateFieldGet(this, _Component_instances, "m", _Component_patch).call(this);
        }
        render() {
            return render.call(this);
        }
        mount(hostEl, index = null) {
            if (__classPrivateFieldGet(this, _Component_isMounted, "f")) {
                throw new Error('Component is already mounted');
            }
            __classPrivateFieldSet(this, _Component_vdom, this.render(), "f");
            mountDOM(__classPrivateFieldGet(this, _Component_vdom, "f"), hostEl, index, this);
            __classPrivateFieldSet(this, _Component_hostEl, hostEl, "f");
            __classPrivateFieldSet(this, _Component_isMounted, true, "f");
        }
        unmount() {
            if (!__classPrivateFieldGet(this, _Component_isMounted, "f")) {
                throw new Error('Component is not mounted');
            }
            destroyDOM(__classPrivateFieldGet(this, _Component_vdom, "f"));
            __classPrivateFieldSet(this, _Component_vdom, null, "f");
            __classPrivateFieldSet(this, _Component_hostEl, null, "f");
            __classPrivateFieldSet(this, _Component_isMounted, false, "f");
            this.props = null;
            this.state = null;
        }
    }
    _Component_isMounted = new WeakMap(), _Component_vdom = new WeakMap(), _Component_hostEl = new WeakMap(), _Component_instances = new WeakSet(), _Component_patch = function _Component_patch() {
        if (!__classPrivateFieldGet(this, _Component_isMounted, "f")) {
            throw new Error('Component is not mounted');
        }
        const vdom = this.render();
        patchDOM(__classPrivateFieldGet(this, _Component_vdom, "f"), vdom, __classPrivateFieldGet(this, _Component_hostEl, "f"), this);
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
