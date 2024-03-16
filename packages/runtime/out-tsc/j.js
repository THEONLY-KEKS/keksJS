import { withoutNulls } from './utils/arrays';
export var DOM_TYPES;
(function (DOM_TYPES) {
    DOM_TYPES["TEXT"] = "text";
    DOM_TYPES["ELEMENT"] = "element";
    DOM_TYPES["FRAGMENT"] = "fragment";
})(DOM_TYPES || (DOM_TYPES = {}));
var virt = {
    type: DOM_TYPES.ELEMENT
};
export function j(tag, props = {}, children = []) {
    const entity = {
        tag: tag,
        props: props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    };
    return entity;
}
export function jString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str
    };
}
export function jFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes))
    };
}
export function extractChildren(vdom) {
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
const vdom = j('form', { class: 'login-form', action: 'login' }, [
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
// function lipsum(amount: number): VirtualEntity {
//     var children: VirtualEntity[] = []
//     var mockValue: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
//     for(let i = 0; i < amount; i++) {
//         children.push(jString(mockValue))
//     }
//     return jFragment(children);
// }
// function TodosList(state: any): VirtualEntity {
//     return j('ul', {}, state.todos.map(
//         (todo: string, i: number) => TodoItem(todo, i, state.editingIdxs)
//     ))
// }
// function TodoItem(todo: string, idxInList: number, editingIdxs: number[]): VirtualEntity {
//     const isEditing = editingIdxs.includes(idxInList);
//     return j(
//         'li', {}, [
//             isEditing ? TodoInEditMode(todo, idxInList): TodoInReadMode(todo, idxInList)
//         ]
//     )
// }
