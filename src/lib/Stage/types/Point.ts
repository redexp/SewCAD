import F from "@flatten-js/core";
import ID from './ID';

export default class Point extends F.Point {
    id: string|number|undefined;
    valid: boolean = false;
}

export interface PointParams {
    id?: ID,
    x: number,
    y: number,
}