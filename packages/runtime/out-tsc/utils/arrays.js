var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ArrayWithOriginalIndices_array, _ArrayWithOriginalIndices_originalIndices, _ArrayWithOriginalIndices_equalsFn;
export var ARRAY_DIFF_OP;
(function (ARRAY_DIFF_OP) {
    ARRAY_DIFF_OP["ADD"] = "add";
    ARRAY_DIFF_OP["REMOVE"] = "remove";
    ARRAY_DIFF_OP["MOVE"] = "move";
    ARRAY_DIFF_OP["NOOP"] = "noop";
})(ARRAY_DIFF_OP || (ARRAY_DIFF_OP = {}));
export function withoutNulls(arr) {
    return arr.filter((item) => {
        return item != null;
    });
}
export function arraysDiff(oldArray, newArray) {
    return {
        added: newArray.filter((item) => {
            if (!oldArray.includes(item)) {
                return item;
            }
        }),
        removed: oldArray.filter((item) => {
            if (!newArray.includes(item)) {
                return item;
            }
        })
    };
}
export function filterOutWhitespaceNodes(element) {
    const childNodes = Array.from(element.childNodes);
    const nonWhitespaceNodes = [];
    for (const node of childNodes) {
        if (node.nodeType === Node.TEXT_NODE && /^\s*$/.test(node.nodeValue)) {
            // Skip whitespace text nodes
            continue;
        }
        nonWhitespaceNodes.push(node);
    }
    return nonWhitespaceNodes;
}
export function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
    const sequence = [];
    const array = new ArrayWithOriginalIndices(oldArray, equalsFn);
    for (let i = 0; i < newArray.length; i++) {
        if (array.isRemoval(i, newArray)) {
            sequence.push(array.removeItem(i));
            i--;
            continue;
        }
        if (array.isNoop(i, newArray)) {
            sequence.push(array.noopItem(i));
            continue;
        }
        const item = newArray[i];
        if (array.isAddition(item, i)) {
            sequence.push(array.addItem(item, i));
            continue;
        }
        sequence.push(array.moveItem(item, i));
    }
    sequence.push(...array.removeItemsAfter(newArray.length));
    return sequence;
}
class ArrayWithOriginalIndices {
    constructor(array, equalsFn) {
        _ArrayWithOriginalIndices_array.set(this, []);
        _ArrayWithOriginalIndices_originalIndices.set(this, []);
        _ArrayWithOriginalIndices_equalsFn.set(this, void 0);
        __classPrivateFieldSet(this, _ArrayWithOriginalIndices_array, [...array], "f");
        __classPrivateFieldSet(this, _ArrayWithOriginalIndices_originalIndices, array.map((_, i) => i), "f");
        __classPrivateFieldSet(this, _ArrayWithOriginalIndices_equalsFn, equalsFn, "f");
    }
    get length() {
        return __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f").length;
    }
    isRemoval(index, newArray) {
        if (index >= this.length) {
            return false;
        }
        ;
        const item = __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[index];
        const indexInNewArray = newArray.findIndex((newItem) => {
            return __classPrivateFieldGet(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, newItem);
        });
        return indexInNewArray === -1;
    }
    isNoop(index, newArray) {
        if (index >= this.length) {
            return false;
        }
        ;
        const item = __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[index];
        const newItem = newArray[index];
        return __classPrivateFieldGet(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, newItem);
    }
    isAddition(item, fromIndex) {
        return this.findIndexFrom(item, fromIndex) === -1;
    }
    findIndexFrom(item, fromIndex) {
        for (let i = fromIndex; i < this.length; i++) {
            if (__classPrivateFieldGet(this, _ArrayWithOriginalIndices_equalsFn, "f").call(this, item, __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[i])) {
                return i;
            }
        }
        return -1;
    }
    originalIndexAt(index) {
        return __classPrivateFieldGet(this, _ArrayWithOriginalIndices_originalIndices, "f")[index];
    }
    removeItem(index) {
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[index]
        };
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f").splice(index, 1);
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(index, 1);
        return operation;
    }
    noopItem(index) {
        return {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[index]
        };
    }
    addItem(item, index) {
        const operation = {
            op: ARRAY_DIFF_OP.ADD,
            index,
            item: item
        };
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f").splice(index, 0, item);
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(index, 0, -1);
        return operation;
    }
    moveItem(item, toIndex) {
        const fromIndex = this.findIndexFrom(item, toIndex);
        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f")[fromIndex]
        };
        const [_item] = __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f").splice(fromIndex, 1);
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_array, "f").splice(toIndex, 0, _item);
        const [originalIndex] = __classPrivateFieldGet(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(fromIndex, 1);
        __classPrivateFieldGet(this, _ArrayWithOriginalIndices_originalIndices, "f").splice(toIndex, 0, originalIndex);
        return operation;
    }
    removeItemsAfter(index) {
        const operations = [];
        while (this.length > index) {
            operations.push(this.removeItem(index));
        }
        return operations;
    }
}
_ArrayWithOriginalIndices_array = new WeakMap(), _ArrayWithOriginalIndices_originalIndices = new WeakMap(), _ArrayWithOriginalIndices_equalsFn = new WeakMap();
function applyArraysDiffSequenceAlt(oldArray, operations) {
    var copy = [...oldArray];
    for (let op of operations) {
        if (op.op == ARRAY_DIFF_OP.REMOVE) {
            copy.splice(op.index, 1);
            continue;
        }
        if (op.op == ARRAY_DIFF_OP.NOOP) {
            continue;
        }
        if (op.op == ARRAY_DIFF_OP.ADD) {
            copy.splice(op.index, 0, op.item);
            continue;
        }
        if (op.op == ARRAY_DIFF_OP.MOVE) {
            copy.splice(op.from, 1);
            copy.splice(op.index, 0, op.item);
        }
    }
    return copy;
}
function applyArraysDiffSequence(oldArray, operations) {
    return operations.reduce((array, { op, item, index, from }) => {
        switch (op) {
            case ARRAY_DIFF_OP.ADD: {
                array.splice(index, 0, item);
                break;
            }
            case ARRAY_DIFF_OP.REMOVE: {
                array.splice(index, 1);
                break;
            }
            case ARRAY_DIFF_OP.MOVE: {
                array.splice(index, 0, array.splice(from, 1)[0]);
                break;
            }
        }
        return array;
    }, oldArray);
}
