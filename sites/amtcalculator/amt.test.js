const test = require("node:test");
const assert = require("node:assert/strict");

const {
  TAX_YEAR_DATA,
  SUPPORTED_TAX_YEARS,
  DEFAULT_TAX_YEAR,
  amtTaxDetails,
  standardTaxDetails,
  calculateAMTBreakdown,
  calculateAMT,
  calculateIncomeTax,
  calculateISOHeadroom,
  calculateTaxSummary
} = require("./amt.js");

test("supports every tax year from 2018 through 2027 and defaults to 2026", () => {
  assert.deepEqual(SUPPORTED_TAX_YEARS, [
    2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027
  ]);
  assert.equal(DEFAULT_TAX_YEAR, 2026);
});

test("uses the IRS standard deductions for every supported year", () => {
  const expected = {
    2018: [12000, 24000, 12000, 18000],
    2019: [12200, 24400, 12200, 18350],
    2020: [12400, 24800, 12400, 18650],
    2021: [12550, 25100, 12550, 18800],
    2022: [12950, 25900, 12950, 19400],
    2023: [13850, 27700, 13850, 20800],
    2024: [14600, 29200, 14600, 21900],
    2025: [15750, 31500, 15750, 23625],
    2026: [16100, 32200, 16100, 24150],
    2027: [16600, 33200, 16600, 24925]
  };

  for (const year of SUPPORTED_TAX_YEARS) {
    assert.deepEqual(
      [
        standardTaxDetails("single", year).standard_deduction,
        standardTaxDetails("married_joint", year).standard_deduction,
        standardTaxDetails("married_separate", year).standard_deduction,
        standardTaxDetails("head_of_household", year).standard_deduction
      ],
      expected[year],
      `standard deductions for ${year}`
    );
  }
});

test("uses the IRS AMT exemptions, breakpoints, and phaseout thresholds", () => {
  const expected = {
    2018: [70300, 109400, 54700, 191100, 95550, 500000, 1000000, 0.25],
    2019: [71700, 111700, 55850, 194800, 97400, 510300, 1020600, 0.25],
    2020: [72900, 113400, 56700, 197900, 98950, 518400, 1036800, 0.25],
    2021: [73600, 114600, 57300, 199900, 99950, 523600, 1047200, 0.25],
    2022: [75900, 118100, 59050, 206100, 103050, 539900, 1079800, 0.25],
    2023: [81300, 126500, 63250, 220700, 110350, 578150, 1156300, 0.25],
    2024: [85700, 133300, 66650, 232600, 116300, 609350, 1218700, 0.25],
    2025: [88100, 137000, 68500, 239100, 119550, 626350, 1252700, 0.25],
    2026: [90100, 140200, 70100, 244500, 122250, 500000, 1000000, 0.50],
    2027: [93000, 144700, 72350, 252500, 126250, 515950, 1031900, 0.50]
  };

  for (const year of SUPPORTED_TAX_YEARS) {
    const single = amtTaxDetails("single", year);
    const joint = amtTaxDetails("married_joint", year);
    const separate = amtTaxDetails("married_separate", year);

    assert.deepEqual(
      [
        single.amt_exemption_amount,
        joint.amt_exemption_amount,
        separate.amt_exemption_amount,
        single.amt_bracket_crossover,
        separate.amt_bracket_crossover,
        single.amt_phase_out_income,
        joint.amt_phase_out_income,
        single.amt_phase_out_percent
      ],
      expected[year],
      `AMT amounts for ${year}`
    );
  }
});

test("regular-tax brackets are continuous and preserve the lower married-separate top bracket", () => {
  for (const year of SUPPORTED_TAX_YEARS) {
    for (const filingStatus of Object.keys(TAX_YEAR_DATA[year].tax_bracket_limits)) {
      const brackets = standardTaxDetails(filingStatus, year).tax_brackets;
      assert.equal(brackets[0][0], 0);
      assert.equal(brackets[brackets.length - 1][1], Number.POSITIVE_INFINITY);

      for (let index = 1; index < brackets.length; index += 1) {
        assert.equal(brackets[index][0], brackets[index - 1][1]);
      }
    }

    const jointTopThreshold = TAX_YEAR_DATA[year].tax_bracket_limits.married_joint[5];
    const separateTopThreshold = TAX_YEAR_DATA[year].tax_bracket_limits.married_separate[5];
    assert.equal(separateTopThreshold, jointTopThreshold / 2, `MFS top threshold for ${year}`);
  }
});

