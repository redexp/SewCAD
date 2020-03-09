import F from '@flatten-js/core';
import SimplePoint from 'types/Point';
import isNum from 'lodash/isNumber';
import Point, {PointParams} from './types/Point';
import ID from './types/ID';
import Shape from './types/Shape';
import Rule from './rules/Rule';
import AngleRule, {AngleLineRuleParams} from './rules/AngleRule';
import DistanceRule, {DistanceRuleParams} from './rules/DistanceRule';
import Draw from './draws/Draw';
import LineDraw from './draws/Line';

export default function stage(start: Point|SimplePoint) {
	return new Stage(start);
}

export class Stage {
    points: Point[] = [];
    draws: Draw[] = [];
    rules: Rule[] = [];
    pointer: Point;
    fixed = true;

    constructor(start: Point|SimplePoint) {
        this.points.push(start instanceof Point ? start : new Point(start.x, start.y));
        this.pointer = this.points[0];
    }

    addPoint(x: number, y: number, id?: ID) {
        var p = new Point(x, y);
        p.id = id;
        this.points.push(p);
        this.pointer = p;
        return p;
    }

    addDraw(draw: Draw) {
        this.draws.push(draw);
        return this;
    }

    getLast() {
        return this.points[this.points.length - 1];
    }

    getPrev(p: Point) {
        return this.points[this.points.indexOf(p) - 1];
    }

    getById(id: ID) {
        return this.points.find(p => p.id === id);
    }

    point(params: PointParams) {
        var {id, x, y} = params;
        this.addPoint(x, y, id);
        return this;
    }

    line(params: LineParams) {
        var {id, x, y, a, d} = params;
        var prev = this.pointer;
        var valid = isNum(x) && isNum(y);
        x = x || 0;
        y = y || 0;
        var p = this.addPoint(x, y, id);
        p.valid = valid;

        this.addDraw(new LineDraw(prev, p));

        if (isNum(a)) {
            let p1 = this.getPrev(prev);

            this.angleRule({
                line1: [p1, prev],
                line2: [prev, p],
                angle: a,
                stage: this,
            });
        }

        if (isNum(d)) {
            this.distanceRule({
                from: prev,
                to: p,
                value: d,
                stage: this,
            });
        }

        return this;
    }

    prev() {
        this.pointer = this.getPrev(this.pointer);

        return this;
    }

    toLines(): LineDraw[] {
        if (!this.fixed) {
            this.fix();
        }

        var lines: LineDraw[] = [];
        this.draws.forEach((draw) => {
            if (draw instanceof LineDraw) {
                lines.push(draw);
            }
        });

        return lines;
    }

    angleRule(params: AngleLineRuleParams) {
        params.stage = this;

        var rule = new AngleRule(params);

        this.rules.push(rule);

        this.fixed = false;

        return rule;
    }

    distanceRule(params: DistanceRuleParams) {
        params.stage = this;

        this.rules.push(new DistanceRule(params));
        this.fixed = false;
    }

    isValid() {
        return this.rules.every(rule => rule.isValid());
    }

    getPointsShapes() {
        var list: Array<{point: Point, shape: Shape}> = [];

        this.rules.forEach((r) => {
            list = list.concat(r.getPointsShapes());
        });

        return list;
    }

    fix() {
        this.points.forEach(p => {
            p.valid = false;

            var shapes: Shape[] = [];
            var intersects: Array<F.Point[]> = [];
            var closest: F.Point|null = null;

            this.rules.forEach(rule => {
                if (!rule.deps.includes(p)) return;

                rule.getPointsShapes().forEach(({point, shape}) => {
                    if (point === p) {
                        shapes.push(shape);
                    }
                });
            });

            if (shapes.length === 0) {
                return;
            }

            if (shapes.length === 1) {
                closest = shapes[0].distanceTo(p)[1].start;
            }
            else {
                shapes.forEach((s1, i) => {
                    shapes.forEach((s2, j) => {
                        if (j <= i) return;

                        intersects.push(s1.intersect(s2));
                    });
                });

                var res = intersects[0].filter(p => {
                    return intersects.every(list => {
                        return list.some(p2 => p2.x === p.x && p2.y === p.y);
                    });
                });

                var d = Number.MAX_VALUE;

                res.some(point => {
                    var dist = point.distanceTo(p)[0];
                    if (dist < d) {
                        d = dist;
                        closest = point;
                        if (d === 0) return true;
                    }
                });
            }

            if (closest) {
                p.x = closest.x;
                p.y = closest.y;
            }
        });

        this.fixed = true;
    }

    setPointPos(params: PointPos) {
        var {id, point, x, y} = params;

        if (!point && id) {
            point = this.getById(id);
        }

        if (!point) return;

        point.x = x;
        point.y = y;

        this.fix();
    }
}

interface LineParams {
    id?: ID,
    x?: number,
    y?: number,
    a?: number,
    d?: number,
}

interface PointPos {
    id?: ID,
    point?: Point,
    x: number,
    y: number,
}
