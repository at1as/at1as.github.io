// Federal income-tax and individual AMT amounts published by the IRS for
// tax years 2018–2027. Sources: Revenue Procedures 2018-18/2018-22,
// 2018-57, 2019-44, 2020-45, 2021-45, 2022-38, 2023-34, 2024-40, 2025-32,
// 2026-35, and P.L. 119-21 (Sec. 70107 for 2026+ AMT phaseout rules).
//
// This calculator is a planning estimate using the standard deduction and the
// income types entered; it does not replace Form 1040 or Form 6251.

const STANDARD_TAX_RATES = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
const AMT_LOW_RATE = 0.26;
const AMT_HIGH_RATE = 0.28;

const TAX_YEAR_DATA = {
  2018: {
    elective_deferral_limit: 18500,
    standard_deductions: {
      single: 12000,
      married_joint: 24000,
      married_separate: 12000,
      head_of_household: 18000
    },
    tax_bracket_limits: {
      single: [9525, 38700, 82500, 157500, 200000, 500000],
      married_joint: [19050, 77400, 165000, 315000, 400000, 600000],
      married_separate: [9525, 38700, 82500, 157500, 200000, 300000],
      head_of_household: [13600, 51800, 82500, 157500, 200000, 500000]
    },
    amt: {
      exemptions: {
        single: 70300,
        married_joint: 109400,
        married_separate: 54700,
        head_of_household: 70300
      },
      bracket_threshold: 191100,
      married_separate_bracket_threshold: 95550,
      phaseout_threshold: 500000,
      married_joint_phaseout_threshold: 1000000,
      phaseout_rate: 0.25
    }
  },
  2019: {
    elective_deferral_limit: 19000,
    standard_deductions: {
      single: 12200,
      married_joint: 24400,
      married_separate: 12200,
      head_of_household: 18350
    },
    tax_bracket_limits: {
      single: [9700, 39475, 84200, 160725, 204100, 510300],
      married_joint: [19400, 78950, 168400, 321450, 408200, 612350],
      married_separate: [9700, 39475, 84200, 160725, 204100, 306175],
      head_of_household: [13850, 52850, 84200, 160700, 204100, 510300]
    },
    amt: {
      exemptions: {
        single: 71700,
        married_joint: 111700,
        married_separate: 55850,
        head_of_household: 71700
      },
      bracket_threshold: 194800,
      married_separate_bracket_threshold: 97400,
      phaseout_threshold: 510300,
      married_joint_phaseout_threshold: 1020600,
      phaseout_rate: 0.25
    }
  },
  2020: {
    elective_deferral_limit: 19500,
    standard_deductions: {
      single: 12400,
      married_joint: 24800,
      married_separate: 12400,
      head_of_household: 18650
    },
    tax_bracket_limits: {
      single: [9875, 40125, 85525, 163300, 207350, 518400],
      married_joint: [19750, 80250, 171050, 326600, 414700, 622050],
      married_separate: [9875, 40125, 85525, 163300, 207350, 311025],
      head_of_household: [14100, 53700, 85500, 163300, 207350, 518400]
    },
    amt: {
      exemptions: {
        single: 72900,
        married_joint: 113400,
        married_separate: 56700,
        head_of_household: 72900
      },
      bracket_threshold: 197900,
      married_separate_bracket_threshold: 98950,
      phaseout_threshold: 518400,
      married_joint_phaseout_threshold: 1036800,
      phaseout_rate: 0.25
    }
  },
  2021: {
    elective_deferral_limit: 19500,
    standard_deductions: {
      single: 12550,
      married_joint: 25100,
      married_separate: 12550,
      head_of_household: 18800
    },
    tax_bracket_limits: {
      single: [9950, 40525, 86375, 164925, 209425, 523600],
      married_joint: [19900, 81050, 172750, 329850, 418850, 628300],
      married_separate: [9950, 40525, 86375, 164925, 209425, 314150],
      head_of_household: [14200, 54200, 86350, 164900, 209400, 523600]
    },
    amt: {
      exemptions: {
        single: 73600,
        married_joint: 114600,
        married_separate: 57300,
        head_of_household: 73600
      },
      bracket_threshold: 199900,
      married_separate_bracket_threshold: 99950,
      phaseout_threshold: 523600,
      married_joint_phaseout_threshold: 1047200,
      phaseout_rate: 0.25
    }
  },
  2022: {
    elective_deferral_limit: 20500,
    standard_deductions: {
      single: 12950,
      married_joint: 25900,
      married_separate: 12950,
      head_of_household: 19400
    },
    tax_bracket_limits: {
      single: [10275, 41775, 89075, 170050, 215950, 539900],
      married_joint: [20550, 83550, 178150, 340100, 431900, 647850],
      married_separate: [10275, 41775, 89075, 170050, 215950, 323925],
      head_of_household: [14650, 55900, 89050, 170050, 215950, 539900]
    },
    amt: {
      exemptions: {
        single: 75900,
        married_joint: 118100,
        married_separate: 59050,
        head_of_household: 75900
      },
      bracket_threshold: 206100,
      married_separate_bracket_threshold: 103050,
      phaseout_threshold: 539900,
      married_joint_phaseout_threshold: 1079800,
      phaseout_rate: 0.25
    }
  },
  2023: {
    elective_deferral_limit: 22500,
    standard_deductions: {
      single: 13850,
      married_joint: 27700,
      married_separate: 13850,
      head_of_household: 20800
    },
    tax_bracket_limits: {
      single: [11000, 44725, 95375, 182100, 231250, 578125],
      married_joint: [22000, 89450, 190750, 364200, 462500, 693750],
      married_separate: [11000, 44725, 95375, 182100, 231250, 346875],
      head_of_household: [15700, 59850, 95350, 182100, 231250, 578100]
    },
    amt: {
      exemptions: {
        single: 81300,
        married_joint: 126500,
        married_separate: 63250,
        head_of_household: 81300
      },
      bracket_threshold: 220700,
      married_separate_bracket_threshold: 110350,
      phaseout_threshold: 578150,
      married_joint_phaseout_threshold: 1156300,
      phaseout_rate: 0.25
    }
  },
  2024: {
    elective_deferral_limit: 23000,
    standard_deductions: {
      single: 14600,
      married_joint: 29200,
      married_separate: 14600,
      head_of_household: 21900
    },
    tax_bracket_limits: {
      single: [11600, 47150, 100525, 191950, 243725, 609350],
      married_joint: [23200, 94300, 201050, 383900, 487450, 731200],
      married_separate: [11600, 47150, 100525, 191950, 243725, 365600],
      head_of_household: [16550, 63100, 100500, 191950, 243700, 609350]
    },
    amt: {
      exemptions: {
        single: 85700,
        married_joint: 133300,
        married_separate: 66650,
        head_of_household: 85700
      },
      bracket_threshold: 232600,
      married_separate_bracket_threshold: 116300,
      phaseout_threshold: 609350,
      married_joint_phaseout_threshold: 1218700,
      phaseout_rate: 0.25
    }
  },
  2025: {
    elective_deferral_limit: 23500,
    standard_deductions: {
      // Updated by P.L. 119-21 and Rev. Proc. 2025-32.
      single: 15750,
      married_joint: 31500,
      married_separate: 15750,
      head_of_household: 23625
    },
    tax_bracket_limits: {
      single: [11925, 48475, 103350, 197300, 250525, 626350],
      married_joint: [23850, 96950, 206700, 394600, 501050, 751600],
      married_separate: [11925, 48475, 103350, 197300, 250525, 375800],
      head_of_household: [17000, 64850, 103350, 197300, 250500, 626350]
    },
    amt: {
      exemptions: {
        single: 88100,
        married_joint: 137000,
        married_separate: 68500,
        head_of_household: 88100
      },
      bracket_threshold: 239100,
      married_separate_bracket_threshold: 119550,
      phaseout_threshold: 626350,
      married_joint_phaseout_threshold: 1252700,
      phaseout_rate: 0.25
    }
  },
  2026: {
    elective_deferral_limit: 24500,
    standard_deductions: {
      single: 16100,
      married_joint: 32200,
      married_separate: 16100,
      head_of_household: 24150
    },
    tax_bracket_limits: {
      single: [12400, 50400, 105700, 201775, 256225, 640600],
      married_joint: [24800, 100800, 211400, 403550, 512450, 768700],
      married_separate: [12400, 50400, 105700, 201775, 256225, 384350],
      head_of_household: [17700, 67450, 105700, 201750, 256200, 640600]
    },
    amt: {
      exemptions: {
        single: 90100,
        married_joint: 140200,
        married_separate: 70100,
        head_of_household: 90100
      },
      bracket_threshold: 244500,
      married_separate_bracket_threshold: 122250,
      phaseout_threshold: 500000,
      married_joint_phaseout_threshold: 1000000,
      phaseout_rate: 0.50
    }
  },
  2027: {
    elective_deferral_limit: 25500,
    // Official inflation adjustments published in Rev. Proc. 2026-35.
    standard_deductions: {
      single: 16600,
      married_joint: 33200,
      married_separate: 16600,
      head_of_household: 24925
    },
    tax_bracket_limits: {
      single: [12800, 52025, 109125, 208325, 264550, 661375],
      married_joint: [25600, 104050, 218250, 416650, 529100, 793650],
      married_separate: [12800, 52025, 109125, 208325, 264550, 396825],
      head_of_household: [18250, 69650, 109100, 208300, 264550, 661375]
    },
    amt: {
      exemptions: {
        single: 93000,
        married_joint: 144700,
        married_separate: 72350,
        head_of_household: 93000
      },
      bracket_threshold: 252500,
      married_separate_bracket_threshold: 126250,
      phaseout_threshold: 515950,
      married_joint_phaseout_threshold: 1031900,
      phaseout_rate: 0.50
    }
  }
};

