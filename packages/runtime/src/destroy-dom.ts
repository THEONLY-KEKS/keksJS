import { removeEventListeners } from './events';
import { DOM_TYPES, VirtualEntity } from './j';

export function destroyDOM(vdom: VirtualEntity) {
    const { type } = vdom;

    switch(type){
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

function removeTextNode(vdom: VirtualEntity) {
    const { el } = vdom;
    el!.remove()
}

function removeElementNode(vdom: VirtualEntity) {
    const { el, children, listeners } = vdom;
    el!.remove();
    children!.forEach(child => {
        destroyDOM(child);
    });

    if(listeners){
    removeEventListeners(listeners, el!);
    delete vdom.listeners
    }
}

function removeFragmentNodes(vdom: VirtualEntity) {
    const { children } = vdom;
    children!.forEach(destroyDOM);
}