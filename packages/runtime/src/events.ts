export type EventListeners = Record<string, EventListener>;

export function addEventListener(eventName: string, handler: EventListener, el: HTMLElement, hostComponent: any = null) {

   function boundHandler() {
    hostComponent ? handler.apply(hostComponent, arguments as any): (handler as (...args: any[]) => void)(...arguments)
   }

    el.addEventListener(eventName, boundHandler);
    return boundHandler;
}   

export function addEventListeners(listeners: EventListeners = {}, el: HTMLElement, hostComponent = null): EventListeners{
    const addedListeners: EventListeners = {}

    Object.entries(listeners).forEach(([eventName, handler]) => {
        const listener = addEventListener(eventName, handler, el, hostComponent);
        addedListeners[eventName] = listener;
    })
    return addedListeners;
}

export function removeEventListeners(listeners: EventListeners = {}, el: HTMLElement | Text): void{

    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler);
    })
}

