import Point from "../types/Point";
import Shape from '../types/Shape';

export default interface Rule {
    deps: Point[];
    isValid(): boolean;
    getPointsShapes(): Array<{point: Point, shape: Shape}>;
    draw(key?: string|number): any;
}