import F from '@flatten-js/core';
import Point from '../types/Point';

export default class Segment extends F.Segment {
    ps: Point;
    pe: Point;

    constructor(start: Point, end: Point) {
        super();

        this.ps = start;
        this.pe = end;
    }
}