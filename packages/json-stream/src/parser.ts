import { utf8Slice } from './utf8-slice';

// Ported from https://github.com/creationix/jsonparse

// Tokens
const LEFT_BRACE = 0x1;
const RIGHT_BRACE = 0x2;
const LEFT_BRACKET = 0x3;
const RIGHT_BRACKET = 0x4;
const COLON = 0x5;
const COMMA = 0x6;
const TRUE = 0x7;
const FALSE = 0x8;
const NULL = 0x9;
const STRING = 0xa;
const NUMBER = 0xb;
type Token =
  | typeof LEFT_BRACE
  | typeof RIGHT_BRACE
  | typeof LEFT_BRACKET
  | typeof RIGHT_BRACKET
  | typeof COLON
  | typeof COMMA
  | typeof TRUE
  | typeof FALSE
  | typeof NULL
  | typeof STRING
  | typeof NUMBER;
// Tokenizer States
const START = 0x11;
const STOP = 0x12;
const TRUE1 = 0x21;
const TRUE2 = 0x22;
const TRUE3 = 0x23;
const FALSE1 = 0x31;
const FALSE2 = 0x32;
const FALSE3 = 0x33;
const FALSE4 = 0x34;
const NULL1 = 0x41;
const NULL2 = 0x42;
const NULL3 = 0x43;
const NUMBER1 = 0x51;
const NUMBER3 = 0x53;
const STRING1 = 0x61;
const STRING2 = 0x62;
const STRING3 = 0x63;
const STRING4 = 0x64;
const STRING5 = 0x65;
const STRING6 = 0x66;
type TokenizerState =
  | typeof START
  | typeof STOP
  | typeof TRUE1
  | typeof TRUE2
  | typeof TRUE3
  | typeof FALSE1
  | typeof FALSE2
  | typeof FALSE3
  | typeof FALSE4
  | typeof NULL1
  | typeof NULL2
  | typeof NULL3
  | typeof NUMBER1
  | typeof NUMBER3
  | typeof STRING1
  | typeof STRING2
  | typeof STRING3
  | typeof STRING4
  | typeof STRING5
  | typeof STRING6;
// Parser States
const VALUE = 0x71;
const KEY = 0x72;
type ParserState = typeof VALUE | typeof KEY;
// Parser Modes
const OBJECT = 0x81;
const ARRAY = 0x82;
type ParserMode = typeof OBJECT | typeof ARRAY;

// Character constants
const BACK_SLASH = '\\'.charCodeAt(0);
const FORWARD_SLASH = '/'.charCodeAt(0);
const BACKSPACE = '\b'.charCodeAt(0);
const FORM_FEED = '\f'.charCodeAt(0);
const NEWLINE = '\n'.charCodeAt(0);
const CARRIAGE_RETURN = '\r'.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);

const STRING_BUFFER_SIZE = 64 * 1024;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const C: Record<string, Token | TokenizerState | ParserState | ParserMode> = {
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  COLON,
  COMMA,
  TRUE,
  FALSE,
  NULL,
  STRING,
  NUMBER,
  START,
  STOP,
  TRUE1,
  TRUE2,
  TRUE3,
  FALSE1,
  FALSE2,
  FALSE3,
  FALSE4,
  NULL1,
  NULL2,
  NULL3,
  NUMBER1,
  NUMBER3,
  STRING1,
  STRING2,
  STRING3,
  STRING4,
  STRING5,
  STRING6
};

export class Parser {
  static C = C;
  public offset: number;
  public key: any;
  public stack: any[];
  private tState: TokenizerState;
  private value: any;
  private string: string | undefined;
  private stringBuffer: Uint8Array;
  private stringBufferOffset: number;
  private unicode: any;
  private highSurrogate: any;
  private mode: any;
  private state: ParserState | Token;
  private bytes_remaining: number;
  private bytes_in_sequence: number;
  private temp_buffs: Record<number, Uint8Array>;

  constructor() {
    this.tState = START;
    this.value = undefined;

    this.string = undefined; // string data
    this.stringBuffer = new Uint8Array(STRING_BUFFER_SIZE);
    this.stringBufferOffset = 0;
    this.unicode = undefined; // unicode escapes
    this.highSurrogate = undefined;

    this.key = undefined;
    this.mode = undefined;
    this.stack = [];
    this.state = VALUE;
    this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
    this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
    this.temp_buffs = {
      '2': new Uint8Array(2),
      '3': new Uint8Array(3),
      '4': new Uint8Array(4)
    }; // for rebuilding chars split before boundary is reached

    // Stream offset
    this.offset = -1;
  }

