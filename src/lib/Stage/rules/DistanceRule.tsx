import React, {Fragment} from 'react';
import F, {Circle} from "@flatten-js/core";
import K from 'react-konva';
import _ from 'lib/y';
import Rule from "./Rule";
import Point from "../types/Point";

export default class DistanceRule implements Rule {
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

    draw(key?: string|number) {
        var v1 = new F.Vector(this.from, this.to);
        var v2 = new F.Vector(this.to, this.from);
        v1 = v1.rotate90CW().normalize().multiply(20);
        v2 = v2.rotate90CCW().normalize().multiply(20);
        var from = this.from.translate(v1);
        var to = this.to.translate(v2);
        v1 = v1.normalize().multiply(16);
        v2 = v2.normalize().multiply(16);
        var start = this.from.translate(v1);
        var end = this.to.translate(v2);

        return <Fragment key={key}>
            <K.Line
                points={[this.from.x, _(this.from.y), from.x, _(from.y)]}
                stroke="grey"
                strokeWidth={1}
            />
            <K.Line
                points={[this.to.x, _(this.to.y), to.x, _(to.y)]}
                stroke="grey"
                strokeWidth={1}
            />
            <K.Arrow
                points={[start.x, _(start.y), end.x, _(end.y)]}
                stroke="grey"
                strokeWidth={1}
                tension={100}
                pointerAtBeginning
            />
        </Fragment>;
    }
}

export interface DistanceRuleParams {
    from: Point,
    to: Point,
    value: number,
}