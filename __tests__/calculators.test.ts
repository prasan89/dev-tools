import { CALCULATORS, CALCULATOR_CATEGORIES } from '@/lib/calculators/catalog';
import { calculate, getCalculatorFields as getFields } from '@/lib/calculators/engine';

describe('calculator catalog', () => {
  it('contains exactly 75 uniquely-addressable calculators across four categories', () => {
    expect(CALCULATORS).toHaveLength(75);
    expect(new Set(CALCULATORS.map((item) => item.slug)).size).toBe(75);
    expect(CALCULATOR_CATEGORIES).toEqual(['Financial', 'Fitness & Health', 'Math', 'Other']);
    expect(CALCULATORS.filter((item) => item.category === 'Financial')).toHaveLength(30);
    expect(CALCULATORS.filter((item) => item.category === 'Fitness & Health')).toHaveLength(15);
    expect(CALCULATORS.filter((item) => item.category === 'Math')).toHaveLength(15);
    expect(CALCULATORS.filter((item) => item.category === 'Other')).toHaveLength(15);
  });

  it('provides input fields and a non-placeholder result for every catalog entry', () => {
    for (const calculator of CALCULATORS) {
      const fields = getFields(calculator);
      expect(fields.length).toBeGreaterThan(0);
      const values = Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? '']));
      const result = calculate(calculator.slug, values);
      expect(result.title).not.toBe('Calculator not available yet');
      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.lines.join(' ')).not.toContain('Unable to calculate with these inputs.');
    }
  });
});

describe('representative formula checks', () => {
  it('calculates a zero-interest loan payment correctly', () => {
    const result = calculate('loan-calculator', { principal: 1200, downPayment: 0, fee: 0, rate: 0, years: 1 });
    expect(result.lines[0]).toContain('$100');
  });

  it('calculates BMI from metric height and weight', () => {
    const result = calculate('bmi-calculator', { weightKg: 70, heightCm: 175, age: 30, sex: 'male' });
    expect(result.lines[0]).toContain('22.86');
  });

  it('reports the correct percentage of a value', () => {
    const result = calculate('percentage-calculator', { a: 80, b: 15, operation: 'of' });
    expect(result.lines[0]).toContain('12');
  });

  it('validates an invalid IPv4 address instead of calculating nonsense', () => {
    const result = calculate('ip-subnet-calculator', { ipAddress: '999.1.1.1', cidr: 24 });
    expect(result.title).toBe('Invalid IPv4 address');
  });
});
