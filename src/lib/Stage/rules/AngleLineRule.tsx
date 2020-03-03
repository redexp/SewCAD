import React from 'react';
import F, {Segment, Vector} from "@flatten-js/core";
import K from 'react-konva';
import Rule from "./Rule";
import Point from "../types/Point";
import deg2rad from "lib/deg2rad";
import rad2deg from "lib/rad2deg";
import _ from "lib/y";

export default class AngleLineRule implements Rule {
    deps: Point[];
    line1: Point[];
    line2: Point[];
    angle: number;
    radian: number;
    center: F.Point|null = null;

    constructor(params: AngleLineRuleParams) {
        Object.assign(this, params);

        this.deps = [...this.line2];
        this.radian = deg2rad(this.angle);
    }

    isValid() {
        var v1 = new Vector(this.line1[0], this.line1[1]).normalize();
        var v2 = new Vector(this.line2[0], this.line2[1]).normalize();
        var a = rad2deg(v1.angleTo(v2));

        if (a > 180) {
            a = 360 - a;
        }

        return a === Math.abs(this.angle);
    }

    getPointsShapes() {
        var line1 = new F.Line(this.line1[0], this.line1[1]);
        var line2 = new F.Line(this.line2[0], this.line2[1]);
        var points = line1.intersect(line2);
        var center = points.length > 0 ? points[0] : this.line1[1];
        this.center = center;
        let v = new Vector(center, this.line1[0]);
        v = v.normalize().multiply(1000);
        var segment = new Segment(center, this.line1[0].translate(v));
        segment = segment.rotate(-this.radian, center);

        return [
            {
                point: this.line2[0],
                shape: segment,
            },
            {
                point: this.line2[1],
                shape: segment,
            },
        ];
    }

    draw(key?: string|number) {
        var center = this.center!;
        var v1 = new Vector(center, this.line1[0]);
        var v2 = new Vector(1, 0);
        var a = rad2deg(v1.angleTo(v2));

        return (
            <K.Arc
                key={key}
                angle={Math.abs(this.angle)}
                rotation={a}
                x={center.x}
                y={_(center.y)}
                innerRadius={20}
                outerRadius={20}
                stroke="grey"
                strokeWidth={1}
                dash={[3]}
            />
        );
    }
}

export interface AngleLineRuleParams {
    line1: Point[],
    line2: Point[],
    angle: number,
}