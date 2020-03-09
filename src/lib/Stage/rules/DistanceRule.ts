import F, {Circle} from "@flatten-js/core";
import {Stage} from "../index";
import Rule from "./Rule";
import Point from "../types/Point";

export default class DistanceRule implements Rule {
    type: string = 'distance';
    stage: Stage;
    deps: Point[];
    from: Point;
    to: Point;
    value: number;

    constructor(params: DistanceRuleParams) {
        Object.assign(this, params);

        this.deps = [this.to];
    }

    isValid(): boolean {
        return this.from.distanceTo(this.to)[0] === this.value;
    }

    getPointsShapes() {
        return [
            {
                point: this.to,
                shape: new Circle(this.from, this.value),
            },
        ];
    }

    getDrawShapes() {
        var {from, to} = this;
        var v1 = new F.Vector(from, to);
        var v2 = new F.Vector(to, from);
        v1 = v1.rotate90CW().normalize().multiply(20);
        v2 = v2.rotate90CCW().normalize().multiply(20);
        var fromEnd = from.translate(v1);
        var toEnd = to.translate(v2);
        v1 = v1.normalize().multiply(16);
        v2 = v2.normalize().multiply(16);
        var arrowStart = from.translate(v1);
        var arrowEnd = to.translate(v2);

        return [
            new F.Segment(from, fromEnd),
            new F.Segment(to, toEnd),
            new F.Segment(arrowStart, arrowEnd),
        ];
    }

    setValue(value: number) {
        this.value = value;
    }
}

export interface DistanceRuleParams {
    from: Point,
    to: Point,
    value: number,
    stage?: Stage,
}