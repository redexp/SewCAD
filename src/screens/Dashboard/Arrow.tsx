import React, {useCallback, useMemo, useState} from 'react';
import K, {Path} from 'react-konva';
import DragPoint from 'components/DragPoint';
import Point from 'types/Point';
import stage from 'lib/Stage';
import _ from 'lib/y';

interface ArrowProps {
    length: number,
    angle: number,
}

export default function Arrow(props: ArrowProps) {
    const {length} = props;
    const [pos, setPos] = useState<Point>({x: length, y: length});
    const arrow = useMemo(() => {
        var st = (
            stage({x: 100, y: 100})
                .line({
                    id: 'end',
                    x: 150,
                    y: 150,
                })
                .line({
                    x: 100,
                    y: 130,
                })
        );

        var end = st.getById('end')!;

        st.angleRule({
            line1: [st.points[0], end],
            line2: [end, st.pointer],
            angle: 90,
        });

        st.distanceRule({
            from: end,
            to: st.pointer,
            value: 40,
        });

        return st;
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
                lines.map(({start, end}) => (
                    `M ${start.x},${_(start.y)} L ${end.x},${_(end.y)}`
                )).join(' ')
            }
            stroke="red"
            strokeWidth={1}
            fill="none"
        />

        {arrow.rules.map((r, i) => r.draw(i))}

        <DragPoint
            x={pos.x}
            y={pos.y}
            onDrag={onDrag}
        />
    </>;
}