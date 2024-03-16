import { DOM_TYPES, VirtualEntity } from './j';

export function areNodesEqual(nodeOne: VirtualEntity, nodeTwo: VirtualEntity): boolean {
    if(nodeOne.type !== nodeTwo.type){
        return false;
    }

    if(nodeOne.type === DOM_TYPES.ELEMENT) {
        const { tag: tagOne } = nodeOne;
        const { tag: tagTwo } = nodeTwo;
        return tagOne === tagTwo;
    }

    return true;
}