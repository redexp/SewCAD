import F, {Segment, Vector} from "@flatten-js/core";
import {Stage} from '../index';
import Rule from "./Rule";
import Point from "../types/Point";
import deg2rad from "lib/deg2rad";
import rad2deg from "lib/rad2deg";

export default class AngleRule implements Rule {
    type: string = 'angle';
    stage: Stage;
    deps: Point[];
    line1: Point[];
    line2: Point[];
    angle: number;
    radian: number;
    center: Center|null = null;
    radius: number = 20;

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

    getCenter(): F.Point {
        if (!this.center || !this.center.validate(this)) {
            this.center = new Center(this);
        }

        return this.center;
    }

    getPointsShapes() {
        var center = this.getCenter();
        let v = new Vector(center, this.line1[0]);
        v = v.normalize().multiply(Number.MAX_SAFE_INTEGER);
        var segment = new Segment(center, this.line1[0].translate(v));
        segment = segment.rotate(-this.radian, center);

        return [
            {
                point: this.line2[1],
                shape: segment,
            },
        ];
    }

    getDrawShapes() {
        var center = this.getCenter();
        var v1 = new Vector(1, 0);
        var v2 = new Vector(center, this.line1[0]);
        var v3 = new Vector(center, this.line2[1]);
        var a1 = v1.angleTo(v2);
        var a2 = v1.angleTo(v3);

        if (this.angle < 0) {
            let x = a1;
            a1 = a2;
            a2 = x;
        }

        var arc = new F.Arc(center, this.radius, a1, a2);

        return [arc];
    }

    setAngle(angle: number) {
        this.angle = angle;
        this.radian = deg2rad(angle);
    }
}

export interface AngleLineRuleParams {
    line1: Point[],
    line2: Point[],
    angle: number,
    stage?: Stage,
}

class Center extends F.Point {
    p1: F.Point;
    p2: F.Point;
    p3: F.Point;
    p4: F.Point;

    constructor(params: CenterParams) {
        var {line1, line2} = params;
        var l1 = new F.Line(line1[0], line1[1]);
        var l2 = new F.Line(line2[0], line2[1]);
        var points = l1.intersect(l2);
        var center = points.length > 0 ? points[0] : line1[1];

        super(center.x, center.y);

        this.p1 = line1[0].clone();
        this.p2 = line1[1].clone();
        this.p3 = line2[0].clone();
        this.p4 = line2[1].clone();
    }

    validate(params: CenterParams) {
        var {line1, line2} = params;

        return (
            this.p1.equalTo(line1[0]) &&
            this.p2.equalTo(line1[1]) &&
            this.p3.equalTo(line2[0]) &&
            this.p4.equalTo(line2[1])
        );
    }
}

interface CenterParams {
    line1: F.Point[];
    line2: F.Point[];
}