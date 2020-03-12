import Point from 'types/Point';
import F from '@flatten-js/core';

export default function _(y) {
	return -y + 300;
}

export function _p(p: Point): Point {
	return {
		x: p.x,
		y: _(p.y),
	};
}

export function _fp(p: Point): F.Point {
	return new F.Point(p.x, _(p.y));
}