const SUPPORTED_TAX_YEARS = Object.keys(TAX_YEAR_DATA)
  .map(year => Number(year))
  .sort((a, b) => a - b);
const DEFAULT_TAX_YEAR = 2026;
const FILING_STATUSES = ["single", "married_joint", "married_separate", "head_of_household"];

function taxYear() {
  const year_input = typeof document === "undefined" ? null : document.getElementById("inputYear");
  const selected_year = year_input ? Number(year_input.value) : DEFAULT_TAX_YEAR;
  return TAX_YEAR_DATA[selected_year] ? selected_year : DEFAULT_TAX_YEAR;
}

function taxYearData(year) {
  const selected_year = Number(year === undefined ? taxYear() : year);
  if (!TAX_YEAR_DATA[selected_year]) {
    throw new RangeError(`Unsupported tax year: ${year}`);
  }
  return TAX_YEAR_DATA[selected_year];
}

function validateFilingStatus(filing_status) {
  if (!FILING_STATUSES.includes(filing_status)) {
    throw new RangeError(`Unsupported filing status: ${filing_status}`);
  }
}

function amount(value) {
  const parsed_value = Number(value);
  return Number.isFinite(parsed_value) && parsed_value > 0 ? parsed_value : 0;
}

function amtTaxDetails(filing_status, year) {
  validateFilingStatus(filing_status);
  const selected_year = Number(year === undefined ? taxYear() : year);
  const details = taxYearData(selected_year).amt;

  return {
    amt_low_rate: AMT_LOW_RATE,
    amt_high_rate: AMT_HIGH_RATE,
    amt_exemption_amount: details.exemptions[filing_status],
    amt_bracket_crossover: filing_status === "married_separate"
      ? details.married_separate_bracket_threshold
      : details.bracket_threshold,
    amt_phase_out_income: filing_status === "married_joint"
      ? details.married_joint_phaseout_threshold
      : details.phaseout_threshold,
    amt_phase_out_percent: details.phaseout_rate,
    tax_year: selected_year
  };
}

