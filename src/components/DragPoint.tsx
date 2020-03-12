import React, {useCallback, useRef, useState} from 'react';
import {Circle} from 'react-konva';
import Konva from 'konva';
import Point from 'types/Point';
import _ from 'lib/y';

type KonvaDragEvent = Konva.KonvaEventObject<DragEvent>;
type KonvaMouseEvent = Konva.KonvaEventObject<MouseEvent>;

interface DragPointProps {
    x: number,
    y: number,
    onDrag: (p: Point) => void,
}

export default function DragPoint(props: DragPointProps) {
    const {x, y, onDrag} = props;
    const [pos, setPos] = useState<Point>({x, y});
    const ref = useRef<Konva.Circle|null>(null);
    const initPos = useRef<Point>({x, y});
    const curPos = useRef<Point>({x, y});
    const startEventPos = useRef<Point|null>(null);

    const onMouseOver = useCallback(() => {
        ref.current!.to({
            scaleX: 2,
            scaleY: 2,
            duration: 0.1,
        });
    }, []);

    const onMouseOut = useCallback(() => {
        if (startEventPos.current) return;

        ref.current!.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
        });
    }, []);

    const onMouseDown = useCallback((e: KonvaMouseEvent) => {
        e.cancelBubble = true;

        ref.current!.to({
            scaleX: 2,
            scaleY: 2,
            duration: 0.1,
        });

        startEventPos.current = {
            x: e.evt.clientX,
            y: e.evt.clientY,
        };
    }, []);

    const onMouseMove = useCallback((e: KonvaDragEvent) => {
        var offset = {
            x: e.evt.clientX - startEventPos.current!.x,
            y: startEventPos.current!.y - e.evt.clientY,
        };

        var pos = curPos.current = {
            x: initPos.current.x + offset.x,
            y: initPos.current.y + offset.y,
        };

        setPos(pos);
        onDrag(pos);
    }, []);

    const onDragEnd = useCallback(() => {
        ref.current!.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
        });

        initPos.current = curPos.current;
        startEventPos.current = null;
    }, []);

	return (
	    <Circle
            ref={ref}
            x={pos.x}
            y={_(pos.y)}
            radius={4}
            fill="black"
            draggable
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseDown={onMouseDown}
            onDragMove={onMouseMove}
            onDragEnd={onDragEnd}
        />
    );
}