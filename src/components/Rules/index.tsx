import React, {ReactElement} from 'react';
import {Rule, AngleLineRule, DistanceRule} from 'lib/Stage/rules';
import {drawAngle} from './Angle';
import {drawDistance} from './Distance';

export function drawRule(rule: Rule, props?: object): ReactElement|null {
    if (rule instanceof AngleLineRule) {
        return drawAngle(rule, props);
    }
    else if (rule instanceof DistanceRule) {
        return drawDistance(rule, props);
    }
    else if (rule instanceof DistanceRule) {
        return drawDistance(rule, props);
    }
    else {
        console.error('Unknown rule', rule);
        return null;
    }
}