function standardTaxDetails(filing_status, year) {
  validateFilingStatus(filing_status);
  const selected_year = Number(year === undefined ? taxYear() : year);
  const details = taxYearData(selected_year);
  const bracket_limits = details.tax_bracket_limits[filing_status].concat(Number.POSITIVE_INFINITY);
  let previous_limit = 0;

  return {
    tax_year: selected_year,
    elective_deferral_limit: details.elective_deferral_limit,
    standard_deduction: details.standard_deductions[filing_status],
    tax_brackets: bracket_limits.map((limit, index) => {
      const bracket = [previous_limit, limit, STANDARD_TAX_RATES[index]];
      previous_limit = limit;
      return bracket;
    })
  };
}

function asCurrency(value, { whole = false } = {}) {
  const n = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2
  }).format(n);
}

function reducedAMTExemptionAmount(exemption) {
  return Math.max(0, exemption);
}

function calculateAMTBreakdown(income, iso_gains, rsu_income, pension, filing_status, year) {
  const amt_details = amtTaxDetails(filing_status, year);
  const base_exemption = amt_details.amt_exemption_amount;
  const phase_out_income = amt_details.amt_phase_out_income;
  const phase_out_percent = amt_details.amt_phase_out_percent;

  const amti_before_mfs_addback = Math.max(
    0,
    amount(income) + amount(rsu_income) + amount(iso_gains) - amount(pension)
  );

  // Form 6251 Line 4 adds back an extra AMTI amount for high-income MFS filers
  // once their exemption is fully phased out, using the year's statutory
  // phaseout rate (25% in 2018–2025; 50% in 2026+ under P.L. 119-21).
  let mfs_addback = 0;
  if (filing_status === "married_separate") {
    const complete_phaseout_income = phase_out_income + (base_exemption / phase_out_percent);
    const income_above_complete_phaseout = Math.max(0, amti_before_mfs_addback - complete_phaseout_income);
    mfs_addback = Math.min(
      base_exemption,
      income_above_complete_phaseout * phase_out_percent
    );
  }

  const amti = amti_before_mfs_addback + mfs_addback;
  const exemption_reduction = Math.min(
    base_exemption,
    Math.max(0, amti - phase_out_income) * phase_out_percent
  );
  const exemption = reducedAMTExemptionAmount(base_exemption - exemption_reduction);
  const taxable_excess = Math.max(0, amti - exemption);
  const lower_rate_income = Math.min(taxable_excess, amt_details.amt_bracket_crossover);
  const higher_rate_income = Math.max(0, taxable_excess - amt_details.amt_bracket_crossover);
  const tentative_minimum_tax = (lower_rate_income * amt_details.amt_low_rate) +
    (higher_rate_income * amt_details.amt_high_rate);

  const in_phaseout = amti > phase_out_income && exemption > 0;
  const in_mfs_addback = mfs_addback > 0 && mfs_addback < base_exemption;

  return {
    amti_before_mfs_addback,
    mfs_addback,
    amti,
    base_exemption,
    phase_out_income,
    phase_out_percent,
    exemption_reduction,
    exemption,
    taxable_excess,
    bracket_crossover: amt_details.amt_bracket_crossover,
    lower_rate_income,
    higher_rate_income,
    tentative_minimum_tax,
    in_phaseout,
    in_mfs_addback
  };
}

