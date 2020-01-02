import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Router } from '../src/index';

describe('Router', () => {
  it('constructs', () => {
    const router = new Router();
    expect(router).not.to.be.undefined;
  });
});
