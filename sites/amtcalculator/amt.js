// Federal income-tax and individual AMT amounts published by the IRS for
// tax years 2018–2026. Sources: Revenue Procedures 2018-18/2018-22,
// 2018-57, 2019-44, 2020-45, 2021-45, 2022-38, 2023-34, 2024-40, and 2025-32.
//
// This calculator deliberately remains a planning estimate. It applies the
// standard deduction and the income types collected by the form; it is not a
// replacement for Form 1040 and Form 6251.

const STANDARD_TAX_RATES = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
const AMT_LOW_RATE = 0.26;
const AMT_HIGH_RATE = 0.28;
const AMT_MFS_ADDITIONAL_INCOME_RATE = 0.25;

const TAX_YEAR_DATA = {
  2018: {
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
  }
};

const SUPPORTED_TAX_YEARS = Object.keys(TAX_YEAR_DATA)
  .map(year => Number(year))
  .sort((a, b) => a - b);
const DEFAULT_TAX_YEAR = SUPPORTED_TAX_YEARS[SUPPORTED_TAX_YEARS.length - 1];
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
  return Number.isFinite(parsed_value) ? parsed_value : 0;
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
    standard_deduction: details.standard_deductions[filing_status],
    tax_brackets: bracket_limits.map((limit, index) => {
      const bracket = [previous_limit, limit, STANDARD_TAX_RATES[index]];
      previous_limit = limit;
      return bracket;
    })
  };
}

function asCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount(value));
}

function reducedAMTExemptionAmount(exemption) {
  return Math.max(0, exemption);
}

// Returns tentative minimum tax, the Form 6251 amount compared with regular tax.
// The additional AMT owed is max(0, tentative minimum tax - regular tax).
function calculateAMT(income, iso_gains, rsu_income, pension, filing_status, year) {
  const amt_details = amtTaxDetails(filing_status, year);
  const exemption_amount = amt_details.amt_exemption_amount;
  const phase_out_income = amt_details.amt_phase_out_income;
  const phase_out_percent = amt_details.amt_phase_out_percent;
  let adjusted_income = Math.max(
    0,
    amount(income) + amount(rsu_income) + amount(iso_gains) - amount(pension)
  );

  // Form 6251 requires an additional AMTI amount for very-high-income taxpayers
  // who are married filing separately. It starts once their exemption is gone.
  if (filing_status === "married_separate") {
    const complete_phaseout_income = phase_out_income + (exemption_amount / phase_out_percent);
    const income_above_complete_phaseout = Math.max(0, adjusted_income - complete_phaseout_income);
    adjusted_income += Math.min(
      exemption_amount,
      income_above_complete_phaseout * AMT_MFS_ADDITIONAL_INCOME_RATE
    );
  }

  const exemption_reduction = Math.max(0, adjusted_income - phase_out_income) * phase_out_percent;
  const reduced_exemption = reducedAMTExemptionAmount(exemption_amount - exemption_reduction);
  const taxable_excess = Math.max(0, adjusted_income - reduced_exemption);
  const lower_rate_income = Math.min(taxable_excess, amt_details.amt_bracket_crossover);
  const higher_rate_income = Math.max(0, taxable_excess - amt_details.amt_bracket_crossover);

  return (lower_rate_income * amt_details.amt_low_rate) +
    (higher_rate_income * amt_details.amt_high_rate);
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

function calculateTaxSummary(income, iso_gains, rsu_income, pension, filing_status, year) {
  const regular_tax = calculateIncomeTax(
    income,
    iso_gains,
    rsu_income,
    pension,
    filing_status,
    year
  );
  const tentative_minimum_tax = calculateAMT(
    income,
    iso_gains,
    rsu_income,
    pension,
    filing_status,
    year
  );
  const additional_amt = Math.max(0, tentative_minimum_tax - regular_tax);

  return {
    regular_tax,
    tentative_minimum_tax,
    additional_amt,
    total_federal_tax: regular_tax + additional_amt,
    is_amt_due: additional_amt > 0
  };
}

function calculateTaxes() {
  const filing_status = document.getElementById("inputFilingStatus").value;
  const income = amount(document.getElementById("inputIncome").value);
  const rsu_income = amount(document.getElementById("rsuIncome").value);
  const iso_gains = amount(document.getElementById("isoGains").value);
  const pension_contrib = amount(document.getElementById("pensionContributions").value);
  const year = taxYear();
  const summary = calculateTaxSummary(
    income,
    iso_gains,
    rsu_income,
    pension_contrib,
    filing_status,
    year
  );

  document.getElementById("tax_bill").textContent = asCurrency(summary.regular_tax);
  document.getElementById("amt_bill").textContent = asCurrency(summary.tentative_minimum_tax);
  document.getElementById("tax_amt_delta").textContent = asCurrency(summary.additional_amt);

  const tax_method = document.getElementById("type_of_tax_owed");
  if (summary.is_amt_due) {
    tax_method.textContent = "AMT applies to this estimate";
    tax_method.style.color = "red";
  } else {
    tax_method.textContent = "Regular federal income tax applies";
    tax_method.style.color = "green";
  }
}

function updateTaxYearCopy() {
  document.getElementById("page_title").textContent = `AMT Tax Calculator – ${taxYear()}`;
}

if (typeof document !== "undefined") {
  const tax_form = document.querySelector("form");
  const year_input = document.getElementById("inputYear");

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

  document.addEventListener("DOMContentLoaded", updateTaxYearCopy);
}

if (typeof window !== "undefined" && window.jQuery) {
  window.jQuery(() => {
    window.jQuery("[data-toggle=\"tooltip\"]").tooltip();
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
    calculateAMT,
    calculateIncomeTax,
    calculateTaxSummary,
    asCurrency
  };
}
