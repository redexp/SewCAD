import F from '@flatten-js/core';
import SimplePoint from 'types/Point';
import isNum from 'lodash/isNumber';
import Point, {PointParams} from './types/Point';
import ID from './types/ID';
import Shape from './types/Shape';
import Rule from './rules/Rule';
import AngleRule, {AngleLineRuleParams} from './rules/AngleRule';
import DistanceRule, {DistanceRuleParams} from './rules/DistanceRule';
import OnLineRule, {OnLineRuleParams} from './rules/OnLineRule';
import * as D from './draws';

export default function stage(start: Point|SimplePoint) {
	return new Stage(start);
}

export class Stage {
    points: Point[] = [];
    draws: D.Draw[] = [];
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

    addEqualPoint(p: SimplePoint): Point {
        var equal = this.getEqualPoint(p) as Point;

        if (equal) return equal;

        return this.addPoint(p.x, p.y);
    }

    addDraw(draw: D.Draw) {
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
        x = x || 0;
        y = y || 0;
        var p = this.addPoint(x, y, id);

        this.addDraw(new D.Segment(prev, p));

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

    addLine(from: F.Point, to: F.Point, params: AddLineParams = {}) {
        var start: Point, end: Point;

        if (params.replaceEqual !== false) {
            start = this.addEqualPoint(from);
            end = this.addEqualPoint(to);
        }
        else {
            start = this.addPoint(from.x, from.y);
            end = this.addPoint(to.x, to.y);
        }

        if (params.addOnLineRule !== false) {
            let nearStart = this.getNearSegment(start, 0.01);
            let nearEnd = this.getNearSegment(end, 0.01);

            if (
                nearStart &&
                !nearStart.ps.equalTo(start) &&
                !nearStart.pe.equalTo(start)
            ) {
                this.onLineRule({
                    stage: this,
                    point: start,
                    line: [nearStart.ps, nearStart.pe],
                });
            }

            if (
                nearEnd &&
                !nearEnd.ps.equalTo(end) &&
                !nearEnd.pe.equalTo(end)
            ) {
                this.onLineRule({
                    stage: this,
                    point: end,
                    line: [nearEnd.ps, nearEnd.pe],
                });
            }
        }

        this.addDraw(new D.Segment(start, end));

        return this;
    }

    prev() {
        this.pointer = this.getPrev(this.pointer);

        return this;
    }

    toLines(): D.Segment[] {
        if (!this.fixed) {
            this.fix();
        }

        var lines: D.Segment[] = [];
        this.draws.forEach((draw) => {
            if (draw instanceof D.Segment) {
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

    onLineRule(params: OnLineRuleParams) {
        params.stage = this;

        this.rules.push(new OnLineRule(params));
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

                closest = closestPoint(p, res);
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

    getEqualPoint(p: SimplePoint|F.Point): Point|null {
        return equalPoint(toFPoint(p), this.points) as Point;
    }

    getClosestPoint(p: SimplePoint|F.Point): Point|null {
        return closestPoint(toFPoint(p), this.points) as Point;
    }

    getNearPoint(p: SimplePoint|F.Point): F.Point|null {
        var point = toFPoint(p);
        var near = nearPoint(point, 10, this.points);

        if (!near) {
            let seg = this.getNearSegment(point);

            if (seg) {
                near = seg.distanceTo(point)[1].start;
            }
        }

        return near;
    }

    getNearSegment(p: SimplePoint|F.Point, radius: number = 10): D.Segment|null {
        var point = toFPoint(p);
        var near: D.Segment|null = null;

        this.draws.some(draw => {
            if (!(draw instanceof D.Segment)) return;

            var [dist] = draw.distanceTo(point);

            if (dist > radius) return;

            near = draw;

            if (dist < 0.01) return true;
        });

        return near;
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

interface AddLineParams {
    replaceEqual?: boolean,
    addOnLineRule?: boolean,
}

function toFPoint(p: SimplePoint|F.Point): F.Point {
	return p instanceof F.Point ? p : new F.Point(p.x, p.y);
}

function equalPoint(p: F.Point, list: F.Point[]): F.Point|null {
    return list.find(point => point.equalTo(p)) || null;
}

function closestPoint(p: F.Point, list: F.Point[]): F.Point|null {
    var closest: F.Point|null = null;
    var d = Number.MAX_VALUE;

    list.some(point => {
        var dist = point.distanceTo(p)[0];
        if (dist < d) {
            d = dist;
            closest = point;

            if (d === 0) return true;
        }
    });

    return closest;
}

function nearPoint(p: F.Point, radius: number, list: F.Point[]): F.Point|null {
    var closest: F.Point|null = null;

    list.some(point => {
        var dist = point.distanceTo(p)[0];
        if (dist < radius) {
            radius = dist;
            closest = point;

            if (radius === 0) return true;
        }
    });

    return closest;
}