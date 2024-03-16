import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { patchDOM } from "./patch-dom";
import { VirtualEntity } from './j';
import { Dispatcher } from "./dispatcher";

type State = Record<string, any>; 
type Reducer = Record<string, Function | Function[]>; 
type View = (state: State, func: Function) => VirtualEntity;

export function createApp({state, view, reducers}: {state: State, view: View, reducers: Reducer}){
        let parentEl: HTMLElement | null = null;
        let vdom: VirtualEntity | null = null;
        let isMounted = false;

        const dispatcher: Dispatcher = new Dispatcher();
        const subscriptions: Function[] = [dispatcher.afterEveryCommand(renderApp)];

        function emit(eventName: string, payload: any) {
            dispatcher.dispatch(eventName, payload);
        }

        for(const actionName in reducers) {
            const reducer = reducers[actionName];
            if(Array.isArray(reducer)){
                reducer.forEach(action => {
                    const subs = dispatcher.subscribe(actionName, (payload: any) => {
                    state = action(state, payload)
                    subscriptions.push(subs);
                    })
                })
            } else {
            const subs = dispatcher.subscribe(actionName, (payload: any) => {
                state = reducer(state, payload);
            })
            subscriptions.push(subs);
            }
        }
 
        function renderApp() {
            const newVdom = view(state, emit)
            vdom = patchDOM(vdom!, newVdom, parentEl!);
        }

        return {
            mount(_parentEl: HTMLElement) {
                if(isMounted){
                    throw new Error('The application is already mounted');
                }
                parentEl = _parentEl
                vdom = view(state, emit);
                mountDOM(vdom, parentEl, null);
                isMounted = true;
            },

            unmount() {
                destroyDOM(vdom!);
                vdom = null;
                subscriptions.forEach((unsubscribe) => {unsubscribe()});

                isMounted = false
            }
        }
}