// Returns tentative minimum tax, the Form 6251 amount compared with regular tax.
// The additional AMT owed is max(0, tentative minimum tax - regular tax).
function calculateAMT(income, iso_gains, rsu_income, pension, filing_status, year) {
  return calculateAMTBreakdown(income, iso_gains, rsu_income, pension, filing_status, year)
    .tentative_minimum_tax;
}

function calculateIncomeTax(income, iso_gains, rsu_income, pension, filing_status, year) {
  const standard_tax_details = standardTaxDetails(filing_status, year);
  const taxable_income = Math.max(
    0,
    amount(income) + amount(rsu_income) - amount(pension) - standard_tax_details.standard_deduction
  );

  // ISO bargain-element income is excluded from regular income tax in this
  // simplified model and included in the AMT calculation above.
  return standard_tax_details.tax_brackets.reduce((tax, bracket) => {
    const lower_limit = bracket[0];
    const upper_limit = bracket[1];
    const rate = bracket[2];
    const taxable_in_bracket = Math.max(0, Math.min(taxable_income, upper_limit) - lower_limit);
    return tax + (taxable_in_bracket * rate);
  }, 0);
}

// Maximum ISO bargain element realizable without triggering additional AMT.
function calculateISOHeadroom(income, rsu_income, pension, filing_status, year) {
  const regular_tax = calculateIncomeTax(income, 0, rsu_income, pension, filing_status, year);
  const tmt_at_zero = calculateAMT(income, 0, rsu_income, pension, filing_status, year);
  if (tmt_at_zero > regular_tax + 1e-9) {
    return 0;
  }

  let lo = 0;
  let hi = 100000;
  while (calculateAMT(income, hi, rsu_income, pension, filing_status, year) <= regular_tax + 1e-9) {
    lo = hi;
    hi *= 2;
    if (hi > 1e11) break;
  }

  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (calculateAMT(income, mid, rsu_income, pension, filing_status, year) <= regular_tax + 1e-9) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.floor(lo * 100) / 100;
}

