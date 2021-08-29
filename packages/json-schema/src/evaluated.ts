import { InstanceType } from './types.js';

export const evaluatedItems = Symbol('evalutatedItems');

export interface Evaluated extends Record<string | number, boolean> {
  [evaluatedItems]: number;
}

export const evaluatedProto = { [evaluatedItems]: -1 };

export function mergeEvaluated(
  evaluated: Evaluated,
  subEvaluateds: Evaluated[],
  instanceType: InstanceType
) {
  if (instanceType === 'object') {
    Object.assign(evaluated, ...subEvaluateds);
  } else if (instanceType === 'array') {
    let a = evaluated[evaluatedItems];
    for (let j = 0; j < subEvaluateds.length; j++) {
      const b = subEvaluateds[j][evaluatedItems];
      if (b > a) {
        a = b;
      }
    }
    evaluated[evaluatedItems] = a;
  }
}
