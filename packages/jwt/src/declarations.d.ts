// extend existing JsonWebKey interface
interface JsonWebKey {
  x5c?: string[];
  kid?: string;
  x5t?: string;
}
