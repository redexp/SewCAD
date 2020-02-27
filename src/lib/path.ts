import F, {Point as FPoint, Vector, Line as FLine, Circle, Segment} from '@flatten-js/core';
import SimplePoint from 'types/Point';
import isNum from 'lodash/isNumber';

//@ts-ignore
window.F = F;

export default function path(start: Point|SimplePoint) {
	return new Path(start);
}

class Path {
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
                line: [p1, prev],
                point: p,
                angle: a,
            });
        }

        if (isNum(d)) {
            this.distanceRule({
                from: prev,
                to: p,
                value: d,
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

    angleRule(params: AngleRuleParams) {
        this.rules.push(new AngleRule(params));
        this.fixed = false;
    }

    distanceRule(params: DistanceRuleParams) {
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

class Point extends FPoint {
    id: string|number|undefined;
    valid: boolean = false;
}

interface Rule {
    deps: Point[];
    // shapeFor(p: Point, to?: Point): Shape;
    isValid(): boolean;
    getPointsShapes(): Array<{point: Point, shape: Shape}>
}

class AngleRule implements Rule {
    deps: Point[];
    line: Point[];
    point: Point;
    angle: number;
    radian: number;

    constructor(params: AngleRuleParams) {
        Object.assign(this, params);

        this.deps = [this.point];
        this.radian = deg2rad(this.angle);
    }

    isValid(): boolean {
        var v1 = new Vector(this.line[1], this.line[0]).normalize();
        var v2 = new Vector(this.line[1], this.point).normalize();
        var a = rad2deg(v1.angleTo(v2));

        if (a > 180) {
            a = 360 - a;
        }

        return a === Math.abs(this.angle);
    }

    getPointsShapes() {
        let v = new Vector(this.line[1], this.line[0]);
        v = v.normalize().multiply(Number.MAX_SAFE_INTEGER);
        var line = new Segment(this.line[1], this.line[0].translate(v));
        line = line.rotate(-this.radian, line.start);

        return [
            {
                point: this.point,
                shape: line,
            }
        ];
    }
}

class DistanceRule implements Rule {
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
}

interface LineParams {
    id?: ID,
    x?: number,
    y?: number,
    a?: number,
    d?: number,
}

type Shape = FLine|Circle|Segment;

interface AngleRuleParams {
    line: Point[],
    point: Point,
    angle: number,
}

interface DistanceRuleParams {
    from: Point,
    to: Point,
    value: number,
}

type ID = string|number;

interface PointPos {
    id?: ID,
    point?: Point,
    x: number,
    y: number,
}

class Draw {

}

class LineDraw extends Draw {
    start: Point;
    end: Point;

    constructor(start: Point, end: Point) {
        super();

        this.start = start;
        this.end = end;
    }
}

function deg2rad(deg) {
	return deg * Math.PI / 180;
}

function rad2deg(rad) {
	var deg = rad * 180 / Math.PI;
	return fix(deg);
}

function fix(n: number|FPoint|F.Vector) {
    if (n instanceof FPoint) {
        return new FPoint(fix(n.x), fix(n.y));
    }
    else if (n instanceof F.Vector) {
        return new F.Vector(fix(n.x), fix(n.y));
    }

	return Number(n.toFixed(3));
}