import React from 'react';
import {useTranslation} from "react-i18next";
import {Stage, Layer} from 'react-konva';
import Arrow from './Arrow';

export default function Dashboard() {
    const [__] = useTranslation();

    return (
        <div>
            <Stage
                width={800}
                height={600}
            >
                <Layer>
                    <Arrow length={150} angle={45}/>
                </Layer>
            </Stage>
        </div>
    );
}
