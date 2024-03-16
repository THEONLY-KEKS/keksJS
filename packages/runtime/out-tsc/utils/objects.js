export function objectsDiff(oldObj, newObj) {
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);
    return {
        added: newKeys.filter((key) => {
            if (!(key in oldObj)) {
                return key;
            }
        }),
        removed: oldKeys.filter((key) => {
            if (!(key in oldObj)) {
                return key;
            }
        }),
        updated: newKeys.filter((key) => {
            if (key in oldObj && oldObj[key] !== newObj[key]) {
                return key;
            }
        })
    };
}
export function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
