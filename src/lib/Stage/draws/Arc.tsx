import React from 'react';
import {Arc as KArc} from 'react-konva';
import Draw from "./Draw";
import Point from "../types/Point";

export default class Arc implements Draw {
    line1: Point[];
    line2: Point[];
    radius: number;

    constructor(params: ArcParams) {
        Object.assign(this, params);
    }

    draw() {
        return (
            <KArc
                angle={10}
                innerRadius={10}
                outerRadius={10}
            />
        );
    }
}

export interface ArcParams {
    line1: Point[];
    line2: Point[];
    radius: number;
}