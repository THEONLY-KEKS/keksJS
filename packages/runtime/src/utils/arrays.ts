import { VirtualEntity } from "../j";

export interface ArrayState {
    [key: string]: any;
    added: any[];
    removed: any[]
}

export enum ARRAY_DIFF_OP {
    ADD = "add",
    REMOVE = "remove",
    MOVE = "move",
    NOOP = "noop"
}

export interface Operation {
    op: ARRAY_DIFF_OP;
    index: number;
    item: any;
    originalIndex?: number;
    from?: number;
}

export function withoutNulls(arr: (VirtualEntity | string)[]): (VirtualEntity | string)[] {
    return arr.filter((item) => {
        return item != null
    })
}

export function arraysDiff(oldArray: any, newArray: any): ArrayState {
    return {
        added: newArray.filter((item: any) =>{
            if(!oldArray.includes(item)){
                return item
            }
        }),
        removed: oldArray.filter((item: any) =>{
            if(!newArray.includes(item)){
                return item
            }
        })
    }
}

export function filterOutWhitespaceNodes(element: HTMLElement): Node[] {
    const childNodes = Array.from(element.childNodes);
    const nonWhitespaceNodes: Node[] = [];
  
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE && /^\s*$/.test(node.nodeValue!)) {
        // Skip whitespace text nodes
        continue;
      }
      nonWhitespaceNodes.push(node);
    }
  
    return nonWhitespaceNodes;
  }

export function arraysDiffSequence(oldArray: any[], newArray: any[], equalsFn: Function = (a: any,b: any) => a === b): Operation[]{
    const sequence: Operation[] = [];
    const array = new ArrayWithOriginalIndices(oldArray, equalsFn);

    for(let i = 0; i < newArray.length; i++) {
        if(array.isRemoval(i, newArray)){
            sequence.push(array.removeItem(i));
            i--;
            continue;
        }

        if(array.isNoop(i, newArray)) {
            sequence.push(array.noopItem(i));
            continue
        }

        const item = newArray[i];
        if(array.isAddition(item, i)){
            sequence.push(array.addItem(item, i));
            continue;
        }

        sequence.push(array.moveItem(item, i));
    }
    sequence.push(...array.removeItemsAfter(newArray.length));
    return sequence;
}

class ArrayWithOriginalIndices {
    #array: any[] = [];
    #originalIndices: number[] = [];
    #equalsFn: Function;

    constructor(array: any[], equalsFn: Function) {
        this.#array = [...array];
        this.#originalIndices = array.map((_, i) => i);
        this.#equalsFn = equalsFn;
    }

    get length(): number {
        return this.#array.length;
    }

    isRemoval(index: number, newArray: any[]): boolean {
        if(index >= this.length) {
            return false;
        };
        const item = this.#array[index];
        const indexInNewArray = newArray.findIndex((newItem) => {
            return this.#equalsFn(item, newItem);
        })

        return indexInNewArray === -1
    }

    isNoop(index: number, newArray: any[]): boolean {
        if(index >= this.length) {
            return false;
        };
        const item = this.#array[index];
        const newItem = newArray[index];

        return this.#equalsFn(item, newItem);
    }

    isAddition(item: any, fromIndex: number): boolean {
        return this.findIndexFrom(item, fromIndex) === -1
    }

    findIndexFrom(item: any, fromIndex: number): number {
        for(let i = fromIndex; i < this.length; i++) {
            if(this.#equalsFn(item, this.#array[i])){
                return i;
            }
        }
        return -1;
    }

    originalIndexAt(index: number) {
        return this.#originalIndices[index];
    }

    removeItem(index: number): Operation {
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: this.#array[index]
        }

        this.#array.splice(index, 1);
        this.#originalIndices.splice(index, 1);

        return operation;
    }

    noopItem(index: number): Operation {
        return {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: this.#array[index]
        }
    }

    addItem(item: any, index: number): Operation {
        const operation = {
            op: ARRAY_DIFF_OP.ADD,
            index,
            item: item
        }

        this.#array.splice(index, 0, item);
        this.#originalIndices.splice(index, 0, -1);

        return operation;
    }

    moveItem(item: any, toIndex: number): Operation {
        const fromIndex = this.findIndexFrom(item, toIndex);

        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: this.#array[fromIndex]
        }

        const [_item] = this.#array.splice(fromIndex, 1);
        this.#array.splice(toIndex, 0, _item);

        const [originalIndex] = this.#originalIndices.splice(fromIndex, 1);
        this.#originalIndices.splice(toIndex, 0, originalIndex);

        return operation;
    }

    removeItemsAfter(index: number): Operation[] {
        const operations = [];

        while(this.length > index) {
            operations.push(this.removeItem(index));
        }

        return operations;
    }
}

function applyArraysDiffSequenceAlt(oldArray: any[], operations: Operation[]): any[] {
    var copy: any[] = [...oldArray];
    for(let op of operations) {
        if(op.op == ARRAY_DIFF_OP.REMOVE){
            copy.splice(op.index, 1);
            continue;
        }
        if(op.op == ARRAY_DIFF_OP.NOOP){
            continue;
        }
        if(op.op == ARRAY_DIFF_OP.ADD){
            copy.splice(op.index, 0, op.item)
            continue;
        }
        if(op.op == ARRAY_DIFF_OP.MOVE){
            copy.splice(op.from!, 1);
            copy.splice(op.index, 0, op.item);
        }
    }

    return copy;
}

function applyArraysDiffSequence(oldArray: any[], operations: Operation[]): any[] {
    return operations.reduce((array, { op, item, index, from}) => {
        switch(op) {
            case ARRAY_DIFF_OP.ADD: {
                array.splice(index, 0, item);
                break;
            }
            case ARRAY_DIFF_OP.REMOVE: {
                array.splice(index, 1);
                break;
            }
            case ARRAY_DIFF_OP.MOVE: {
                array.splice(index, 0, array.splice(from!, 1)[0]);
                break;
            }
        }
        return array;
    }, oldArray)
}

