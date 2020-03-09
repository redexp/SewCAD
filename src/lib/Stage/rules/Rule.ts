import {Stage} from '../index';
import Point from "../types/Point";
import Shape from '../types/Shape';

export default interface Rule {
    type: string;
    stage: Stage;
    deps: Point[];
    isValid(): boolean;
    getPointsShapes(): Array<{point: Point, shape: Shape}>;
    getDrawShapes(): Shape[];
}