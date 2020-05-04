import { deepCompareStrict } from './deep-compare-strict';
import { ucs2length } from './ucs2-length';
import { Schema, InstanceType, SchemaDraft } from './types';
import { dereference } from './dereference';
import { encodePointer } from './pointer';
import { fastFormat } from './format';

const validResult = Object.freeze({ valid: true });
const invalidResult = Object.freeze({ valid: false });

export function validate(
  instance: any,
  schema: Schema | boolean,
  draft: SchemaDraft = '2019-09',
  lookup = dereference(schema),
  recursiveAnchor: Schema | null = null,
  instancePointer = '/#',
  evaluated?: { properties?: Record<string, boolean>; items?: number }
): { valid: boolean } {
  if (schema === true) {
    return validResult;
  }

  if (schema === false) {
    return invalidResult;
  }

  const rawInstanceType = typeof instance;
  let instanceType: Exclude<InstanceType, 'integer'>;
  switch (rawInstanceType) {
    case 'boolean':
    case 'number':
    case 'string':
      instanceType = rawInstanceType;
      break;
    case 'object':
      if (instance === null) {
        instanceType = 'null';
      } else if (Array.isArray(instance)) {
        instanceType = 'array';
        evaluated = evaluated || { items: -1 };
      } else {
        instanceType = 'object';
        evaluated = evaluated || { properties: Object.create(null) };
      }
      break;
    default:
      // undefined, bigint, function, symbol
      throw new Error(
        `Instances of "${rawInstanceType}" type are not supported.`
      );
  }

  const {
    $ref,
    $recursiveRef,
    $recursiveAnchor,
    type: $type,
    const: $const,
    enum: $enum,
    required: $required,
    not: $not,
    anyOf: $anyOf,
    allOf: $allOf,
    oneOf: $oneOf,
    if: $if,
    then: $then,
    else: $else,

    format: $format,

    properties: $properties,
    patternProperties: $patternProperties,
    additionalProperties: $additionalProperties,
    unevaluatedProperties: $unevaluatedProperties,
    minProperties: $minProperties,
    maxProperties: $maxProperties,
    propertyNames: $propertyNames,
    dependentRequired: $dependentRequired,
    dependentSchemas: $dependentSchemas,
    dependencies: $dependencies,

    items: $items,
    additionalItems: $additionalItems,
    unevaluatedItems: $unevaluatedItems,
    contains: $contains,
    minItems: $minItems,
    maxItems: $maxItems,
    uniqueItems: $uniqueItems,

    minimum: $minimum,
    maximum: $maximum,
    exclusiveMinimum: $exclusiveMinimum,
    exclusiveMaximum: $exclusiveMaximum,
    multipleOf: $multipleOf,

    minLength: $minLength,
    maxLength: $maxLength,
    pattern: $pattern,

    __absolute_ref__
  } = schema;

  if ($ref !== undefined) {
    const uri = __absolute_ref__ || $ref;
    const refSchema = lookup[uri];
    if (refSchema === undefined) {
      let message = `Unresolved $ref "${$ref}".`;
      if (__absolute_ref__ && __absolute_ref__ !== $ref) {
        message += `  Absolute URI "${__absolute_ref__}".`;
      }
      message += `\nKnown schemas:\n- ${Object.keys(lookup).join('\n- ')}`;
      throw new Error(message);
    }
    if (
      !validate(
        instance,
        refSchema,
        draft,
        lookup,
        recursiveAnchor,
        instancePointer
      ).valid
    ) {
      return invalidResult;
    }
    if (draft === '4' || draft === '7') {
      return validResult;
    }
  }

  if ($recursiveAnchor === true && recursiveAnchor === null) {
    recursiveAnchor = schema;
  }

  if (
    $recursiveRef === '#' &&
    !validate(
      instance,
      recursiveAnchor === null ? schema : recursiveAnchor,
      draft,
      lookup,
      recursiveAnchor,
      instancePointer
    ).valid
  ) {
    return invalidResult;
  }

  if (Array.isArray($type)) {
    let length = $type.length;
    let valid = false;
    for (let i = 0; i < length; i++) {
      if (
        instanceType === $type[i] ||
        ($type[i] === 'integer' &&
          instanceType === 'number' &&
          instance % 1 === 0 &&
          instance === instance)
      ) {
        valid = true;
        break;
      }
    }
    if (!valid) {
      return invalidResult;
    }
  } else if ($type === 'integer') {
    if (instanceType !== 'number' || instance % 1 || instance !== instance) {
      return invalidResult;
    }
  } else if ($type !== undefined && instanceType !== $type) {
    return invalidResult;
  }

  if ($const !== undefined) {
    if (instanceType === 'object' || instanceType === 'array') {
      if (!deepCompareStrict(instance, $const)) {
        return invalidResult;
      }
    } else if (instance !== $const) {
      return invalidResult;
    }
  }

  if ($enum !== undefined) {
    if (instanceType === 'object' || instanceType === 'array') {
      if (!$enum.some(value => deepCompareStrict(instance, value))) {
        return invalidResult;
      }
    } else if (!$enum.some(value => instance === value)) {
      return invalidResult;
    }
  }

  if (
    $not !== undefined &&
    validate(
      instance,
      $not,
      draft,
      lookup,
      recursiveAnchor,
      instancePointer,
      evaluated
    ).valid
  ) {
    return invalidResult;
  }

  if (
    $anyOf !== undefined &&
    !$anyOf.some(
      subSchema =>
        validate(
          instance,
          subSchema,
          draft,
          lookup,
          recursiveAnchor,
          instancePointer,
          evaluated
        ).valid
    )
  ) {
    return invalidResult;
  }

  if (
    $allOf !== undefined &&
    !$allOf.every(
      subSchema =>
        validate(
          instance,
          subSchema,
          draft,
          lookup,
          recursiveAnchor,
          instancePointer,
          evaluated
        ).valid
    )
  ) {
    return invalidResult;
  }

  if (
    $oneOf !== undefined &&
    $oneOf.filter(
      subSchema =>
        validate(
          instance,
          subSchema,
          draft,
          lookup,
          recursiveAnchor,
          instancePointer,
          evaluated
        ).valid
    ).length !== 1
  ) {
    return invalidResult;
  }

  if ($if !== undefined) {
    if (
      validate(
        instance,
        $if,
        draft,
        lookup,
        recursiveAnchor,
        instancePointer,
        evaluated
      ).valid
    ) {
      if (
        $then !== undefined &&
        !validate(
          instance,
          $then,
          draft,
          lookup,
          recursiveAnchor,
          instancePointer,
          evaluated
        ).valid
      ) {
        return invalidResult;
      }
    } else if (
      $else !== undefined &&
      !validate(
        instance,
        $else,
        draft,
        lookup,
        recursiveAnchor,
        instancePointer,
        evaluated
      ).valid
    ) {
      return invalidResult;
    }
  }

  if (instanceType === 'object') {
    if ($required !== undefined) {
      for (const key of $required) {
        if (!(key in instance)) {
          return invalidResult;
        }
      }
    }

    const keys = Object.keys(instance);

    if ($minProperties !== undefined && keys.length < $minProperties) {
      return invalidResult;
    }

    if ($maxProperties !== undefined && keys.length > $maxProperties) {
      return invalidResult;
    }

    if ($propertyNames !== undefined) {
      for (const key in instance) {
        if (
          !validate(
            key,
            $propertyNames,
            draft,
            lookup,
            recursiveAnchor,
            instancePointer
          ).valid
        ) {
          return invalidResult;
        }
      }
    }

    if ($dependentRequired !== undefined) {
      for (const key in $dependentRequired) {
        if (key in instance) {
          const required = $dependentRequired[key];
          for (const key of required) {
            if (!(key in instance)) {
              return invalidResult;
            }
          }
        }
      }
    }

    if ($dependentSchemas !== undefined) {
      for (const key in $dependentSchemas) {
        if (key in instance) {
          if (
            !validate(
              instance,
              $dependentSchemas[key],
              draft,
              lookup,
              recursiveAnchor,
              instancePointer
            ).valid
          ) {
            return invalidResult;
          }
        }
      }
    }

    if ($dependencies !== undefined) {
      for (const key in $dependencies) {
        if (key in instance) {
          const propsOrSchema = $dependencies[key];
          if (Array.isArray(propsOrSchema)) {
            for (const key of propsOrSchema) {
              if (!(key in instance)) {
                return invalidResult;
              }
            }
          } else {
            if (
              !validate(
                instance,
                propsOrSchema,
                draft,
                lookup,
                recursiveAnchor,
                instancePointer
              ).valid
            ) {
              return invalidResult;
            }
          }
        }
      }
    }

    const thisEvaluated = Object.create(null);
    if (!evaluated || !evaluated.properties) {
      throw new Error('evaluated.properties should be an object');
    }

    if ($properties !== undefined) {
      for (const key in $properties) {
        if (!(key in instance)) {
          continue;
        }
        const subInstancePointer = `${instancePointer}/${encodePointer(key)}`;
        if (
          validate(
            instance[key],
            $properties[key],
            draft,
            lookup,
            recursiveAnchor,
            subInstancePointer
          ).valid
        ) {
          evaluated.properties[key] = thisEvaluated[key] = true;
        } else {
          return invalidResult;
        }
      }
    }
    if ($patternProperties !== undefined) {
      for (const pattern in $patternProperties) {
        const regex = new RegExp(pattern);
        const subSchema = $patternProperties[pattern];
        for (const key in instance) {
          if (!regex.test(key)) {
            continue;
          }
          const subInstancePointer = `${instancePointer}/${encodePointer(key)}`;
          if (
            validate(
              instance[key],
              subSchema,
              draft,
              lookup,
              recursiveAnchor,
              subInstancePointer
            ).valid
          ) {
            evaluated.properties[key] = thisEvaluated[key] = true;
          } else {
            return invalidResult;
          }
        }
      }
    }
    if ($additionalProperties !== undefined) {
      for (const key in instance) {
        if (thisEvaluated[key]) {
          continue;
        }
        const subInstancePointer = `${instancePointer}/${encodePointer(key)}`;
        if (
          validate(
            instance[key],
            $additionalProperties,
            draft,
            lookup,
            recursiveAnchor,
            subInstancePointer
          ).valid
        ) {
          evaluated.properties[key] = true;
        } else {
          return invalidResult;
        }
      }
    } else if ($unevaluatedProperties !== undefined) {
      for (const key in instance) {
        if (!evaluated.properties[key]) {
          const subInstancePointer = `${instancePointer}/${encodePointer(key)}`;
          if (
            !validate(
              instance[key],
              $unevaluatedProperties,
              draft,
              lookup,
              recursiveAnchor,
              subInstancePointer
            ).valid
          ) {
            return invalidResult;
          }
        }
      }
    }
  } else if (instanceType === 'array') {
    if ($maxItems !== undefined && instance.length > $maxItems) {
      return invalidResult;
    }

    if ($minItems !== undefined && instance.length < $minItems) {
      return invalidResult;
    }

    if (!evaluated || evaluated.items === undefined) {
      throw new Error('evaluated.items should be a number');
    }

    const length: number = instance.length;
    let i = 0;
    if ($items !== undefined) {
      if (Array.isArray($items)) {
        const length2 = Math.min($items.length, length);
        for (; i < length2; i++) {
          if (
            !validate(
              instance[i],
              $items[i],
              draft,
              lookup,
              recursiveAnchor,
              `${instancePointer}/${i}`
            ).valid
          ) {
            return invalidResult;
          }
        }
      } else {
        for (; i < length; i++) {
          if (
            !validate(
              instance[i],
              $items,
              draft,
              lookup,
              recursiveAnchor,
              `${instancePointer}/${i}`
            ).valid
          ) {
            return invalidResult;
          }
        }
      }

      evaluated.items = Math.max(i, evaluated.items);

      if ($additionalItems !== undefined) {
        for (; i < length; i++) {
          if (
            !validate(
              instance[i],
              $additionalItems,
              draft,
              lookup,
              recursiveAnchor,
              `${instancePointer}/${i}`
            ).valid
          ) {
            return invalidResult;
          }
        }
        evaluated.items = Math.max(i, evaluated.items);
      }
    }

    if ($unevaluatedItems !== undefined) {
      for (i = Math.max(evaluated.items, 0); i < length; i++) {
        if (
          !validate(
            instance[i],
            $unevaluatedItems,
            draft,
            lookup,
            recursiveAnchor,
            `${instancePointer}/${i}`
          ).valid
        ) {
          return invalidResult;
        }
      }
    }

    if ($contains !== undefined) {
      if (length === 0) {
        return invalidResult;
      }
      let contained = false;
      for (let i = 0; i < length; i++) {
        if (
          validate(
            instance[i],
            $contains,
            draft,
            lookup,
            recursiveAnchor,
            `${instancePointer}/${i}`
          ).valid
        ) {
          contained = true;
          break;
        }
      }
      if (!contained) {
        return invalidResult;
      }
    }

    if ($uniqueItems) {
      for (let j = 0; j < length; j++) {
        const a = instance[j];
        const ao = typeof a === 'object' && a !== null;
        for (let k = 0; k < length; k++) {
          if (j === k) {
            continue;
          }
          const b = instance[k];
          const bo = typeof b === 'object' && b !== null;
          if (a === b || (ao && bo && deepCompareStrict(a, b))) {
            return invalidResult;
          }
        }
      }
    }
  } else if (instanceType === 'number') {
    if (draft === '4') {
      if (
        $minimum !== undefined &&
        (($exclusiveMinimum === true && instance <= $minimum) ||
          instance < $minimum)
      ) {
        return invalidResult;
      }
      if (
        $maximum !== undefined &&
        (($exclusiveMaximum === true && instance >= $maximum) ||
          instance > $maximum)
      ) {
        return invalidResult;
      }
    } else {
      if ($minimum !== undefined && instance < $minimum) {
        return invalidResult;
      }
      if ($maximum !== undefined && instance > $maximum) {
        return invalidResult;
      }
      if ($exclusiveMinimum !== undefined && instance <= $exclusiveMinimum) {
        return invalidResult;
      }
      if ($exclusiveMaximum !== undefined && instance >= $exclusiveMaximum) {
        return invalidResult;
      }
    }
    if ($multipleOf !== undefined) {
      const division = instance / $multipleOf;
      if (division !== Math.floor(division)) {
        return invalidResult;
      }
    }
  } else if (instanceType === 'string') {
    if ($minLength !== undefined && ucs2length(instance) < $minLength) {
      return invalidResult;
    }
    if ($maxLength !== undefined && ucs2length(instance) > $maxLength) {
      return invalidResult;
    }
    if ($pattern !== undefined && !new RegExp($pattern).test(instance)) {
      return invalidResult;
    }
    if (
      $format !== undefined &&
      fastFormat[$format] &&
      !fastFormat[$format](instance)
    ) {
      return invalidResult;
    }
  }

  return validResult;
}
