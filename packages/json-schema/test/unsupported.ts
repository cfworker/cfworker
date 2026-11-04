export const unsupportedTests: Record<
  string,
  Record<string, Record<string, boolean>>
> = {
  'draft2019-09/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
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
      'label starting with a digit before a right-to-left letter is invalid': true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid': true
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
  'draft2020-12/defs': {
    'validate definition against metaschema': {
      'invalid definition schema': true
    }
  },
  'draft2020-12/dynamicRef': {
    'multiple dynamic paths to the $dynamicRef keyword': {
      'number list with string values': true,
      'string list with number values': true
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
      'string matches /$defs/thingy, but the $dynamicRef does not stop here': true,
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
  'draft2020-12/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
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
      'label starting with a digit before a right-to-left letter is invalid': true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid': true
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
  'draft2020-12/ref': {
    'order of evaluation: $id and $anchor and $ref': {
      'data is valid against first definition': true
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
  'draft7/optional/format/idn-email': {
    'validation of an internationalized e-mail addresses': {
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
      'label starting with a digit before a right-to-left letter is invalid': true,
      'left-to-right label containing a right-to-left letter is invalid': true,
      'right-to-left label mixing both digit types is invalid': true,
      'A-label that decodes to a disallowed code point is invalid': true,
      'A-label that decodes to a Bidi rule violation is invalid': true,
      'a U-label whose A-label form is longer than 63 octets is invalid': true,
      'empty label between two dots is invalid': true,
      'a name longer than 253 characters is invalid': true,
      'A-label that decodes to only ASCII is invalid': true,
      'non-canonical Punycode that does not re-encode to itself is invalid': true
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
  'draft2019-09/optional/cross-draft': {
    'refs to historic drafts are processed as historic drafts': {
      'missing bar is valid': true
    }
  },
  'draft2019-09/optional/format/hostname': {
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
  'draft2019-09/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft2019-09/optional/refOfUnknownKeyword': {
    'reference internals of known non-applicator': {
      match: true,
      mismatch: true
    }
  },
  'draft2019-09/ref': {
    'order of evaluation: $id and $anchor and $ref': {
      'data is valid against first definition': true
    }
  },
  'draft2019-09/refRemote': {
    'remote HTTP ref with different $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different URN $id': {
      'number is invalid': true,
      'string is valid': true
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
        'string property fails': true
      }
  },
  'draft2020-12/optional/format/hostname': {
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
  'draft2020-12/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft2020-12/optional/refOfUnknownKeyword': {
    'reference internals of known non-applicator': {
      match: true,
      mismatch: true
    }
  },
  'draft2020-12/refRemote': {
    'remote HTTP ref with different $id': {
      'number is invalid': true,
      'string is valid': true
    },
    'remote HTTP ref with different URN $id': {
      'number is invalid': true,
      'string is valid': true
    }
  },
  'draft2020-12/unevaluatedItems': {
    'unevaluatedItems with $dynamicRef': {
      'with no unevaluated items': true
    }
  },
  'draft2020-12/unevaluatedProperties': {
    'unevaluatedProperties with $dynamicRef': {
      'with no unevaluated properties': true
    }
  },
  'draft2020-12/vocabulary': {
    'schema that uses custom metaschema with with no validation vocabulary': {
      'no validation: invalid number, but it still validates': true
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
  'draft4/ref': {
    '$ref prevents a sibling id from changing the base uri': {
      '$ref resolves to /definitions/base_foo, data does not validate': true,
      '$ref resolves to /definitions/base_foo, data validates': true
    }
  },
  'draft7/optional/format/hostname': {
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
  'draft7/optional/format/uri': {
    'validation of URIs': {
      'non-numeric port is invalid': true,
      'leading zero in an embedded IPv4 address is invalid': true,
      'square brackets are not allowed in a path segment': true,
      'an IPv6 address without enclosing brackets is invalid': true
    }
  },
  'draft7/ref': {
    '$ref prevents a sibling $id from changing the base uri': {
      '$ref resolves to /definitions/base_foo, data does not validate': true,
      '$ref resolves to /definitions/base_foo, data validates': true
    }
  }
};
