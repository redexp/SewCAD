import {Point as FPoint} from "@flatten-js/core";
import ID from './ID';

export default class Point extends FPoint {
    id: string|number|undefined;
    valid: boolean = false;
}

export interface PointParams {
    id?: ID,
    x: number,
    y: number,
}