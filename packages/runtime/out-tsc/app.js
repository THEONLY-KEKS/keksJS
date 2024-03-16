import { destroyDOM } from "./destroy-dom";
import { mountDOM } from "./mount-dom";
import { patchDOM } from "./patch-dom";
import { Dispatcher } from "./dispatcher";
export function createApp({ state, view, reducers }) {
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