  // Slow code to string converter (only used when throwing syntax errors)
  static toknam(code: number) {
    const keys = Object.keys(C);
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      if (C[key] === code) {
        return key;
      }
    }
    return code && '0x' + code.toString(16);
  }

  onError(err: Error) {
    throw err;
  }

  charError(buffer: Uint8Array, i: number) {
    this.tState = STOP;
    this.onError(
      new Error(
        'Unexpected ' +
          JSON.stringify(String.fromCharCode(buffer[i])) +
          ' at position ' +
          i +
          ' in state ' +
          Parser.toknam(this.tState)
      )
    );
  }

  appendStringChar(char: number) {
    if (this.stringBufferOffset >= STRING_BUFFER_SIZE) {
      this.string += textDecoder.decode(this.stringBuffer);
      this.stringBufferOffset = 0;
    }

    this.stringBuffer[this.stringBufferOffset++] = char;
  }

  appendStringBuf(buf: Uint8Array, start?: number, end?: number) {
    let size = buf.length;
    if (typeof start === 'number') {
      if (typeof end === 'number') {
        if (end < 0) {
          // adding a negative end decreeses the size
          size = buf.length - start + end;
        } else {
          size = end - start;
        }
      } else {
        size = buf.length - start;
      }
    }

    if (size < 0) {
      size = 0;
    }

    if (this.stringBufferOffset + size > STRING_BUFFER_SIZE) {
      this.string += utf8Slice(this.stringBuffer, 0, this.stringBufferOffset);
      this.stringBufferOffset = 0;
    }
    this.stringBuffer.set(buf.subarray(start, end), this.stringBufferOffset);
    this.stringBufferOffset += size;
  }

  write(buffer: Uint8Array | string) {
    if (typeof buffer === 'string') {
      buffer = textEncoder.encode(buffer);
    }
    let n;
    for (let i = 0, l = buffer.length; i < l; i++) {
      if (this.tState === START) {
        n = buffer[i];
        this.offset++;
        if (n === 0x7b) {
          this.onToken(LEFT_BRACE, '{'); // {
        } else if (n === 0x7d) {
          this.onToken(RIGHT_BRACE, '}'); // }
        } else if (n === 0x5b) {
          this.onToken(LEFT_BRACKET, '['); // [
        } else if (n === 0x5d) {
          this.onToken(RIGHT_BRACKET, ']'); // ]
        } else if (n === 0x3a) {
          this.onToken(COLON, ':'); // :
        } else if (n === 0x2c) {
          this.onToken(COMMA, ','); // ,
        } else if (n === 0x74) {
          this.tState = TRUE1; // t
        } else if (n === 0x66) {
          this.tState = FALSE1; // f
        } else if (n === 0x6e) {
          this.tState = NULL1; // n
        } else if (n === 0x22) {
          // "
          this.string = '';
          this.stringBufferOffset = 0;
          this.tState = STRING1;
        } else if (n === 0x2d) {
          this.string = '-';
          this.tState = NUMBER1; // -
        } else {
          if (n >= 0x30 && n < 0x40) {
            // 1-9
            this.string = String.fromCharCode(n);
            this.tState = NUMBER3;
          } else if (n === 0x20 || n === 0x09 || n === 0x0a || n === 0x0d) {
            // whitespace
          } else {
            return this.charError(buffer, i);
          }
        }
      } else if (this.tState === STRING1) {
        // After open quote
        n = buffer[i]; // get current byte from buffer
        // check for carry over of a multi byte char split between data chunks
        // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
        if (this.bytes_remaining > 0) {
          let j: number;
          for (j = 0; j < this.bytes_remaining; j++) {
            this.temp_buffs[this.bytes_in_sequence][
              this.bytes_in_sequence - this.bytes_remaining + j
            ] = buffer[j];
          }

          this.appendStringBuf(this.temp_buffs[this.bytes_in_sequence]);
          this.bytes_in_sequence = this.bytes_remaining = 0;
          i = i + j - 1;
        } else if (this.bytes_remaining === 0 && n >= 128) {
          // else if no remainder bytes carried over, parse multi byte (>=128) chars one at a time
          if (n <= 193 || n > 244) {
            return this.onError(
              new Error(
                'Invalid UTF-8 character at position ' +
                  i +
                  ' in state ' +
                  Parser.toknam(this.tState)
              )
            );
          }
          if (n >= 194 && n <= 223) this.bytes_in_sequence = 2;
          if (n >= 224 && n <= 239) this.bytes_in_sequence = 3;
          if (n >= 240 && n <= 244) this.bytes_in_sequence = 4;
          if (this.bytes_in_sequence + i > buffer.length) {
            // if bytes needed to complete char fall outside buffer length, we have a boundary split
            for (let k = 0; k <= buffer.length - 1 - i; k++) {
              this.temp_buffs[this.bytes_in_sequence][k] = buffer[i + k]; // fill temp buffer of correct size with bytes available in this chunk
            }
            this.bytes_remaining = i + this.bytes_in_sequence - buffer.length;
            i = buffer.length - 1;
          } else {
            this.appendStringBuf(buffer, i, i + this.bytes_in_sequence);
            i = i + this.bytes_in_sequence - 1;
          }
        } else if (n === 0x22) {
          this.tState = START;
          this.string += utf8Slice(
            this.stringBuffer,
            0,
            this.stringBufferOffset
          );
          this.stringBufferOffset = 0;
          this.onToken(STRING, this.string);
          this.offset += textEncoder.encode(this.string).byteLength + 1;
          this.string = undefined;
        } else if (n === 0x5c) {
          this.tState = STRING2;
        } else if (n >= 0x20) {
          this.appendStringChar(n);
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === STRING2) {
        // After backslash
        n = buffer[i];
        if (n === 0x22) {
          this.appendStringChar(n);
          this.tState = STRING1;
        } else if (n === 0x5c) {
          this.appendStringChar(BACK_SLASH);
          this.tState = STRING1;
        } else if (n === 0x2f) {
          this.appendStringChar(FORWARD_SLASH);
          this.tState = STRING1;
        } else if (n === 0x62) {
          this.appendStringChar(BACKSPACE);
          this.tState = STRING1;
        } else if (n === 0x66) {
          this.appendStringChar(FORM_FEED);
          this.tState = STRING1;
        } else if (n === 0x6e) {
          this.appendStringChar(NEWLINE);
          this.tState = STRING1;
        } else if (n === 0x72) {
          this.appendStringChar(CARRIAGE_RETURN);
          this.tState = STRING1;
        } else if (n === 0x74) {
          this.appendStringChar(TAB);
          this.tState = STRING1;
        } else if (n === 0x75) {
          this.unicode = '';
          this.tState = STRING3;
        } else {
          return this.charError(buffer, i);
        }
      } else if (
        this.tState === STRING3 ||
        this.tState === STRING4 ||
        this.tState === STRING5 ||
        this.tState === STRING6
      ) {
        // unicode hex codes
        n = buffer[i];
        // 0-9 A-F a-f
        if (
          (n >= 0x30 && n < 0x40) ||
          (n > 0x40 && n <= 0x46) ||
          (n > 0x60 && n <= 0x66)
        ) {
          this.unicode += String.fromCharCode(n);
          if (this.tState++ === STRING6) {
            const intVal = parseInt(this.unicode, 16);
            this.unicode = undefined;
            if (
              this.highSurrogate !== undefined &&
              intVal >= 0xdc00 &&
              intVal < 0xdfff + 1
            ) {
              //<56320,57343> - lowSurrogate
              this.appendStringBuf(
                textEncoder.encode(
                  String.fromCharCode(this.highSurrogate, intVal)
                )
              );
              this.highSurrogate = undefined;
            } else if (
              this.highSurrogate === undefined &&
              intVal >= 0xd800 &&
              intVal < 0xdbff + 1
            ) {
              //<55296,56319> - highSurrogate
              this.highSurrogate = intVal;
            } else {
              if (this.highSurrogate !== undefined) {
                this.appendStringBuf(
                  textEncoder.encode(String.fromCharCode(this.highSurrogate))
                );
                this.highSurrogate = undefined;
              }
              this.appendStringBuf(
                textEncoder.encode(String.fromCharCode(intVal))
              );
            }
            this.tState = STRING1;
          }
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === NUMBER1 || this.tState === NUMBER3) {
        n = buffer[i];

        switch (n) {
          case 0x30: // 0
          case 0x31: // 1
          case 0x32: // 2
          case 0x33: // 3
          case 0x34: // 4
          case 0x35: // 5
          case 0x36: // 6
          case 0x37: // 7
          case 0x38: // 8
          case 0x39: // 9
          case 0x2e: // .
          case 0x65: // e
          case 0x45: // E
          case 0x2b: // +
          case 0x2d: // -
            this.string += String.fromCharCode(n);
            this.tState = NUMBER3;
            break;
          default:
            this.tState = START;
            const error = this.numberReviver(this.string!, buffer, i);
            if (error) {
              return error;
            }

            this.offset += this.string!.length - 1;
            this.string = undefined;
            i--;
            break;
        }
      } else if (this.tState === TRUE1) {
        // r
        if (buffer[i] === 0x72) {
          this.tState = TRUE2;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === TRUE2) {
        // u
        if (buffer[i] === 0x75) {
          this.tState = TRUE3;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === TRUE3) {
        // e
        if (buffer[i] === 0x65) {
          this.tState = START;
          this.onToken(TRUE, true);
          this.offset += 3;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === FALSE1) {
        // a
        if (buffer[i] === 0x61) {
          this.tState = FALSE2;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === FALSE2) {
        // l
        if (buffer[i] === 0x6c) {
          this.tState = FALSE3;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === FALSE3) {
        // s
        if (buffer[i] === 0x73) {
          this.tState = FALSE4;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === FALSE4) {
        // e
        if (buffer[i] === 0x65) {
          this.tState = START;
          this.onToken(FALSE, false);
          this.offset += 4;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === NULL1) {
        // u
        if (buffer[i] === 0x75) {
          this.tState = NULL2;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === NULL2) {
        // l
        if (buffer[i] === 0x6c) {
          this.tState = NULL3;
        } else {
          return this.charError(buffer, i);
        }
      } else if (this.tState === NULL3) {
        // l
        if (buffer[i] === 0x6c) {
          this.tState = START;
          this.onToken(NULL, null);
          this.offset += 3;
        } else {
          return this.charError(buffer, i);
        }
      }
    }
  }

  parseError(token: Token, value: any) {
    this.tState = STOP;
    this.onError(
      new Error(
        'Unexpected ' +
          Parser.toknam(token) +
          (value ? '(' + JSON.stringify(value) + ')' : '') +
          ' in state ' +
          Parser.toknam(this.state)
      )
    );
  }

  push() {
    this.stack.push({ value: this.value, key: this.key, mode: this.mode });
  }

  pop() {
    const value = this.value;
    const parent = this.stack.pop();
    this.value = parent.value;
    this.key = parent.key;
    this.mode = parent.mode;
    this.emit(value);
    if (!this.mode) {
      this.state = VALUE;
    }
  }

  emit(value: any) {
    if (this.mode) {
      this.state = COMMA;
    }
    this.onValue(value);
  }

  // @ts-ignore
  onValue(value: any) {
    // Override me
  }

  onToken(token: Token, value: any) {
    if (this.state === VALUE) {
      if (
        token === STRING ||
        token === NUMBER ||
        token === TRUE ||
        token === FALSE ||
        token === NULL
      ) {
        if (this.value) {
          this.value[this.key] = value;
        }
        this.emit(value);
      } else if (token === LEFT_BRACE) {
        this.push();
        if (this.value) {
          this.value = this.value[this.key] = {};
        } else {
          this.value = {};
        }
        this.key = undefined;
        this.state = KEY;
        this.mode = OBJECT;
      } else if (token === LEFT_BRACKET) {
        this.push();
        if (this.value) {
          this.value = this.value[this.key] = [];
        } else {
          this.value = [];
        }
        this.key = 0;
        this.mode = ARRAY;
        this.state = VALUE;
      } else if (token === RIGHT_BRACE) {
        if (this.mode === OBJECT) {
          this.pop();
        } else {
          return this.parseError(token, value);
        }
      } else if (token === RIGHT_BRACKET) {
        if (this.mode === ARRAY) {
          this.pop();
        } else {
          return this.parseError(token, value);
        }
      } else {
        return this.parseError(token, value);
      }
    } else if (this.state === KEY) {
      if (token === STRING) {
        this.key = value;
        this.state = COLON;
      } else if (token === RIGHT_BRACE) {
        this.pop();
      } else {
        return this.parseError(token, value);
      }
    } else if (this.state === COLON) {
      if (token === COLON) {
        this.state = VALUE;
      } else {
        return this.parseError(token, value);
      }
    } else if (this.state === COMMA) {
      if (token === COMMA) {
        if (this.mode === ARRAY) {
          this.key++;
          this.state = VALUE;
        } else if (this.mode === OBJECT) {
          this.state = KEY;
        }
      } else if (
        (token === RIGHT_BRACKET && this.mode === ARRAY) ||
        (token === RIGHT_BRACE && this.mode === OBJECT)
      ) {
        this.pop();
      } else {
        return this.parseError(token, value);
      }
    } else {
      return this.parseError(token, value);
    }
  }

  // Override to implement your own number reviver.
  // Any value returned is treated as error and will interrupt parsing.
  numberReviver(text: string, buffer: Uint8Array, i: number): any {
    const result = Number(text);

    if (isNaN(result)) {
      this.charError(buffer, i);
      return;
    }

    // @ts-ignore
    if (text.match(/[0-9]+/) == text && result.toString() != text) {
      // Long string of digits which is an ID string and not valid and/or safe JavaScript integer Number
      this.onToken(STRING, text);
    } else {
      this.onToken(NUMBER, result);
    }
  }
}
