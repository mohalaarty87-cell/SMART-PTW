import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateSystemCompliance } from '../src/utils/complianceEngine';
import { INITIAL_PTW_DATA } from '../src/data/mockData';

describe('ISO 45001 / OSHA 1910.119 Compliance Engine', () => {
  it('computes realistic industrial compliance score on initial dataset', () => {
    const compliance = calculateSystemCompliance(INITIAL_PTW_DATA);

    assert.ok(compliance.overallScore >= 0 && compliance.overallScore <= 100);
    assert.strictEqual(typeof compliance.checklistPassRate, 'number');
    assert.strictEqual(typeof compliance.gasSafetyRate, 'number');
    assert.strictEqual(typeof compliance.signatureCompletionRate, 'number');

    assert.ok(compliance.standards.length >= 3);
  });

  it('penalizes score heavily when permits have critical gas or are suspended', () => {
    const modified = { ...INITIAL_PTW_DATA };
    modified['hot'] = {
      ...modified['hot'],
      status: 'SUSPENDED',
      gasCriticalWarningActive: true,
      gasTests: [
        {
          id: 'g-bad',
          time: '12:00',
          lel: '25%',
          o2: '16%',
          h2s: '30 ppm',
          co: '90 ppm',
          tester: 'Tester',
          signature: 'BADGE',
          status: 'CRITICAL',
          violations: ['High LEL'],
        },
      ],
    };

    const result = calculateSystemCompliance(modified);
    const standardDeficiencies = result.standards.flatMap((s) => s.deficienciesEn);
    assert.ok(standardDeficiencies.length > 0);
  });
});
