import { InstanceType } from './types';

export function getInstanceType(
  instance: any
): Exclude<InstanceType, 'integer'>;
export function coerceValue(opts: {
  instanceType: Exclude<InstanceType, 'integer'>;
  instance: any;
  $type: InstanceType;
  recur?: boolean;
}): any | undefined;
