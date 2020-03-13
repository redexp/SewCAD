import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import K from 'react-konva';
import Konva from "konva";
import F from '@flatten-js/core';
import Point from "types/Point";
import _, {_p} from 'lib/y';

type KonvaMouseEvent = Konva.KonvaEventObject<MouseEvent>;

interface LineProps {
    x: number,
    y: number,
    width: number,
    height: number,
    onShape: (line: F.Segment) => void,
    onRule?: () => void,
    getNearPoint: (p: Point) => F.Point|null,
}

export default function Line(props: LineProps) {
    const {x, y, width, height, onShape, onRule, getNearPoint} = props;
    const [start, setStart] = useState<Point|null>(null);
    const [end, setEnd] = useState<Point|null>(null);
    const [nearStart, setNearStart] = useState<Point|null>(null);
    const [nearEnd, setNearEnd] = useState<Point|null>(null);
    const initPos = useRef<Point|null>(null);
    const startPos = useRef<Point|null>(null);
    const curPos = useRef<Point|null>(null);
    const nearStartPos = useRef<Point|null>(null);
    const nearEndPos = useRef<Point|null>(null);

    const onStartMove = useCallback((e: KonvaMouseEvent) => {
        if (startPos.current) return;

        var pos = e.currentTarget.getStage()!.getPointerPosition();
        var near = pos ? getNearPoint(_p(pos)) : null;
        var point = near && _p(near);

        nearStartPos.current = point;
        setNearStart(point);
    }, []);

    const onMouseDown = useCallback((e: KonvaMouseEvent) => {
        if (e.target !== e.currentTarget) {
            nearStartPos.current = null;
            setNearStart(null);
            return;
        }

        var pos = initPos.current = e.currentTarget.getStage()!.getPointerPosition();

        startPos.current = {
            x: e.evt.clientX,
            y: e.evt.clientY,
        };

        setStart(pos);

        document.body.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('mouseup', onMouseUp);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        var offset = {
            x: e.clientX - startPos.current!.x,
            y: e.clientY - startPos.current!.y,
        };

        var pos = curPos.current = {
            x: initPos.current!.x + offset.x,
            y: initPos.current!.y + offset.y,
        };

        var n = getNearPoint(_p(pos));
        var near = nearEndPos.current = n && _p(n);

        setEnd(pos);
        setNearEnd(near);
    }, []);

    const onMouseUp = useCallback((e: MouseEvent) => {
        onMouseMove(e);

        document.body.removeEventListener('mousemove', onMouseMove);
        document.body.removeEventListener('mouseup', onMouseUp);

        var start = nearStartPos.current || initPos.current!;
        var end = nearEndPos.current || curPos.current!;

        onShape(new F.Segment(new F.Point(start.x, _(start.y)), new F.Point(end.x, _(end.y))));

        setStart(null);
        setEnd(null);
        setNearEnd(null);

        initPos.current = null;
        startPos.current = null;
        curPos.current = null;
        nearStartPos.current = null;
        nearEndPos.current = null;
    }, []);

    useEffect(() => {
        return () => {
            document.body.removeEventListener('mousemove', onMouseMove);
            document.body.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

	return <>
        {nearStart &&
		<K.Circle
			x={nearStart.x}
			y={nearStart.y}
			radius={4}
			fill="green"
		/>}

        {nearEnd &&
		<K.Circle
			x={nearEnd.x}
			y={nearEnd.y}
			radius={4}
			fill="green"
		/>}

        <K.Rect
            {...{x, y, width, height}}
            onMouseDown={onMouseDown}
            onMouseMove={onStartMove}
        />

        {start &&
		<K.Circle
			x={start.x}
			y={start.y}
			radius={4}
			fill="black"
		/>}

        {end &&
		<K.Circle
			x={end.x}
			y={end.y}
			radius={4}
			fill="black"
		/>}

        {start && end &&
        <K.Line
            points={[start!.x, start!.y, end!.x, end!.y]}
            stroke="red"
            strokeWidth={2}
        />}
    </>;
}