test("calculates regular tax without one-dollar gaps between brackets", () => {
  assert.equal(calculateIncomeTax(100000, 0, 0, 0, "single", 2020), 15103.50);

  const deduction = standardTaxDetails("married_separate", 2020).standard_deduction;
  const taxAtTopOf35PercentBracket = calculateIncomeTax(
    deduction + 311025,
    0,
    0,
    0,
    "married_separate",
    2020
  );
  const taxOneDollarHigher = calculateIncomeTax(
    deduction + 311026,
    0,
    0,
    0,
    "married_separate",
    2020
  );

  assert.equal(taxAtTopOf35PercentBracket, 83653.75);
  assert.ok(Math.abs((taxOneDollarHigher - taxAtTopOf35PercentBracket) - 0.37) < 1e-9);
});

test("applies the AMT exemption before the 26/28 percent rate breakpoint", () => {
  // $300,000 AMTI - $70,300 exemption = $229,700 taxable excess.
  // 26% of $191,100 plus 28% of $38,600 = $60,494.
  assert.equal(calculateAMT(300000, 0, 0, 0, "single", 2018), 60494);
});

test("applies the 2026 and 2027 50 percent AMT exemption phaseout", () => {
  // 2026: Exemption $90,100 - 50% × ($600,000 - $500,000) = $40,100 -> excess $559,900.
  assert.equal(calculateAMT(600000, 0, 0, 0, "single", 2026), 151882);

  // 2027: Exemption $93,000 - 50% × ($615,950 - $515,950) = $43,000 -> excess $572,950.
  // 26% × $252,500 + 28% × $320,450 = $65,650 + $89,726 = $155,376.
  assert.equal(calculateAMT(615950, 0, 0, 0, "single", 2027), 155376);
});

test("applies Form 6251 married-filing-separately high-income add-back at 25% in 2025 and 50% in 2026+", () => {
  // 2025 MFS complete phaseout: $626,350 + ($68,500 / 0.25) = $900,350.
  // At $920,350, add 25% of $20,000 = $5,000 -> AMTI $925,350.
  assert.ok(
    Math.abs(calculateAMT(920350, 0, 0, 0, "married_separate", 2025) - 256707) < 1e-9
  );

  // 2026 MFS complete phaseout: $500,000 + ($70,100 / 0.50) = $640,200.
  // At $700,200, Form 6251 Line 4 adds 50% of $60,000 = $30,000 -> AMTI $730,200.
  // 26% × $122,250 + 28% × ($730,200 - $122,250) = $31,785 + $170,226 = $202,011.
  const bd2026 = calculateAMTBreakdown(700200, 0, 0, 0, "married_separate", 2026);
  assert.equal(bd2026.mfs_addback, 30000);
  assert.equal(bd2026.amti, 730200);
  assert.ok(Math.abs(bd2026.tentative_minimum_tax - 202011) < 1e-9);

  // Above $780,400 in 2026, MFS add-back caps at full exemption ($70,100).
  const bdCap = calculateAMTBreakdown(800000, 0, 0, 0, "married_separate", 2026);
  assert.equal(bdCap.mfs_addback, 70100);
});

test("computes accurate AMT-free ISO headroom and 42% phaseout-zone marginal rate", () => {
  // Zero income: AMT-free ISO headroom equals the exact AMT exemption.
  assert.equal(calculateISOHeadroom(0, 0, 0, "single", 2026), 90100);
  assert.equal(calculateISOHeadroom(0, 0, 0, "married_joint", 2027), 144700);

  // Realistic Single 2026 scenario: headroom keeps additional AMT at $0, and +$1 triggers AMT.
  const headroom = calculateISOHeadroom(200000, 50000, 24500, "single", 2026);
  assert.ok(headroom > 0);
  assert.equal(calculateTaxSummary(200000, headroom, 50000, 24500, "single", 2026).additional_amt, 0);
  assert.ok(calculateTaxSummary(200000, headroom + 1, 50000, 24500, "single", 2026).additional_amt > 0);

  // Inside 2026 50% exemption phaseout above the 28% crossover: marginal ISO rate is 42%.
  const cliff = calculateTaxSummary(300000, 250000, 0, 0, "single", 2026);
  assert.equal(cliff.is_amt_due, true);
  assert.equal(cliff.amt_breakdown.in_phaseout, true);
  assert.ok(Math.abs(cliff.next_iso_dollar_rate - 0.42) < 1e-6);
});

test("clamps negative inputs to zero and reports additional AMT as zero when regular tax is higher", () => {
  const summary = calculateTaxSummary(100000, -5000, 0, -2000, "single", 2026);

  assert.equal(summary.regular_tax, 13170);
  assert.equal(summary.additional_amt, 0);
  assert.equal(summary.total_federal_tax, summary.regular_tax);
  assert.equal(summary.is_amt_due, false);
});

test("rejects unsupported years and filing statuses", () => {
  assert.throws(() => standardTaxDetails("single", 2017), /Unsupported tax year/);
  assert.throws(() => amtTaxDetails("qualifying_cat", 2026), /Unsupported filing status/);
});