function calculateTaxSummary(income, iso_gains, rsu_income, pension, filing_status, year) {
  const inc = amount(income);
  const iso = amount(iso_gains);
  const rsu = amount(rsu_income);
  const pen = amount(pension);
  const standard_details = standardTaxDetails(filing_status, year);
  const ordinary_adjusted = Math.max(0, inc + rsu - pen);
  const regular_taxable_income = Math.max(0, ordinary_adjusted - standard_details.standard_deduction);
  const regular_tax = calculateIncomeTax(inc, iso, rsu, pen, filing_status, year);
  const amt_breakdown = calculateAMTBreakdown(inc, iso, rsu, pen, filing_status, year);
  const tentative_minimum_tax = amt_breakdown.tentative_minimum_tax;
  const additional_amt = Math.max(0, tentative_minimum_tax - regular_tax);
  const total_federal_tax = regular_tax + additional_amt;
  const total_economic_income = Math.max(0, inc + rsu + iso - pen);
  const effective_tax_rate = total_economic_income > 0 ? total_federal_tax / total_economic_income : 0;

  const iso_headroom = calculateISOHeadroom(inc, rsu, pen, filing_status, year);
  const iso_headroom_remaining = Math.max(0, iso_headroom - iso);
  const iso_over_headroom = Math.max(0, iso - iso_headroom);

  const tmt_plus_one = calculateAMT(inc, iso + 1, rsu, pen, filing_status, year);
  const total_plus_one = Math.max(regular_tax, tmt_plus_one);
  const next_iso_dollar_rate = Math.max(0, total_plus_one - total_federal_tax);

  let regular_marginal_rate = 0;
  if (regular_taxable_income > 0) {
    const bracket = standard_details.tax_brackets.find(
      ([low, high]) => regular_taxable_income > low && regular_taxable_income <= high
    );
    regular_marginal_rate = bracket ? bracket[2] : STANDARD_TAX_RATES[STANDARD_TAX_RATES.length - 1];
  }

  return {
    tax_year: standard_details.tax_year,
    standard_deduction: standard_details.standard_deduction,
    elective_deferral_limit: standard_details.elective_deferral_limit,
    regular_taxable_income,
    regular_marginal_rate,
    regular_tax,
    tentative_minimum_tax,
    additional_amt,
    total_federal_tax,
    effective_tax_rate,
    is_amt_due: additional_amt > 0,
    iso_headroom,
    iso_headroom_remaining,
    iso_over_headroom,
    next_iso_dollar_rate,
    amt_breakdown
  };
}

function asPercent(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}

function updateHelperHints() {
  const year = taxYear();
  const status = document.getElementById("inputFilingStatus").value;
  const details = taxYearData(year);
  const limit = details.elective_deferral_limit;
  const jointLimit = limit * 2;
  const k401Hint = document.getElementById("pension_limit_hint");
  if (k401Hint) {
    k401Hint.textContent = `${year} base elective deferral limit: ${asCurrency(limit, { whole: true })} individual (${asCurrency(jointLimit, { whole: true })} MFJ dual earners, excluding catch-ups). Leave $0 if Salary is already W-2 Box 1.`;
  }

  const lawCallout = document.getElementById("law_callout");
  if (lawCallout) {
    if (year >= 2026) {
      const thresh = status === "married_joint"
        ? details.amt.married_joint_phaseout_threshold
        : details.amt.phaseout_threshold;
      const ex = details.amt.exemptions[status];
      lawCallout.hidden = false;
      lawCallout.textContent = `${year} rules (P.L. 119-21): AMT exemption (${asCurrency(ex, { whole: true })}) phases out at 50% above ${asCurrency(thresh, { whole: true })} AMTI—creating up to a 42% effective marginal rate on ISO exercises inside the phaseout zone.`;
    } else {
      lawCallout.hidden = true;
    }
  }
}

