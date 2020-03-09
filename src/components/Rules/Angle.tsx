import React, {useCallback, useMemo, useRef} from 'react';
import K from 'react-konva';
import Konva from 'konva';
import F from '@flatten-js/core';
import AngleRule from 'lib/Stage/rules/AngleRule';
import rad2deg from 'lib/rad2deg';
import _ from 'lib/y';
import Point from 'types/Point';

interface AngleProps {
    center: Point,
    angle: number,
    radius: number,
    start: number,
    rule: AngleRule,
    onChange?: () => void,
}

export default function Angle(props: AngleProps) {
    const {rule, onChange} = props;
    const dash = useMemo(() => [4, 6], []);
    const ref = useRef<Konva.Arc|null>(null);

    const onEdit = useCallback(() => {
        var value: string|null = prompt('Angle', String(rule.angle));

        if (value === null) return;

        rule.setAngle(Number(value));
        rule.stage.fix();

        if (onChange) {
            onChange();
        }
    }, [rule, onChange]);

    const onOver = useCallback(() => {
        if (ref.current){
            ref.current.to({
                stroke: '#0dd92b',
                strokeWidth: 4,
                duration: 0.1,
            });
        }
    }, []);

    const onOut = useCallback(() => {
        if (ref.current) {
            ref.current.to({
                stroke: '#ccc',
                strokeWidth: 2,
            });
        }
    }, []);

    return <K.Arc
        ref={ref}
        x={props.center.x}
        y={_(props.center.y)}
        angle={props.angle}
        rotation={props.start}
        innerRadius={props.radius}
        outerRadius={props.radius}
        strokeWidth={2}
        stroke="#ccc"
        dash={dash}
        onDblClick={onEdit}
        onMouseOver={onOver}
        onMouseOut={onOut}
    />;
}

export function drawAngle(rule: AngleRule, props?: object) {
    var arc: F.Arc = rule.getDrawShapes()[0];

	return (
	    <Angle
            center={arc.center}
            angle={rad2deg(arc.startAngle - arc.endAngle)}
            radius={20}
            start={360 - rad2deg(arc.startAngle)}
            rule={rule}
            {...props}
        />
    );
}