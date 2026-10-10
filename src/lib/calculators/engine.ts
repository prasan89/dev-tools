import type { CalculatorEntry } from './catalog';

export type FieldKind = 'number' | 'text' | 'date' | 'select' | 'textarea';
export interface CalculatorField {
  key: string;
  label: string;
  kind?: FieldKind;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
  hint?: string;
}
export type CalculatorValues = Record<string, string | number>;

const n = (v: CalculatorValues, key: string, fallback = 0): number => {
  const value = Number(v[key] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};
const s = (v: CalculatorValues, key: string, fallback = ''): string => String(v[key] ?? fallback);
const money = (value: number): string => Number.isFinite(value)
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
  : 'Unable to calculate with these inputs.';
const fixed = (value: number, digits = 2): string => Number.isFinite(value)
  ? value.toLocaleString('en-US', { maximumFractionDigits: digits })
  : 'Unable to calculate with these inputs.';
const positive = (value: number): number => Math.max(0, value);
const monthlyPayment = (principal: number, annualRate: number, months: number): number => {
  if (months <= 0) return 0;
  const r = annualRate / 1200;
  return r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
};

const common = {
  principal: { key: 'principal', label: 'Principal / amount', defaultValue: 250000, min: 0, step: 100 },
  rate: { key: 'rate', label: 'Annual rate (%)', defaultValue: 6.5, min: 0, max: 100, step: 0.1 },
  years: { key: 'years', label: 'Years', defaultValue: 20, min: 0.1, max: 100, step: 1 },
  monthlyPayment: { key: 'monthlyPayment', label: 'Monthly payment', defaultValue: 1500, min: 0, step: 50 },
  initial: { key: 'initial', label: 'Initial amount', defaultValue: 10000, min: 0, step: 100 },
  monthlyContribution: { key: 'monthlyContribution', label: 'Monthly contribution', defaultValue: 250, min: 0, step: 25 },
  income: { key: 'income', label: 'Annual income', defaultValue: 90000, min: 0, step: 1000 },
  expenses: { key: 'expenses', label: 'Monthly expenses', defaultValue: 2500, min: 0, step: 100 },
  taxRate: { key: 'taxRate', label: 'Tax / deduction rate (%)', defaultValue: 20, min: 0, max: 100, step: 1 },
  price: { key: 'price', label: 'Price / amount', defaultValue: 100, min: 0, step: 1 },
  fee: { key: 'fee', label: 'Fees / additional cost', defaultValue: 0, min: 0, step: 10 },
};

export function getCalculatorFields(calculator: CalculatorEntry): CalculatorField[] {
  const slug = calculator.slug;
  const fields = (...keys: Array<keyof typeof common>) => keys.map((key) => common[key]);
  const number = (key: string, label: string, value: number, extras: Partial<CalculatorField> = {}): CalculatorField =>
    ({ key, label, defaultValue: value, min: 0, step: 1, ...extras });
  const select = (key: string, label: string, options: Array<{label:string;value:string}>, value = options[0]?.value): CalculatorField =>
    ({ key, label, kind: 'select', defaultValue: value, options });
  switch (slug) {
    case 'mortgage-calculator': case 'loan-calculator': case 'auto-loan-calculator':
    case 'payment-calculator': case 'amortization-calculator': case 'student-loan-calculator':
    case 'personal-loan-calculator': case 'credit-card-calculator': case 'credit-card-payoff-calculator':
      return [...fields('principal', 'rate', 'years', 'fee'), number('downPayment', 'Down payment', 25000)];
    case 'mortgage-payoff-calculator': case 'debt-payoff-calculator':
      return [...fields('principal', 'rate', 'monthlyPayment'), number('extraPayment', 'Extra monthly payment', 100)];
    case 'retirement-calculator': case 'investment-calculator': case 'savings-calculator':
      return [...fields('initial', 'monthlyContribution', 'rate', 'years'), number('annualIncrease', 'Annual contribution increase (%)', 0, { max: 100, step: 1 })];
    case 'inflation-calculator':
      return [number('amount', 'Amount today', 1000), number('inflationRate', 'Annual inflation (%)', 3, { max: 100, step: 0.1 }), number('years', 'Years', 10, { max: 100, step: 1 })];
    case 'finance-calculator':
      return [...fields('principal', 'rate', 'years', 'monthlyPayment')];
    case 'income-tax-calculator': case 'take-home-pay-calculator':
      return [...fields('income', 'taxRate')];
    case 'salary-calculator':
      return [number('salary', 'Salary amount', 90000), select('period', 'Salary period', [{label:'Annual',value:'annual'},{label:'Monthly',value:'monthly'},{label:'Biweekly',value:'biweekly'},{label:'Weekly',value:'weekly'},{label:'Hourly',value:'hourly'}], 'annual'), number('hoursPerWeek', 'Hours per week', 40)];
    case 'interest-calculator': case 'simple-interest-calculator': case 'compound-interest-calculator':
    case 'cd-calculator': case 'bond-calculator':
      return [...fields('principal', 'rate', 'years'), number('compounds', 'Compounds per year', 12, { min: 1, max: 365, step: 1 }), number('contribution', 'Additional yearly contribution', 0)];
    case 'sales-tax-calculator':
      return [...fields('price', 'taxRate'), select('mode', 'Calculation', [{label:'Add tax to price',value:'add'},{label:'Find tax included in total',value:'included'}], 'add')];
    case 'house-affordability-calculator':
      return [number('income', 'Gross annual household income', 100000), number('monthlyDebts', 'Monthly debt payments', 500), number('downPayment', 'Down payment', 60000), number('rate', 'Mortgage rate (%)', 6.5, {max:100,step:0.1}), number('years', 'Mortgage term (years)', 30), number('expenseRatio', 'Housing share of gross income (%)', 28,{max:100,step:1})];
    case 'budget-calculator':
      return [number('income', 'Monthly take-home income', 5000), number('expenses', 'Monthly expenses', 3500), number('savingsGoal', 'Monthly savings goal', 500)];
    case 'rent-vs-buy-calculator':
      return [number('monthlyRent','Monthly rent',1800),number('homePrice','Home price',350000),number('downPayment','Down payment',70000),number('rate','Mortgage rate (%)',6.5,{max:100,step:0.1}),number('years','Mortgage term (years)',30),number('monthlyOwnership','Other monthly ownership costs',500)];
    case 'roi-calculator':
      return [number('initial','Initial investment',10000),number('finalValue','Final value',12500),number('fee','Fees / costs',0)];
    case 'interest-rate-calculator':
      return [number('principal','Starting amount',10000),number('futureValue','Ending amount',15000),number('years','Years invested',5,{min:0.1,max:100,step:0.1})];
    case 'apr-calculator':
      return [number('principal','Amount borrowed',20000),number('rate','Nominal annual rate (%)',8,{max:100,step:0.1}),number('years','Term in years',5),number('fee','Upfront fees',500)];
    case 'macro-calculator':
      return [number('calories','Daily calorie target',2200),number('proteinPct','Protein (%)',30,{max:100}),number('carbPct','Carbohydrate (%)',40,{max:100}),number('fatPct','Fat (%)',30,{max:100})];
    case 'bmi-calculator': case 'bmr-calculator': case 'calorie-calculator':
      return [number('weightKg','Weight (kg)',70),number('heightCm','Height (cm)',175),number('age','Age (years)',30,{min:1,max:120}),select('sex','Sex',[{label:'Male',value:'male'},{label:'Female',value:'female'}],'male'),...(slug==='calorie-calculator'?[select('activity','Activity level',[{label:'Sedentary',value:'1.2'},{label:'Lightly active',value:'1.375'},{label:'Moderately active',value:'1.55'},{label:'Very active',value:'1.725'},{label:'Extra active',value:'1.9'}],'1.55')]:[])];
    case 'body-fat-calculator': case 'army-body-fat-calculator':
      return [number('heightCm','Height (cm)',175),number('waistCm','Waist circumference (cm)',85),number('neckCm','Neck circumference (cm)',38),number('hipCm','Hip circumference (cm)',98),select('sex','Sex',[{label:'Male',value:'male'},{label:'Female',value:'female'}],'male')];
    case 'ideal-weight-calculator': case 'lean-body-mass-calculator':
      return [number('heightCm','Height (cm)',175),number('weightKg','Weight (kg)',70),number('bodyFatPct','Body fat (%)',20,{max:70})];
    case 'pregnancy-calculator': case 'due-date-calculator':
      return [{key:'lmpDate',label:'First day of last menstrual period',kind:'date',defaultValue:new Date().toISOString().slice(0,10)}];
    case 'pregnancy-conception-calculator':
      return [{key:'dueDate',label:'Estimated due date',kind:'date',defaultValue:new Date().toISOString().slice(0,10)}];
    case 'pregnancy-weight-gain-calculator':
      return [number('heightCm','Pre-pregnancy height (cm)',165),number('weightKg','Pre-pregnancy weight (kg)',65),number('currentWeek','Pregnancy week',20,{max:42})];
    case 'pace-calculator':
      return [number('distanceKm','Distance (km)',5),number('hours','Hours',0,{max:100}),number('minutes','Minutes',30,{max:59}),number('seconds','Seconds',0,{max:59})];
    case 'calories-burned-calculator':
      return [number('weightKg','Weight (kg)',70),number('durationMinutes','Exercise duration (minutes)',30),number('met','Activity MET value',6,{min:0.1,max:25,step:0.1})];
    case 'target-heart-rate-calculator':
      return [number('age','Age (years)',30,{min:1,max:120}),number('restingHeartRate','Resting heart rate (bpm)',65,{max:220}),number('intensityLow','Low intensity (%)',50,{max:100}),number('intensityHigh','High intensity (%)',85,{max:100})];
    case 'scientific-calculator':
      return [number('a','First number',12),select('operation','Operation',[{label:'Add (+)',value:'add'},{label:'Subtract (−)',value:'subtract'},{label:'Multiply (×)',value:'multiply'},{label:'Divide (÷)',value:'divide'},{label:'Power',value:'power'},{label:'Square root of first number',value:'sqrt'},{label:'Sine of first number (degrees)',value:'sin'},{label:'Cosine of first number (degrees)',value:'cos'},{label:'Log base 10',value:'log'}],'multiply'),number('b','Second number',3)];
    case 'fraction-calculator':
      return [number('a','Numerator 1',1),number('b','Denominator 1',2,{min:1}),select('operation','Operation',[{label:'Add',value:'add'},{label:'Subtract',value:'subtract'},{label:'Multiply',value:'multiply'},{label:'Divide',value:'divide'}],'add'),number('c','Numerator 2',1),number('d','Denominator 2',3,{min:1})];
    case 'percentage-calculator':
      return [number('a','Value',80),number('b','Percentage (%)',15,{max:10000}),select('operation','Calculation',[{label:'Find percentage of value',value:'of'},{label:'Percentage change from A to B',value:'change'},{label:'A is what percent of B?',value:'is'}],'of')];
    case 'triangle-calculator':
      return [number('a','Side a',3),number('b','Side b',4),number('angle','Included angle (degrees)',90,{min:0.1,max:179.9,step:0.1})];
    case 'volume-calculator':
      return [select('shape','Solid',[{label:'Rectangular prism',value:'box'},{label:'Cylinder',value:'cylinder'},{label:'Sphere',value:'sphere'},{label:'Cone',value:'cone'}],'box'),number('a','Length / radius',5),number('b','Width',4),number('c','Height',3)];
    case 'standard-deviation-calculator':
      return [{key:'numbers',label:'Numbers (comma-separated)',kind:'textarea',defaultValue:'4, 7, 8, 9, 10, 12'}];
    case 'random-number-generator':
      return [number('min','Minimum integer',1),number('max','Maximum integer',100),number('count','How many numbers',1,{min:1,max:100,step:1})];
    case 'number-sequence-calculator':
      return [number('a','First term',2),number('b','Common difference / ratio',3),number('count','Number of terms',10,{min:1,max:100,step:1}),select('sequenceType','Sequence type',[{label:'Arithmetic',value:'arithmetic'},{label:'Geometric',value:'geometric'}],'arithmetic')];
    case 'percent-error-calculator':
      return [number('measured','Measured value',9.8),number('accepted','Accepted value',9.81)];
    case 'exponent-calculator':
      return [number('a','Base',2),number('b','Exponent',8)];
    case 'binary-calculator':
      return [number('a','First integer',12),select('operation','Operation',[{label:'Convert',value:'convert'},{label:'Add',value:'add'},{label:'Subtract',value:'subtract'},{label:'AND',value:'and'},{label:'OR',value:'or'},{label:'XOR',value:'xor'}],'convert'),number('b','Second integer',5)];
    case 'quadratic-formula-calculator':
      return [number('a','Coefficient a',1),number('b','Coefficient b',-3),number('c','Coefficient c',2)];
    case 'slope-calculator':
      return [number('x1','Point 1 x',1),number('y1','Point 1 y',2),number('x2','Point 2 x',4),number('y2','Point 2 y',8)];
    case 'log-calculator':
      return [number('a','Number',100),number('base','Logarithm base',10,{min:0.01})];
    case 'probability-calculator':
      return [number('favorable','Favorable outcomes',1),number('total','Total possible outcomes',6,{min:1})];
    case 'age-calculator':
      return [{key:'birthDate',label:'Date of birth',kind:'date',defaultValue:'1990-01-01'},{key:'asOfDate',label:'Calculate age on',kind:'date',defaultValue:new Date().toISOString().slice(0,10)}];
    case 'date-calculator':
      return [{key:'startDate',label:'Start date',kind:'date',defaultValue:new Date().toISOString().slice(0,10)},{key:'endDate',label:'End date',kind:'date',defaultValue:new Date(Date.now()+30*86400000).toISOString().slice(0,10)},number('daysToAdd','Days to add (optional)',0)];
    case 'time-calculator': case 'hours-calculator': case 'time-card-calculator':
      return [number('startHour','Start hour (24h)',9,{max:23}),number('startMinute','Start minute',0,{max:59}),number('endHour','End hour (24h)',17,{max:23}),number('endMinute','End minute',0,{max:59}),number('breakMinutes','Unpaid break (minutes)',30,{max:1440})];
    case 'gpa-calculator':
      return [number('gradePoints','Total grade points',10),number('credits','Total credits',3,{min:0.1})];
    case 'grade-calculator':
      return [number('earned','Points earned',85),number('possible','Points possible',100,{min:0.1})];
    case 'concrete-calculator':
      return [number('length','Length (ft)',20),number('width','Width (ft)',10),number('depth','Depth (in)',4)];
    case 'ip-subnet-calculator':
      return [{key:'ipAddress',label:'IPv4 address',kind:'text',defaultValue:'192.168.1.10'},{key:'cidr',label:'CIDR prefix',defaultValue:24,min:0,max:32,step:1}];
    case 'password-generator':
      return [number('length','Password length',20,{min:8,max:128,step:1}),number('count','Number of passwords',1,{min:1,max:10,step:1}),select('symbols','Include symbols',[{label:'Yes',value:'yes'},{label:'No',value:'no'}],'yes')];
    case 'conversion-calculator':
      return [number('value','Value to convert',1),select('conversion','Conversion',[{label:'Kilometres → miles',value:'km-mi'},{label:'Miles → kilometres',value:'mi-km'},{label:'Kilograms → pounds',value:'kg-lb'},{label:'Pounds → kilograms',value:'lb-kg'},{label:'Celsius → Fahrenheit',value:'c-f'},{label:'Fahrenheit → Celsius',value:'f-c'},{label:'Centimetres → inches',value:'cm-in'},{label:'Inches → centimetres',value:'in-cm'}],'km-mi')];
    case 'fuel-cost-calculator':
      return [number('distanceKm','Trip distance (km)',250),number('efficiency','Fuel efficiency (km/L)',15,{min:0.1}),number('fuelPrice','Fuel price per litre',1.1)];
    case 'voltage-drop-calculator':
      return [number('current','Current (A)',10),number('length','One-way conductor length (m)',20),number('area','Conductor area (mm²)',2.5,{min:0.1}),select('material','Conductor',[{label:'Copper',value:'copper'},{label:'Aluminium',value:'aluminium'}],'copper'),number('voltage','Supply voltage (V)',230)];
    case 'tip-calculator':
      return [number('bill','Bill amount',80),number('tipPct','Tip (%)',15,{max:100}),number('people','People splitting bill',2,{min:1,max:100,step:1})];
    case 'sleep-calculator':
      return [select('mode','I want to',[{label:'Find wake-up times',value:'wake'},{label:'Find bedtime',value:'bed'}],'wake'),select('time','Reference time',[{label:'6:00 AM',value:'06:00'},{label:'7:00 AM',value:'07:00'},{label:'8:00 AM',value:'08:00'},{label:'9:00 PM',value:'21:00'},{label:'10:00 PM',value:'22:00'},{label:'11:00 PM',value:'23:00'}],'07:00'),number('cycles','Sleep cycles',5,{min:3,max:6,step:1})];
    default:
      return [...fields('price', 'rate'), number('a','First value',10), number('b','Second value',5)];
  }
}

export function calculate(slug: string, v: CalculatorValues): { title: string; lines: string[]; note?: string } {
  const a=n(v,'a'), b=n(v,'b'), c=n(v,'c'), principal=positive(n(v,'principal')), rate=n(v,'rate'), years=n(v,'years',1), months=Math.max(1,Math.round(years*12));
  const result=(title:string,...lines:string[]):{title:string;lines:string[]}=>({title,lines});
  switch(slug) {
    case 'mortgage-calculator': case 'loan-calculator': case 'auto-loan-calculator': case 'payment-calculator': case 'student-loan-calculator': case 'credit-card-calculator': {
      const financed=positive(principal-n(v,'downPayment')+n(v,'fee')); const p=monthlyPayment(financed,rate,months);
      return result('Estimated payment',money(p)+' per month','Total of payments: '+money(p*months),'Total interest: '+money(p*months-financed));
    }
    case 'amortization-calculator': {
      const p=monthlyPayment(principal,rate,months); return result('Amortization summary','Monthly payment: '+money(p),'Total principal: '+money(principal),'Total interest: '+money(p*months-principal),'Total paid: '+money(p*months));
    }
    case 'mortgage-payoff-calculator': case 'debt-payoff-calculator': case 'credit-card-payoff-calculator': {
      const payment=n(v,'monthlyPayment')+n(v,'extraPayment'); const r=rate/1200; if(payment<=principal*r) return result('Payment too low','Monthly payment must exceed the first month interest of '+money(principal*r));
      let balance=principal, totalInterest=0, count=0; while(balance>0.01&&count<1200){const interest=balance*r;totalInterest+=interest;balance=Math.max(0,balance+interest-payment);count++;} return result('Payoff estimate', 'Months to payoff: '+count,'Total interest: '+money(totalInterest),'Total paid: '+money(principal+totalInterest));
    }
    case 'retirement-calculator': case 'investment-calculator': case 'savings-calculator': {
      const r=rate/1200; let balance=n(v,'initial'); let contribution=n(v,'monthlyContribution'); const annualIncrease=n(v,'annualIncrease')/100; for(let i=0;i<months;i++){balance=balance*(1+r)+contribution;if((i+1)%12===0)contribution*=1+annualIncrease;}
      const contributed=n(v,'initial')+n(v,'monthlyContribution')*Array.from({length:Math.ceil(months/12)},(_,i)=>Math.min(12,Math.max(0,months-i*12))*Math.pow(1+annualIncrease,i)).reduce((sum,x)=>sum+x,0); return result('Projected balance',money(balance),'Total contributions: '+money(contributed),'Estimated growth: '+money(balance-contributed));
    }
    case 'inflation-calculator': {const amount=n(v,'amount');const future=amount*Math.pow(1+n(v,'inflationRate')/100,years);return result('Inflation projection','Future equivalent: '+money(future),'Additional amount: '+money(future-amount),'Purchasing power of '+money(amount)+' today is roughly equivalent to '+money(amount/Math.pow(1+n(v,'inflationRate')/100,years))+' in '+years+' years.');}
    case 'finance-calculator': {const p=monthlyPayment(principal,rate,months);return result('Time value of money','Monthly payment for principal: '+money(p),'Total payments: '+money(p*months),'Total interest: '+money(p*months-principal));}
    case 'income-tax-calculator': case 'take-home-pay-calculator': {const income=n(v,'income');const deductions=income*n(v,'taxRate')/100;return result('Estimated annual result','Gross income: '+money(income),'Estimated deductions: '+money(deductions),'Net income: '+money(income-deductions),'This is a simplified estimate, not a jurisdiction-specific tax calculation.');}
    case 'salary-calculator': {const salary=n(v,'salary');const factor=s(v,'period','annual');const annual=factor==='monthly'?salary*12:factor==='biweekly'?salary*26:factor==='weekly'?salary*52:factor==='hourly'?salary*n(v,'hoursPerWeek',40)*52:salary;return result('Salary conversion','Annual: '+money(annual),'Monthly: '+money(annual/12),'Biweekly: '+money(annual/26),'Hourly estimate: '+money(annual/(52*n(v,'hoursPerWeek',40))));}
    case 'interest-calculator': case 'simple-interest-calculator': {const interest=principal*rate/100*years;return result('Simple interest','Interest: '+money(interest),'Principal plus interest: '+money(principal+interest));}
    case 'compound-interest-calculator': case 'cd-calculator': {const compounds=Math.max(1,n(v,'compounds',12));const factor=Math.pow(1+rate/100/compounds,compounds);const future=principal*Math.pow(factor,years);const contribution=n(v,'contribution');let contributionsFuture=0;for(let year=1;year<=Math.floor(years);year++)contributionsFuture+=contribution*Math.pow(factor,years-year);const totalFuture=future+contributionsFuture;return result('Compound growth','Future value: '+money(totalFuture),'Interest and growth: '+money(totalFuture-principal-contribution*Math.floor(years)),'Effective annual rate: '+fixed((factor-1)*100)+'%');}
    case 'interest-rate-calculator': {const future=n(v,'futureValue',principal);const annual=(Math.pow(future/Math.max(principal,0.0001),1/Math.max(years,0.01))-1)*100;return result('Estimated annual rate',fixed(annual)+'% per year');}
    case 'bond-calculator': {const coupon=principal*rate/100;return result('Bond income','Annual coupon income: '+money(coupon),'Simple current yield: '+fixed(coupon/Math.max(n(v,'price',principal),0.01)*100)+'%','Excludes maturity value changes and reinvestment.');}
    case 'sales-tax-calculator': {const price=n(v,'price'),r=n(v,'taxRate')/100;const tax=s(v,'mode')==='included'?price-price/(1+r):price*r;return result('Sales tax','Tax amount: '+money(tax),'Total with tax: '+money(s(v,'mode')==='included'?price:price+tax),'Pre-tax price: '+money(s(v,'mode')==='included'?price/(1+r):price));}
    case 'house-affordability-calculator': {const monthly=n(v,'income')/12*n(v,'expenseRatio',28)/100-n(v,'monthlyDebts');const r=rate/1200;const principalMax=monthly>0?(r===0?monthly*months:monthly*(1-Math.pow(1+r,-months))/r):0;return result('Estimated home budget',money(principalMax+n(v,'downPayment'))+' including down payment','Estimated affordable mortgage: '+money(principalMax),'Based on your selected housing share; excludes taxes, insurance and maintenance.');}
    case 'budget-calculator': {const income=n(v,'income'),expenses=n(v,'expenses'),goal=n(v,'savingsGoal');return result('Monthly budget','Surplus / deficit: '+money(income-expenses),'After savings goal: '+money(income-expenses-goal),'Savings rate: '+fixed(income>0?(income-expenses)/income*100:0)+'%');}
    case 'rent-vs-buy-calculator': {const payment=monthlyPayment(positive(n(v,'homePrice')-n(v,'downPayment')),rate,months)+n(v,'monthlyOwnership');const rent=n(v,'monthlyRent');return result('Monthly cost comparison','Estimated ownership cost: '+money(payment),'Rent: '+money(rent),'Monthly difference (ownership − rent): '+money(payment-rent),'Simplified monthly comparison; excludes appreciation, transaction costs and tax effects.');}
    case 'roi-calculator': {const initial=n(v,'initial'),net=n(v,'finalValue')-initial-n(v,'fee');return result('Return on investment','Net gain: '+money(net),'ROI: '+fixed(initial>0?net/initial*100:0)+'%');}
    case 'apr-calculator': {const financed=positive(principal-n(v,'fee'));const payment=monthlyPayment(financed,rate,months);const total=payment*months+n(v,'fee');return result('Borrowing cost','Monthly payment: '+money(payment),'Total cost including fees: '+money(total),'Nominal rate: '+fixed(rate)+'%. This estimate does not solve an exact regulatory APR equation.');}
    case 'macro-calculator': {const calories=n(v,'calories'),p=calories*n(v,'proteinPct')/100/4,carb=calories*n(v,'carbPct')/100/4,fat=calories*n(v,'fatPct')/100/9;return result('Daily macro estimate','Protein: '+fixed(p)+' g','Carbohydrates: '+fixed(carb)+' g','Fat: '+fixed(fat)+' g','Macro percentages total '+fixed(n(v,'proteinPct')+n(v,'carbPct')+n(v,'fatPct'))+'%.');}
    case 'bmi-calculator': {const bmi=n(v,'weightKg')/Math.pow(n(v,'heightCm')/100,2);return result('Body mass index',fixed(bmi)+' kg/m²',bmi<18.5?'Adult BMI category: underweight':bmi<25?'Adult BMI category: healthy range':bmi<30?'Adult BMI category: overweight':'Adult BMI category: obesity','BMI is a screening measure, not a diagnosis.');}
    case 'bmr-calculator': case 'calorie-calculator': {const w=n(v,'weightKg'),h=n(v,'heightCm'),age=n(v,'age');const bmr=10*w+6.25*h-5*age+(s(v,'sex')==='female'?-161:5);return result(slug==='bmr-calculator'?'Basal metabolic rate':'Estimated daily calories',fixed(bmr)+' kcal/day'+(slug==='calorie-calculator'?' before activity adjustment':''),...(slug==='calorie-calculator'?['Estimated maintenance: '+fixed(bmr*n(v,'activity',1.55))+' kcal/day']:[]),'Uses Mifflin–St Jeor; individual needs vary.');}
    case 'body-fat-calculator': case 'army-body-fat-calculator': {const height=n(v,'heightCm')/2.54,waist=n(v,'waistCm')/2.54,neck=n(v,'neckCm')/2.54,hip=n(v,'hipCm')/2.54;const estimate=s(v,'sex')==='female'?163.205*Math.log10(Math.max(waist+hip-neck,1))-97.684*Math.log10(height)-78.387:86.01*Math.log10(Math.max(waist-neck,1))-70.041*Math.log10(height)+36.76;return result('Estimated body fat',fixed(estimate)+'%','Uses a circumference-based estimate; measurement method affects accuracy.');}
    case 'ideal-weight-calculator': {const h=n(v,'heightCm')/100;return result('Reference weight estimates','BMI 18.5–24.9 range: '+fixed(18.5*h*h)+'–'+fixed(24.9*h*h)+' kg','These population reference ranges are not a personalized medical recommendation.');}
    case 'lean-body-mass-calculator': {const weight=n(v,'weightKg'),lean=weight*(1-n(v,'bodyFatPct')/100);return result('Lean body mass',fixed(lean)+' kg','Estimated fat mass: '+fixed(weight-lean)+' kg');}
    case 'pregnancy-calculator': case 'due-date-calculator': {const date=new Date(s(v,'lmpDate'));if(Number.isNaN(date.getTime()))return result('Invalid date','Enter a valid last menstrual period date.');date.setDate(date.getDate()+280);return result('Estimated due date',date.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}),'Pregnancy dating is an estimate; consult a qualified clinician.');}
    case 'pregnancy-conception-calculator': {const date=new Date(s(v,'dueDate'));date.setDate(date.getDate()-266);return result('Estimated conception date',date.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}),'This is an approximate date, not confirmation of conception.');}
    case 'pregnancy-weight-gain-calculator': {const bmi=n(v,'weightKg')/Math.pow(n(v,'heightCm')/100,2);const range=bmi<18.5?[12.5,18]:bmi<25?[11.5,16]:bmi<30?[7,11.5]:[5,9];return result('General pregnancy weight-gain guidance',range[0]+'–'+range[1]+' kg total for a singleton pregnancy','Discuss personal targets with your maternity-care provider.');}
    case 'pace-calculator': {const dist=n(v,'distanceKm'),total=n(v,'hours')*3600+n(v,'minutes')*60+n(v,'seconds');return result('Running pace',fixed(total/Math.max(dist,0.001)/60)+' min/km','Speed: '+fixed(dist/(total/3600||1))+' km/h','Distance and time are user-entered; use consistent units.');}
    case 'calories-burned-calculator': {const kcal=n(v,'met')*3.5*n(v,'weightKg')/200*n(v,'durationMinutes');return result('Estimated calories burned',fixed(kcal)+' kcal','Exercise energy estimates vary by person and activity.');}
    case 'target-heart-rate-calculator': {const max=208-0.7*n(v,'age');const reserve=max-n(v,'restingHeartRate');return result('Target heart-rate range',fixed(n(v,'restingHeartRate')+reserve*n(v,'intensityLow')/100)+'–'+fixed(n(v,'restingHeartRate')+reserve*n(v,'intensityHigh')/100)+' bpm','Estimate only; follow medical advice where relevant.');}
    case 'scientific-calculator': {const op=s(v,'operation');const values:Record<string,number>={add:a+b,subtract:a-b,multiply:a*b,divide:a/b,power:Math.pow(a,b),sqrt:Math.sqrt(a),sin:Math.sin(a*Math.PI/180),cos:Math.cos(a*Math.PI/180),log:Math.log10(a)};return result('Result',fixed(values[op]??NaN,8));}
    case 'fraction-calculator': {const d=n(v,'b',1),e=n(v,'d',1),x=n(v,'c');const op=s(v,'operation');const numerator=op==='add'?a*e+x*d:op==='subtract'?a*e-x*d:op==='multiply'?a*x:a*e;const denominator=op==='multiply'?d*e:op==='divide'?d*x:d*e;return result('Fraction result',fixed(numerator/denominator,8),numerator+'/'+denominator);}
    case 'percentage-calculator': {const op=s(v,'operation');const value=op==='of'?a*b/100:op==='change'?(a===0?NaN:(b-a)/Math.abs(a)*100):(b===0?NaN:a/b*100);return result('Percentage result',fixed(value)+'%');}
    case 'triangle-calculator': {const area=0.5*a*b*Math.sin(n(v,'angle')*Math.PI/180);const side=Math.sqrt(Math.max(0,a*a+b*b-2*a*b*Math.cos(n(v,'angle')*Math.PI/180)));return result('Triangle results','Area: '+fixed(area),'Third side: '+fixed(side),'Perimeter: '+fixed(a+b+side));}
    case 'volume-calculator': {const shape=s(v,'shape');const vol=shape==='sphere'?4/3*Math.PI*a**3:shape==='cylinder'?Math.PI*a*a*c:shape==='cone'?Math.PI*a*a*c/3:a*b*c;return result('Volume',fixed(vol)+' cubic units');}
    case 'standard-deviation-calculator': {const values=s(v,'numbers').split(/[\s,;]+/).map(Number).filter(Number.isFinite);if(!values.length)return result('No data','Enter comma-separated numbers.');const mean=values.reduce((sum,x)=>sum+x,0)/values.length;const variance=values.reduce((sum,x)=>sum+(x-mean)**2,0)/values.length;return result('Statistics','Count: '+values.length,'Mean: '+fixed(mean),'Population variance: '+fixed(variance),'Population standard deviation: '+fixed(Math.sqrt(variance)),'Sample standard deviation: '+fixed(Math.sqrt(values.length>1?variance*values.length/(values.length-1):0)));}
    case 'random-number-generator': {const min=Math.ceil(n(v,'min')),max=Math.floor(n(v,'max')),count=Math.min(100,Math.max(1,Math.floor(n(v,'count',1))));if(max<min)return result('Invalid range','Maximum must be at least the minimum.');return result('Random numbers',Array.from({length:count},()=>String(Math.floor(Math.random()*(max-min+1))+min)).join(', '));}
    case 'number-sequence-calculator': {const count=Math.min(100,Math.max(1,Math.floor(n(v,'count',10))));const vals=Array.from({length:count},(_,i)=>s(v,'sequenceType')==='geometric'?a*Math.pow(b,i):a+b*i);return result('Sequence',vals.map(x=>fixed(x)).join(', '));}
    case 'percent-error-calculator': {const accepted=n(v,'accepted');return result('Percent error',fixed(Math.abs(n(v,'measured')-accepted)/Math.max(Math.abs(accepted),0.0000001)*100)+'%');}
    case 'exponent-calculator': return result('Power',fixed(Math.pow(a,b),8));
    case 'binary-calculator': {const x=Math.trunc(a),y=Math.trunc(b),op=s(v,'operation');const val=op==='add'?x+y:op==='subtract'?x-y:op==='and'?(x&y):op==='or'?(x|y):op==='xor'?(x^y):x;return result('Binary result','Decimal: '+val,'Binary: '+(val>>>0).toString(2));}
    case 'quadratic-formula-calculator': {if(a===0)return result('Not quadratic','Coefficient a cannot be zero.');const disc=b*b-4*a*c;if(disc>=0)return result('Roots','x₁ = '+fixed((-b+Math.sqrt(disc))/(2*a)),'x₂ = '+fixed((-b-Math.sqrt(disc))/(2*a)),'Discriminant: '+fixed(disc));return result('Complex roots','Real part: '+fixed(-b/(2*a)),'Imaginary magnitude: '+fixed(Math.sqrt(-disc)/(2*Math.abs(a))),'Discriminant: '+fixed(disc));}
    case 'slope-calculator': {const dx=n(v,'x2')-n(v,'x1'),dy=n(v,'y2')-n(v,'y1');return result('Line results',dx===0?'Slope: undefined (vertical line)':'Slope: '+fixed(dy/dx),'Change in y: '+fixed(dy),'Change in x: '+fixed(dx));}
    case 'log-calculator': return result('Logarithm',fixed(Math.log(n(v,'a'))/Math.log(n(v,'base',10)),8));
    case 'probability-calculator': {const p=n(v,'favorable')/Math.max(1,n(v,'total'));return result('Probability',fixed(p*100)+'%','Decimal probability: '+fixed(p),'Odds in favor: '+fixed(n(v,'favorable'))+' : '+fixed(Math.max(0,n(v,'total')-n(v,'favorable'))));}
    case 'age-calculator': {const birth=new Date(s(v,'birthDate')),asOf=new Date(s(v,'asOfDate'));let age=asOf.getFullYear()-birth.getFullYear();const m=asOf.getMonth()-birth.getMonth();if(m<0||(m===0&&asOf.getDate()<birth.getDate()))age--;return result('Age',age>=0?age+' years':'Check the dates','Birth date: '+birth.toLocaleDateString(),'As of: '+asOf.toLocaleDateString());}
    case 'date-calculator': {const start=new Date(s(v,'startDate')),end=new Date(s(v,'endDate'));const days=Math.round((end.getTime()-start.getTime())/86400000);const added=new Date(start);added.setDate(added.getDate()+n(v,'daysToAdd'));return result('Date calculation','Days between dates: '+days,'Date after adding '+n(v,'daysToAdd')+' days: '+added.toLocaleDateString());}
    case 'time-calculator': case 'hours-calculator': case 'time-card-calculator': {let mins=n(v,'endHour')*60+n(v,'endMinute')-(n(v,'startHour')*60+n(v,'startMinute'));if(mins<0)mins+=1440;mins=Math.max(0,mins-n(v,'breakMinutes'));return result('Elapsed paid time',fixed(mins/60)+' hours',Math.floor(mins/60)+' hours '+(mins%60)+' minutes');}
    case 'gpa-calculator': return result('GPA',fixed(n(v,'gradePoints')/Math.max(n(v,'credits'),0.01)),'Use grade points and credits on the same grading scale.');
    case 'grade-calculator': {const pct=n(v,'earned')/Math.max(n(v,'possible'),0.01)*100;return result('Grade',fixed(pct)+'%',pct>=90?'Letter grade estimate: A':pct>=80?'Letter grade estimate: B':pct>=70?'Letter grade estimate: C':pct>=60?'Letter grade estimate: D':'Letter grade estimate: F');}
    case 'concrete-calculator': {const cubicFt=n(v,'length')*n(v,'width')*n(v,'depth')/12;return result('Concrete volume',fixed(cubicFt)+' cubic feet',fixed(cubicFt/27)+' cubic yards','Add a waste allowance for real-world orders.');}
    case 'ip-subnet-calculator': {const ip=s(v,'ipAddress').split('.').map(Number),cidr=Math.max(0,Math.min(32,Math.floor(n(v,'cidr',24))));if(ip.length!==4||ip.some(x=>!Number.isInteger(x)||x<0||x>255))return result('Invalid IPv4 address','Enter a valid dotted IPv4 address.');const num=ip.reduce((acc,x)=>(acc*256+x)>>>0,0)>>>0;const mask=cidr===0?0:(0xffffffff<<(32-cidr))>>>0;const network=(num&mask)>>>0;const broadcast=(network|(~mask>>>0))>>>0;const ipText=(x:number)=>[x>>>24,(x>>>16)&255,(x>>>8)&255,x&255].join('.');return result('Subnet details','Network: '+ipText(network),'Broadcast: '+ipText(broadcast),'Subnet mask: '+ipText(mask),'Addresses: '+Math.pow(2,32-cidr),'Usable hosts: '+(cidr>=31?Math.pow(2,32-cidr):Math.max(0,Math.pow(2,32-cidr)-2)));}
    case 'password-generator': {const length=Math.max(8,Math.min(128,Math.floor(n(v,'length',20)))),count=Math.max(1,Math.min(10,Math.floor(n(v,'count',1))));const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'+(s(v,'symbols')==='yes'?'!@#$%^&*()-_=+[]{}?':'');const passwords=Array.from({length:count},()=>{const bytes=new Uint32Array(length);if(typeof crypto!=='undefined'&&crypto.getRandomValues)crypto.getRandomValues(bytes);else for(let i=0;i<length;i++)bytes[i]=Math.floor(Math.random()*4294967295);return Array.from(bytes,x=>chars[x%chars.length]).join('');});return result('Generated passwords',...passwords,'Generated locally; do not reuse passwords across sites.');}
    case 'conversion-calculator': {const value=n(v,'value');const factors:Record<string,(x:number)=>number>={'km-mi':x=>x*0.621371,'mi-km':x=>x/0.621371,'kg-lb':x=>x*2.20462262,'lb-kg':x=>x/2.20462262,'c-f':x=>x*9/5+32,'f-c':x=>(x-32)*5/9,'cm-in':x=>x/2.54,'in-cm':x=>x*2.54};return result('Converted value',fixed((factors[s(v,'conversion')]??(x=>x))(value)));}
    case 'fuel-cost-calculator': {const litres=n(v,'distanceKm')/Math.max(n(v,'efficiency'),0.01);return result('Trip fuel estimate',fixed(litres)+' litres','Estimated cost: '+money(litres*n(v,'fuelPrice')));}
    case 'voltage-drop-calculator': {const resistivity=s(v,'material')==='aluminium'?0.0282:0.0172;const drop=2*n(v,'length')*n(v,'current')*resistivity/Math.max(n(v,'area'),0.01);return result('Voltage drop',fixed(drop)+' V','Voltage at load: '+fixed(n(v,'voltage')-drop)+' V','Approximate DC estimate; actual wiring rules and AC impedance may differ.');}
    case 'tip-calculator': {const bill=n(v,'bill'),tip=bill*n(v,'tipPct')/100,people=Math.max(1,n(v,'people'));return result('Bill split','Tip: '+money(tip),'Total: '+money(bill+tip),'Per person: '+money((bill+tip)/people));}
    case 'sleep-calculator': {const [hh,mm]=s(v,'time','07:00').split(':').map(Number);const base=new Date();base.setHours(hh,mm,0,0);const direction=s(v,'mode')==='bed'?-1:1;const times=[3,4,5,6].map(cycles=>{const d=new Date(base.getTime()+direction*(cycles*90+15)*60000);return cycles+' cycles: '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});});return result(s(v,'mode')==='bed'?'Suggested bedtimes':'Suggested wake-up times',...times,'Sleep cycles vary; this is a planning aid, not medical advice.');}
    default: return result('Calculator not available yet','This calculator is listed in the catalog but its formula has not been implemented.');
  }
}
