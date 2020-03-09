import React, {Component, createRef} from 'react';
import K from 'react-konva';
import Konva from 'konva';
import F from '@flatten-js/core';
import DistanceRule from 'lib/Stage/rules/DistanceRule';
import _ from 'lib/y';

interface DistanceProps {
    from: F.Segment,
    to: F.Segment,
    arrow: F.Segment,
    rule: DistanceRule,
    onChange?: () => void,
}

export default class Distance extends Component<DistanceProps> {
    lineRef = createRef<Konva.Path>();
    arrowRef = createRef<Konva.Line>();

    shouldComponentUpdate(props: DistanceProps) {
        return !(
            this.props.rule === props.rule &&
            this.props.onChange === props.onChange &&
            this.props.from.equalTo(props.from) &&
            this.props.to.equalTo(props.from) &&
            this.props.arrow.equalTo(props.from)
        );
    }

    onEdit = () => {
        var {rule, onChange} = this.props;

        var value = prompt('Distance', String(rule.value));

        if (value === null) return;

        rule.setValue(Number(value));
        rule.stage.fix();

        if (onChange) {
            onChange();
        }
    };

    onOver = () => {
        this.lineRef.current!.to({
            stroke: '#0dd92b',
            duration: 0.1,
        });

        this.arrowRef.current!.to({
            strokeWidth: 4,
            stroke: '#0dd92b',
            duration: 0.1,
        });
    };

    onOut = () => {
        this.lineRef.current!.to({
            stroke: '#ccc',
            duration: 0.1,
        });

        this.arrowRef.current!.to({
            strokeWidth: 2,
            stroke: '#ccc',
            duration: 0.1,
        });
    };

    render() {
        var {from, to, arrow} = this.props;

        return <>
            <K.Path
                ref={this.lineRef}
                data={`M ${from.start.x}, ${_(from.start.y)} L ${from.end.x}, ${_(from.end.y)} M ${to.start.x}, ${_(to.start.y)} L ${to.end.x}, ${_(to.end.y)}`}
                strokeWidth={1}
                stroke="#ccc"
            />
            <K.Line
                ref={this.arrowRef}
                points={[arrow.start.x, _(arrow.start.y), arrow.end.x, _(arrow.end.y)]}
                strokeWidth={2}
                stroke="#ccc"
                onDblClick={this.onEdit}
                onMouseOver={this.onOver}
                onMouseOut={this.onOut}
            />
        </>;
    }
}

export function drawDistance(rule: DistanceRule, props?: object) {
    var shapes = rule.getDrawShapes();
    var from: F.Segment = shapes[0];
    var to: F.Segment = shapes[1];
    var arrow: F.Segment = shapes[2];

    return (
        <Distance
            from={from}
            to={to}
            arrow={arrow}
            rule={rule}
            {...props}
        />
    );
}