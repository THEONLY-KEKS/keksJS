export type Attributes = Record<string, string>;

export function setAttributes(el: HTMLElement, attrs: Attributes = {}){
    const { class: className, style, ...otherAttrs} = attrs;
    if(className) {
        setClass(el, className);
    }

    if(style) {
        Object.entries(style).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        })
    }

    for(const [name, value] of Object.entries(otherAttrs)){
        setAttribute(el, name, value);
    }
} 

function setClass(el: HTMLElement, className: string | string[]) {
    el.className = '';

    if(typeof className === 'string'){
        el.className = className;
    }

    if(Array.isArray(className)) {
        el.classList.add(...className);
    }
}

export function setStyle(el: HTMLElement, styleName: string, styleValue: string): void{
    //el.style.setProperty(styleName, styleValue);
    el.style[styleName as any] = styleValue;
}

export function removeStyle(el: HTMLElement, styleName: string): void{
    el.style[styleName as any] = null!;
}

export function setAttribute(el: HTMLElement|any, name: string, value: string): void {
    if(value == null){
        removeAttribute(el, name);
    } else {
        el[name] = value;
    } 
}

export function removeAttribute(el: Element|any, name: string): void {
    el[name] = null;
    el.removeAttribute(name);
}