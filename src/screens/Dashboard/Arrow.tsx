import React, {useCallback, useMemo, useState} from 'react';
import {Path} from 'react-konva';
import DragPoint from 'components/DragPoint';
import Point from 'types/Point';
import path from 'lib/path';
import _ from 'lib/y';

interface ArrowProps {
    length: number,
    angle: number,
}

export default function Arrow(props: ArrowProps) {
    const {length} = props;
    const [pos, setPos] = useState<Point>({x: length, y: length});
    const arrow = useMemo(() => {
        return (
            path({x: 10, y: 10})
                .line({
                    id: 'end',
                    ...pos
                })
                .line({id: 'test', a: 45, d: 20})
                .prev()
                .line({a: -45, d: 20})
        );
    }, []);
    const lines = useMemo(() => {
        arrow.setPointPos({
            id: 'end',
            ...pos
        });

        return arrow.toLines();
    }, [pos]);
    const onDrag = useCallback((p: Point) => {
        setPos(p);
    }, []);

    return <>
        <Path
            data={
                lines.map(({start, end}, i) => (
                    `M ${start.x},${_(start.y)} L ${end.x},${_(end.y)}`
                )).join(' ')
            }
            stroke="red"
            strokeWidth={1}
            fill="none"
        />

        <DragPoint
            x={pos.x}
            y={pos.y}
            onDrag={onDrag}
        />
    </>;
}