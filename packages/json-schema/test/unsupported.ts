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
      'invalid relative-json-pointer string is only an annotation by default':
        true
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
      'an invalid e-mail address': true,
      'an invalid e-mail/idn e-mail address': true,
      'a fullwidth commercial at is not a local-part separator': true,
      'a domain label starting with a hyphen is not valid': true,
      'a domain label ending with a hyphen is not valid': true,
      'a domain starting with a dot is not valid': true,
      'a domain ending with a dot is not valid': true,
      'two subsequent dots inside the domain are not valid': true,
      'domain is required': true
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'a single label of 64 characters is too long': true,
      'empty string': true,
      'trailing newline is invalid': true,
      'leading space is invalid': true,
      'space inside a label is invalid': true,
      'a label of only Arabic-Indic digits is invalid': true,
      'zero width non-joiner must pass at every occurrence': true,
      'Bidi domain name with a digit-first label is invalid': true,
      'label starting with a digit before a right-to-left letter is invalid':
        true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid':
        true
    },
    'validation of separators in internationalized host names': {
      'single dot': true,
      'single ideographic full stop': true,
      'single fullwidth full stop': true,
      'single halfwidth ideographic full stop': true,
      'leading dot': true,
      'leading ideographic full stop': true,
      'leading fullwidth full stop': true,
      'leading halfwidth ideographic full stop': true,
      'trailing dot': true,
      'trailing ideographic full stop': true,
      'trailing fullwidth full stop': true,
      'trailing halfwidth ideographic full stop': true
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
      'an invalid IRI fragment': true,
      'an embedded IPv4 with a leading zero is invalid': true,
      'a trailing newline after a valid IRI Reference is invalid': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true
    }
  },
  'draft2019-09/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true,
      'an IPv6 address without enclosing brackets is invalid': true,
      'an IPv6 host whose embedded IPv4 has a leading zero is invalid': true,
      'a trailing newline after a valid IRI is invalid': true
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
      'an invalid time string with invalid time numoffset minute': true,
      'no time offset': true,
      'no time offset with second fraction': true,
      'a numeric time-offset requires the colon separator': true,
      'a numeric time-offset requires the minutes component': true
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
  'draft2020-12/defs': {
    'validate definition against metaschema': {
      'invalid definition schema': true
    }
  },
  'draft2020-12/dynamicRef': {
    'A $dynamicRef to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef to an $anchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $ref to a $dynamicAnchor in the same schema resource should behave like a normal $ref to an $anchor':
      {
        'An array of strings is valid': true,
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef should resolve to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated':
      {
        'An array containing non-strings is invalid': true
      },
    "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor should not affect dynamic scope resolution":
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor should resolve to the first $dynamicAnchor in the dynamic scope':
      {
        'The recursive part is not valid against the root': true
      },
    'multiple dynamic paths to the $dynamicRef keyword': {
      'recurse to integerNode - floats are not allowed': true,
      'number list with string values': true,
      'string list with number values': true
    },
    'after leaving a dynamic scope, it should not be used by a $dynamicRef': {
      'string matches /$defs/thingy, but the $dynamicRef does not stop here':
        true,
      'first_scope is not in dynamic scope for the $dynamicRef': true
    },
    'A $dynamicRef to a $dynamicAnchor in the same schema resource behaves like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef to an $anchor in the same schema resource behaves like a normal $ref to an $anchor':
      {
        'An array containing non-strings is invalid': true
      },
    'A $ref to a $dynamicAnchor in the same schema resource behaves like a normal $ref to an $anchor':
      {
        'An array of strings is valid': true,
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef resolves to the first $dynamicAnchor still in scope that is encountered when the schema is evaluated':
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef without anchor in fragment behaves identical to $ref': {
      'An array of strings is invalid': true
    },
    "A $dynamicRef with intermediate scopes that don't include a matching $dynamicAnchor does not affect dynamic scope resolution":
      {
        'An array containing non-strings is invalid': true
      },
    'A $dynamicRef that initially resolves to a schema with a matching $dynamicAnchor resolves to the first $dynamicAnchor in the dynamic scope':
      {
        'The recursive part is not valid against the root': true
      },
    'after leaving a dynamic scope, it is not used by a $dynamicRef': {
      'string matches /$defs/thingy, but the $dynamicRef does not stop here':
        true,
      'first_scope is not in dynamic scope for the $dynamicRef': true
    },
    'strict-tree schema, guards against misspelled properties': {
      'instance with misspelled field': true
    },
    'tests for implementation dynamic anchor and reference link': {
      'incorrect extended schema': true
    },
    '$ref and $dynamicAnchor are independent of order - $defs first': {
      'incorrect extended schema': true
    },
    '$ref and $dynamicAnchor are independent of order - $ref first': {
      'incorrect extended schema': true
    },
    '$ref to $dynamicRef finds detached $dynamicAnchor': {
      'number is valid': true,
      'non-number is invalid': true
    },
    '$dynamicRef points to a boolean schema': {
      'follow $dynamicRef to a false schema': true
    },
    '$dynamicRef skips over intermediate resources - direct reference': {
      'string property fails': true
    },
    '$dynamicRef avoids the root of each schema, but scopes are still registered':
      {
        'data is sufficient for schema at second#/$defs/length': true,
        'data is not sufficient for schema at second#/$defs/length': true
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
      'invalid relative-json-pointer string is only an annotation by default':
        true
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
      'an invalid e-mail address': true,
      'an invalid e-mail/idn e-mail address': true,
      'a fullwidth commercial at is not a local-part separator': true,
      'a domain label starting with a hyphen is not valid': true,
      'a domain label ending with a hyphen is not valid': true,
      'a domain starting with a dot is not valid': true,
      'a domain ending with a dot is not valid': true,
      'two subsequent dots inside the domain are not valid': true,
      'domain is required': true
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'a single label of 64 characters is too long': true,
      'empty string': true,
      'trailing newline is invalid': true,
      'leading space is invalid': true,
      'space inside a label is invalid': true,
      'a label of only Arabic-Indic digits is invalid': true,
      'zero width non-joiner must pass at every occurrence': true,
      'Bidi domain name with a digit-first label is invalid': true,
      'label starting with a digit before a right-to-left letter is invalid':
        true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid':
        true
    },
    'validation of separators in internationalized host names': {
      'single dot': true,
      'single ideographic full stop': true,
      'single fullwidth full stop': true,
      'single halfwidth ideographic full stop': true,
      'leading dot': true,
      'leading ideographic full stop': true,
      'leading fullwidth full stop': true,
      'leading halfwidth ideographic full stop': true,
      'trailing dot': true,
      'trailing ideographic full stop': true,
      'trailing fullwidth full stop': true,
      'trailing halfwidth ideographic full stop': true
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
      'an invalid IRI fragment': true,
      'an embedded IPv4 with a leading zero is invalid': true,
      'a trailing newline after a valid IRI Reference is invalid': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true
    }
  },
  'draft2020-12/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true,
      'an IPv6 address without enclosing brackets is invalid': true,
      'an IPv6 host whose embedded IPv4 has a leading zero is invalid': true,
      'a trailing newline after a valid IRI is invalid': true
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
      'an invalid time string with invalid time numoffset minute': true,
      'no time offset': true,
      'no time offset with second fraction': true,
      'a numeric time-offset requires the colon separator': true,
      'a numeric time-offset requires the minutes component': true
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
  'draft2020-12/ref': {
    'relative pointer ref to array': {
      'mismatch array': true
    },
    'root pointer ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    'remote ref, containing refs itself': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'refs with relative uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'relative refs with absolute uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'order of evaluation: $id and $anchor and $ref': {
      'data is valid against first definition': true
    },
    'simple URN base URI with JSON pointer': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with NSS': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with r-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with q-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with URN and JSON pointer ref': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN ref with nested pointer ref': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    '$id with file URI still resolves pointers - *nix': {
      'number is valid': true,
      'non-number is invalid': true
    },
    '$id with file URI still resolves pointers - windows': {
      'number is valid': true,
      'non-number is invalid': true
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
    'some languages do not distinguish between different types of numeric value':
      {
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
      'an invalid e-mail address': true,
      'an invalid e-mail/idn e-mail address': true,
      'a fullwidth commercial at is not a local-part separator': true,
      'a domain label starting with a hyphen is not valid': true,
      'a domain label ending with a hyphen is not valid': true,
      'a domain starting with a dot is not valid': true,
      'a domain ending with a dot is not valid': true,
      'two subsequent dots inside the domain are not valid': true,
      'domain is required': true
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'a single label of 64 characters is too long': true,
      'empty string': true,
      'trailing newline is invalid': true,
      'leading space is invalid': true,
      'space inside a label is invalid': true,
      'a label of only Arabic-Indic digits is invalid': true,
      'zero width non-joiner must pass at every occurrence': true,
      'Bidi domain name with a digit-first label is invalid': true,
      'label starting with a digit before a right-to-left letter is invalid':
        true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid':
        true
    },
    'validation of separators in internationalized host names': {
      'single dot': true,
      'single ideographic full stop': true,
      'single fullwidth full stop': true,
      'single halfwidth ideographic full stop': true,
      'leading dot': true,
      'leading ideographic full stop': true,
      'leading fullwidth full stop': true,
      'leading halfwidth ideographic full stop': true,
      'trailing dot': true,
      'trailing ideographic full stop': true,
      'trailing fullwidth full stop': true,
      'trailing halfwidth ideographic full stop': true
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
      'an invalid IRI fragment': true,
      'an embedded IPv4 with a leading zero is invalid': true,
      'a trailing newline after a valid IRI Reference is invalid': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true
    }
  },
  'draft7/optional/format/iri': {
    'validation of IRIs': {
      'an invalid IRI based on IPv6': true,
      'an invalid relative IRI Reference': true,
      'an invalid IRI': true,
      'an invalid IRI though valid IRI reference': true,
      'invalid percent-encoding with non-hex digits': true,
      'incomplete percent-encoding triplet': true,
      'lone percent sign is invalid': true,
      'an IPv6 address without enclosing brackets is invalid': true,
      'an IPv6 host whose embedded IPv4 has a leading zero is invalid': true,
      'a trailing newline after a valid IRI is invalid': true
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
      'an invalid time string with invalid time numoffset minute': true,
      'no time offset': true,
      'no time offset with second fraction': true,
      'a numeric time-offset requires the colon separator': true,
      'a numeric time-offset requires the minutes component': true
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
  },
  'draft2019-09/defs': {
    'validate definition against metaschema': {
      'valid definition schema': true,
      'invalid definition schema': true
    }
  },
  'draft2019-09/optional/cross-draft': {
    'refs to historic drafts are processed as historic drafts': {
      'missing bar is valid': true
    }
  },
  'draft2019-09/optional/format/date-time': {
    'validation of date-time strings': {
      'a valid date-time with a leap second, with minus offset': true,
      'an invalid offset in date-time string': true,
      'an invalid offset minute in date-time string': true,
      'a numeric offset without minutes is invalid': true
    }
  },
  'draft2019-09/optional/format/duration': {
    'validation of duration strings': {
      'fractional duration is not allowed by RFC 3339 ABNF': true,
      'years and days cannot appear without months': true,
      'hours and seconds cannot appear without minutes': true,
      'a component with many digits is valid': true,
      'a comma as the decimal separator is invalid': true
    }
  },
  'draft2019-09/optional/format/email': {
    'validation of e-mail addresses': {
      'a quoted string with a space in the local part is valid': true,
      'a quoted string with a double dot in the local part is valid': true,
      'a quoted string with a @ in the local part is valid': true,
      'an IPv4-address-literal after the @ is valid': true,
      'an IPv6-address-literal after the @ is valid': true,
      'an empty quoted string in the local part is valid': true,
      'a quoted string containing only a space in the local part is valid':
        true,
      'a quoted string with no special characters in the local part is valid':
        true,
      'a quoted pair in the local part is valid': true,
      'an escaped double quote in the local part is valid': true,
      'an escaped backslash in the local part is valid': true,
      'a lowercase IPv6 tag in an address literal is valid': true
    }
  },
  'draft2019-09/optional/format/hostname': {
    'validation of host names': {
      'trailing dot': true
    },
    'validation of A-label (punycode) host names': {
      'invalid Punycode': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'contains "--" in the 3rd and 4th position': true
    }
  },
  'draft2019-09/optional/format/uri-reference': {
    'validation of URI References': {
      'a double quote in a path': true,
      'square brackets outside an authority': true,
      'a non-numeric port in a network-path reference': true,
      'more than one at-sign in the authority': true,
      'a leading zero in the IPv4 part of an IPv6 literal': true,
      'a colon in the first segment of a relative-path reference': true
    }
  },
  'draft2019-09/optional/format/uri-template': {
    'format: uri-template': {
      'a dotted variable name is valid': true,
      'a delete character in a literal is invalid': true,
      'an apostrophe in a literal is valid': true
    }
  },
  'draft2019-09/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft2019-09/optional/format/uuid': {
    'uuid format': {
      'URN prefixed UUID is invalid': true
    }
  },
  'draft2019-09/optional/refOfUnknownKeyword': {
    'reference internals of known non-applicator': {
      match: true,
      mismatch: true
    }
  },
  'draft2019-09/properties': {
    'properties whose names are Javascript object property names': {
      'none of the properties mentioned': true
    }
  },
  'draft2019-09/recursiveRef': {
    '$recursiveRef without $recursiveAnchor works like $ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    '$recursiveRef without using nesting': {
      'integer matches at the outer level': true,
      'single level match': true,
      'integer does not match as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, no match': true
    },
    '$recursiveRef with nesting': {
      'integer matches at the outer level': true,
      'single level match': true,
      'integer now matches as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, properties match with $recursiveRef': true
    },
    '$recursiveRef with $recursiveAnchor: false works like $ref': {
      'integer matches at the outer level': true,
      'single level match': true,
      'integer does not match as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, integer does not match as a property value': true
    },
    '$recursiveRef with no $recursiveAnchor works like $ref': {
      'integer matches at the outer level': true,
      'single level match': true,
      'integer does not match as a property value': true,
      'two levels, properties match with inner definition': true,
      'two levels, integer does not match as a property value': true
    },
    'dynamic $recursiveRef destination (not predictable at schema compile time)':
      {
        'numeric node': true,
        'integer node': true
      }
  },
  'draft2019-09/ref': {
    'root pointer ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    'remote ref, containing refs itself': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'refs with relative uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'relative refs with absolute uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'order of evaluation: $id and $anchor and $ref': {
      'data is valid against first definition': true
    },
    'simple URN base URI with JSON pointer': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with NSS': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with r-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with q-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with URN and JSON pointer ref': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN ref with nested pointer ref': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    '$id with file URI still resolves pointers - *nix': {
      'number is valid': true,
      'non-number is invalid': true
    },
    '$id with file URI still resolves pointers - windows': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft2019-09/refRemote': {
    'remote ref': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'base URI change': {
      'base URI change ref valid': true,
      'base URI change ref invalid': true
    },
    'base URI change - change folder': {
      'number is valid': true,
      'string is invalid': true
    },
    'base URI change - change folder in subschema': {
      'number is valid': true,
      'string is invalid': true
    },
    'root ref in remote ref': {
      'string is valid': true,
      'null is valid': true,
      'object is invalid': true
    },
    'remote ref with ref to defs': {
      invalid: true,
      valid: true
    },
    'retrieved nested refs resolve relative to their URI not $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different URN $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with nested absolute ref': {
      'number is invalid': true,
      'string is valid': true
    },
    '$ref to $ref finds detached $anchor': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft2019-09/required': {
    'required properties whose names are Javascript object property names': {
      'none of the properties mentioned': true,
      '__proto__ present': true,
      'toString present': true,
      'constructor present': true
    }
  },
  'draft2019-09/unevaluatedItems': {
    'unevaluatedItems can see annotations from if without then and else': {
      'invalid in case if is evaluated': true
    }
  },
  'draft2019-09/unevaluatedProperties': {
    'unevaluatedProperties + single cyclic ref': {
      'Single is valid': true,
      'Unevaluated on 1st level is invalid': true,
      'Nested is valid': true,
      'Unevaluated on 2nd level is invalid': true,
      'Deep nested is valid': true,
      'Unevaluated on 3rd level is invalid': true
    }
  },
  'draft2019-09/vocabulary': {
    'schema that uses custom metaschema with with no validation vocabulary': {
      'no validation: invalid number, but it still validates': true
    }
  },
  'draft2020-12/optional/cross-draft': {
    'refs to historic drafts are processed as historic drafts': {
      'first item not a string is valid': true
    }
  },
  'draft2020-12/optional/dynamicRef': {
    '$dynamicRef skips over intermediate resources - pointer reference across resource boundary':
      {
        'integer property passes': true,
        'string property fails': true
      }
  },
  'draft2020-12/optional/format/date-time': {
    'validation of date-time strings': {
      'a valid date-time with a leap second, with minus offset': true,
      'an invalid offset in date-time string': true,
      'an invalid offset minute in date-time string': true,
      'a numeric offset without minutes is invalid': true
    }
  },
  'draft2020-12/optional/format/duration': {
    'validation of duration strings': {
      'fractional duration is not allowed by RFC 3339 ABNF': true,
      'years and days cannot appear without months': true,
      'hours and seconds cannot appear without minutes': true,
      'a component with many digits is valid': true,
      'a comma as the decimal separator is invalid': true
    }
  },
  'draft2020-12/optional/format/email': {
    'validation of e-mail addresses': {
      'a quoted string with a space in the local part is valid': true,
      'a quoted string with a double dot in the local part is valid': true,
      'a quoted string with a @ in the local part is valid': true,
      'an IPv4-address-literal after the @ is valid': true,
      'an IPv6-address-literal after the @ is valid': true,
      'an empty quoted string in the local part is valid': true,
      'a quoted string containing only a space in the local part is valid':
        true,
      'a quoted string with no special characters in the local part is valid':
        true,
      'a quoted pair in the local part is valid': true,
      'an escaped double quote in the local part is valid': true,
      'an escaped backslash in the local part is valid': true,
      'a lowercase IPv6 tag in an address literal is valid': true
    }
  },
  'draft2020-12/optional/format/hostname': {
    'validation of host names': {
      'trailing dot': true
    },
    'validation of A-label (punycode) host names': {
      'invalid Punycode': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'contains "--" in the 3rd and 4th position': true
    }
  },
  'draft2020-12/optional/format/uri-reference': {
    'validation of URI References': {
      'a double quote in a path': true,
      'square brackets outside an authority': true,
      'a non-numeric port in a network-path reference': true,
      'more than one at-sign in the authority': true,
      'a leading zero in the IPv4 part of an IPv6 literal': true,
      'a colon in the first segment of a relative-path reference': true
    }
  },
  'draft2020-12/optional/format/uri-template': {
    'format: uri-template': {
      'a dotted variable name is valid': true,
      'a delete character in a literal is invalid': true,
      'an apostrophe in a literal is valid': true
    }
  },
  'draft2020-12/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft2020-12/optional/format/uuid': {
    'uuid format': {
      'URN prefixed UUID is invalid': true
    }
  },
  'draft2020-12/optional/refOfUnknownKeyword': {
    'reference internals of known non-applicator': {
      match: true,
      mismatch: true
    }
  },
  'draft2020-12/properties': {
    'properties whose names are Javascript object property names': {
      'none of the properties mentioned': true
    }
  },
  'draft2020-12/refRemote': {
    'remote ref': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'base URI change': {
      'base URI change ref valid': true,
      'base URI change ref invalid': true
    },
    'base URI change - change folder': {
      'number is valid': true,
      'string is invalid': true
    },
    'base URI change - change folder in subschema': {
      'number is valid': true,
      'string is invalid': true
    },
    'root ref in remote ref': {
      'string is valid': true,
      'null is valid': true,
      'object is invalid': true
    },
    'remote ref with ref to defs': {
      invalid: true,
      valid: true
    },
    'retrieved nested refs resolve relative to their URI not $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different URN $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with nested absolute ref': {
      'number is invalid': true,
      'string is valid': true
    },
    '$ref to $ref finds detached $anchor': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft2020-12/required': {
    'required properties whose names are Javascript object property names': {
      'none of the properties mentioned': true,
      '__proto__ present': true,
      'toString present': true,
      'constructor present': true
    }
  },
  'draft2020-12/unevaluatedItems': {
    'unevaluatedItems with $dynamicRef': {
      'with no unevaluated items': true
    },
    'unevaluatedItems can see annotations from if without then and else': {
      'invalid in case if is evaluated': true
    }
  },
  'draft2020-12/unevaluatedProperties': {
    'unevaluatedProperties with $dynamicRef': {
      'with no unevaluated properties': true
    },
    'unevaluatedProperties + single cyclic ref': {
      'Single is valid': true,
      'Unevaluated on 1st level is invalid': true,
      'Nested is valid': true,
      'Unevaluated on 2nd level is invalid': true,
      'Deep nested is valid': true,
      'Unevaluated on 3rd level is invalid': true
    }
  },
  'draft2020-12/vocabulary': {
    'schema that uses custom metaschema with with no validation vocabulary': {
      'no validation: invalid number, but it still validates': true
    }
  },
  'draft4/definitions': {
    'validate definition against metaschema': {
      'valid definition schema': true,
      'invalid definition schema': true
    }
  },
  'draft4/optional/format/date-time': {
    'validation of date-time strings': {
      'a valid date-time with a leap second, with minus offset': true,
      'an invalid offset minute in date-time string': true,
      'an invalid offset in date-time string': true,
      'a numeric offset without minutes is invalid': true
    }
  },
  'draft4/optional/format/email': {
    'validation of e-mail addresses': {
      'a quoted string with a space in the local part is valid': true,
      'a quoted string with a double dot in the local part is valid': true,
      'a quoted string with a @ in the local part is valid': true,
      'an IPv4-address-literal after the @ is valid': true,
      'an IPv6-address-literal after the @ is valid': true,
      'an empty quoted string in the local part is valid': true,
      'a quoted string containing only a space in the local part is valid':
        true,
      'a quoted string with no special characters in the local part is valid':
        true,
      'a quoted pair in the local part is valid': true,
      'an escaped double quote in the local part is valid': true,
      'an escaped backslash in the local part is valid': true,
      'a lowercase IPv6 tag in an address literal is valid': true
    }
  },
  'draft4/optional/format/hostname': {
    'validation of host names': {
      'trailing dot': true
    }
  },
  'draft4/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft4/properties': {
    'properties whose names are Javascript object property names': {
      'none of the properties mentioned': true
    }
  },
  'draft4/ref': {
    'root pointer ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    '$ref prevents a sibling id from changing the base uri': {
      '$ref resolves to /definitions/base_foo, data does not validate': true,
      '$ref resolves to /definitions/base_foo, data validates': true
    },
    'remote ref, containing refs itself': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'id with file URI still resolves pointers - *nix': {
      'number is valid': true,
      'non-number is invalid': true
    },
    'id with file URI still resolves pointers - windows': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft4/refRemote': {
    'remote ref': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'base URI change': {
      'base URI change ref valid': true,
      'base URI change ref invalid': true
    },
    'base URI change - change folder': {
      'number is valid': true,
      'string is invalid': true
    },
    'base URI change - change folder in subschema': {
      'number is valid': true,
      'string is invalid': true
    },
    'root ref in remote ref': {
      'string is valid': true,
      'null is valid': true,
      'object is invalid': true
    }
  },
  'draft4/required': {
    'required properties whose names are Javascript object property names': {
      'none of the properties mentioned': true,
      '__proto__ present': true,
      'toString present': true,
      'constructor present': true
    }
  },
  'draft7/definitions': {
    'validate definition against metaschema': {
      'valid definition schema': true,
      'invalid definition schema': true
    }
  },
  'draft7/optional/format/date-time': {
    'validation of date-time strings': {
      'a valid date-time with a leap second, with minus offset': true,
      'an invalid offset minute in date-time string': true,
      'an invalid offset in date-time string': true,
      'a numeric offset without minutes is invalid': true
    }
  },
  'draft7/optional/format/email': {
    'validation of e-mail addresses': {
      'a quoted string with a space in the local part is valid': true,
      'a quoted string with a double dot in the local part is valid': true,
      'a quoted string with a @ in the local part is valid': true,
      'an IPv4-address-literal after the @ is valid': true,
      'an IPv6-address-literal after the @ is valid': true,
      'an empty quoted string in the local part is valid': true,
      'a quoted string containing only a space in the local part is valid':
        true,
      'a quoted string with no special characters in the local part is valid':
        true,
      'a quoted pair in the local part is valid': true,
      'an escaped double quote in the local part is valid': true,
      'an escaped backslash in the local part is valid': true,
      'a lowercase IPv6 tag in an address literal is valid': true
    }
  },
  'draft7/optional/format/hostname': {
    'validation of host names': {
      'trailing dot': true
    },
    'validation of A-label (punycode) host names': {
      'invalid Punycode': true,
      'contains illegal char U+302E Hangul single dot tone mark': true,
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
      'ZERO WIDTH JOINER not preceded by anything': true,
      'contains "--" in the 3rd and 4th position': true
    }
  },
  'draft7/optional/format/uri-reference': {
    'validation of URI References': {
      'a double quote in a path': true,
      'square brackets outside an authority': true,
      'a non-numeric port in a network-path reference': true,
      'more than one at-sign in the authority': true,
      'a leading zero in the IPv4 part of an IPv6 literal': true,
      'a colon in the first segment of a relative-path reference': true
    }
  },
  'draft7/optional/format/uri-template': {
    'format: uri-template': {
      'a dotted variable name is valid': true,
      'a delete character in a literal is invalid': true,
      'an apostrophe in a literal is valid': true
    }
  },
  'draft7/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft7/properties': {
    'properties whose names are Javascript object property names': {
      'none of the properties mentioned': true
    }
  },
  'draft7/ref': {
    'root pointer ref': {
      match: true,
      'recursive match': true,
      'recursive mismatch': true
    },
    '$ref prevents a sibling $id from changing the base uri': {
      '$ref resolves to /definitions/base_foo, data does not validate': true,
      '$ref resolves to /definitions/base_foo, data validates': true
    },
    'remote ref, containing refs itself': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'refs with relative uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'relative refs with absolute uris and defs': {
      'invalid on inner field': true,
      'invalid on outer field': true,
      'valid on both fields': true
    },
    'simple URN base URI with JSON pointer': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with NSS': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with r-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with q-component': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    'URN base URI with URN and JSON pointer ref': {
      'a string is valid': true,
      'a non-string is invalid': true
    },
    '$id with file URI still resolves pointers - *nix': {
      'number is valid': true,
      'non-number is invalid': true
    },
    '$id with file URI still resolves pointers - windows': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft7/refRemote': {
    'remote ref': {
      'remote ref valid': true,
      'remote ref invalid': true
    },
    'base URI change': {
      'base URI change ref valid': true,
      'base URI change ref invalid': true
    },
    'base URI change - change folder': {
      'number is valid': true,
      'string is invalid': true
    },
    'base URI change - change folder in subschema': {
      'number is valid': true,
      'string is invalid': true
    },
    'root ref in remote ref': {
      'string is valid': true,
      'null is valid': true,
      'object is invalid': true
    },
    'remote ref with ref to definitions': {
      invalid: true,
      valid: true
    },
    'retrieved nested refs resolve relative to their URI not $id': {
      'number is invalid': true,
      'string is valid': true
    },
    '$ref to $ref finds location-independent $id': {
      'number is valid': true,
      'non-number is invalid': true
    }
  },
  'draft7/required': {
    'required properties whose names are Javascript object property names': {
      'none of the properties mentioned': true,
      '__proto__ present': true,
      'toString present': true,
      'constructor present': true
    }
  }
};
