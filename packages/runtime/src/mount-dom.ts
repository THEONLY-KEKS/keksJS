import { DOM_TYPES, VirtualEntity } from './j';
import { setAttributes } from './attributes'
import { addEventListeners } from './events'
import { filterOutWhitespaceNodes } from './utils/arrays';

export function mountDOM(vdom: VirtualEntity, parentEl: HTMLElement, index: number | null, hostComponent: any = null) {
    switch(vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index)
            break
        }
        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index, hostComponent)
            break
        }
        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index, hostComponent)
            break
        }
        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`);
        }
    }
}

function createTextNode(vdom: VirtualEntity, parentEl: HTMLElement, index: number | null) {
    const { value } = vdom;
    const textNode: Text = document.createTextNode(value!)
    vdom.el = textNode;
    insert(textNode, parentEl, index);
}

function createFragmentNodes(vdom: VirtualEntity, parentEl: HTMLElement, index: number | null, hostComponent: any) {
    const { children } = vdom;
    vdom.el = parentEl;
    children!.forEach((child, i) => mountDOM(child, parentEl, index ? index + i: null, hostComponent));
}

function createElementNode(vdom: VirtualEntity, parentEl: HTMLElement, index: number | null, hostComponent: any){
    const { tag, props, children} = vdom;

    const element = document.createElement(tag!);
    addProps(element, props, vdom, hostComponent);
    vdom.el = element;

    children!.forEach((child, i) => mountDOM(child, element, null, hostComponent));
    insert(element, parentEl, index);
}

function addProps(el: HTMLElement, props: any, vdom: VirtualEntity, hostComponent: any) {
    const { on: events, ...attrs} = props;

    vdom.listeners = addEventListeners(events, el, hostComponent)
    setAttributes(el, attrs);
}

function insert(el: HTMLElement  | Text, parentEl: HTMLElement, index: number | null): void {
    if(index == null) {
        parentEl.append(el);
        return
    }

    if(index < 0) {
        throw new Error(`Index must be a positive integer, got ${index}`)
    }

    const children = filterOutWhitespaceNodes(parentEl);

    if(index >= children.length) {
        parentEl.append(el);
    } else {
        parentEl.insertBefore(el, children[index]);
    }
}