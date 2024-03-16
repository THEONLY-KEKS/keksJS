import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { patchDOM } from "./patch-dom";
import { VirtualEntity } from './j';
import { DOM_TYPES, extractChildren } from "./j";
import { hasOwnProperty } from "./utils/objects";


export function defineComponent({render, state, ...methods}: {render: Function, state: any, [key: string]: any}){
    class Component {
        #isMounted: boolean = false;
        #vdom: VirtualEntity | null = null;
        #hostEl: HTMLElement | null = null;
        props: any = null;
        state: any = null;

        constructor(props: any = {}){
            this.props = props;
            this.state = state ? state(props): {};
        }

        get elements(): (HTMLElement | Text)[]{
            if(this.#vdom == null){
                return []
            }

            if(this.#vdom.type === DOM_TYPES.FRAGMENT){
                return extractChildren(this.#vdom!).map((child) => child.el!);
            }

            return [this.#vdom.el!]
        }

        get firstElement(): Element {
            return this.elements[0] as Element
        }

        get offset(): number{
            if(this.#vdom!.type === DOM_TYPES.FRAGMENT){
                return Array.from(this.#hostEl?.children!).indexOf(this.firstElement);
            }
            return 0;
        }

        updateState(state: any) {
            this.state = {...this.state, ...state}
            this.#patch()
        }

        render(){
            return render.call(this);
        }

        mount(hostEl: HTMLElement, index: number | null = null){
            if(this.#isMounted){
                throw new Error('Component is already mounted');
            }

            this.#vdom = this.render();
            mountDOM(this.#vdom!, hostEl, index, this);
            this.#hostEl = hostEl;
            this.#isMounted = true;
        }

        unmount(){
            if(!this.#isMounted){
                throw new Error('Component is not mounted');
            }

            destroyDOM(this.#vdom!);

            this.#vdom = null;
            this.#hostEl = null;
            this.#isMounted = false;
            this.props = null;
            this.state = null;
        }

        #patch(){
            if(!this.#isMounted){
                throw new Error('Component is not mounted')
            }

            const vdom = this.render();
            patchDOM(this.#vdom!, vdom, this.#hostEl!, this);
            this.#vdom = {...vdom};
        }
    }

    for(const methodName in methods){
        if(hasOwnProperty(Component, methodName)){
            throw new Error(`Method ${methodName}() already exists in the component. Can't override existing methods`)
        }

        (Component.prototype as any)[methodName] = methods[methodName];
    }

    return Component;
}