function calculateTaxes() {
  const filing_status = document.getElementById("inputFilingStatus").value;
  const income = amount(document.getElementById("inputIncome").value);
  const rsu_income = amount(document.getElementById("rsuIncome").value);
  const iso_gains = amount(document.getElementById("isoGains").value);
  const pension_contrib = amount(document.getElementById("pensionContributions").value);
  const year = taxYear();
  const s = calculateTaxSummary(income, iso_gains, rsu_income, pension_contrib, filing_status, year);
  const b = s.amt_breakdown;

  document.getElementById("total_tax").textContent = asCurrency(s.total_federal_tax);
  document.getElementById("effective_rate_note").textContent = `${asPercent(s.effective_tax_rate)} effective federal rate`;
  document.getElementById("tax_amt_delta").textContent = asCurrency(s.additional_amt);
  document.getElementById("amt_delta_card").dataset.highlight = s.is_amt_due ? "amt" : "none";
  document.getElementById("amt_delta_note").textContent = s.is_amt_due
    ? `Next $1 of ISO spread taxed at ${asPercent(s.next_iso_dollar_rate)}`
    : "No additional AMT owed";

  document.getElementById("tax_bill").textContent = asCurrency(s.regular_tax);
  document.getElementById("amt_bill").textContent = asCurrency(s.tentative_minimum_tax);

  const maxTax = Math.max(s.regular_tax, s.tentative_minimum_tax, 1);
  document.getElementById("regular_bar").style.width = `${Math.min(100, (s.regular_tax / maxTax) * 100)}%`;
  document.getElementById("amt_bar").style.width = `${Math.min(100, (s.tentative_minimum_tax / maxTax) * 100)}%`;

  const banner = document.getElementById("verdict_banner");
  const verdict = document.getElementById("type_of_tax_owed");
  const marginalBadge = document.getElementById("marginal_iso_badge");
  const inCliff = s.is_amt_due && (b.in_phaseout || b.in_mfs_addback);
  banner.dataset.state = inCliff ? "phaseout" : (s.is_amt_due ? "amt" : "regular");
  verdict.textContent = inCliff
    ? `AMT applies (${Math.round(b.phase_out_percent * 100)}% exemption phaseout zone)`
    : s.is_amt_due
      ? "AMT applies to this estimate"
      : "Regular federal income tax applies";
  marginalBadge.textContent = `Next ISO $1: ${asPercent(s.next_iso_dollar_rate)}`;

  // AMT-free ISO headroom display
  document.getElementById("iso_headroom_total").textContent = asCurrency(s.iso_headroom, { whole: true });
  const headroomFill = document.getElementById("headroom_fill");
  const headroomCopy = document.getElementById("headroom_copy");
  const usagePct = s.iso_headroom > 0
    ? Math.min(100, (iso_gains / s.iso_headroom) * 100)
    : (iso_gains > 0 ? 100 : 0);
  headroomFill.style.width = `${usagePct}%`;
  headroomFill.dataset.over = String(s.is_amt_due);

  if (s.is_amt_due) {
    headroomCopy.textContent = `Your ${asCurrency(iso_gains, { whole: true })} ISO spread is ${asCurrency(s.iso_over_headroom, { whole: true })} over the AMT-free threshold of ${asCurrency(s.iso_headroom, { whole: true })}.`;
  } else if (iso_gains > 0) {
    headroomCopy.textContent = `Using ${Math.round(usagePct)}% of your AMT-free headroom—${asCurrency(s.iso_headroom_remaining, { whole: true })} of additional ISO spread remaining before AMT kicks in.`;
  } else {
    headroomCopy.textContent = `With your current income, you can exercise up to ${asCurrency(s.iso_headroom, { whole: true })} of ISO bargain element before triggering AMT.`;
  }

  // Form 1040 & Form 6251 breakdown rows
  document.getElementById("bd_std_deduction").textContent = asCurrency(s.standard_deduction);
  document.getElementById("bd_reg_taxable").textContent = asCurrency(s.regular_taxable_income);
  document.getElementById("bd_reg_marginal").textContent = asPercent(s.regular_marginal_rate);
  document.getElementById("bd_amti").textContent = asCurrency(b.amti);
  const mfsRow = document.getElementById("bd_mfs_row");
  mfsRow.hidden = b.mfs_addback <= 0;
  document.getElementById("bd_mfs_addback").textContent = `+${asCurrency(b.mfs_addback)}`;
  document.getElementById("bd_base_exemption").textContent = asCurrency(b.base_exemption);
  document.getElementById("bd_exemption_phaseout").textContent = b.exemption_reduction > 0
    ? `−${asCurrency(b.exemption_reduction)}`
    : "$0.00";
  document.getElementById("bd_net_exemption").textContent = asCurrency(b.exemption);
  document.getElementById("bd_amt_excess").textContent = asCurrency(b.taxable_excess);
  document.getElementById("bd_amt_26").textContent = `${asCurrency(b.lower_rate_income)} → ${asCurrency(b.lower_rate_income * AMT_LOW_RATE)}`;
  document.getElementById("bd_amt_28").textContent = `${asCurrency(b.higher_rate_income)} → ${asCurrency(b.higher_rate_income * AMT_HIGH_RATE)}`;
}

