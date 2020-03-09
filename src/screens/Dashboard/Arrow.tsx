import React, {useCallback, useMemo, useState} from 'react';
import K from 'react-konva';
import DragPoint from 'components/DragPoint';
import {drawRule} from 'components/Rules';
import Point from 'types/Point';
import stage from 'lib/Stage';
import _ from 'lib/y';
import useRedraw from 'lib/useRedraw';

interface ArrowProps {
    length: number,
    angle: number,
}

export default function Arrow(props: ArrowProps) {
    const [pos, setPos] = useState<Point>({x: 100, y: 100});
    const [s, redraw] = useRedraw();
    const arrow = useMemo(() => {
        var st = (
            stage({x: 50, y: 50})
                .line({
                    id: 'start',
                    x: 100,
                    y: 100,
                })
                .line({
                    id: 'tl',
                    x: 100,
                    y: 200,
                })
                .line({
                    id: 'tr',
                    x: 200,
                    y: 200,
                })
                .line({
                    id: 'br',
                    x: 200,
                    y: 100,
                })
                .line({
                    id: 'bl',
                    x: 100,
                    y: 100,
                })
        );

        var start = st.getById('start')!;
        var tl = st.getById('tl')!;
        var tr = st.getById('tr')!;
        var bl = st.getById('bl')!;
        var br = st.getById('br')!;

        st.angleRule({
            line1: [st.points[0], start],
            line2: [start, tl],
            angle: 90 + 45,
        });

        st.distanceRule({
            from: start,
            to: tl,
            value: 100,
        });

        // st.angleRule({
        //     line1: [start, tl],
        //     line2: [tl, tr],
        //     angle: -90,
        // });

        st.distanceRule({
            from: tl,
            to: tr,
            value: 100,
        });

        // st.angleRule({
        //     line1: [tl, tr],
        //     line2: [tr, br],
        //     angle: -90,
        // });

        st.distanceRule({
            from: tr,
            to: br,
            value: 100,
        });

        // st.angleRule({
        //     line1: [tr, br],
        //     line2: [br, bl],
        //     angle: -90,
        // });

        st.distanceRule({
            from: br,
            to: bl,
            value: 100,
        });

        return st;
    }, []);
    const lines = useMemo(() => {
        arrow.setPointPos({
            id: 'start',
            ...pos
        });

        return arrow.toLines();
    }, [pos, s]);
    const rules = useMemo(() => {
        return arrow.rules.map((rule, i) => (
            drawRule(rule, {
                key: rule.type + i,
                onChange: redraw,
            })
        ));
    }, [lines]);
    const onDrag = useCallback((p: Point) => {
        setPos(p);
    }, []);

    return <>
        <K.Path
            data={
                lines.map(({start, end}) => (
                    `M ${start.x},${_(start.y)} L ${end.x},${_(end.y)}`
                )).join(' ')
            }
            stroke="red"
            strokeWidth={1}
            fill="none"
        />

        {rules}

        <DragPoint
            x={pos.x}
            y={pos.y}
            onDrag={onDrag}
        />
    </>;
}