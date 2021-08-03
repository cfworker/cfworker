export const css = `
:root {
  --color-bg-canvas: #040d21;
  --color-text-primary: #fff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  display: grid;
  place-content: center;
  background-color: var(--color-bg-canvas);
  color: var(--color-text-primary);
  font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,Liberation Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
  font-size: clamp(16px, 4vw, 32px);
  line-height: 1.5;
  min-height: 100vh;
}

h1 {
  -webkit-text-fill-color: transparent;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  background: -webkit-linear-gradient(-70deg, #ff7170, #ffe57f);
  -webkit-background-clip: text;
  background-clip: text;
  margin-top: 0;
}

.align-middle {
  vertical-align: middle;
}
`;

async function digestMessage(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const cssHash = digestMessage(css).then(
  buffer => `sha256-${arrayBufferToBase64(buffer)}`
);
