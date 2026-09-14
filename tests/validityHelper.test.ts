import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkPermitValidity } from '../src/utils/validityHelper';

describe('Permit Validity Helper', () => {
  it('handles empty validity window safely', () => {
    const res = checkPermitValidity('');
    assert.strictEqual(res.isExpired, false);
    assert.strictEqual(res.isExpiringSoon, false);
  });

  it('calculates validity for standard formatted shift', () => {
    const res = checkPermitValidity('Today 06:00 - 23:59');
    assert.strictEqual(typeof res.remainingMinutes, 'number');
    assert.strictEqual(typeof res.labelEn, 'string');
    assert.strictEqual(typeof res.labelAr, 'string');
  });
});
