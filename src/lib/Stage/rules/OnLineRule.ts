import F from "@flatten-js/core";
import {Stage} from "../index";
import Rule from "./Rule";
import Point from "../types/Point";

export default class OnLineRule implements Rule {
    type = 'on_line';
    stage: Stage;
    deps: Point[];
    point: Point;
    line: Point[];

    constructor(params: OnLineRuleParams) {
        Object.assign(this, params);

        this.deps = [params.point];
    }

    isValid() {
        return true;
    }

    getPointsShapes() {
        return [
            {
                point: this.point,
                shape: new F.Segment(this.line[0], this.line[1]),
            }
        ];
    }

    getDrawShapes() {
        return [];
    }
}

export interface OnLineRuleParams {
    stage?: Stage,
    point: Point,
    line: Point[],
}