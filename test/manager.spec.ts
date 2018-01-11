import { expect } from 'chai';
import manager from '../src/manager';

describe('manager', function() {
  describe('plus', function() {
    it('shold return 2 when a = 1', function() {
      const result = manager(1);

      expect(result).to.equal(2);
    });
  });
});
