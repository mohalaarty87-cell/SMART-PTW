import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateGasReadings } from '../src/utils/gasValidation';

describe('Gas Safety Engine (OSHA / API RP 2201)', () => {
  it('identifies standard atmospheric safe conditions', () => {
    const res = evaluateGasReadings('0.0%', '20.9%', '0.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'SAFE');
    assert.strictEqual(res.violationsEn.length, 0);
  });

  it('triggers CRITICAL alarm when LEL exceeds 10%', () => {
    const res = evaluateGasReadings('12.5%', '20.9%', '0.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'CRITICAL');
    assert.ok(res.violationsEn.some((v) => v.includes('LEL')));
    assert.ok(res.violationsAr.some((v) => v.includes('الغاز القابل للاشتعال')));
  });

  it('triggers CRITICAL alarm when Oxygen is critically deficient (<18.0%)', () => {
    const res = evaluateGasReadings('0.0%', '17.5%', '0.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'CRITICAL');
    assert.ok(res.violationsEn.some((v) => v.includes('Oxygen is critically deficient')));
  });

  it('triggers WARNING when Oxygen is slightly low (<19.5% and >=18.0%)', () => {
    const res = evaluateGasReadings('0.0%', '19.1%', '0.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'WARNING');
  });

  it('triggers CRITICAL alarm when Oxygen is enriched (>24.0%)', () => {
    const res = evaluateGasReadings('0.0%', '24.5%', '0.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'CRITICAL');
    assert.ok(res.violationsEn.some((v) => v.includes('Oxygen enriched')));
  });

  it('triggers CRITICAL alarm when H2S reaches or exceeds 10 ppm', () => {
    const res = evaluateGasReadings('0.0%', '20.9%', '14.0 ppm', '0.0 ppm');
    assert.strictEqual(res.status, 'CRITICAL');
    assert.ok(res.violationsEn.some((v) => v.includes('H2S toxic gas')));
  });

  it('triggers CRITICAL alarm when Carbon Monoxide exceeds 35 ppm', () => {
    const res = evaluateGasReadings('0.0%', '20.9%', '0.0 ppm', '45.0 ppm');
    assert.strictEqual(res.status, 'CRITICAL');
    assert.ok(res.violationsEn.some((v) => v.includes('Carbon Monoxide')));
  });
});