function updateTaxYearCopy() {
  const year = taxYear();
  const badge = document.getElementById("year_badge");
  if (badge) badge.textContent = `Tax Year ${year}`;
  updateHelperHints();
}

function syncISOHelper() {
  const shares = amount(document.getElementById("isoShares")?.value);
  const strike = amount(document.getElementById("isoStrike")?.value);
  const fmv = amount(document.getElementById("isoFmv")?.value);
  const spread = Math.max(0, shares * Math.max(0, fmv - strike));
  const isoInput = document.getElementById("isoGains");
  if (isoInput) {
    isoInput.value = spread > 0 ? spread.toFixed(2).replace(/\.00$/, "") : "0";
    calculateTaxes();
  }
}

if (typeof document !== "undefined") {
  const tax_form = document.querySelector("form");
  const year_input = document.getElementById("inputYear");
  const status_input = document.getElementById("inputFilingStatus");
  const numeric_inputs = ["inputIncome", "rsuIncome", "isoGains", "pensionContributions"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (tax_form) {
    tax_form.addEventListener("submit", event => {
      event.preventDefault();
      calculateTaxes();
    });
  }

  if (year_input) {
    year_input.addEventListener("change", () => {
      updateTaxYearCopy();
      calculateTaxes();
    });
  }

  if (status_input) {
    status_input.addEventListener("change", () => {
      updateHelperHints();
      calculateTaxes();
    });
  }

  for (const input of numeric_inputs) {
    input.addEventListener("input", calculateTaxes);
  }

  for (const id of ["isoShares", "isoStrike", "isoFmv"]) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", syncISOHelper);
  }

  const exampleBtn = document.getElementById("load_example");
  if (exampleBtn) {
    exampleBtn.addEventListener("click", () => {
      const year = taxYear();
      const limit = taxYearData(year).elective_deferral_limit;
      document.getElementById("inputFilingStatus").value = "single";
      document.getElementById("inputIncome").value = "240000";
      document.getElementById("rsuIncome").value = "80000";
      document.getElementById("isoGains").value = "220000";
      document.getElementById("pensionContributions").value = String(limit);
      updateHelperHints();
      calculateTaxes();
    });
  }

  const resetBtn = document.getElementById("reset_form");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      for (const id of ["inputIncome", "rsuIncome", "isoGains", "pensionContributions", "isoShares", "isoStrike", "isoFmv"]) {
        const el = document.getElementById(id);
        if (el) el.value = id.startsWith("iso") && id !== "isoGains" ? "" : "0";
      }
      calculateTaxes();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateTaxYearCopy();
    calculateTaxes();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TAX_YEAR_DATA,
    SUPPORTED_TAX_YEARS,
    DEFAULT_TAX_YEAR,
    taxYearData,
    amtTaxDetails,
    standardTaxDetails,
    reducedAMTExemptionAmount,
    calculateAMTBreakdown,
    calculateAMT,
    calculateIncomeTax,
    calculateISOHeadroom,
    calculateTaxSummary,
    asCurrency
  };
}
