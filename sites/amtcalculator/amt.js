// <START> UPDATE THIS SECTION YEARLY (Current: 2020)
function taxYear() {
  return 2020;
}

function amtTaxDetails(filing_status) {
  function exemptionAmount() {
    switch(filing_status) {
      case "married_joint":     return 113400;
      case "married_separate":  return 56700;
      default:                  return 72900;
    }
  }
  
  return {
      amt_low_rate:           0.26
    , amt_high_rate:          0.28
    , amt_exemption_amount:   (() => { return exemptionAmount() })()
    , amt_bracket_crossover:  (() => { return (filing_status === "married_separate" ? 98950   : 197900) })()
    , amt_phase_out_income:   (() => { return (filing_status === "married_joint"    ? 1036800 : 518400) })()
    , amt_phase_out_percent:  0.25
    , tax_year:               taxYear()
  }
}

function standardTaxDetails(filing_status) {
  const inf = Number.POSITIVE_INFINITY;
  function standardDeduction() {
    switch(filing_status) {
      case "single":            return 12400;
      case "married_joint":     return 24800;
      case "married_separate":  return 12400;
      case "head_of_household": return 18600;
    }
  }
  
  return {
      tax_year: taxYear()
    , standard_deduction: standardDeduction()
    , tax_brackets: function() {
        switch(filing_status) {
          case "single":
            return [
                [0,       9875,   0.10]
              , [9876,    40125,  0.12]
              , [40126,   85525,  0.22]
              , [85526,   163300, 0.24]
              , [163301,  207350, 0.32]
              , [207351,  518400, 0.35]
              , [518401,  inf,    0.37]
            ];
          case "married_joint":
            return [
                [0,       19750,  0.10]
              , [19751,   80250,  0.12]
              , [80251,   171050, 0.22]
              , [171051,  326600, 0.24]
              , [326601,  414700, 0.32]
              , [414701,  622050, 0.35]
              , [622051,  inf,    0.37]
            ];
          case "married_separate":
            return [
                [0,       9875,   0.10]
              , [9876,    40125,  0.12]
              , [40126,   85525,  0.22]
              , [85526,   163300, 0.24]
              , [163301,  207350, 0.32]
              , [207351,  518400, 0.35]
              , [518401,  inf,    0.37]
            ];
          case "head_of_household":
            return [
                [0,       14100,  0.10]
              , [14101,   53700,  0.12]
              , [53701,   85500,  0.22]
              , [85501,   163300, 0.24]
              , [163301,  207350, 0.32]
              , [207351,  518400, 0.35]
              , [518401,  inf,    0.37]
            ];
      }
    }()
  }
}
// <END> UPDATE THIS SECTION YEARLY (Current: 2018)

function asCurrency(amount) {
  // Ex. 555555 -> 555,555.00
  //     Note that toFixed rounds digits
  //    let x = 9.999; x.toFixed(2)    => "10.00"
  //    Intl.NumberFormat() is a better way to do this, but browser support is so-so
  return "$" + (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function reducedAMTExemptionAmount(exemption) {
  return exemption > 0 ? exemption : 0;
}

function calculateAMT(income, iso_gains, rsu_income, pension, filing_status) {
  const amt_details       = amtTaxDetails(filing_status)
  
  const lower_rate        = amt_details.amt_low_rate;
  const higher_rate       = amt_details.amt_high_rate;

  const exemption_amount  = amt_details.amt_exemption_amount;
  const bracket_crossover = amt_details.amt_bracket_crossover;
  const phase_out_income  = amt_details.amt_phase_out_income;
  const phase_out_percent = amt_details.amt_phase_out_percent;

  const adjusted_income   = income + rsu_income + iso_gains - pension;
  const reduced_exemption = exemption_amount - ((adjusted_income - phase_out_income) * phase_out_percent);

  switch(true) {
    case adjusted_income < exemption_amount:
      return 0;
    case adjusted_income < bracket_crossover:
      return (adjusted_income - exemption_amount) * lower_rate;
    case adjusted_income < phase_out_income:
      return ((bracket_crossover - exemption_amount) * lower_rate) + ((adjusted_income - bracket_crossover) * higher_rate);
    default:
      return ((bracket_crossover - reducedAMTExemptionAmount(reduced_exemption)) * lower_rate) + ((adjusted_income - bracket_crossover) * higher_rate);
  }
}

function calculateIncomeTax(income, iso_gains, rsu_income, pension, filing_status) {
  const standard_deduction = standardTaxDetails(filing_status).standard_deduction;
  const adjusted_income    = income + (iso_gains*0) + rsu_income - pension - standard_deduction;
  console.log(adjusted_income)

  return standardTaxDetails(filing_status).tax_brackets.reduce((acc, bracket) => {
    const reached_current_tax_bracket = bracket[0] < adjusted_income;
    const bracket_taxable_rate        = bracket[0] > adjusted_income ? 0 : bracket[2];
    const floor_of_tax_bracket        = bracket[0];
    const ceiling_of_tax_bracket      = bracket[1] > adjusted_income ? adjusted_income : bracket[1];
    const taxable_income_in_bracket   = ceiling_of_tax_bracket - floor_of_tax_bracket;

    if (reached_current_tax_bracket) {
      console.log(taxable_income_in_bracket * bracket_taxable_rate);
      return acc + (taxable_income_in_bracket * bracket_taxable_rate);
    } else {
      console.log(acc)
      return acc;
    }
  }, 0); 
}

function calculateTaxes() {
  const filing_status   = document.getElementById('inputFilingStatus').value;
  const income          = Number(document.getElementById('inputIncome').value) || 0;
  const rsu_income      = Number(document.getElementById('rsuIncome').value) || 0;
  const iso_gains       = Number(document.getElementById('isoGains').value) || 0;
  const pension_contrib = Number(document.getElementById('pensionContributions').value) || 0;

  const federal_tax = calculateIncomeTax(income, iso_gains, rsu_income, pension_contrib, filing_status);
  const amt_tax     = calculateAMT(income, iso_gains, rsu_income, pension_contrib, filing_status);
  
  const is_amt_due  = federal_tax < amt_tax ? true : false;
  const delta       = Math.abs(federal_tax - amt_tax);
  
  document.getElementById('tax_bill').innerHTML      = `${asCurrency(federal_tax)}`;
  document.getElementById('amt_bill').innerHTML      = `${asCurrency(amt_tax)}`;
  document.getElementById('tax_amt_delta').innerHTML = `${asCurrency(delta)}`;

  if (is_amt_due) {
    document.getElementById('type_of_tax_owed').innerHTML   = 'You will be required to pay AMT';
    document.getElementById('type_of_tax_owed').style.color = 'red';
  } else {
    document.getElementById('type_of_tax_owed').innerHTML   = 'You must pay conventional federal tax';
    document.getElementById('type_of_tax_owed').style.color = 'green';
  }
}

const tax_form = document.querySelector('form');

try {
  tax_form.addEventListener('submit', evt => { 
    evt.preventDefault();
    calculateTaxes();
  });
} catch(e) {
  // for test cases. Won't throw in the browser
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('page_title').innerHTML = `AMT Tax Calculator – ${taxYear()}`;
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

