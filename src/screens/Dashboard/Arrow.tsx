import React, {useCallback, useMemo, useState} from 'react';
import K from 'react-konva';
import F from '@flatten-js/core';
import DragPoint from 'components/DragPoint';
import {drawRule} from 'components/Rules';
import Line from 'components/Shapes/Line';
import Point from 'types/Point';
import stage from 'lib/Stage';
import _ from 'lib/y';

interface ArrowProps {
    length: number,
    angle: number,
}

export default function Arrow(props: ArrowProps) {
    const [pos, setPos] = useState<Point>({x: 100, y: 100});
    const [s, setRandom] = useState(1);
    const redraw = useCallback(() => setRandom(Math.random()), []);
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

        st.angleRule({
            line1: [start, tl],
            line2: [tl, tr],
            angle: -90,
        });

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

        st.angleRule({
            line1: [tr, br],
            line2: [br, bl],
            angle: -90,
        });

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
    const onLine = useCallback((line: F.Segment) => {
        arrow.addLine(line.start, line.end);
        redraw();
    }, []);
    const getNearPoint = useCallback((p: Point) => {
        return arrow.getNearPoint(p);
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

        <Line
            x={0}
            y={0}
            width={800}
            height={600}
            onShape={onLine}
            getNearPoint={getNearPoint}
        />

        <DragPoint
            x={pos.x}
            y={pos.y}
            onDrag={onDrag}
        />
    </>;
}