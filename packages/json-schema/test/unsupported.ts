export const unsupportedTests: Record<
  string,
  Record<string, Record<string, boolean>>
> = {
  'draft2019-09/format': {
    'email format': {
      'invalid email string is only an annotation by default': true
    },
    'regex format': {
      'invalid regex string is only an annotation by default': true
    },
    'ipv4 format': {
      'invalid ipv4 string is only an annotation by default': true
    },
    'ipv6 format': {
      'invalid ipv6 string is only an annotation by default': true
    },
    'hostname format': {
      'invalid hostname string is only an annotation by default': true
    },
    'date format': {
      'invalid date string is only an annotation by default': true
    },
    'date-time format': {
      'invalid date-time string is only an annotation by default': true
    },
    'time format': {
      'invalid time string is only an annotation by default': true
    },
    'json-pointer format': {
      'invalid json-pointer string is only an annotation by default': true
    },
    'relative-json-pointer format': {
      'invalid relative-json-pointer string is only an annotation by default': true
    },
    'uri format': {
      'invalid uri string is only an annotation by default': true
    },
    'uri-reference format': {
      'invalid uri-reference string is only an annotation by default': true
    },
    'uri-template format': {
      'invalid uri-template string is only an annotation by default': true
    },
    'uuid format': {
      'invalid uuid string is only an annotation by default': true
    },
    'duration format': {
      'invalid duration string is only an annotation by default': true
    }
  },
  'draft2019-09/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft2019-09/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft2019-09/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft2019-09/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft2019-09/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft2019-09/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft2019-09/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft2019-09/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft2019-09/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft2019-09/recursiveRef': {
    '$recursiveRef without $recursiveAnchor works like $ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    '$recursiveRef with $recursiveAnchor: false works like $ref': {
      'single level match': true,
      'integer does not match as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, integer does not match as a property value': true
    },
    '$recursiveRef with no $recursiveAnchor works like $ref': {
      'single level match': true,
      'integer does not match as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, integer does not match as a property value': true
    },
    '$recursiveRef with no $recursiveAnchor in the initial target schema resource': {
      'leaf node matches: recursion uses the inner schema': true,
      'leaf node does not match: recursion uses the inner schema': true
    },
    'multiple dynamic paths to the $recursiveRef keyword': {
      'recurse to integerNode - floats are not allowed': true
    },
    'dynamic $recursiveRef destination (not predictable at schema compile time)': {
      'integer node': true
    }
  },
  'draft2019-09/unevaluatedItems': {
    "unevaluatedItems can't see inside cousins": {
      'always fails': true
    }
  },
  'draft2019-09/unevaluatedProperties': {
    "unevaluatedProperties can't see inside cousins": {
      'always fails': true
    },
    'cousin unevaluatedProperties, true and false, true with properties': {
      'with no nested unevaluated properties': true,
      'with nested unevaluated properties': true
    },
    'cousin unevaluatedProperties, true and false, false with properties': {
      'with nested unevaluated properties': true
    },
    'in-place applicator siblings, allOf has unevaluated': {
      'base case: both properties present': true,
      'in place applicator siblings, foo is missing': true
    }
  },
  'draft2020-12/defs': {
    'validate definition against metaschema': {
      'invalid definition schema': true
    }
  },
  'draft2020-12/dynamicRef': {
    'A $dynamicRef to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor': {
      'An array containing non-strings is invalid': true
    },
    'A $dynamicRef to an $anchor in the same schema resource should behave like a normal $ref to an $anchor': {
      'An array containing non-strings is invalid': true
    },
    'A $ref to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor': {
      'An array of strings is valid': true,
      'An array containing non-strings is invalid': true
    },
    'A $dynamicRef should resolve to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated': {
      'An array containing non-strings is invalid': true
    },
    "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor should not affect dynamic scope resolution": {
      'An array containing non-strings is invalid': true
    },
    'A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor should resolve to the first $dynamicAnchor in the dynamic scope': {
      'The recursive part is not valid against the root': true
    },
    'multiple dynamic paths to the $dynamicRef keyword': {
      'recurse to integerNode - floats are not allowed': true
    },
    'after leaving a dynamic scope, it should not be used by a $dynamicRef': {
      'string matches /$defs/thingy, but the $dynamicRef does not stop here': true,
      'first_scope is not in dynamic scope for the $dynamicRef': true
    }
  },
  'draft2020-12/format': {
    'email format': {
      'invalid email string is only an annotation by default': true
    },
    'regex format': {
      'invalid regex string is only an annotation by default': true
    },
    'ipv4 format': {
      'invalid ipv4 string is only an annotation by default': true
    },
    'ipv6 format': {
      'invalid ipv6 string is only an annotation by default': true
    },
    'hostname format': {
      'invalid hostname string is only an annotation by default': true
    },
    'date format': {
      'invalid date string is only an annotation by default': true
    },
    'date-time format': {
      'invalid date-time string is only an annotation by default': true
    },
    'time format': {
      'invalid time string is only an annotation by default': true
    },
    'json-pointer format': {
      'invalid json-pointer string is only an annotation by default': true
    },
    'relative-json-pointer format': {
      'invalid relative-json-pointer string is only an annotation by default': true
    },
    'uri format': {
      'invalid uri string is only an annotation by default': true
    },
    'uri-reference format': {
      'invalid uri-reference string is only an annotation by default': true
    },
    'uri-template format': {
      'invalid uri-template string is only an annotation by default': true
    },
    'uuid format': {
      'invalid uuid string is only an annotation by default': true
    },
    'duration format': {
      'invalid duration string is only an annotation by default': true
    }
  },
  'draft2020-12/id': {
    'Invalid use of fragments in location-independent $id': {
      'Identifier name': true,
      'Identifier name and no ref': true,
      'Identifier path': true,
      'Identifier name with absolute URI': true,
      'Identifier path with absolute URI': true,
      'Identifier name with base URI change in subschema': true,
      'Identifier path with base URI change in subschema': true
    }
  },
  'draft2020-12/items': {
    'items and subitems': {
      'valid items': true,
      'fewer items is valid': true
    },
    'prefixItems with no additional items allowed': {
      'fewer number of items present (1)': true,
      'fewer number of items present (2)': true,
      'equal number of items present': true
    },
    'prefixItems validation adjusts the starting index for items': {
      'valid items': true
    }
  },
  'draft2020-12/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft2020-12/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft2020-12/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft2020-12/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft2020-12/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft2020-12/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft2020-12/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft2020-12/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft2020-12/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft2020-12/prefixItems': {
    'a schema given for prefixItems': {
      'wrong types': true
    },
    'prefixItems with boolean schemas': {
      'array with two items is invalid': true
    }
  },
  'draft2020-12/ref': {
    'relative pointer ref to array': {
      'mismatch array': true
    }
  },
  'draft2020-12/unevaluatedItems': {
    'unevaluatedItems with tuple': {
      'with no unevaluated items': true
    },
    'unevaluatedItems with nested tuple': {
      'with no unevaluated items': true
    },
    'unevaluatedItems with anyOf': {
      'when one schema matches and has no unevaluated items': true,
      'when two schemas match and has no unevaluated items': true
    },
    'unevaluatedItems with oneOf': {
      'with no unevaluated items': true
    },
    'unevaluatedItems with if/then/else': {
      'when if matches and it has no unevaluated items': true,
      "when if doesn't match and it has no unevaluated items": true
    },
    'unevaluatedItems with $ref': {
      'with no unevaluated items': true
    },
    'item is evaluated in an uncle schema to unevaluatedItems': {
      'no extra items': true
    },
    'unevaluatedItems depends on adjacent contains': {
      'second item is evaluated by contains': true
    },
    'unevaluatedItems depends on multiple nested contains': {
      '5 not evaluated, passes unevaluatedItems': true
    },
    'unevaluatedItems and contains interact to control item dependency relationship': {
      "only a's are valid": true,
      "a's and b's are valid": true,
      "a's, b's and c's are valid": true
    }
  },
  'draft2020-12/unevaluatedProperties': {
    "unevaluatedProperties can't see inside cousins": {
      'always fails': true
    },
    'cousin unevaluatedProperties, true and false, true with properties': {
      'with no nested unevaluated properties': true,
      'with nested unevaluated properties': true
    },
    'cousin unevaluatedProperties, true and false, false with properties': {
      'with nested unevaluated properties': true
    },
    'in-place applicator siblings, allOf has unevaluated': {
      'base case: both properties present': true,
      'in place applicator siblings, foo is missing': true
    }
  },
  'draft2020-12/uniqueItems': {
    'uniqueItems with an array of items and additionalItems=false': {
      '[false, true] from items array is valid': true,
      '[true, false] from items array is valid': true
    },
    'uniqueItems=false with an array of items and additionalItems=false': {
      '[false, true] from items array is valid': true,
      '[true, false] from items array is valid': true,
      '[false, false] from items array is valid': true,
      '[true, true] from items array is valid': true
    }
  },
  'draft4/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft4/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft4/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  },
  'draft4/optional/zeroTerminatedFloats': {
    'some languages do not distinguish between different types of numeric value': {
      'a float is not an integer even without fractional part': true
    }
  },
  'draft7/optional/content': {
    'validation of string-encoded content based on media type': {
      'an invalid JSON document': true
    },
    'validation of binary string-encoding': {
      'an invalid base64 string (% is not a valid character)': true
    },
    'validation of binary-encoded media type documents': {
      'a validly-encoded invalid JSON document': true,
      'an invalid base64 string that is valid JSON': true
    }
  },
  'draft7/optional/format/date': {
    'validation of date strings': {
      'a invalid date string with 32 days in January': true,
      'a invalid date string with 29 days in February (normal)': true,
      'a invalid date string with 30 days in February (leap)': true,
      'a invalid date string with 32 days in March': true,
      'a invalid date string with 31 days in April': true,
      'a invalid date string with 32 days in May': true,
      'a invalid date string with 31 days in June': true,
      'a invalid date string with 32 days in July': true,
      'a invalid date string with 32 days in August': true,
      'a invalid date string with 31 days in September': true,
      'a invalid date string with 32 days in October': true,
      'a invalid date string with 31 days in November': true,
      'a invalid date string with 32 days in December': true,
      'a invalid date string with invalid month': true,
      'invalid month': true,
      'invalid month-day combination': true,
      '2021 is not a leap year': true
    }
  },
  'draft7/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
      'an invalid idn e-mail address': true,
      'an invalid e-mail address': true
    }
  },
  'draft7/optional/format/idn-hostname': {
    'validation of internationalized host names': {
      'illegal first char U+302E Hangul single dot tone mark': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
      'a host name with a component too long': true,
      'invalid label, correct Punycode': true,
      'invalid Punycode': true,
      'U-label contains "--" in the 3rd and 4th position': true,
      'U-label starts with a dash': true,
      'U-label ends with a dash': true,
      'U-label starts and ends with a dash': true,
      'Begins with a Spacing Combining Mark': true,
      'Begins with a Nonspacing Mark': true,
      'Begins with an Enclosing Mark': true,
      'Exceptions that are DISALLOWED, right-to-left chars': true,
      'Exceptions that are DISALLOWED, left-to-right chars': true,
      "MIDDLE DOT with no preceding 'l'": true,
      'MIDDLE DOT with nothing preceding': true,
      "MIDDLE DOT with no following 'l'": true,
      'MIDDLE DOT with nothing following': true,
      'Greek KERAIA not followed by Greek': true,
      'Greek KERAIA not followed by anything': true,
      'Hebrew GERESH not preceded by Hebrew': true,
      'Hebrew GERESH not preceded by anything': true,
      'Hebrew GERSHAYIM not preceded by Hebrew': true,
      'Hebrew GERSHAYIM not preceded by anything': true,
      'KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han': true,
      'KATAKANA MIDDLE DOT with no other characters': true,
      'Arabic-Indic digits mixed with Extended Arabic-Indic digits': true,
      'ZERO WIDTH JOINER not preceded by Virama': true,
      'ZERO WIDTH JOINER not preceded by anything': true
    }
  },
  'draft7/optional/format/ipv4': {
    'validation of IP addresses': {
      'leading zeroes should be rejected, as they are treated as octals': true
    }
  },
  'draft7/optional/format/iri-reference': {
    'validation of IRI References': {
      'an invalid IRI Reference': true,
      'an invalid IRI fragment': true
    }
  },
  'draft7/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true
    }
  },
  'draft7/optional/format/time': {
    'validation of time strings': {
      'valid leap second, positive time-offset': true,
      'valid leap second, large positive time-offset': true,
      'invalid leap second, positive time-offset (wrong hour)': true,
      'invalid leap second, positive time-offset (wrong minute)': true,
      'valid leap second, negative time-offset': true,
      'valid leap second, large negative time-offset': true,
      'invalid leap second, negative time-offset (wrong hour)': true,
      'invalid leap second, negative time-offset (wrong minute)': true,
      'an invalid time string with invalid hour': true,
      'an invalid time string with invalid time numoffset hour': true,
      'an invalid time string with invalid time numoffset minute': true
    }
  },
  'draft7/optional/non-bmp-regex': {
    'Proper UTF-16 surrogate pair handling: pattern': {
      'matches empty': true,
      'matches two': true
    },
    'Proper UTF-16 surrogate pair handling: patternProperties': {
      "doesn't match two": true
    }
  },
  'draft7/optional/unicode': {
    'unicode semantics should be used for all pattern matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    },
    'unicode digits are more than 0 through 9': {
      'non-ascii digits (BENGALI DIGIT FOUR, BENGALI DIGIT TWO)': true
    },
    'unicode semantics should be used for all patternProperties matching': {
      'literal unicode character in json string': true,
      'unicode character in hex format in string': true
    }
  }
};
