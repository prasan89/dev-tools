export type CalculatorCategory = 'Financial' | 'Fitness & Health' | 'Math' | 'Other';

export interface CalculatorEntry {
  slug: string;
  name: string;
  category: CalculatorCategory;
  description: string;
}

const groups: Array<{ category: CalculatorCategory; items: Array<[string, string]> }> = [
  { category: 'Financial', items: [
    ['Mortgage Calculator', 'Estimate monthly mortgage payments, total interest and repayment.'],
    ['Loan Calculator', 'Calculate fixed-rate loan payments and total borrowing cost.'],
    ['Auto Loan Calculator', 'Estimate car loan payments including down payment and fees.'],
    ['Interest Calculator', 'Calculate interest earned or charged over time.'],
    ['Payment Calculator', 'Estimate recurring payments for a fixed principal and rate.'],
    ['Retirement Calculator', 'Project retirement savings from current savings and contributions.'],
    ['Amortization Calculator', 'Explore principal and interest across a loan schedule.'],
    ['Investment Calculator', 'Project investment growth with recurring contributions.'],
    ['Inflation Calculator', 'Estimate how purchasing power changes with inflation.'],
    ['Finance Calculator', 'Solve common time-value-of-money scenarios.'],
    ['Income Tax Calculator', 'Estimate income tax using a simplified configurable rate.'],
    ['Compound Interest Calculator', 'Project compound growth over time.'],
    ['Salary Calculator', 'Convert salary across common pay periods.'],
    ['Interest Rate Calculator', 'Estimate annual interest rate from principal and growth.'],
    ['Sales Tax Calculator', 'Calculate tax and total price from a rate.'],
    ['Mortgage Payoff Calculator', 'Estimate payoff time and interest with extra payments.'],
    ['House Affordability Calculator', 'Estimate a home budget from income and expenses.'],
    ['Savings Calculator', 'Project savings from an initial balance and regular deposits.'],
    ['Credit Card Calculator', 'Estimate monthly interest and payoff cost.'],
    ['Credit Card Payoff Calculator', 'Estimate how long a card balance takes to repay.'],
    ['Debt Payoff Calculator', 'Model debt repayment using a fixed monthly payment.'],
    ['Student Loan Calculator', 'Estimate student loan payments and total interest.'],
    ['Simple Interest Calculator', 'Calculate simple interest without compounding.'],
    ['CD Calculator', 'Estimate certificate-of-deposit growth.'],
    ['Bond Calculator', 'Estimate bond coupon income and simple yield.'],
    ['ROI Calculator', 'Calculate return on investment as a percentage.'],
    ['APR Calculator', 'Estimate annualized borrowing cost from rate and fees.'],
    ['Budget Calculator', 'Compare income, expenses and monthly surplus.'],
    ['Rent vs. Buy Calculator', 'Compare simplified monthly renting and ownership costs.'],
    ['Take-Home Pay Calculator', 'Estimate take-home pay after a configurable deduction rate.'],
  ]},
  { category: 'Fitness & Health', items: [
    ['BMI Calculator', 'Calculate body mass index from height and weight.'],
    ['Calorie Calculator', 'Estimate daily calorie needs using activity level.'],
    ['Body Fat Calculator', 'Estimate body-fat percentage using a simplified circumference method.'],
    ['BMR Calculator', 'Estimate basal metabolic rate using the Mifflin–St Jeor equation.'],
    ['Macro Calculator', 'Split a daily calorie target into protein, carbohydrate and fat.'],
    ['Ideal Weight Calculator', 'Compare several common height-based ideal-weight estimates.'],
    ['Pregnancy Calculator', 'Estimate a due date from the last menstrual period.'],
    ['Pregnancy Weight Gain Calculator', 'Estimate a guideline range based on pre-pregnancy BMI.'],
    ['Pregnancy Conception Calculator', 'Estimate a conception date from a due date.'],
    ['Due Date Calculator', 'Estimate a due date from the last menstrual period.'],
    ['Pace Calculator', 'Calculate pace, time or distance for a run.'],
    ['Army Body Fat Calculator', 'Estimate body-fat percentage from circumference measurements.'],
    ['Lean Body Mass Calculator', 'Estimate lean body mass from weight and body-fat percentage.'],
    ['Calories Burned Calculator', 'Estimate exercise calories using MET, weight and duration.'],
    ['Target Heart Rate Calculator', 'Estimate a training heart-rate range by age.'],
  ]},
  { category: 'Math', items: [
    ['Scientific Calculator', 'Evaluate common arithmetic and scientific expressions.'],
    ['Fraction Calculator', 'Add, subtract, multiply or divide two fractions.'],
    ['Percentage Calculator', 'Find percentages, percentage changes and differences.'],
    ['Triangle Calculator', 'Calculate a triangle area and third side from two sides and angle.'],
    ['Volume Calculator', 'Calculate common solid volumes.'],
    ['Standard Deviation Calculator', 'Calculate mean, variance and standard deviation from a list.'],
    ['Random Number Generator', 'Generate random integers within a chosen range.'],
    ['Number Sequence Calculator', 'Generate arithmetic or geometric sequences.'],
    ['Percent Error Calculator', 'Calculate percent error against an accepted value.'],
    ['Exponent Calculator', 'Calculate a base raised to an exponent.'],
    ['Binary Calculator', 'Convert integers to binary and perform basic binary operations.'],
    ['Quadratic Formula Calculator', 'Solve quadratic equations and report real or complex roots.'],
    ['Slope Calculator', 'Calculate slope and line equation from two points.'],
    ['Log Calculator', 'Calculate logarithms for a selected base.'],
    ['Probability Calculator', 'Calculate basic event probability and odds.'],
  ]},
  { category: 'Other', items: [
    ['Age Calculator', 'Calculate age in years, months and days from a birth date.'],
    ['Date Calculator', 'Find the number of days between two dates or add days to a date.'],
    ['Time Calculator', 'Add or subtract hours and minutes.'],
    ['Hours Calculator', 'Calculate elapsed hours between start and end times.'],
    ['GPA Calculator', 'Calculate weighted GPA from course grades and credits.'],
    ['Grade Calculator', 'Calculate a grade percentage from earned and possible points.'],
    ['Concrete Calculator', 'Estimate concrete volume for a rectangular slab.'],
    ['IP Subnet Calculator', 'Calculate IPv4 network, broadcast and host range.'],
    ['Password Generator', 'Generate a strong random password locally in the browser.'],
    ['Conversion Calculator', 'Convert common length, mass and temperature units.'],
    ['Fuel Cost Calculator', 'Estimate trip fuel use and cost.'],
    ['Voltage Drop Calculator', 'Estimate DC voltage drop across a conductor.'],
    ['Time Card Calculator', 'Calculate paid hours from clock-in, clock-out and breaks.'],
    ['Tip Calculator', 'Calculate tip and split a bill between people.'],
    ['Sleep Calculator', 'Suggest sleep/wake times using 90-minute sleep-cycle estimates.'],
  ]},
];

export const CALCULATORS: CalculatorEntry[] = groups.flatMap(({ category, items }) =>
  items.map(([name, description]) => ({
    name,
    description,
    category,
    slug: name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\+/g, 'plus')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  })),
);

export const CALCULATOR_CATEGORIES: CalculatorCategory[] = [
  'Financial',
  'Fitness & Health',
  'Math',
  'Other',
];

export function getCalculator(slug: string): CalculatorEntry | undefined {
  return CALCULATORS.find((calculator) => calculator.slug === slug);
}

export function getCalculatorsByCategory(category?: CalculatorCategory): CalculatorEntry[] {
  return category ? CALCULATORS.filter((calculator) => calculator.category === category) : CALCULATORS;
}
