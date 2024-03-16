import { VirtualEntity } from '../j';

export interface ObjectState {
    [key: string]: any,
    added: string[],
    removed: string[],
    updated: string[]
}

export function objectsDiff(oldObj: any, newObj: any): ObjectState {
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);

    return {
        added: newKeys.filter((key) => {
            if(!(key in oldObj)) {
                return key;
            }
        }),
        removed: oldKeys.filter((key) => {
            if(!(key in oldObj)) {
                return key;
            }
        }),
        updated: newKeys.filter((key) => {
            if(key in oldObj && oldObj[key] !== newObj[key]) {
                return key
            }
        })
    }
}

export function hasOwnProperty(obj: any, prop: any) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}