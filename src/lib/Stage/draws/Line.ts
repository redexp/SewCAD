import Point from "../types/Point";
import Draw from './Draw';

export default class Line implements Draw {
    start: Point;
    end: Point;

    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }

    draw(): any {

    }
}