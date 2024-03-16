import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { areNodesEqual } from "./nodes-equal";
import { DOM_TYPES, VirtualEntity, extractChildren } from './j';
import { objectsDiff } from "./utils/objects";
import { removeAttribute, setAttribute, removeStyle, setStyle } from './attributes';
import { ARRAY_DIFF_OP, Operation, arraysDiff, arraysDiffSequence, filterOutWhitespaceNodes } from './utils/arrays';
import { isNotBlankOrEmptyString } from "./utils/string";
import { EventListeners, addEventListener } from "./events";

export function patchDOM(oldVdom: VirtualEntity, newVdom: VirtualEntity, parentEl: HTMLElement, hostComponent: any = null): VirtualEntity {
    if(!areNodesEqual(oldVdom, newVdom)){
        const index = Array.from(filterOutWhitespaceNodes(parentEl)).indexOf(oldVdom.el!);
        destroyDOM(oldVdom);
        mountDOM(newVdom, parentEl, index, hostComponent);
        return newVdom;
    }

    newVdom.el = oldVdom.el;

    switch(newVdom.type) {
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

function patchText(oldVdom: VirtualEntity, newVdom: VirtualEntity) {
    const el = oldVdom.el;
    const { value: oldText } = oldVdom;
    const { value: newText } = newVdom;
    
    if(oldText !== newText) {
        el!.nodeValue = newText!;
    }
}

function patchElement(oldVdom: VirtualEntity, newVdom: VirtualEntity, hostComponent: any) {
    const el = oldVdom.el as HTMLElement;

    const { class: oldClass, style: oldStyle, on: oldEvents, ...oldAttrs } = oldVdom.props!
    const { class: newClass, style: newStyle, on: newEvents, ...newAttrs } = newVdom.props!
    
    const { listeners: oldListeners } = oldVdom;

    patchAttrs(el, oldAttrs, newAttrs);
    patchClasses(el, oldClass as string | string[], newClass as string | string[]);
    newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents, hostComponent);
    patchStyles(el, oldStyle, newStyle);
}


function patchAttrs(el: HTMLElement, oldAttrs: any = {}, newAttrs: any = {}) {
    const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);
    for(const attr of removed) {
        removeAttribute(el, attr);
    }

    for(const attr of added.concat(updated)) {
        setAttribute(el, attr, newAttrs[attr]);
    }
}

function patchClasses(el: HTMLElement, oldClass: string | string[], newClass: string | string[]) {
    const oldClasses = toClassList(oldClass);
    const newClasses = toClassList(newClass);

    const { added, removed} = arraysDiff(oldClasses, newClasses);
    if(removed.length > 0) {
        el.classList.remove(...removed);
    }
    if(added.length > 0){
        el.classList.add(...added);
    }
}

function toClassList(classes: string | string[] = '') {
    return Array.isArray(classes) ? classes.filter(isNotBlankOrEmptyString) : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
}

function patchStyles(el: HTMLElement, oldStyle: any = {}, newStyle: any = {}) {
    const { added, removed, updated } = objectsDiff(oldStyle, newStyle);

    for(const style of removed) {
        removeStyle(el, style)
    }

    for(const style of added.concat(updated)) {
        setStyle(el, style, newStyle[style]);
    }
}

function patchEvents(el: HTMLElement, oldListeners: any = {}, oldEvents: any = {}, newEvents: any = {}, hostComponent: any): EventListeners{
    const { removed, added, updated} = objectsDiff(oldEvents, newEvents);

    for(const eventName of removed.concat(updated)) {
        el.removeEventListener(eventName, oldListeners[eventName]);
    }

    const addedListeners: EventListeners = {};

    for(const eventName of added.concat(updated)) {
        const listener = addEventListener(eventName, newEvents[eventName], el, hostComponent);
        addedListeners[eventName] = listener;
    }

    return addedListeners;
}

function patchChildren(oldVdom: VirtualEntity, newVdom: VirtualEntity, hostComponent: any) {
    const oldChildren = extractChildren(oldVdom);
    const newChildren = extractChildren(newVdom);

    const parentEl = oldVdom.el as HTMLElement;

    const diffSeq: Operation[] = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);

    for(const operation of diffSeq) {
        const { originalIndex, index, from, item} = operation;
        const offset: number = hostComponent?.offset ?? 0;
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
                const oldChild = oldChildren[originalIndex!];
                const newChild = newChildren[index];
                const el = oldChild.el;
                const elAtTargetIndex = filterOutWhitespaceNodes(parentEl)[index + offset];

                parentEl.insertBefore(el!, elAtTargetIndex);
                patchDOM(oldChild, newChild, parentEl, hostComponent);
                break;
            }
            case ARRAY_DIFF_OP.NOOP: {
                patchDOM(oldChildren[originalIndex!], newChildren[index], parentEl, hostComponent);
                break;
            }
        }
    }
}