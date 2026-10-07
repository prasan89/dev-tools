// Factual scientific reference data — accurate to the best of available knowledge.
// Weather and earthquake records are synthetic/fictional for demonstration purposes.

// ---------------------------------------------------------------------------
// Science Dataset — elements, planets, moons, units, countries, weather,
// earthquakes, animal species, plants, human body reference data
// ---------------------------------------------------------------------------

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: string;
  period: number;
  group: number | null;
  atomicMass: number;
  electronConfiguration: string;
  electronegativity: number | null;
  meltingPoint: number | null; // Kelvin
  boilingPoint: number | null; // Kelvin
  density: number | null; // g/cm³
  discoveredBy: string;
  yearDiscovered: number | null;
  uses: string[];
}

export interface Planet {
  name: string;
  type: 'planet' | 'dwarf planet';
  orderFromSun: number;
  distanceFromSun: number; // AU
  diameter: number; // km
  mass: string; // kg in scientific notation as string
  gravity: number; // m/s²
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // Earth days
  moons: number;
  hasRings: boolean;
  atmosphere: string[];
}

export interface Moon {
  name: string;
  planet: string;
  diameter: number; // km
  orbitalPeriod: number; // days
  distance: number; // km from planet
  discovered: number; // year
  discoveredBy: string;
  notes: string;
}

export interface ScientificUnit {
  name: string;
  symbol: string;
  quantity: string;
  system: 'SI' | 'CGS' | 'imperial' | 'derived' | 'other';
  definition: string;
  equivalents: Record<string, string>;
}

export interface CountryPopulation {
  country: string;
  code: string;
  population: number;
  area: number; // km²
  density: number; // people/km²
  growthRate: number; // %
  medianAge: number;
  urbanization: number; // %
  gdpPerCapita: number; // USD
}

export interface WeatherObservation {
  id: string;
  city: string;
  country: string;
  date: string;
  temperature: number; // °C
  feelsLike: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  pressure: number; // hPa
  condition: string;
  uvIndex: number;
  visibility: number; // km
}

export interface EarthquakeRecord {
  id: string;
  date: string;
  location: string;
  lat: number;
  lng: number;
  magnitude: number;
  depth: number; // km
  tsunami: boolean;
  casualties: number; // synthetic
  damage: string;
}

export interface AnimalSpecies {
  name: string;
  commonName: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  conservationStatus: string;
  habitat: string[];
  diet: string;
  lifespan: number; // years
  weight: number; // kg
  length: number; // cm
}

export interface PlantSpecies {
  name: string;
  commonName: string;
  family: string;
  origin: string;
  type: 'tree' | 'shrub' | 'herb' | 'vine' | 'grass';
  uses: string[];
  climate: string;
  height: number; // cm
  endangered: boolean;
}

export interface BodySystemOrgan {
  name: string;
  function: string;
}

export interface HumanBodySystem {
  system: string;
  organs: BodySystemOrgan[];
  conditions: string[];
  facts: string[];
}

// ---------------------------------------------------------------------------
// Elements data — all 118 elements
// ---------------------------------------------------------------------------

export function scienceElementsData(): Element[] {
  return [
    {
      atomicNumber: 1, symbol: 'H', name: 'Hydrogen', category: 'nonmetal', period: 1, group: 1,
      atomicMass: 1.008, electronConfiguration: '1s¹', electronegativity: 2.20,
      meltingPoint: 14.01, boilingPoint: 20.28, density: 0.00008988,
      discoveredBy: 'Henry Cavendish', yearDiscovered: 1766,
      uses: ['Fuel cells', 'Ammonia production', 'Petroleum refining', 'Rocket fuel'],
    },
    {
      atomicNumber: 2, symbol: 'He', name: 'Helium', category: 'noble gas', period: 1, group: 18,
      atomicMass: 4.0026, electronConfiguration: '1s²', electronegativity: null,
      meltingPoint: null, boilingPoint: 4.22, density: 0.0001664,
      discoveredBy: 'Pierre Janssen / Norman Lockyer', yearDiscovered: 1868,
      uses: ['Balloons', 'Cryogenics', 'MRI machines', 'Leak detection'],
    },
    {
      atomicNumber: 3, symbol: 'Li', name: 'Lithium', category: 'alkali metal', period: 2, group: 1,
      atomicMass: 6.941, electronConfiguration: '[He] 2s¹', electronegativity: 0.98,
      meltingPoint: 453.65, boilingPoint: 1603, density: 0.534,
      discoveredBy: 'Johan August Arfwedson', yearDiscovered: 1817,
      uses: ['Rechargeable batteries', 'Psychiatric medication', 'Ceramics', 'Lubricating greases'],
    },
    {
      atomicNumber: 4, symbol: 'Be', name: 'Beryllium', category: 'alkaline earth metal', period: 2, group: 2,
      atomicMass: 9.0122, electronConfiguration: '[He] 2s²', electronegativity: 1.57,
      meltingPoint: 1560, boilingPoint: 2742, density: 1.85,
      discoveredBy: 'Louis-Nicolas Vauquelin', yearDiscovered: 1798,
      uses: ['Aerospace alloys', 'Nuclear reactors', 'X-ray windows', 'Electronics'],
    },
    {
      atomicNumber: 5, symbol: 'B', name: 'Boron', category: 'metalloid', period: 2, group: 13,
      atomicMass: 10.811, electronConfiguration: '[He] 2s² 2p¹', electronegativity: 2.04,
      meltingPoint: 2349, boilingPoint: 4200, density: 2.34,
      discoveredBy: 'Joseph Louis Gay-Lussac / Louis Jacques Thénard', yearDiscovered: 1808,
      uses: ['Borosilicate glass', 'Detergents', 'Semiconductors', 'Fertilizers'],
    },
    {
      atomicNumber: 6, symbol: 'C', name: 'Carbon', category: 'nonmetal', period: 2, group: 14,
      atomicMass: 12.011, electronConfiguration: '[He] 2s² 2p²', electronegativity: 2.55,
      meltingPoint: 3823, boilingPoint: 4098, density: 2.267,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Steel production', 'Fuels', 'Plastics', 'Diamonds', 'Life (organic chemistry)'],
    },
    {
      atomicNumber: 7, symbol: 'N', name: 'Nitrogen', category: 'nonmetal', period: 2, group: 15,
      atomicMass: 14.007, electronConfiguration: '[He] 2s² 2p³', electronegativity: 3.04,
      meltingPoint: 63.15, boilingPoint: 77.36, density: 0.001251,
      discoveredBy: 'Daniel Rutherford', yearDiscovered: 1772,
      uses: ['Fertilizers', 'Explosives', 'Cryogenic cooling', 'Food packaging'],
    },
    {
      atomicNumber: 8, symbol: 'O', name: 'Oxygen', category: 'nonmetal', period: 2, group: 16,
      atomicMass: 15.999, electronConfiguration: '[He] 2s² 2p⁴', electronegativity: 3.44,
      meltingPoint: 54.36, boilingPoint: 90.20, density: 0.001429,
      discoveredBy: 'Carl Wilhelm Scheele / Joseph Priestley', yearDiscovered: 1774,
      uses: ['Respiration', 'Steel production', 'Medical oxygen', 'Water treatment'],
    },
    {
      atomicNumber: 9, symbol: 'F', name: 'Fluorine', category: 'halogen', period: 2, group: 17,
      atomicMass: 18.998, electronConfiguration: '[He] 2s² 2p⁵', electronegativity: 3.98,
      meltingPoint: 53.53, boilingPoint: 85.03, density: 0.001696,
      discoveredBy: 'Henri Moissan', yearDiscovered: 1886,
      uses: ['Toothpaste (fluoride)', 'Teflon', 'Refrigerants', 'Pharmaceuticals'],
    },
    {
      atomicNumber: 10, symbol: 'Ne', name: 'Neon', category: 'noble gas', period: 2, group: 18,
      atomicMass: 20.180, electronConfiguration: '[He] 2s² 2p⁶', electronegativity: null,
      meltingPoint: 24.56, boilingPoint: 27.07, density: 0.0008999,
      discoveredBy: 'William Ramsay / Morris Travers', yearDiscovered: 1898,
      uses: ['Neon signs', 'Lasers', 'Cryogenics', 'Lighting'],
    },
    {
      atomicNumber: 11, symbol: 'Na', name: 'Sodium', category: 'alkali metal', period: 3, group: 1,
      atomicMass: 22.990, electronConfiguration: '[Ne] 3s¹', electronegativity: 0.93,
      meltingPoint: 370.87, boilingPoint: 1156, density: 0.971,
      discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
      uses: ['Table salt', 'Street lighting', 'Chemical synthesis', 'Nuclear reactors'],
    },
    {
      atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', category: 'alkaline earth metal', period: 3, group: 2,
      atomicMass: 24.305, electronConfiguration: '[Ne] 3s²', electronegativity: 1.31,
      meltingPoint: 923, boilingPoint: 1363, density: 1.738,
      discoveredBy: 'Joseph Black', yearDiscovered: 1755,
      uses: ['Lightweight alloys', 'Fireworks', 'Medicine (antacids)', 'Fertilizers'],
    },
    {
      atomicNumber: 13, symbol: 'Al', name: 'Aluminum', category: 'post-transition metal', period: 3, group: 13,
      atomicMass: 26.982, electronConfiguration: '[Ne] 3s² 3p¹', electronegativity: 1.61,
      meltingPoint: 933.47, boilingPoint: 2792, density: 2.70,
      discoveredBy: 'Hans Christian Ørsted', yearDiscovered: 1825,
      uses: ['Packaging', 'Aircraft', 'Construction', 'Electrical wiring'],
    },
    {
      atomicNumber: 14, symbol: 'Si', name: 'Silicon', category: 'metalloid', period: 3, group: 14,
      atomicMass: 28.086, electronConfiguration: '[Ne] 3s² 3p²', electronegativity: 1.90,
      meltingPoint: 1687, boilingPoint: 3538, density: 2.3296,
      discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1824,
      uses: ['Semiconductors', 'Solar cells', 'Glass', 'Computer chips'],
    },
    {
      atomicNumber: 15, symbol: 'P', name: 'Phosphorus', category: 'nonmetal', period: 3, group: 15,
      atomicMass: 30.974, electronConfiguration: '[Ne] 3s² 3p³', electronegativity: 2.19,
      meltingPoint: 317.30, boilingPoint: 553.65, density: 1.82,
      discoveredBy: 'Hennig Brand', yearDiscovered: 1669,
      uses: ['Fertilizers', 'Detergents', 'Matches', 'DNA backbone'],
    },
    {
      atomicNumber: 16, symbol: 'S', name: 'Sulfur', category: 'nonmetal', period: 3, group: 16,
      atomicMass: 32.065, electronConfiguration: '[Ne] 3s² 3p⁴', electronegativity: 2.58,
      meltingPoint: 388.36, boilingPoint: 717.87, density: 2.067,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Fertilizers', 'Sulfuric acid', 'Vulcanization of rubber', 'Pesticides'],
    },
    {
      atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', category: 'halogen', period: 3, group: 17,
      atomicMass: 35.453, electronConfiguration: '[Ne] 3s² 3p⁵', electronegativity: 3.16,
      meltingPoint: 171.65, boilingPoint: 239.11, density: 0.003214,
      discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1774,
      uses: ['Water purification', 'PVC plastic', 'Disinfectants', 'Bleach'],
    },
    {
      atomicNumber: 18, symbol: 'Ar', name: 'Argon', category: 'noble gas', period: 3, group: 18,
      atomicMass: 39.948, electronConfiguration: '[Ne] 3s² 3p⁶', electronegativity: null,
      meltingPoint: 83.80, boilingPoint: 87.30, density: 0.001784,
      discoveredBy: 'Lord Rayleigh / William Ramsay', yearDiscovered: 1894,
      uses: ['Welding shielding gas', 'Light bulbs', 'Double-pane windows', 'Laboratory use'],
    },
    {
      atomicNumber: 19, symbol: 'K', name: 'Potassium', category: 'alkali metal', period: 4, group: 1,
      atomicMass: 39.098, electronConfiguration: '[Ar] 4s¹', electronegativity: 0.82,
      meltingPoint: 336.53, boilingPoint: 1032, density: 0.862,
      discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
      uses: ['Fertilizers', 'Salt substitutes', 'Soaps', 'Medicine'],
    },
    {
      atomicNumber: 20, symbol: 'Ca', name: 'Calcium', category: 'alkaline earth metal', period: 4, group: 2,
      atomicMass: 40.078, electronConfiguration: '[Ar] 4s²', electronegativity: 1.00,
      meltingPoint: 1115, boilingPoint: 1757, density: 1.55,
      discoveredBy: 'Humphry Davy', yearDiscovered: 1808,
      uses: ['Bones and teeth', 'Cement', 'Steel production', 'Lime'],
    },
    {
      atomicNumber: 22, symbol: 'Ti', name: 'Titanium', category: 'transition metal', period: 4, group: 4,
      atomicMass: 47.867, electronConfiguration: '[Ar] 3d² 4s²', electronegativity: 1.54,
      meltingPoint: 1941, boilingPoint: 3560, density: 4.506,
      discoveredBy: 'William Gregor', yearDiscovered: 1791,
      uses: ['Aerospace alloys', 'Medical implants', 'Paint pigment', 'Sports equipment'],
    },
    {
      atomicNumber: 24, symbol: 'Cr', name: 'Chromium', category: 'transition metal', period: 4, group: 6,
      atomicMass: 51.996, electronConfiguration: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66,
      meltingPoint: 2180, boilingPoint: 2944, density: 7.15,
      discoveredBy: 'Louis-Nicolas Vauquelin', yearDiscovered: 1798,
      uses: ['Stainless steel', 'Chrome plating', 'Pigments', 'Tanning leather'],
    },
    {
      atomicNumber: 25, symbol: 'Mn', name: 'Manganese', category: 'transition metal', period: 4, group: 7,
      atomicMass: 54.938, electronConfiguration: '[Ar] 3d⁵ 4s²', electronegativity: 1.55,
      meltingPoint: 1519, boilingPoint: 2334, density: 7.21,
      discoveredBy: 'Johan Gottlieb Gahn', yearDiscovered: 1774,
      uses: ['Steel production', 'Batteries', 'Fertilizers', 'Pigments'],
    },
    {
      atomicNumber: 26, symbol: 'Fe', name: 'Iron', category: 'transition metal', period: 4, group: 8,
      atomicMass: 55.845, electronConfiguration: '[Ar] 3d⁶ 4s²', electronegativity: 1.83,
      meltingPoint: 1811, boilingPoint: 3134, density: 7.874,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Steel', 'Construction', 'Vehicles', 'Hemoglobin in blood'],
    },
    {
      atomicNumber: 27, symbol: 'Co', name: 'Cobalt', category: 'transition metal', period: 4, group: 9,
      atomicMass: 58.933, electronConfiguration: '[Ar] 3d⁷ 4s²', electronegativity: 1.88,
      meltingPoint: 1768, boilingPoint: 3143, density: 8.90,
      discoveredBy: 'Georg Brandt', yearDiscovered: 1735,
      uses: ['Superalloys', 'Batteries (lithium-ion)', 'Blue pigments', 'Cancer treatment'],
    },
    {
      atomicNumber: 28, symbol: 'Ni', name: 'Nickel', category: 'transition metal', period: 4, group: 10,
      atomicMass: 58.693, electronConfiguration: '[Ar] 3d⁸ 4s²', electronegativity: 1.91,
      meltingPoint: 1728, boilingPoint: 3186, density: 8.908,
      discoveredBy: 'Axel Fredrik Cronstedt', yearDiscovered: 1751,
      uses: ['Stainless steel', 'Coins', 'Batteries', 'Catalysts'],
    },
    {
      atomicNumber: 29, symbol: 'Cu', name: 'Copper', category: 'transition metal', period: 4, group: 11,
      atomicMass: 63.546, electronConfiguration: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90,
      meltingPoint: 1357.77, boilingPoint: 2835, density: 8.96,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Electrical wiring', 'Plumbing', 'Electronics', 'Coins'],
    },
    {
      atomicNumber: 30, symbol: 'Zn', name: 'Zinc', category: 'transition metal', period: 4, group: 12,
      atomicMass: 65.38, electronConfiguration: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65,
      meltingPoint: 692.68, boilingPoint: 1180, density: 7.134,
      discoveredBy: 'Andreas Sigismund Marggraf', yearDiscovered: 1746,
      uses: ['Galvanizing steel', 'Brass alloys', 'Sunscreen', 'Dietary supplement'],
    },
    {
      atomicNumber: 35, symbol: 'Br', name: 'Bromine', category: 'halogen', period: 4, group: 17,
      atomicMass: 79.904, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96,
      meltingPoint: 265.8, boilingPoint: 331.95, density: 3.1028,
      discoveredBy: 'Antoine Jérôme Balard', yearDiscovered: 1826,
      uses: ['Flame retardants', 'Pesticides', 'Photography', 'Water purification'],
    },
    {
      atomicNumber: 36, symbol: 'Kr', name: 'Krypton', category: 'noble gas', period: 4, group: 18,
      atomicMass: 83.798, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: null,
      meltingPoint: 115.79, boilingPoint: 119.93, density: 0.003733,
      discoveredBy: 'William Ramsay / Morris Travers', yearDiscovered: 1898,
      uses: ['Fluorescent lighting', 'Lasers', 'Photography flash', 'Insulated windows'],
    },
    {
      atomicNumber: 47, symbol: 'Ag', name: 'Silver', category: 'transition metal', period: 5, group: 11,
      atomicMass: 107.868, electronConfiguration: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93,
      meltingPoint: 1234.93, boilingPoint: 2435, density: 10.49,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Jewelry', 'Electronics', 'Photography', 'Antibacterial coatings'],
    },
    {
      atomicNumber: 50, symbol: 'Sn', name: 'Tin', category: 'post-transition metal', period: 5, group: 14,
      atomicMass: 118.710, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96,
      meltingPoint: 505.08, boilingPoint: 2875, density: 7.265,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Tin cans', 'Solder', 'Bronze alloys', 'Coatings'],
    },
    {
      atomicNumber: 53, symbol: 'I', name: 'Iodine', category: 'halogen', period: 5, group: 17,
      atomicMass: 126.904, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66,
      meltingPoint: 386.85, boilingPoint: 457.4, density: 4.933,
      discoveredBy: 'Bernard Courtois', yearDiscovered: 1811,
      uses: ['Antiseptics', 'Thyroid medications', 'Photography', 'Water purification'],
    },
    {
      atomicNumber: 54, symbol: 'Xe', name: 'Xenon', category: 'noble gas', period: 5, group: 18,
      atomicMass: 131.293, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: null,
      meltingPoint: 161.4, boilingPoint: 165.03, density: 0.005887,
      discoveredBy: 'William Ramsay / Morris Travers', yearDiscovered: 1898,
      uses: ['Xenon headlights', 'Anesthesia', 'Ion propulsion', 'Flash photography'],
    },
    {
      atomicNumber: 56, symbol: 'Ba', name: 'Barium', category: 'alkaline earth metal', period: 6, group: 2,
      atomicMass: 137.327, electronConfiguration: '[Xe] 6s²', electronegativity: 0.89,
      meltingPoint: 1000, boilingPoint: 2143, density: 3.51,
      discoveredBy: 'Humphry Davy', yearDiscovered: 1808,
      uses: ['X-ray contrast agent', 'Fireworks (green)', 'Oil drilling fluids', 'Glass'],
    },
    {
      atomicNumber: 74, symbol: 'W', name: 'Tungsten', category: 'transition metal', period: 6, group: 6,
      atomicMass: 183.84, electronConfiguration: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36,
      meltingPoint: 3695, boilingPoint: 5828, density: 19.3,
      discoveredBy: 'Juan José Elhuyar / Fausto Elhuyar', yearDiscovered: 1783,
      uses: ['Light bulb filaments', 'Cutting tools', 'X-ray tubes', 'Superalloys'],
    },
    {
      atomicNumber: 78, symbol: 'Pt', name: 'Platinum', category: 'transition metal', period: 6, group: 10,
      atomicMass: 195.084, electronConfiguration: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28,
      meltingPoint: 2041.4, boilingPoint: 4098, density: 21.45,
      discoveredBy: 'Antonio de Ulloa', yearDiscovered: 1735,
      uses: ['Catalytic converters', 'Jewelry', 'Fuel cells', 'Cancer treatment (cisplatin)'],
    },
    {
      atomicNumber: 79, symbol: 'Au', name: 'Gold', category: 'transition metal', period: 6, group: 11,
      atomicMass: 196.967, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54,
      meltingPoint: 1337.33, boilingPoint: 3129, density: 19.30,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Jewelry', 'Currency', 'Electronics', 'Medicine'],
    },
    {
      atomicNumber: 80, symbol: 'Hg', name: 'Mercury', category: 'transition metal', period: 6, group: 12,
      atomicMass: 200.592, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00,
      meltingPoint: 234.32, boilingPoint: 629.88, density: 13.534,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Thermometers (legacy)', 'Fluorescent lamps', 'Dental amalgams', 'Mining'],
    },
    {
      atomicNumber: 82, symbol: 'Pb', name: 'Lead', category: 'post-transition metal', period: 6, group: 14,
      atomicMass: 207.2, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33,
      meltingPoint: 600.61, boilingPoint: 2022, density: 11.34,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Lead-acid batteries', 'Radiation shielding', 'Ammunition', 'Weights'],
    },
    {
      atomicNumber: 86, symbol: 'Rn', name: 'Radon', category: 'noble gas', period: 6, group: 18,
      atomicMass: 222, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: null,
      meltingPoint: 202, boilingPoint: 211.45, density: 0.00973,
      discoveredBy: 'Friedrich Ernst Dorn', yearDiscovered: 1900,
      uses: ['Cancer treatment (historical)', 'Earthquake detection research', 'Atmospheric research'],
    },
    {
      atomicNumber: 88, symbol: 'Ra', name: 'Radium', category: 'alkaline earth metal', period: 7, group: 2,
      atomicMass: 226, electronConfiguration: '[Rn] 7s²', electronegativity: 0.89,
      meltingPoint: 973, boilingPoint: 2010, density: 5.0,
      discoveredBy: 'Marie Curie / Pierre Curie', yearDiscovered: 1898,
      uses: ['Cancer treatment (historical)', 'Luminous paint (historical)', 'Neutron source'],
    },
    {
      atomicNumber: 92, symbol: 'U', name: 'Uranium', category: 'actinide', period: 7, group: null,
      atomicMass: 238.029, electronConfiguration: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38,
      meltingPoint: 1405.3, boilingPoint: 4404, density: 19.1,
      discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789,
      uses: ['Nuclear fuel', 'Nuclear weapons', 'Radiation shielding', 'Geological dating'],
    },
    {
      atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', category: 'actinide', period: 7, group: null,
      atomicMass: 244, electronConfiguration: '[Rn] 5f⁶ 7s²', electronegativity: 1.28,
      meltingPoint: 912.5, boilingPoint: 3505, density: 19.84,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1940,
      uses: ['Nuclear weapons', 'Nuclear reactor fuel', 'Space power (RTGs)'],
    },
    // Remaining elements to reach 118
    {
      atomicNumber: 21, symbol: 'Sc', name: 'Scandium', category: 'transition metal', period: 4, group: 3,
      atomicMass: 44.956, electronConfiguration: '[Ar] 3d¹ 4s²', electronegativity: 1.36,
      meltingPoint: 1814, boilingPoint: 3109, density: 2.985,
      discoveredBy: 'Lars Fredrik Nilson', yearDiscovered: 1879,
      uses: ['Aerospace alloys', 'Sports equipment', 'High-intensity lamps'],
    },
    {
      atomicNumber: 23, symbol: 'V', name: 'Vanadium', category: 'transition metal', period: 4, group: 5,
      atomicMass: 50.942, electronConfiguration: '[Ar] 3d³ 4s²', electronegativity: 1.63,
      meltingPoint: 2183, boilingPoint: 3680, density: 6.11,
      discoveredBy: 'Andrés Manuel del Río', yearDiscovered: 1801,
      uses: ['Steel alloys', 'Catalysts', 'Redox flow batteries'],
    },
    {
      atomicNumber: 31, symbol: 'Ga', name: 'Gallium', category: 'post-transition metal', period: 4, group: 13,
      atomicMass: 69.723, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81,
      meltingPoint: 302.91, boilingPoint: 2477, density: 5.91,
      discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1875,
      uses: ['Semiconductors (GaAs)', 'LEDs', 'Solar cells', 'Thermometers'],
    },
    {
      atomicNumber: 32, symbol: 'Ge', name: 'Germanium', category: 'metalloid', period: 4, group: 14,
      atomicMass: 72.630, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01,
      meltingPoint: 1211.4, boilingPoint: 3106, density: 5.323,
      discoveredBy: 'Clemens Winkler', yearDiscovered: 1886,
      uses: ['Semiconductors', 'Fiber optics', 'Infrared optics', 'Catalysts'],
    },
    {
      atomicNumber: 33, symbol: 'As', name: 'Arsenic', category: 'metalloid', period: 4, group: 15,
      atomicMass: 74.922, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18,
      meltingPoint: 1090, boilingPoint: 887, density: 5.727,
      discoveredBy: 'Albertus Magnus', yearDiscovered: 1250,
      uses: ['Semiconductors (GaAs)', 'Wood preservatives (historical)', 'Pesticides (historical)'],
    },
    {
      atomicNumber: 34, symbol: 'Se', name: 'Selenium', category: 'nonmetal', period: 4, group: 16,
      atomicMass: 78.971, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55,
      meltingPoint: 494, boilingPoint: 958, density: 4.819,
      discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1817,
      uses: ['Solar cells', 'Glass coloring', 'Antidandruff shampoos', 'Semiconductors'],
    },
    {
      atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', category: 'alkali metal', period: 5, group: 1,
      atomicMass: 85.468, electronConfiguration: '[Kr] 5s¹', electronegativity: 0.82,
      meltingPoint: 312.46, boilingPoint: 961, density: 1.532,
      discoveredBy: 'Robert Bunsen / Gustav Kirchhoff', yearDiscovered: 1861,
      uses: ['Atomic clocks', 'Research', 'Fireworks (purple)'],
    },
    {
      atomicNumber: 38, symbol: 'Sr', name: 'Strontium', category: 'alkaline earth metal', period: 5, group: 2,
      atomicMass: 87.62, electronConfiguration: '[Kr] 5s²', electronegativity: 0.95,
      meltingPoint: 1050, boilingPoint: 1655, density: 2.64,
      discoveredBy: 'Adair Crawford', yearDiscovered: 1790,
      uses: ['Fireworks (red)', 'Magnets', 'Glow-in-dark phosphors', 'Osteoporosis treatment'],
    },
    {
      atomicNumber: 39, symbol: 'Y', name: 'Yttrium', category: 'transition metal', period: 5, group: 3,
      atomicMass: 88.906, electronConfiguration: '[Kr] 4d¹ 5s²', electronegativity: 1.22,
      meltingPoint: 1799, boilingPoint: 3609, density: 4.472,
      discoveredBy: 'Johan Gadolin', yearDiscovered: 1794,
      uses: ['LEDs', 'Superconductors', 'Cancer treatment', 'Camera lenses'],
    },
    {
      atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', category: 'transition metal', period: 5, group: 4,
      atomicMass: 91.224, electronConfiguration: '[Kr] 4d² 5s²', electronegativity: 1.33,
      meltingPoint: 2128, boilingPoint: 4682, density: 6.52,
      discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789,
      uses: ['Nuclear reactors', 'Ceramics', 'Medical implants', 'Gemstone (cubic zirconia)'],
    },
    {
      atomicNumber: 41, symbol: 'Nb', name: 'Niobium', category: 'transition metal', period: 5, group: 5,
      atomicMass: 92.906, electronConfiguration: '[Kr] 4d⁴ 5s¹', electronegativity: 1.60,
      meltingPoint: 2750, boilingPoint: 5017, density: 8.57,
      discoveredBy: 'Charles Hatchett', yearDiscovered: 1801,
      uses: ['High-strength steel', 'Superconducting magnets', 'Jet engines'],
    },
    {
      atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', category: 'transition metal', period: 5, group: 6,
      atomicMass: 95.95, electronConfiguration: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16,
      meltingPoint: 2896, boilingPoint: 4912, density: 10.22,
      discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1778,
      uses: ['Steel alloys', 'Catalysts', 'Lubricants', 'Aircraft parts'],
    },
    {
      atomicNumber: 43, symbol: 'Tc', name: 'Technetium', category: 'transition metal', period: 5, group: 7,
      atomicMass: 98, electronConfiguration: '[Kr] 4d⁵ 5s²', electronegativity: 1.90,
      meltingPoint: 2430, boilingPoint: 4538, density: 11.0,
      discoveredBy: 'Carlo Perrier / Emilio Segrè', yearDiscovered: 1937,
      uses: ['Medical imaging (nuclear medicine)', 'Corrosion inhibitor (research)'],
    },
    {
      atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', category: 'transition metal', period: 5, group: 8,
      atomicMass: 101.07, electronConfiguration: '[Kr] 4d⁷ 5s¹', electronegativity: 2.20,
      meltingPoint: 2607, boilingPoint: 4423, density: 12.37,
      discoveredBy: 'Karl Ernst Claus', yearDiscovered: 1844,
      uses: ['Electrical contacts', 'Catalysts', 'Pen nibs', 'Hard disk coatings'],
    },
    {
      atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', category: 'transition metal', period: 5, group: 9,
      atomicMass: 102.906, electronConfiguration: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28,
      meltingPoint: 2237, boilingPoint: 3968, density: 12.41,
      discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1803,
      uses: ['Catalytic converters', 'Jewelry plating', 'Thermocouples'],
    },
    {
      atomicNumber: 46, symbol: 'Pd', name: 'Palladium', category: 'transition metal', period: 5, group: 10,
      atomicMass: 106.42, electronConfiguration: '[Kr] 4d¹⁰', electronegativity: 2.20,
      meltingPoint: 1828.05, boilingPoint: 3236, density: 12.023,
      discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1803,
      uses: ['Catalytic converters', 'Hydrogen purification', 'Jewelry', 'Dentistry'],
    },
    {
      atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', category: 'transition metal', period: 5, group: 12,
      atomicMass: 112.411, electronConfiguration: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69,
      meltingPoint: 594.22, boilingPoint: 1040, density: 8.65,
      discoveredBy: 'Friedrich Strohmeyer', yearDiscovered: 1817,
      uses: ['Ni-Cd batteries', 'Electroplating', 'Solar cells (CdTe)', 'Nuclear control rods'],
    },
    {
      atomicNumber: 49, symbol: 'In', name: 'Indium', category: 'post-transition metal', period: 5, group: 13,
      atomicMass: 114.818, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78,
      meltingPoint: 429.75, boilingPoint: 2345, density: 7.31,
      discoveredBy: 'Ferdinand Reich / Hieronymous Theodor Richter', yearDiscovered: 1863,
      uses: ['LCD screens (ITO)', 'Semiconductors', 'Bearings', 'Solar cells'],
    },
    {
      atomicNumber: 51, symbol: 'Sb', name: 'Antimony', category: 'metalloid', period: 5, group: 15,
      atomicMass: 121.760, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05,
      meltingPoint: 903.78, boilingPoint: 1860, density: 6.697,
      discoveredBy: 'Ancient (known since antiquity)', yearDiscovered: null,
      uses: ['Flame retardants', 'Lead-acid batteries', 'Semiconductors', 'Pigments'],
    },
    {
      atomicNumber: 52, symbol: 'Te', name: 'Tellurium', category: 'metalloid', period: 5, group: 16,
      atomicMass: 127.60, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.10,
      meltingPoint: 722.66, boilingPoint: 1261, density: 6.24,
      discoveredBy: 'Franz-Joseph Müller von Reichenstein', yearDiscovered: 1783,
      uses: ['Solar cells (CdTe)', 'Thermoelectric devices', 'Steel alloys'],
    },
    {
      atomicNumber: 55, symbol: 'Cs', name: 'Cesium', category: 'alkali metal', period: 6, group: 1,
      atomicMass: 132.905, electronConfiguration: '[Xe] 6s¹', electronegativity: 0.79,
      meltingPoint: 301.59, boilingPoint: 944, density: 1.873,
      discoveredBy: 'Robert Bunsen / Gustav Kirchhoff', yearDiscovered: 1860,
      uses: ['Atomic clocks', 'Photoelectric cells', 'Ion engines (research)', 'Drilling fluids'],
    },
    {
      atomicNumber: 57, symbol: 'La', name: 'Lanthanum', category: 'lanthanide', period: 6, group: null,
      atomicMass: 138.905, electronConfiguration: '[Xe] 5d¹ 6s²', electronegativity: 1.10,
      meltingPoint: 1193, boilingPoint: 3737, density: 6.162,
      discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1839,
      uses: ['Camera lenses', 'Hybrid car batteries', 'Hydrogen storage', 'Catalysts'],
    },
    {
      atomicNumber: 58, symbol: 'Ce', name: 'Cerium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 140.116, electronConfiguration: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12,
      meltingPoint: 1068, boilingPoint: 3716, density: 6.770,
      discoveredBy: 'Martin Heinrich Klaproth / Jöns Jacob Berzelius / Wilhelm Hisinger', yearDiscovered: 1803,
      uses: ['Catalytic converters', 'Glass polishing', 'UV filters', 'Lighter flints'],
    },
    {
      atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 144.242, electronConfiguration: '[Xe] 4f⁴ 6s²', electronegativity: 1.14,
      meltingPoint: 1297, boilingPoint: 3347, density: 7.01,
      discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885,
      uses: ['Powerful permanent magnets', 'Lasers', 'Headphones', 'Wind turbines'],
    },
    {
      atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 157.25, electronConfiguration: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.20,
      meltingPoint: 1585, boilingPoint: 3546, density: 7.90,
      discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1880,
      uses: ['MRI contrast agents', 'Nuclear reactor shielding', 'Magneto-optical recording'],
    },
    {
      atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 162.500, electronConfiguration: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22,
      meltingPoint: 1680, boilingPoint: 2840, density: 8.551,
      discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1886,
      uses: ['Powerful magnets (Nd-Fe-B)', 'Nuclear reactors', 'Data storage'],
    },
    {
      atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 173.045, electronConfiguration: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.10,
      meltingPoint: 1097, boilingPoint: 1469, density: 6.90,
      discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1878,
      uses: ['Atomic clocks', 'Fiber optic amplifiers', 'Stress gauges'],
    },
    {
      atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 174.967, electronConfiguration: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27,
      meltingPoint: 1925, boilingPoint: 3675, density: 9.841,
      discoveredBy: 'Georges Urbain', yearDiscovered: 1907,
      uses: ['PET scan detectors', 'Cancer treatment (Lu-177)', 'Catalysts'],
    },
    {
      atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', category: 'transition metal', period: 6, group: 4,
      atomicMass: 178.49, electronConfiguration: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.30,
      meltingPoint: 2506, boilingPoint: 4876, density: 13.31,
      discoveredBy: 'Dirk Coster / George de Hevesy', yearDiscovered: 1923,
      uses: ['Nuclear control rods', 'Microprocessor gate dielectrics', 'Superalloys'],
    },
    {
      atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', category: 'transition metal', period: 6, group: 5,
      atomicMass: 180.948, electronConfiguration: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.50,
      meltingPoint: 3290, boilingPoint: 5731, density: 16.69,
      discoveredBy: 'Anders Gustaf Ekeberg', yearDiscovered: 1802,
      uses: ['Capacitors (electronics)', 'Medical implants', 'Superalloys'],
    },
    {
      atomicNumber: 75, symbol: 'Re', name: 'Rhenium', category: 'transition metal', period: 6, group: 7,
      atomicMass: 186.207, electronConfiguration: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.90,
      meltingPoint: 3459, boilingPoint: 5869, density: 21.02,
      discoveredBy: 'Walter Noddack / Ida Noddack / Otto Berg', yearDiscovered: 1925,
      uses: ['Jet engine superalloys', 'Catalysts', 'Thermocouples'],
    },
    {
      atomicNumber: 76, symbol: 'Os', name: 'Osmium', category: 'transition metal', period: 6, group: 8,
      atomicMass: 190.23, electronConfiguration: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.20,
      meltingPoint: 3306, boilingPoint: 5285, density: 22.59,
      discoveredBy: 'Smithson Tennant', yearDiscovered: 1803,
      uses: ['Pen nibs', 'Electrical contacts', 'Hardening alloys'],
    },
    {
      atomicNumber: 77, symbol: 'Ir', name: 'Iridium', category: 'transition metal', period: 6, group: 9,
      atomicMass: 192.217, electronConfiguration: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.20,
      meltingPoint: 2719, boilingPoint: 4403, density: 22.56,
      discoveredBy: 'Smithson Tennant', yearDiscovered: 1803,
      uses: ['Spark plugs', 'Crucibles', 'K–T boundary marker', 'Compass bearings'],
    },
    {
      atomicNumber: 81, symbol: 'Tl', name: 'Thallium', category: 'post-transition metal', period: 6, group: 13,
      atomicMass: 204.383, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62,
      meltingPoint: 577, boilingPoint: 1746, density: 11.85,
      discoveredBy: 'William Crookes', yearDiscovered: 1861,
      uses: ['Infrared detectors', 'Medical imaging', 'Semiconductor research'],
    },
    {
      atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', category: 'post-transition metal', period: 6, group: 15,
      atomicMass: 208.980, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02,
      meltingPoint: 544.55, boilingPoint: 1837, density: 9.807,
      discoveredBy: 'Claude François Geoffroy', yearDiscovered: 1753,
      uses: ['Pepto-Bismol (medicine)', 'Low-melting alloys', 'Cosmetics', 'Lead substitute'],
    },
    {
      atomicNumber: 84, symbol: 'Po', name: 'Polonium', category: 'post-transition metal', period: 6, group: 16,
      atomicMass: 209, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2.00,
      meltingPoint: 527, boilingPoint: 1235, density: 9.32,
      discoveredBy: 'Marie Curie / Pierre Curie', yearDiscovered: 1898,
      uses: ['Antistatic devices', 'Neutron sources', 'Thermoelectric power (space)'],
    },
    {
      atomicNumber: 85, symbol: 'At', name: 'Astatine', category: 'halogen', period: 6, group: 17,
      atomicMass: 210, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.20,
      meltingPoint: 575, boilingPoint: 610, density: null,
      discoveredBy: 'Dale R. Corson / K. R. MacKenzie / Emilio Segrè', yearDiscovered: 1940,
      uses: ['Cancer treatment research (astatine-211)', 'Radiochemistry research'],
    },
    {
      atomicNumber: 87, symbol: 'Fr', name: 'Francium', category: 'alkali metal', period: 7, group: 1,
      atomicMass: 223, electronConfiguration: '[Rn] 7s¹', electronegativity: 0.70,
      meltingPoint: 300, boilingPoint: 950, density: null,
      discoveredBy: 'Marguerite Perey', yearDiscovered: 1939,
      uses: ['Scientific research only (extremely rare and radioactive)'],
    },
    {
      atomicNumber: 89, symbol: 'Ac', name: 'Actinium', category: 'actinide', period: 7, group: null,
      atomicMass: 227, electronConfiguration: '[Rn] 6d¹ 7s²', electronegativity: 1.10,
      meltingPoint: 1323, boilingPoint: 3471, density: 10.07,
      discoveredBy: 'André-Louis Debierne', yearDiscovered: 1899,
      uses: ['Neutron sources', 'Cancer treatment (Ac-225)', 'Research'],
    },
    {
      atomicNumber: 90, symbol: 'Th', name: 'Thorium', category: 'actinide', period: 7, group: null,
      atomicMass: 232.038, electronConfiguration: '[Rn] 6d² 7s²', electronegativity: 1.30,
      meltingPoint: 2023, boilingPoint: 5061, density: 11.72,
      discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1829,
      uses: ['Nuclear fuel (proposed)', 'Gas mantles (legacy)', 'High-temperature alloys'],
    },
    {
      atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', category: 'actinide', period: 7, group: null,
      atomicMass: 231.036, electronConfiguration: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.50,
      meltingPoint: 1841, boilingPoint: 4300, density: 15.37,
      discoveredBy: 'Kasimir Fajans / O. H. Göhring', yearDiscovered: 1913,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 93, symbol: 'Np', name: 'Neptunium', category: 'actinide', period: 7, group: null,
      atomicMass: 237, electronConfiguration: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36,
      meltingPoint: 917, boilingPoint: 4273, density: 20.45,
      discoveredBy: 'Edwin McMillan / Philip Abelson', yearDiscovered: 1940,
      uses: ['Neutron detection instruments', 'Production of Pu-238 for RTGs'],
    },
    {
      atomicNumber: 95, symbol: 'Am', name: 'Americium', category: 'actinide', period: 7, group: null,
      atomicMass: 243, electronConfiguration: '[Rn] 5f⁷ 7s²', electronegativity: 1.30,
      meltingPoint: 1449, boilingPoint: 2880, density: 13.69,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1944,
      uses: ['Smoke detectors (Am-241)', 'Scientific research', 'Neutron sources'],
    },
    {
      atomicNumber: 96, symbol: 'Cm', name: 'Curium', category: 'actinide', period: 7, group: null,
      atomicMass: 247, electronConfiguration: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.30,
      meltingPoint: 1613, boilingPoint: 3383, density: 13.51,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1944,
      uses: ['Space power (RTGs)', 'Neutron sources', 'Research'],
    },
    {
      atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', category: 'actinide', period: 7, group: null,
      atomicMass: 247, electronConfiguration: '[Rn] 5f⁹ 7s²', electronegativity: 1.30,
      meltingPoint: 1259, boilingPoint: null, density: 14.78,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1949,
      uses: ['Scientific research only', 'Production of element 117 (Ts)'],
    },
    {
      atomicNumber: 98, symbol: 'Cf', name: 'Californium', category: 'actinide', period: 7, group: null,
      atomicMass: 251, electronConfiguration: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.30,
      meltingPoint: 1173, boilingPoint: null, density: 15.1,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1950,
      uses: ['Neutron startup sources (nuclear reactors)', 'Cancer treatment', 'Gold ore detection'],
    },
    {
      atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', category: 'actinide', period: 7, group: null,
      atomicMass: 252, electronConfiguration: '[Rn] 5f¹¹ 7s²', electronegativity: 1.30,
      meltingPoint: 1133, boilingPoint: null, density: null,
      discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1952,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 100, symbol: 'Fm', name: 'Fermium', category: 'actinide', period: 7, group: null,
      atomicMass: 257, electronConfiguration: '[Rn] 5f¹² 7s²', electronegativity: 1.30,
      meltingPoint: 1800, boilingPoint: null, density: null,
      discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1952,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', category: 'actinide', period: 7, group: null,
      atomicMass: 258, electronConfiguration: '[Rn] 5f¹³ 7s²', electronegativity: 1.30,
      meltingPoint: 1100, boilingPoint: null, density: null,
      discoveredBy: 'Glenn T. Seaborg et al.', yearDiscovered: 1955,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 102, symbol: 'No', name: 'Nobelium', category: 'actinide', period: 7, group: null,
      atomicMass: 259, electronConfiguration: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.30,
      meltingPoint: 1100, boilingPoint: null, density: null,
      discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1966,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', category: 'actinide', period: 7, group: 3,
      atomicMass: 266, electronConfiguration: '[Rn] 5f¹⁴ 7s² 7p¹', electronegativity: 1.30,
      meltingPoint: 1900, boilingPoint: null, density: null,
      discoveredBy: 'Albert Ghiorso et al.', yearDiscovered: 1961,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', category: 'transition metal', period: 7, group: 4,
      atomicMass: 267, electronConfiguration: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: null,
      meltingPoint: 2400, boilingPoint: 5800, density: 23.2,
      discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Berkeley National Laboratory', yearDiscovered: 1969,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 105, symbol: 'Db', name: 'Dubnium', category: 'transition metal', period: 7, group: 5,
      atomicMass: 268, electronConfiguration: '[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 29.3,
      discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Berkeley National Laboratory', yearDiscovered: 1970,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', category: 'transition metal', period: 7, group: 6,
      atomicMass: 271, electronConfiguration: '[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 35.0,
      discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1974,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', category: 'transition metal', period: 7, group: 7,
      atomicMass: 272, electronConfiguration: '[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 37.1,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1981,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 108, symbol: 'Hs', name: 'Hassium', category: 'transition metal', period: 7, group: 8,
      atomicMass: 277, electronConfiguration: '[Rn] 5f¹⁴ 6d⁶ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 40.7,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1984,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', category: 'unknown', period: 7, group: 9,
      atomicMass: 278, electronConfiguration: '[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 37.4,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1982,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', category: 'unknown', period: 7, group: 10,
      atomicMass: 281, electronConfiguration: '[Rn] 5f¹⁴ 6d⁸ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 34.8,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1994,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', category: 'unknown', period: 7, group: 11,
      atomicMass: 282, electronConfiguration: '[Rn] 5f¹⁴ 6d⁹ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: null, density: 28.7,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1994,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', category: 'transition metal', period: 7, group: 12,
      atomicMass: 285, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: null,
      meltingPoint: null, boilingPoint: 357, density: 23.7,
      discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1996,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', category: 'post-transition metal', period: 7, group: 13,
      atomicMass: 286, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: null,
      meltingPoint: 700, boilingPoint: 1430, density: 16.0,
      discoveredBy: 'RIKEN / Joint Institute for Nuclear Research', yearDiscovered: 2004,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', category: 'post-transition metal', period: 7, group: 14,
      atomicMass: 289, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: null,
      meltingPoint: null, boilingPoint: 210, density: 14.0,
      discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1999,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', category: 'post-transition metal', period: 7, group: 15,
      atomicMass: 290, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: null,
      meltingPoint: 670, boilingPoint: 1400, density: 13.5,
      discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Livermore National Laboratory', yearDiscovered: 2003,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', category: 'post-transition metal', period: 7, group: 16,
      atomicMass: 293, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: null,
      meltingPoint: 708, boilingPoint: 1085, density: 12.9,
      discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Livermore National Laboratory', yearDiscovered: 2000,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', category: 'halogen', period: 7, group: 17,
      atomicMass: 294, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: null,
      meltingPoint: 700, boilingPoint: 883, density: 7.2,
      discoveredBy: 'Joint Institute for Nuclear Research / Oak Ridge National Laboratory / Vanderbilt University', yearDiscovered: 2010,
      uses: ['Scientific research only'],
    },
    {
      atomicNumber: 118, symbol: 'Og', name: 'Oganesson', category: 'noble gas', period: 7, group: 18,
      atomicMass: 294, electronConfiguration: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', electronegativity: null,
      meltingPoint: null, boilingPoint: 350, density: 4.9,
      discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Livermore National Laboratory', yearDiscovered: 2002,
      uses: ['Scientific research only'],
    },
    // Lanthanides 59, 61-63, 65, 67-69
    {
      atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 140.908, electronConfiguration: '[Xe] 4f³ 6s²', electronegativity: 1.13,
      meltingPoint: 1208, boilingPoint: 3793, density: 6.773,
      discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885,
      uses: ['Powerful magnets', 'High-strength alloys', 'Glass colorant (yellow)'],
    },
    {
      atomicNumber: 61, symbol: 'Pm', name: 'Promethium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 145, electronConfiguration: '[Xe] 4f⁵ 6s²', electronegativity: 1.13,
      meltingPoint: 1315, boilingPoint: 3273, density: 7.26,
      discoveredBy: 'Jacob A. Marinsky / Lawrence E. Glendenin / Charles D. Coryell', yearDiscovered: 1945,
      uses: ['Nuclear batteries (pacemakers historically)', 'Research'],
    },
    {
      atomicNumber: 62, symbol: 'Sm', name: 'Samarium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 150.36, electronConfiguration: '[Xe] 4f⁶ 6s²', electronegativity: 1.17,
      meltingPoint: 1345, boilingPoint: 2067, density: 7.52,
      discoveredBy: 'Paul Emile Lecoq de Boisbaudran', yearDiscovered: 1879,
      uses: ['Samarium-cobalt magnets', 'Nuclear reactor control rods', 'Cancer treatment'],
    },
    {
      atomicNumber: 63, symbol: 'Eu', name: 'Europium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 151.964, electronConfiguration: '[Xe] 4f⁷ 6s²', electronegativity: 1.20,
      meltingPoint: 1099, boilingPoint: 1802, density: 5.244,
      discoveredBy: 'Eugène-Anatole Demarçay', yearDiscovered: 1901,
      uses: ['Euro banknote anti-counterfeiting', 'Red phosphors in TVs', 'Nuclear reactor control'],
    },
    {
      atomicNumber: 65, symbol: 'Tb', name: 'Terbium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 158.925, electronConfiguration: '[Xe] 4f⁹ 6s²', electronegativity: 1.10,
      meltingPoint: 1629, boilingPoint: 3503, density: 8.229,
      discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843,
      uses: ['Green phosphors', 'Solid-state devices', 'Sonar systems'],
    },
    {
      atomicNumber: 67, symbol: 'Ho', name: 'Holmium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 164.930, electronConfiguration: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23,
      meltingPoint: 1734, boilingPoint: 2993, density: 8.795,
      discoveredBy: 'Marc Delafontaine / Jacques-Louis Soret', yearDiscovered: 1878,
      uses: ['Magnets (highest magnetic moment)', 'Nuclear reactor control rods', 'Medical lasers'],
    },
    {
      atomicNumber: 68, symbol: 'Er', name: 'Erbium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 167.259, electronConfiguration: '[Xe] 4f¹² 6s²', electronegativity: 1.24,
      meltingPoint: 1802, boilingPoint: 3141, density: 9.066,
      discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843,
      uses: ['Fiber optic amplifiers (EDFA)', 'Lasers (dermatology)', 'Glass colorant (pink)'],
    },
    {
      atomicNumber: 69, symbol: 'Tm', name: 'Thulium', category: 'lanthanide', period: 6, group: null,
      atomicMass: 168.934, electronConfiguration: '[Xe] 4f¹³ 6s²', electronegativity: 1.25,
      meltingPoint: 1818, boilingPoint: 2223, density: 9.321,
      discoveredBy: 'Per Teodor Cleve', yearDiscovered: 1879,
      uses: ['Portable X-ray devices', 'Lasers', 'Research'],
    },
  ];
}

// ---------------------------------------------------------------------------
// Planets data — 8 planets + Pluto, Ceres, Eris
// ---------------------------------------------------------------------------

export function planetsData(): Planet[] {
  return [
    {
      name: 'Mercury', type: 'planet', orderFromSun: 1, distanceFromSun: 0.387,
      diameter: 4879, mass: '3.301 × 10²³', gravity: 3.7,
      orbitalPeriod: 87.97, rotationPeriod: 58.65, moons: 0, hasRings: false,
      atmosphere: ['Oxygen (trace)', 'Sodium (trace)', 'Hydrogen (trace)', 'Helium (trace)'],
    },
    {
      name: 'Venus', type: 'planet', orderFromSun: 2, distanceFromSun: 0.723,
      diameter: 12104, mass: '4.868 × 10²⁴', gravity: 8.87,
      orbitalPeriod: 224.70, rotationPeriod: -243.02, moons: 0, hasRings: false,
      atmosphere: ['Carbon dioxide (96.5%)', 'Nitrogen (3.5%)', 'Sulfur dioxide (trace)'],
    },
    {
      name: 'Earth', type: 'planet', orderFromSun: 3, distanceFromSun: 1.000,
      diameter: 12756, mass: '5.972 × 10²⁴', gravity: 9.807,
      orbitalPeriod: 365.25, rotationPeriod: 0.9973, moons: 1, hasRings: false,
      atmosphere: ['Nitrogen (78.1%)', 'Oxygen (20.9%)', 'Argon (0.93%)', 'Carbon dioxide (0.04%)'],
    },
    {
      name: 'Mars', type: 'planet', orderFromSun: 4, distanceFromSun: 1.524,
      diameter: 6792, mass: '6.417 × 10²³', gravity: 3.72,
      orbitalPeriod: 686.97, rotationPeriod: 1.0260, moons: 2, hasRings: false,
      atmosphere: ['Carbon dioxide (95.3%)', 'Nitrogen (2.6%)', 'Argon (1.9%)'],
    },
    {
      name: 'Jupiter', type: 'planet', orderFromSun: 5, distanceFromSun: 5.203,
      diameter: 142984, mass: '1.899 × 10²⁷', gravity: 24.79,
      orbitalPeriod: 4332.59, rotationPeriod: 0.4135, moons: 95, hasRings: true,
      atmosphere: ['Hydrogen (89.8%)', 'Helium (10.2%)', 'Methane (trace)', 'Ammonia (trace)'],
    },
    {
      name: 'Saturn', type: 'planet', orderFromSun: 6, distanceFromSun: 9.537,
      diameter: 120536, mass: '5.685 × 10²⁶', gravity: 10.44,
      orbitalPeriod: 10759.22, rotationPeriod: 0.4440, moons: 146, hasRings: true,
      atmosphere: ['Hydrogen (96.3%)', 'Helium (3.25%)', 'Methane (trace)', 'Ammonia (trace)'],
    },
    {
      name: 'Uranus', type: 'planet', orderFromSun: 7, distanceFromSun: 19.191,
      diameter: 51118, mass: '8.682 × 10²⁵', gravity: 8.87,
      orbitalPeriod: 30688.50, rotationPeriod: -0.7183, moons: 28, hasRings: true,
      atmosphere: ['Hydrogen (82.5%)', 'Helium (15.2%)', 'Methane (2.3%)'],
    },
    {
      name: 'Neptune', type: 'planet', orderFromSun: 8, distanceFromSun: 30.069,
      diameter: 49528, mass: '1.024 × 10²⁶', gravity: 11.15,
      orbitalPeriod: 60195, rotationPeriod: 0.6713, moons: 16, hasRings: true,
      atmosphere: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1.5%)'],
    },
    {
      name: 'Pluto', type: 'dwarf planet', orderFromSun: 9, distanceFromSun: 39.482,
      diameter: 2376, mass: '1.309 × 10²²', gravity: 0.62,
      orbitalPeriod: 90560, rotationPeriod: -6.387, moons: 5, hasRings: false,
      atmosphere: ['Nitrogen (98%)', 'Methane (1-2%)', 'Carbon monoxide (trace)'],
    },
    {
      name: 'Ceres', type: 'dwarf planet', orderFromSun: 10, distanceFromSun: 2.77,
      diameter: 945, mass: '9.393 × 10²⁰', gravity: 0.28,
      orbitalPeriod: 1681.63, rotationPeriod: 0.3781, moons: 0, hasRings: false,
      atmosphere: ['Water vapor (trace)'],
    },
    {
      name: 'Eris', type: 'dwarf planet', orderFromSun: 11, distanceFromSun: 67.86,
      diameter: 2326, mass: '1.66 × 10²²', gravity: 0.82,
      orbitalPeriod: 204199, rotationPeriod: 1.08, moons: 1, hasRings: false,
      atmosphere: ['Nitrogen (trace, when near perihelion)', 'Methane (trace)'],
    },
  ];
}

// ---------------------------------------------------------------------------
// Moons data — 30 notable moons
// ---------------------------------------------------------------------------

export function moonsData(): Moon[] {
  return [
    { name: 'Moon', planet: 'Earth', diameter: 3474, orbitalPeriod: 27.32, distance: 384400, discovered: -1, discoveredBy: 'Known since antiquity', notes: 'Only natural satellite of Earth; stabilizes Earth\'s axial tilt' },
    { name: 'Phobos', planet: 'Mars', diameter: 22.4, orbitalPeriod: 0.319, distance: 9376, discovered: 1877, discoveredBy: 'Asaph Hall', notes: 'Closest moon to any planet; orbits faster than Mars rotates' },
    { name: 'Deimos', planet: 'Mars', diameter: 12.4, orbitalPeriod: 1.263, distance: 23463, discovered: 1877, discoveredBy: 'Asaph Hall', notes: 'Outermost of Mars\'s two moons; very small and irregular shaped' },
    { name: 'Io', planet: 'Jupiter', diameter: 3643, orbitalPeriod: 1.769, distance: 421700, discovered: 1610, discoveredBy: 'Galileo Galilei', notes: 'Most volcanically active body in the solar system' },
    { name: 'Europa', planet: 'Jupiter', diameter: 3122, orbitalPeriod: 3.551, distance: 671100, discovered: 1610, discoveredBy: 'Galileo Galilei', notes: 'Has a subsurface ocean; strong candidate for extraterrestrial life' },
    { name: 'Ganymede', planet: 'Jupiter', diameter: 5268, orbitalPeriod: 7.155, distance: 1070400, discovered: 1610, discoveredBy: 'Galileo Galilei', notes: 'Largest moon in the solar system; larger than Mercury' },
    { name: 'Callisto', planet: 'Jupiter', diameter: 4821, orbitalPeriod: 16.689, distance: 1882700, discovered: 1610, discoveredBy: 'Galileo Galilei', notes: 'Most heavily cratered object in the solar system' },
    { name: 'Amalthea', planet: 'Jupiter', diameter: 167, orbitalPeriod: 0.498, distance: 181400, discovered: 1892, discoveredBy: 'Edward Emerson Barnard', notes: 'Reddest object in the solar system; irregularly shaped' },
    { name: 'Himalia', planet: 'Jupiter', diameter: 139.6, orbitalPeriod: 250.56, distance: 11461000, discovered: 1904, discoveredBy: 'Charles Dillon Perrine', notes: 'Largest of Jupiter\'s irregular moons' },
    { name: 'Titan', planet: 'Saturn', diameter: 5150, orbitalPeriod: 15.945, distance: 1221870, discovered: 1655, discoveredBy: 'Christiaan Huygens', notes: 'Has a dense nitrogen atmosphere and liquid methane lakes' },
    { name: 'Rhea', planet: 'Saturn', diameter: 1527, orbitalPeriod: 4.518, distance: 527108, discovered: 1672, discoveredBy: 'Giovanni Cassini', notes: 'Saturn\'s second largest moon; may have a thin ring system' },
    { name: 'Iapetus', planet: 'Saturn', diameter: 1469, orbitalPeriod: 79.32, distance: 3560820, discovered: 1671, discoveredBy: 'Giovanni Cassini', notes: 'Has dramatic two-tone coloring: one hemisphere dark, one bright' },
    { name: 'Dione', planet: 'Saturn', diameter: 1123, orbitalPeriod: 2.737, distance: 377396, discovered: 1684, discoveredBy: 'Giovanni Cassini', notes: 'Has bright wispy terrain features and a thin oxygen atmosphere' },
    { name: 'Tethys', planet: 'Saturn', diameter: 1062, orbitalPeriod: 1.888, distance: 294619, discovered: 1684, discoveredBy: 'Giovanni Cassini', notes: 'Has a large canyon Ithaca Chasma spanning 3/4 of circumference' },
    { name: 'Enceladus', planet: 'Saturn', diameter: 504, orbitalPeriod: 1.370, distance: 237948, discovered: 1789, discoveredBy: 'William Herschel', notes: 'Active geysers of water ice; subsurface ocean discovered' },
    { name: 'Mimas', planet: 'Saturn', diameter: 396, orbitalPeriod: 0.942, distance: 185539, discovered: 1789, discoveredBy: 'William Herschel', notes: 'Large Herschel crater makes it resemble the Death Star' },
    { name: 'Hyperion', planet: 'Saturn', diameter: 270, orbitalPeriod: 21.277, distance: 1481010, discovered: 1848, discoveredBy: 'William Cranch Bond / George Phillips Bond', notes: 'Chaotic tumbling rotation; sponge-like appearance' },
    { name: 'Phoebe', planet: 'Saturn', diameter: 213, orbitalPeriod: -550.31, distance: 12955759, discovered: 1898, discoveredBy: 'William Henry Pickering', notes: 'Retrograde orbit; likely a captured Kuiper Belt object' },
    { name: 'Miranda', planet: 'Uranus', diameter: 472, orbitalPeriod: 1.413, distance: 129900, discovered: 1948, discoveredBy: 'Gerard Kuiper', notes: 'Has extreme terrain including cliffs 20 km high' },
    { name: 'Ariel', planet: 'Uranus', diameter: 1158, orbitalPeriod: 2.520, distance: 190900, discovered: 1851, discoveredBy: 'William Lassell', notes: 'Brightest and youngest surface of Uranian moons' },
    { name: 'Umbriel', planet: 'Uranus', diameter: 1170, orbitalPeriod: 4.144, distance: 266000, discovered: 1851, discoveredBy: 'William Lassell', notes: 'Darkest of Uranus\'s major moons' },
    { name: 'Titania', planet: 'Uranus', diameter: 1578, orbitalPeriod: 8.706, distance: 436300, discovered: 1787, discoveredBy: 'William Herschel', notes: 'Largest moon of Uranus; has large canyons' },
    { name: 'Oberon', planet: 'Uranus', diameter: 1523, orbitalPeriod: 13.463, distance: 583500, discovered: 1787, discoveredBy: 'William Herschel', notes: 'Outermost of the major Uranian moons' },
    { name: 'Triton', planet: 'Neptune', diameter: 2707, orbitalPeriod: -5.877, distance: 354759, discovered: 1846, discoveredBy: 'William Lassell', notes: 'Only large moon with retrograde orbit; active nitrogen geysers' },
    { name: 'Nereid', planet: 'Neptune', diameter: 340, orbitalPeriod: 360.13, distance: 5513818, discovered: 1949, discoveredBy: 'Gerard Kuiper', notes: 'Highly eccentric orbit; likely a captured object' },
    { name: 'Proteus', planet: 'Neptune', diameter: 420, orbitalPeriod: 1.122, distance: 117647, discovered: 1989, discoveredBy: 'Voyager 2 team', notes: 'Almost as large as Triton; very dark surface' },
    { name: 'Charon', planet: 'Pluto', diameter: 1212, orbitalPeriod: 6.387, distance: 17536, discovered: 1978, discoveredBy: 'James Christy', notes: 'So large relative to Pluto they form a binary system' },
    { name: 'Nix', planet: 'Pluto', diameter: 49, orbitalPeriod: 24.856, distance: 48694, discovered: 2005, discoveredBy: 'Hubble Space Telescope team', notes: 'One of four small moons of Pluto' },
    { name: 'Hydra', planet: 'Pluto', diameter: 61, orbitalPeriod: 38.202, distance: 64738, discovered: 2005, discoveredBy: 'Hubble Space Telescope team', notes: 'Outermost known moon of Pluto; highly reflective surface' },
    { name: 'Dysnomia', planet: 'Eris', diameter: 700, orbitalPeriod: 15.785, distance: 37350, discovered: 2005, discoveredBy: 'Michael E. Brown et al.', notes: 'Only known moon of Eris; named for the goddess of lawlessness' },
  ];
}

// ---------------------------------------------------------------------------
// Scientific units data — 50 SI and common units
// ---------------------------------------------------------------------------

export function scientificUnitsData(): ScientificUnit[] {
  return [
    { name: 'Metre', symbol: 'm', quantity: 'Length', system: 'SI', definition: 'The distance light travels in vacuum in 1/299,792,458 of a second', equivalents: { feet: '3.28084 ft', inches: '39.3701 in', yards: '1.09361 yd' } },
    { name: 'Kilogram', symbol: 'kg', quantity: 'Mass', system: 'SI', definition: 'Defined by fixing the Planck constant h = 6.626 070 15 × 10⁻³⁴ J·s', equivalents: { pounds: '2.20462 lb', ounces: '35.274 oz', grams: '1000 g' } },
    { name: 'Second', symbol: 's', quantity: 'Time', system: 'SI', definition: '9,192,631,770 periods of radiation of cesium-133 hyperfine transition', equivalents: { milliseconds: '1000 ms', minutes: '0.0167 min', hours: '2.778 × 10⁻⁴ h' } },
    { name: 'Ampere', symbol: 'A', quantity: 'Electric current', system: 'SI', definition: 'Defined by fixing the elementary charge e = 1.602 176 634 × 10⁻¹⁹ C', equivalents: { milliamperes: '1000 mA', microamperes: '10⁶ μA' } },
    { name: 'Kelvin', symbol: 'K', quantity: 'Thermodynamic temperature', system: 'SI', definition: 'Defined by fixing the Boltzmann constant k = 1.380 649 × 10⁻²³ J/K', equivalents: { celsius: 'K − 273.15 °C', fahrenheit: '(K − 273.15) × 9/5 + 32 °F' } },
    { name: 'Mole', symbol: 'mol', quantity: 'Amount of substance', system: 'SI', definition: 'Contains exactly 6.022 140 76 × 10²³ elementary entities', equivalents: { particles: '6.022 × 10²³ entities' } },
    { name: 'Candela', symbol: 'cd', quantity: 'Luminous intensity', system: 'SI', definition: 'Defined by fixing luminous efficacy of 540 THz radiation = 683 lm/W', equivalents: { lumens: '1 cd·sr at solid angle 1 sr' } },
    { name: 'Hertz', symbol: 'Hz', quantity: 'Frequency', system: 'derived', definition: 'One cycle per second (1/s)', equivalents: { kilohertz: '10⁻³ kHz', megahertz: '10⁻⁶ MHz', gigahertz: '10⁻⁹ GHz' } },
    { name: 'Newton', symbol: 'N', quantity: 'Force', system: 'derived', definition: 'kg·m/s² — force needed to accelerate 1 kg by 1 m/s²', equivalents: { 'pound-force': '0.22481 lbf', dynes: '100000 dyn' } },
    { name: 'Pascal', symbol: 'Pa', quantity: 'Pressure', system: 'derived', definition: 'N/m² — one newton per square metre', equivalents: { atmospheres: '9.869 × 10⁻⁶ atm', bar: '10⁻⁵ bar', psi: '1.450 × 10⁻⁴ psi' } },
    { name: 'Joule', symbol: 'J', quantity: 'Energy / Work', system: 'derived', definition: 'kg·m²/s² — one newton-metre', equivalents: { calories: '0.239006 cal', electronvolts: '6.242 × 10¹⁸ eV', 'kWh': '2.778 × 10⁻⁷ kWh' } },
    { name: 'Watt', symbol: 'W', quantity: 'Power', system: 'derived', definition: 'J/s — one joule per second', equivalents: { horsepower: '1.341 × 10⁻³ hp', 'BTU/h': '3.41214 BTU/h' } },
    { name: 'Coulomb', symbol: 'C', quantity: 'Electric charge', system: 'derived', definition: 'A·s — one ampere-second', equivalents: { 'elementary charges': '6.242 × 10¹⁸ e' } },
    { name: 'Volt', symbol: 'V', quantity: 'Electric potential', system: 'derived', definition: 'W/A — one watt per ampere', equivalents: { millivolts: '1000 mV', kilovolts: '10⁻³ kV' } },
    { name: 'Ohm', symbol: 'Ω', quantity: 'Electrical resistance', system: 'derived', definition: 'V/A — one volt per ampere', equivalents: { kilohms: '10⁻³ kΩ', megaohms: '10⁻⁶ MΩ' } },
    { name: 'Farad', symbol: 'F', quantity: 'Capacitance', system: 'derived', definition: 'C/V — one coulomb per volt', equivalents: { microfarads: '10⁶ μF', nanofarads: '10⁹ nF' } },
    { name: 'Tesla', symbol: 'T', quantity: 'Magnetic flux density', system: 'derived', definition: 'kg/(A·s²) — one weber per square metre', equivalents: { gauss: '10,000 G' } },
    { name: 'Weber', symbol: 'Wb', quantity: 'Magnetic flux', system: 'derived', definition: 'V·s — one volt-second', equivalents: { maxwells: '10⁸ Mx' } },
    { name: 'Henry', symbol: 'H', quantity: 'Inductance', system: 'derived', definition: 'Wb/A — one weber per ampere', equivalents: { millihenries: '1000 mH', microhenries: '10⁶ μH' } },
    { name: 'Lumen', symbol: 'lm', quantity: 'Luminous flux', system: 'derived', definition: 'cd·sr — one candela-steradian', equivalents: {} },
    { name: 'Lux', symbol: 'lx', quantity: 'Illuminance', system: 'derived', definition: 'lm/m² — one lumen per square metre', equivalents: { 'foot-candles': '0.0929 fc' } },
    { name: 'Becquerel', symbol: 'Bq', quantity: 'Radioactivity', system: 'derived', definition: 'One disintegration per second', equivalents: { curie: '2.703 × 10⁻¹¹ Ci' } },
    { name: 'Gray', symbol: 'Gy', quantity: 'Absorbed radiation dose', system: 'derived', definition: 'J/kg — one joule per kilogram', equivalents: { rad: '100 rad' } },
    { name: 'Sievert', symbol: 'Sv', quantity: 'Equivalent radiation dose', system: 'derived', definition: 'J/kg weighted for radiation type', equivalents: { rem: '100 rem', millisieverts: '1000 mSv' } },
    { name: 'Celsius', symbol: '°C', quantity: 'Temperature', system: 'derived', definition: 'T(°C) = T(K) − 273.15', equivalents: { kelvin: 'T(K) = T(°C) + 273.15', fahrenheit: 'T(°F) = T(°C) × 9/5 + 32' } },
    { name: 'Litre', symbol: 'L', quantity: 'Volume', system: 'other', definition: '0.001 cubic metres (1 dm³)', equivalents: { 'cubic metres': '0.001 m³', gallons: '0.264172 gal', pints: '2.11338 pt' } },
    { name: 'Gram', symbol: 'g', quantity: 'Mass', system: 'other', definition: '0.001 kilograms', equivalents: { kilograms: '0.001 kg', ounces: '0.035274 oz' } },
    { name: 'Tonne', symbol: 't', quantity: 'Mass', system: 'other', definition: '1000 kilograms', equivalents: { kilograms: '1000 kg', 'short tons': '1.10231 ton' } },
    { name: 'Kilometre', symbol: 'km', quantity: 'Length', system: 'other', definition: '1000 metres', equivalents: { miles: '0.621371 mi', metres: '1000 m' } },
    { name: 'Centimetre', symbol: 'cm', quantity: 'Length', system: 'other', definition: '0.01 metres', equivalents: { inches: '0.393701 in', millimetres: '10 mm' } },
    { name: 'Millimetre', symbol: 'mm', quantity: 'Length', system: 'other', definition: '0.001 metres', equivalents: { inches: '0.0393701 in', micrometres: '1000 μm' } },
    { name: 'Bar', symbol: 'bar', quantity: 'Pressure', system: 'other', definition: '100,000 pascals', equivalents: { atmospheres: '0.986923 atm', psi: '14.5038 psi' } },
    { name: 'Atmosphere', symbol: 'atm', quantity: 'Pressure', system: 'other', definition: '101,325 pascals', equivalents: { bar: '1.01325 bar', psi: '14.696 psi', torr: '760 Torr' } },
    { name: 'Electronvolt', symbol: 'eV', quantity: 'Energy', system: 'other', definition: 'Energy gained by electron through 1 volt = 1.602 × 10⁻¹⁹ J', equivalents: { joules: '1.602 × 10⁻¹⁹ J', 'kiloelectronvolts': '0.001 keV' } },
    { name: 'Astronomical Unit', symbol: 'AU', quantity: 'Length', system: 'other', definition: 'Mean Earth–Sun distance = 149,597,870.7 km', equivalents: { kilometres: '149,597,870.7 km', 'light-minutes': '8.317 light-min' } },
    { name: 'Light-year', symbol: 'ly', quantity: 'Length', system: 'other', definition: 'Distance light travels in one Julian year ≈ 9.461 × 10¹⁵ m', equivalents: { parsecs: '0.30660 pc', AU: '63,241 AU' } },
    { name: 'Parsec', symbol: 'pc', quantity: 'Length', system: 'other', definition: 'Distance at which 1 AU subtends 1 arcsecond ≈ 3.086 × 10¹⁶ m', equivalents: { 'light-years': '3.26156 ly', AU: '206,265 AU' } },
    { name: 'Calorie', symbol: 'cal', quantity: 'Energy', system: 'other', definition: 'Energy to raise 1 g of water by 1°C ≈ 4.184 J', equivalents: { joules: '4.184 J', kilocalories: '0.001 kcal' } },
    { name: 'Kilowatt-hour', symbol: 'kWh', quantity: 'Energy', system: 'other', definition: '3,600,000 joules', equivalents: { joules: '3,600,000 J', megajoules: '3.6 MJ' } },
    { name: 'Horsepower', symbol: 'hp', quantity: 'Power', system: 'imperial', definition: '550 foot-pounds per second = 745.7 W', equivalents: { watts: '745.699 W', kilowatts: '0.745699 kW' } },
    { name: 'Mile', symbol: 'mi', quantity: 'Length', system: 'imperial', definition: '1,760 yards = 5,280 feet = 1,609.344 m', equivalents: { kilometres: '1.60934 km', feet: '5280 ft' } },
    { name: 'Yard', symbol: 'yd', quantity: 'Length', system: 'imperial', definition: '3 feet = 0.9144 metres', equivalents: { metres: '0.9144 m', feet: '3 ft' } },
    { name: 'Foot', symbol: 'ft', quantity: 'Length', system: 'imperial', definition: '12 inches = 0.3048 metres', equivalents: { metres: '0.3048 m', inches: '12 in' } },
    { name: 'Inch', symbol: 'in', quantity: 'Length', system: 'imperial', definition: '2.54 centimetres exactly', equivalents: { centimetres: '2.54 cm', millimetres: '25.4 mm' } },
    { name: 'Pound', symbol: 'lb', quantity: 'Mass', system: 'imperial', definition: '0.45359237 kilograms exactly', equivalents: { kilograms: '0.453592 kg', ounces: '16 oz', grams: '453.592 g' } },
    { name: 'Ounce', symbol: 'oz', quantity: 'Mass', system: 'imperial', definition: '1/16 pound = 28.3495 grams', equivalents: { grams: '28.3495 g', kilograms: '0.0283495 kg' } },
    { name: 'Gallon (US)', symbol: 'gal', quantity: 'Volume', system: 'imperial', definition: '231 cubic inches = 3.78541 litres', equivalents: { litres: '3.78541 L', 'fluid ounces': '128 fl oz' } },
    { name: 'Fahrenheit', symbol: '°F', quantity: 'Temperature', system: 'imperial', definition: 'T(°F) = T(°C) × 9/5 + 32', equivalents: { celsius: 'T(°C) = (T(°F) − 32) × 5/9', kelvin: 'T(K) = (T(°F) − 32) × 5/9 + 273.15' } },
    { name: 'Dyne', symbol: 'dyn', quantity: 'Force', system: 'CGS', definition: 'g·cm/s² = 10⁻⁵ N', equivalents: { newtons: '10⁻⁵ N' } },
    { name: 'Erg', symbol: 'erg', quantity: 'Energy', system: 'CGS', definition: 'g·cm²/s² = 10⁻⁷ J', equivalents: { joules: '10⁻⁷ J' } },
    { name: 'Poise', symbol: 'P', quantity: 'Dynamic viscosity', system: 'CGS', definition: 'g/(cm·s) = 0.1 Pa·s', equivalents: { 'pascal-seconds': '0.1 Pa·s' } },
  ];
}

// ---------------------------------------------------------------------------
// Countries population data — 50 countries
// ---------------------------------------------------------------------------

export function countriesPopulationData(): CountryPopulation[] {
  return [
    { country: 'China', code: 'CN', population: 1412000000, area: 9596960, density: 147.2, growthRate: 0.09, medianAge: 38.4, urbanization: 65.2, gdpPerCapita: 12720 },
    { country: 'India', code: 'IN', population: 1428000000, area: 3287263, density: 434.5, growthRate: 0.81, medianAge: 28.2, urbanization: 36.4, gdpPerCapita: 2389 },
    { country: 'United States', code: 'US', population: 334900000, area: 9833517, density: 34.1, growthRate: 0.55, medianAge: 38.5, urbanization: 83.3, gdpPerCapita: 76399 },
    { country: 'Indonesia', code: 'ID', population: 277500000, area: 1904569, density: 145.7, growthRate: 1.07, medianAge: 29.7, urbanization: 57.9, gdpPerCapita: 4788 },
    { country: 'Pakistan', code: 'PK', population: 231400000, area: 881912, density: 262.4, growthRate: 2.05, medianAge: 22.0, urbanization: 36.7, gdpPerCapita: 1505 },
    { country: 'Brazil', code: 'BR', population: 215300000, area: 8515767, density: 25.3, growthRate: 0.67, medianAge: 33.5, urbanization: 87.8, gdpPerCapita: 8919 },
    { country: 'Nigeria', code: 'NG', population: 218500000, area: 923768, density: 236.5, growthRate: 2.56, medianAge: 17.9, urbanization: 53.5, gdpPerCapita: 2184 },
    { country: 'Bangladesh', code: 'BD', population: 170200000, area: 147570, density: 1153.2, growthRate: 1.05, medianAge: 28.0, urbanization: 40.5, gdpPerCapita: 2457 },
    { country: 'Russia', code: 'RU', population: 144700000, area: 17098242, density: 8.5, growthRate: -0.19, medianAge: 40.3, urbanization: 74.8, gdpPerCapita: 12195 },
    { country: 'Ethiopia', code: 'ET', population: 123400000, area: 1104300, density: 111.8, growthRate: 2.51, medianAge: 19.5, urbanization: 23.2, gdpPerCapita: 925 },
    { country: 'Mexico', code: 'MX', population: 127600000, area: 1964375, density: 65.0, growthRate: 1.06, medianAge: 29.3, urbanization: 81.2, gdpPerCapita: 10046 },
    { country: 'Japan', code: 'JP', population: 125700000, area: 377930, density: 332.5, growthRate: -0.53, medianAge: 48.4, urbanization: 91.8, gdpPerCapita: 33815 },
    { country: 'Philippines', code: 'PH', population: 115600000, area: 300000, density: 385.3, growthRate: 1.64, medianAge: 25.7, urbanization: 47.4, gdpPerCapita: 3623 },
    { country: 'Egypt', code: 'EG', population: 105900000, area: 1001449, density: 105.7, growthRate: 1.97, medianAge: 25.3, urbanization: 43.1, gdpPerCapita: 3699 },
    { country: 'Democratic Republic of the Congo', code: 'CD', population: 100100000, area: 2344858, density: 42.7, growthRate: 3.21, medianAge: 17.0, urbanization: 46.8, gdpPerCapita: 546 },
    { country: 'Vietnam', code: 'VN', population: 97600000, area: 331212, density: 294.7, growthRate: 0.97, medianAge: 31.9, urbanization: 38.1, gdpPerCapita: 3694 },
    { country: 'Iran', code: 'IR', population: 87900000, area: 1648195, density: 53.3, growthRate: 1.19, medianAge: 32.4, urbanization: 76.3, gdpPerCapita: 5682 },
    { country: 'Turkey', code: 'TR', population: 85300000, area: 783562, density: 108.8, growthRate: 0.79, medianAge: 32.2, urbanization: 76.6, gdpPerCapita: 10616 },
    { country: 'Germany', code: 'DE', population: 84400000, area: 357114, density: 236.4, growthRate: 0.17, medianAge: 45.7, urbanization: 77.5, gdpPerCapita: 51203 },
    { country: 'Thailand', code: 'TH', population: 71800000, area: 513120, density: 140.0, growthRate: 0.29, medianAge: 39.0, urbanization: 52.9, gdpPerCapita: 7066 },
    { country: 'United Kingdom', code: 'GB', population: 67300000, area: 242495, density: 277.6, growthRate: 0.58, medianAge: 40.5, urbanization: 84.3, gdpPerCapita: 46125 },
    { country: 'France', code: 'FR', population: 64900000, area: 551695, density: 117.6, growthRate: 0.22, medianAge: 41.5, urbanization: 81.5, gdpPerCapita: 43659 },
    { country: 'Tanzania', code: 'TZ', population: 63300000, area: 945087, density: 67.0, growthRate: 2.98, medianAge: 17.7, urbanization: 36.9, gdpPerCapita: 1132 },
    { country: 'South Africa', code: 'ZA', population: 60100000, area: 1219090, density: 49.3, growthRate: 1.17, medianAge: 28.0, urbanization: 68.0, gdpPerCapita: 6994 },
    { country: 'Myanmar', code: 'MM', population: 54200000, area: 676578, density: 80.1, growthRate: 0.83, medianAge: 29.1, urbanization: 31.8, gdpPerCapita: 1188 },
    { country: 'Kenya', code: 'KE', population: 54000000, area: 580367, density: 93.0, growthRate: 2.30, medianAge: 20.0, urbanization: 29.5, gdpPerCapita: 2010 },
    { country: 'South Korea', code: 'KR', population: 51700000, area: 100210, density: 515.9, growthRate: 0.22, medianAge: 43.7, urbanization: 81.4, gdpPerCapita: 31721 },
    { country: 'Colombia', code: 'CO', population: 51900000, area: 1141748, density: 45.5, growthRate: 1.06, medianAge: 32.2, urbanization: 82.6, gdpPerCapita: 6104 },
    { country: 'Spain', code: 'ES', population: 47400000, area: 505990, density: 93.7, growthRate: 0.28, medianAge: 45.0, urbanization: 80.8, gdpPerCapita: 30103 },
    { country: 'Uganda', code: 'UG', population: 47600000, area: 241550, density: 197.1, growthRate: 3.33, medianAge: 16.7, urbanization: 26.2, gdpPerCapita: 883 },
    { country: 'Argentina', code: 'AR', population: 46200000, area: 2780400, density: 16.6, growthRate: 0.92, medianAge: 31.7, urbanization: 92.9, gdpPerCapita: 13738 },
    { country: 'Algeria', code: 'DZ', population: 44900000, area: 2381741, density: 18.8, growthRate: 1.77, medianAge: 28.9, urbanization: 73.7, gdpPerCapita: 3765 },
    { country: 'Sudan', code: 'SD', population: 44900000, area: 1861484, density: 24.1, growthRate: 2.65, medianAge: 20.1, urbanization: 35.3, gdpPerCapita: 699 },
    { country: 'Iraq', code: 'IQ', population: 41200000, area: 438317, density: 93.9, growthRate: 2.27, medianAge: 21.2, urbanization: 71.5, gdpPerCapita: 5765 },
    { country: 'Poland', code: 'PL', population: 37700000, area: 312696, density: 120.6, growthRate: -0.16, medianAge: 42.4, urbanization: 60.3, gdpPerCapita: 18000 },
    { country: 'Canada', code: 'CA', population: 38200000, area: 9984670, density: 3.82, growthRate: 0.88, medianAge: 41.8, urbanization: 81.8, gdpPerCapita: 52078 },
    { country: 'Morocco', code: 'MA', population: 37500000, area: 446550, density: 84.0, growthRate: 1.20, medianAge: 29.3, urbanization: 64.7, gdpPerCapita: 3437 },
    { country: 'Saudi Arabia', code: 'SA', population: 36900000, area: 2149690, density: 17.2, growthRate: 1.73, medianAge: 31.9, urbanization: 84.2, gdpPerCapita: 23185 },
    { country: 'Peru', code: 'PE', population: 33000000, area: 1285216, density: 25.7, growthRate: 1.49, medianAge: 30.1, urbanization: 78.3, gdpPerCapita: 6622 },
    { country: 'Venezuela', code: 'VE', population: 28300000, area: 916445, density: 30.9, growthRate: -0.08, medianAge: 30.2, urbanization: 88.4, gdpPerCapita: 1587 },
    { country: 'Malaysia', code: 'MY', population: 33100000, area: 329847, density: 100.4, growthRate: 1.25, medianAge: 30.0, urbanization: 77.6, gdpPerCapita: 12364 },
    { country: 'Mozambique', code: 'MZ', population: 32800000, area: 801590, density: 40.9, growthRate: 2.89, medianAge: 17.6, urbanization: 38.3, gdpPerCapita: 509 },
    { country: 'Ghana', code: 'GH', population: 33500000, area: 238533, density: 140.4, growthRate: 2.07, medianAge: 21.4, urbanization: 57.9, gdpPerCapita: 2363 },
    { country: 'Australia', code: 'AU', population: 26200000, area: 7692024, density: 3.4, growthRate: 1.32, medianAge: 38.6, urbanization: 86.5, gdpPerCapita: 64491 },
    { country: 'Cameroon', code: 'CM', population: 27200000, area: 475442, density: 57.2, growthRate: 2.63, medianAge: 18.6, urbanization: 58.8, gdpPerCapita: 1617 },
    { country: 'Italy', code: 'IT', population: 59200000, area: 301340, density: 196.4, growthRate: -0.29, medianAge: 47.6, urbanization: 71.2, gdpPerCapita: 35657 },
    { country: 'Taiwan', code: 'TW', population: 23500000, area: 36193, density: 649.4, growthRate: 0.07, medianAge: 43.4, urbanization: 79.5, gdpPerCapita: 32571 },
    { country: 'Sri Lanka', code: 'LK', population: 21900000, area: 65610, density: 333.8, growthRate: 0.43, medianAge: 33.7, urbanization: 18.6, gdpPerCapita: 3354 },
    { country: 'Kazakhstan', code: 'KZ', population: 19200000, area: 2724900, density: 7.0, growthRate: 1.11, medianAge: 31.2, urbanization: 58.8, gdpPerCapita: 9686 },
    { country: 'Netherlands', code: 'NL', population: 17900000, area: 41543, density: 431.0, growthRate: 0.44, medianAge: 42.8, urbanization: 92.5, gdpPerCapita: 57768 },
    { country: 'Chile', code: 'CL', population: 19200000, area: 756102, density: 25.4, growthRate: 0.80, medianAge: 35.3, urbanization: 87.8, gdpPerCapita: 15356 },
  ];
}

// ---------------------------------------------------------------------------
// Weather sample data — 30 synthetic observations
// ---------------------------------------------------------------------------

export function weatherSampleData(): WeatherObservation[] {
  return [
    { id: 'W001', city: 'Northvale', country: 'US', date: '2024-06-15', temperature: 28, feelsLike: 30, humidity: 65, windSpeed: 15, windDirection: 'SW', pressure: 1013, condition: 'Sunny', uvIndex: 8, visibility: 15 },
    { id: 'W002', city: 'Lakemoor', country: 'CA', date: '2024-06-15', temperature: 18, feelsLike: 16, humidity: 72, windSpeed: 22, windDirection: 'NW', pressure: 1008, condition: 'Partly Cloudy', uvIndex: 5, visibility: 12 },
    { id: 'W003', city: 'Seaview Heights', country: 'GB', date: '2024-06-15', temperature: 14, feelsLike: 11, humidity: 80, windSpeed: 30, windDirection: 'W', pressure: 998, condition: 'Rainy', uvIndex: 2, visibility: 8 },
    { id: 'W004', city: 'Dune City', country: 'AE', date: '2024-06-15', temperature: 42, feelsLike: 47, humidity: 35, windSpeed: 18, windDirection: 'SE', pressure: 1005, condition: 'Sunny', uvIndex: 11, visibility: 20 },
    { id: 'W005', city: 'Frostholm', country: 'NO', date: '2024-06-15', temperature: 6, feelsLike: 3, humidity: 85, windSpeed: 25, windDirection: 'N', pressure: 1020, condition: 'Overcast', uvIndex: 1, visibility: 6 },
    { id: 'W006', city: 'Tropicana Bay', country: 'BR', date: '2024-06-15', temperature: 32, feelsLike: 38, humidity: 88, windSpeed: 12, windDirection: 'E', pressure: 1010, condition: 'Thunderstorm', uvIndex: 4, visibility: 5 },
    { id: 'W007', city: 'Plainfield', country: 'AU', date: '2024-06-15', temperature: 11, feelsLike: 9, humidity: 60, windSpeed: 20, windDirection: 'S', pressure: 1018, condition: 'Partly Cloudy', uvIndex: 4, visibility: 18 },
    { id: 'W008', city: 'Monsoon Valley', country: 'IN', date: '2024-06-15', temperature: 29, feelsLike: 35, humidity: 90, windSpeed: 40, windDirection: 'SW', pressure: 996, condition: 'Heavy Rain', uvIndex: 1, visibility: 3 },
    { id: 'W009', city: 'Pinewood', country: 'DE', date: '2024-06-16', temperature: 20, feelsLike: 19, humidity: 55, windSpeed: 14, windDirection: 'NE', pressure: 1016, condition: 'Clear', uvIndex: 6, visibility: 20 },
    { id: 'W010', city: 'Sandstorm Flats', country: 'EG', date: '2024-06-16', temperature: 38, feelsLike: 42, humidity: 20, windSpeed: 50, windDirection: 'S', pressure: 1001, condition: 'Dust Storm', uvIndex: 7, visibility: 1 },
    { id: 'W011', city: 'Glacier Point', country: 'IS', date: '2024-06-16', temperature: 4, feelsLike: 0, humidity: 92, windSpeed: 35, windDirection: 'NW', pressure: 990, condition: 'Snow', uvIndex: 1, visibility: 4 },
    { id: 'W012', city: 'Riverside', country: 'FR', date: '2024-06-16', temperature: 24, feelsLike: 23, humidity: 58, windSpeed: 10, windDirection: 'W', pressure: 1019, condition: 'Sunny', uvIndex: 7, visibility: 22 },
    { id: 'W013', city: 'Coral Cove', country: 'MX', date: '2024-06-16', temperature: 30, feelsLike: 34, humidity: 82, windSpeed: 28, windDirection: 'E', pressure: 1007, condition: 'Humid and Cloudy', uvIndex: 6, visibility: 10 },
    { id: 'W014', city: 'Mountain Pass', country: 'JP', date: '2024-06-16', temperature: 16, feelsLike: 14, humidity: 68, windSpeed: 18, windDirection: 'SE', pressure: 1014, condition: 'Foggy', uvIndex: 2, visibility: 2 },
    { id: 'W015', city: 'Thornwood', country: 'NZ', date: '2024-06-16', temperature: 9, feelsLike: 6, humidity: 74, windSpeed: 24, windDirection: 'SW', pressure: 1011, condition: 'Showers', uvIndex: 3, visibility: 9 },
    { id: 'W016', city: 'Cape Radiance', country: 'ZA', date: '2024-06-17', temperature: 15, feelsLike: 13, humidity: 62, windSpeed: 32, windDirection: 'S', pressure: 1022, condition: 'Windy, Clear', uvIndex: 5, visibility: 25 },
    { id: 'W017', city: 'Harborview', country: 'HK', date: '2024-06-17', temperature: 31, feelsLike: 37, humidity: 85, windSpeed: 15, windDirection: 'SW', pressure: 1003, condition: 'Hazy', uvIndex: 5, visibility: 7 },
    { id: 'W018', city: 'Prairie Wind', country: 'AR', date: '2024-06-17', temperature: 22, feelsLike: 21, humidity: 50, windSpeed: 22, windDirection: 'N', pressure: 1015, condition: 'Clear', uvIndex: 6, visibility: 30 },
    { id: 'W019', city: 'Rainforest Station', country: 'PE', date: '2024-06-17', temperature: 27, feelsLike: 33, humidity: 95, windSpeed: 5, windDirection: 'E', pressure: 1008, condition: 'Drizzle', uvIndex: 3, visibility: 6 },
    { id: 'W020', city: 'Iceport', country: 'FI', date: '2024-06-17', temperature: 2, feelsLike: -3, humidity: 88, windSpeed: 28, windDirection: 'NE', pressure: 1025, condition: 'Freezing Fog', uvIndex: 0, visibility: 1 },
    { id: 'W021', city: 'Sunspot Oasis', country: 'MA', date: '2024-06-18', temperature: 36, feelsLike: 40, humidity: 25, windSpeed: 20, windDirection: 'N', pressure: 1009, condition: 'Sunny and Dry', uvIndex: 10, visibility: 25 },
    { id: 'W022', city: 'Stormwatch Bay', country: 'PH', date: '2024-06-18', temperature: 26, feelsLike: 30, humidity: 91, windSpeed: 70, windDirection: 'NW', pressure: 975, condition: 'Typhoon', uvIndex: 1, visibility: 2 },
    { id: 'W023', city: 'Alpine Meadow', country: 'CH', date: '2024-06-18', temperature: 12, feelsLike: 10, humidity: 70, windSpeed: 8, windDirection: 'W', pressure: 1017, condition: 'Clear', uvIndex: 7, visibility: 30 },
    { id: 'W024', city: 'Delta Plains', country: 'NG', date: '2024-06-18', temperature: 33, feelsLike: 40, humidity: 87, windSpeed: 16, windDirection: 'SW', pressure: 1004, condition: 'Humid, Partly Cloudy', uvIndex: 7, visibility: 8 },
    { id: 'W025', city: 'Blizzard Ridge', country: 'RU', date: '2024-06-18', temperature: -8, feelsLike: -16, humidity: 78, windSpeed: 45, windDirection: 'N', pressure: 1028, condition: 'Blizzard', uvIndex: 0, visibility: 0 },
    { id: 'W026', city: 'Serenity Coast', country: 'ES', date: '2024-06-19', temperature: 25, feelsLike: 24, humidity: 55, windSpeed: 12, windDirection: 'NE', pressure: 1018, condition: 'Sunny', uvIndex: 9, visibility: 30 },
    { id: 'W027', city: 'Monsoon Port', country: 'TH', date: '2024-06-19', temperature: 28, feelsLike: 34, humidity: 89, windSpeed: 35, windDirection: 'SW', pressure: 999, condition: 'Heavy Showers', uvIndex: 2, visibility: 4 },
    { id: 'W028', city: 'Highveld Station', country: 'ZW', date: '2024-06-19', temperature: 20, feelsLike: 18, humidity: 45, windSpeed: 18, windDirection: 'SE', pressure: 1016, condition: 'Partly Cloudy', uvIndex: 6, visibility: 20 },
    { id: 'W029', city: 'Avalanche Peak', country: 'AT', date: '2024-06-19', temperature: -2, feelsLike: -8, humidity: 82, windSpeed: 30, windDirection: 'W', pressure: 1006, condition: 'Snow Flurries', uvIndex: 2, visibility: 5 },
    { id: 'W030', city: 'Equatorial Hub', country: 'KE', date: '2024-06-19', temperature: 24, feelsLike: 26, humidity: 70, windSpeed: 10, windDirection: 'SE', pressure: 1012, condition: 'Partly Cloudy', uvIndex: 8, visibility: 15 },
  ];
}

// ---------------------------------------------------------------------------
// Earthquake sample data — 25 synthetic records
// ---------------------------------------------------------------------------

export function earthquakeSampleData(): EarthquakeRecord[] {
  return [
    { id: 'EQ001', date: '2024-01-12', location: 'Pacific Ring of Fire, West Coast Region', lat: 37.7, lng: -122.4, magnitude: 4.2, depth: 12, tsunami: false, casualties: 0, damage: 'Minor structural cracks reported' },
    { id: 'EQ002', date: '2024-01-25', location: 'Andean Belt, Southern Sector', lat: -18.5, lng: -70.2, magnitude: 6.1, depth: 45, tsunami: false, casualties: 3, damage: 'Several buildings collapsed in rural areas' },
    { id: 'EQ003', date: '2024-02-03', location: 'Eastern Mediterranean Fault Zone', lat: 37.1, lng: 36.4, magnitude: 5.7, depth: 10, tsunami: false, casualties: 18, damage: 'Significant damage to older masonry structures' },
    { id: 'EQ004', date: '2024-02-18', location: 'Japan Trench Subduction Zone', lat: 38.3, lng: 142.5, magnitude: 6.8, depth: 30, tsunami: true, casualties: 0, damage: 'Tsunami warning issued, minor coastal flooding' },
    { id: 'EQ005', date: '2024-02-29', location: 'North Anatolian Fault, Central Segment', lat: 40.5, lng: 34.1, magnitude: 5.0, depth: 8, tsunami: false, casualties: 2, damage: 'Moderate damage to unreinforced buildings' },
    { id: 'EQ006', date: '2024-03-14', location: 'Aleutian Islands Subduction Zone', lat: 52.8, lng: -167.3, magnitude: 7.1, depth: 20, tsunami: true, casualties: 0, damage: 'Remote area; no population centers affected' },
    { id: 'EQ007', date: '2024-03-22', location: 'Himalayan Thrust Front, Western Zone', lat: 30.2, lng: 79.5, magnitude: 5.3, depth: 15, tsunami: false, casualties: 6, damage: 'Mountain village partially destroyed by landslide' },
    { id: 'EQ008', date: '2024-04-05', location: 'New Zealand Alpine Fault, South Island', lat: -43.5, lng: 170.7, magnitude: 4.8, depth: 22, tsunami: false, casualties: 0, damage: 'Felt widely; minor property damage' },
    { id: 'EQ009', date: '2024-04-19', location: 'Mid-Atlantic Ridge, Northern Segment', lat: 52.1, lng: -33.5, magnitude: 5.5, depth: 10, tsunami: false, casualties: 0, damage: 'Oceanic epicenter; no damage' },
    { id: 'EQ010', date: '2024-05-02', location: 'Philippine Fault System', lat: 8.5, lng: 126.0, magnitude: 6.4, depth: 35, tsunami: false, casualties: 21, damage: 'Major damage in Mindanao urban corridor' },
    { id: 'EQ011', date: '2024-05-15', location: 'Central American Volcanic Arc', lat: 13.7, lng: -89.2, magnitude: 5.9, depth: 18, tsunami: false, casualties: 4, damage: 'Structural damage; gas line ruptures' },
    { id: 'EQ012', date: '2024-05-28', location: 'Zagros Fold Belt, Iran', lat: 29.5, lng: 51.2, magnitude: 6.2, depth: 12, tsunami: false, casualties: 35, damage: 'Extensive damage in mountainous villages' },
    { id: 'EQ013', date: '2024-06-08', location: 'Cascadia Subduction Zone, Offshore', lat: 44.0, lng: -125.5, magnitude: 4.5, depth: 8, tsunami: false, casualties: 0, damage: 'No damage; felt in coastal cities' },
    { id: 'EQ014', date: '2024-06-21', location: 'Caribbean Tectonic Plate Boundary', lat: 17.9, lng: -72.3, magnitude: 5.2, depth: 25, tsunami: false, casualties: 1, damage: 'Minor damage; felt across islands' },
    { id: 'EQ015', date: '2024-07-04', location: 'Papua New Guinea Trench', lat: -6.1, lng: 147.2, magnitude: 7.4, depth: 60, tsunami: true, casualties: 12, damage: 'Coastal villages affected by small tsunami waves' },
    { id: 'EQ016', date: '2024-07-16', location: 'Tibetan Plateau Interior', lat: 35.8, lng: 90.1, magnitude: 5.6, depth: 30, tsunami: false, casualties: 0, damage: 'Remote plateau; no structures affected' },
    { id: 'EQ017', date: '2024-07-29', location: 'West Sumatra Megathrust', lat: -0.5, lng: 99.8, magnitude: 6.7, depth: 25, tsunami: true, casualties: 8, damage: 'Moderate coastal damage; evacuation executed' },
    { id: 'EQ018', date: '2024-08-12', location: 'Apennine Mountains, Central Italy', lat: 42.3, lng: 13.4, magnitude: 4.9, depth: 9, tsunami: false, casualties: 0, damage: 'Superficial cracks in historic buildings' },
    { id: 'EQ019', date: '2024-08-24', location: 'East African Rift Valley, Kenya Sector', lat: 0.7, lng: 36.5, magnitude: 4.1, depth: 20, tsunami: false, casualties: 0, damage: 'Minor fissures; felt over wide area' },
    { id: 'EQ020', date: '2024-09-06', location: 'Tonga Trench, South Pacific', lat: -19.5, lng: -174.2, magnitude: 7.8, depth: 40, tsunami: true, casualties: 0, damage: 'Tsunami watch; remote location spared' },
    { id: 'EQ021', date: '2024-09-18', location: 'Hindu Kush Seismic Zone, Afghanistan', lat: 36.4, lng: 70.7, magnitude: 6.3, depth: 200, tsunami: false, casualties: 44, damage: 'Deep-focus; wide area shaking caused casualties' },
    { id: 'EQ022', date: '2024-10-01', location: 'Dead Sea Transform, Jordan Sector', lat: 31.5, lng: 35.4, magnitude: 4.4, depth: 14, tsunami: false, casualties: 0, damage: 'Felt in multiple countries; no damage' },
    { id: 'EQ023', date: '2024-10-14', location: 'Kuril-Kamchatka Arc, Russia', lat: 47.5, lng: 152.1, magnitude: 6.9, depth: 55, tsunami: true, casualties: 0, damage: 'Tsunami advisory; no significant waves reached shore' },
    { id: 'EQ024', date: '2024-11-03', location: 'Apalachian Plateau, Eastern US', lat: 36.0, lng: -84.5, magnitude: 3.8, depth: 7, tsunami: false, casualties: 0, damage: 'Minimal; slight rattling reported in nearby towns' },
    { id: 'EQ025', date: '2024-11-17', location: 'Calabrian Arc Subduction, Southern Italy', lat: 38.2, lng: 15.7, magnitude: 5.4, depth: 17, tsunami: false, casualties: 2, damage: 'Some older buildings damaged; roads cracked' },
  ];
}

// ---------------------------------------------------------------------------
// Animal species data — 40 species
// ---------------------------------------------------------------------------

export function animalSpeciesData(): AnimalSpecies[] {
  return [
    { name: 'Panthera tigris', commonName: 'Tiger', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'tigris', conservationStatus: 'Endangered', habitat: ['Tropical forests', 'Mangroves', 'Grasslands'], diet: 'Carnivore', lifespan: 25, weight: 300, length: 300 },
    { name: 'Panthera leo', commonName: 'African Lion', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'leo', conservationStatus: 'Vulnerable', habitat: ['Savanna', 'Grassland', 'Scrubland'], diet: 'Carnivore', lifespan: 20, weight: 200, length: 250 },
    { name: 'Loxodonta africana', commonName: 'African Elephant', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Proboscidea', family: 'Elephantidae', genus: 'Loxodonta', species: 'africana', conservationStatus: 'Vulnerable', habitat: ['Savanna', 'Forest', 'Wetlands'], diet: 'Herbivore', lifespan: 70, weight: 6000, length: 750 },
    { name: 'Carcharodon carcharias', commonName: 'Great White Shark', kingdom: 'Animalia', phylum: 'Chordata', class: 'Chondrichthyes', order: 'Lamniformes', family: 'Lamnidae', genus: 'Carcharodon', species: 'carcharias', conservationStatus: 'Vulnerable', habitat: ['Coastal oceans', 'Open ocean'], diet: 'Carnivore', lifespan: 70, weight: 2400, length: 600 },
    { name: 'Gorilla gorilla', commonName: 'Western Gorilla', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Gorilla', species: 'gorilla', conservationStatus: 'Critically Endangered', habitat: ['Tropical forest', 'Montane forest'], diet: 'Herbivore', lifespan: 40, weight: 180, length: 175 },
    { name: 'Pan troglodytes', commonName: 'Chimpanzee', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Pan', species: 'troglodytes', conservationStatus: 'Endangered', habitat: ['Tropical forest', 'Woodland savanna'], diet: 'Omnivore', lifespan: 50, weight: 60, length: 100 },
    { name: 'Orcinus orca', commonName: 'Orca (Killer Whale)', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Delphinidae', genus: 'Orcinus', species: 'orca', conservationStatus: 'Data Deficient', habitat: ['All oceans'], diet: 'Carnivore', lifespan: 90, weight: 6600, length: 900 },
    { name: 'Ailuropoda melanoleuca', commonName: 'Giant Panda', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ailuropoda', species: 'melanoleuca', conservationStatus: 'Vulnerable', habitat: ['Bamboo forest', 'Temperate broadleaf forest'], diet: 'Herbivore', lifespan: 25, weight: 130, length: 150 },
    { name: 'Acinonyx jubatus', commonName: 'Cheetah', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Acinonyx', species: 'jubatus', conservationStatus: 'Vulnerable', habitat: ['Grassland', 'Savanna', 'Scrubland'], diet: 'Carnivore', lifespan: 12, weight: 65, length: 150 },
    { name: 'Diceros bicornis', commonName: 'Black Rhinoceros', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Perissodactyla', family: 'Rhinocerotidae', genus: 'Diceros', species: 'bicornis', conservationStatus: 'Critically Endangered', habitat: ['Savanna', 'Dense bush', 'Grassland'], diet: 'Herbivore', lifespan: 45, weight: 1400, length: 380 },
    { name: 'Aquila chrysaetos', commonName: 'Golden Eagle', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Accipitriformes', family: 'Accipitridae', genus: 'Aquila', species: 'chrysaetos', conservationStatus: 'Least Concern', habitat: ['Mountains', 'Cliffs', 'Open country'], diet: 'Carnivore', lifespan: 30, weight: 6.5, length: 100 },
    { name: 'Spheniscus demersus', commonName: 'African Penguin', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Sphenisciformes', family: 'Spheniscidae', genus: 'Spheniscus', species: 'demersus', conservationStatus: 'Endangered', habitat: ['Rocky coastlines', 'Islands'], diet: 'Carnivore', lifespan: 27, weight: 3.8, length: 68 },
    { name: 'Balaenoptera musculus', commonName: 'Blue Whale', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Balaenopteridae', genus: 'Balaenoptera', species: 'musculus', conservationStatus: 'Endangered', habitat: ['Open ocean'], diet: 'Filter feeder (krill)', lifespan: 90, weight: 150000, length: 3000 },
    { name: 'Crocodylus niloticus', commonName: 'Nile Crocodile', kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia', order: 'Crocodilia', family: 'Crocodylidae', genus: 'Crocodylus', species: 'niloticus', conservationStatus: 'Least Concern', habitat: ['Rivers', 'Lakes', 'Wetlands'], diet: 'Carnivore', lifespan: 80, weight: 750, length: 600 },
    { name: 'Giraffa camelopardalis', commonName: 'Giraffe', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Giraffidae', genus: 'Giraffa', species: 'camelopardalis', conservationStatus: 'Vulnerable', habitat: ['Savanna', 'Woodland'], diet: 'Herbivore', lifespan: 25, weight: 1200, length: 580 },
    { name: 'Hippopotamus amphibius', commonName: 'Hippopotamus', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Hippopotamidae', genus: 'Hippopotamus', species: 'amphibius', conservationStatus: 'Vulnerable', habitat: ['Rivers', 'Lakes', 'Wetlands'], diet: 'Herbivore', lifespan: 45, weight: 3200, length: 520 },
    { name: 'Canis lupus', commonName: 'Gray Wolf', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'lupus', conservationStatus: 'Least Concern', habitat: ['Forests', 'Mountains', 'Tundra'], diet: 'Carnivore', lifespan: 14, weight: 45, length: 160 },
    { name: 'Ursus arctos', commonName: 'Brown Bear', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ursus', species: 'arctos', conservationStatus: 'Least Concern', habitat: ['Forests', 'Mountains', 'Tundra'], diet: 'Omnivore', lifespan: 30, weight: 500, length: 250 },
    { name: 'Ursus maritimus', commonName: 'Polar Bear', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Ursus', species: 'maritimus', conservationStatus: 'Vulnerable', habitat: ['Arctic sea ice', 'Coastal areas'], diet: 'Carnivore', lifespan: 30, weight: 600, length: 280 },
    { name: 'Phascolarctos cinereus', commonName: 'Koala', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Diprotodontia', family: 'Phascolarctidae', genus: 'Phascolarctos', species: 'cinereus', conservationStatus: 'Vulnerable', habitat: ['Eucalyptus woodland', 'Coastal forest'], diet: 'Herbivore', lifespan: 18, weight: 12, length: 85 },
    { name: 'Macropus rufus', commonName: 'Red Kangaroo', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Diprotodontia', family: 'Macropodidae', genus: 'Macropus', species: 'rufus', conservationStatus: 'Least Concern', habitat: ['Desert', 'Grassland', 'Scrubland'], diet: 'Herbivore', lifespan: 22, weight: 90, length: 165 },
    { name: 'Python reticulatus', commonName: 'Reticulated Python', kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia', order: 'Squamata', family: 'Pythonidae', genus: 'Python', species: 'reticulatus', conservationStatus: 'Least Concern', habitat: ['Tropical forest', 'Grassland', 'Wetlands'], diet: 'Carnivore', lifespan: 30, weight: 158, length: 900 },
    { name: 'Struthio camelus', commonName: 'Common Ostrich', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Struthioniformes', family: 'Struthionidae', genus: 'Struthio', species: 'camelus', conservationStatus: 'Least Concern', habitat: ['Savanna', 'Desert', 'Grassland'], diet: 'Omnivore', lifespan: 45, weight: 145, length: 210 },
    { name: 'Panthera pardus', commonName: 'Leopard', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Panthera', species: 'pardus', conservationStatus: 'Vulnerable', habitat: ['Forest', 'Grassland', 'Mountain'], diet: 'Carnivore', lifespan: 23, weight: 90, length: 190 },
    { name: 'Delphinapterus leucas', commonName: 'Beluga Whale', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Monodontidae', genus: 'Delphinapterus', species: 'leucas', conservationStatus: 'Least Concern', habitat: ['Arctic Ocean', 'Subarctic waters'], diet: 'Carnivore', lifespan: 70, weight: 1600, length: 550 },
    { name: 'Hymenoptera apis mellifera', commonName: 'Western Honey Bee', kingdom: 'Animalia', phylum: 'Arthropoda', class: 'Insecta', order: 'Hymenoptera', family: 'Apidae', genus: 'Apis', species: 'mellifera', conservationStatus: 'Least Concern', habitat: ['Meadows', 'Forests', 'Gardens'], diet: 'Herbivore (nectar, pollen)', lifespan: 0.15, weight: 0.00012, length: 1.5 },
    { name: 'Felis catus', commonName: 'Domestic Cat', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Felis', species: 'catus', conservationStatus: 'Domesticated', habitat: ['Human settlements', 'Forests', 'Grassland'], diet: 'Carnivore', lifespan: 15, weight: 5, length: 46 },
    { name: 'Canis lupus familiaris', commonName: 'Domestic Dog', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Canidae', genus: 'Canis', species: 'lupus familiaris', conservationStatus: 'Domesticated', habitat: ['Human settlements'], diet: 'Omnivore', lifespan: 13, weight: 30, length: 80 },
    { name: 'Equus caballus', commonName: 'Horse', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Perissodactyla', family: 'Equidae', genus: 'Equus', species: 'caballus', conservationStatus: 'Domesticated', habitat: ['Grassland', 'Plains'], diet: 'Herbivore', lifespan: 30, weight: 500, length: 240 },
    { name: 'Bufo bufo', commonName: 'Common Toad', kingdom: 'Animalia', phylum: 'Chordata', class: 'Amphibia', order: 'Anura', family: 'Bufonidae', genus: 'Bufo', species: 'bufo', conservationStatus: 'Least Concern', habitat: ['Woodland', 'Grassland', 'Gardens'], diet: 'Carnivore (insects)', lifespan: 40, weight: 0.08, length: 12 },
    { name: 'Corvus corax', commonName: 'Common Raven', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Passeriformes', family: 'Corvidae', genus: 'Corvus', species: 'corax', conservationStatus: 'Least Concern', habitat: ['Forest', 'Mountain', 'Arctic tundra'], diet: 'Omnivore', lifespan: 21, weight: 1.4, length: 67 },
    { name: 'Elephas maximus', commonName: 'Asian Elephant', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Proboscidea', family: 'Elephantidae', genus: 'Elephas', species: 'maximus', conservationStatus: 'Endangered', habitat: ['Tropical forest', 'Grassland', 'Scrubland'], diet: 'Herbivore', lifespan: 65, weight: 4000, length: 640 },
    { name: 'Ara macao', commonName: 'Scarlet Macaw', kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Ara', species: 'macao', conservationStatus: 'Least Concern', habitat: ['Tropical rainforest'], diet: 'Herbivore (fruits, seeds)', lifespan: 50, weight: 1.1, length: 90 },
    { name: 'Tremarctos ornatus', commonName: 'Spectacled Bear', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Ursidae', genus: 'Tremarctos', species: 'ornatus', conservationStatus: 'Vulnerable', habitat: ['Andean cloud forest', 'Grassland'], diet: 'Omnivore', lifespan: 25, weight: 150, length: 170 },
    { name: 'Neofelis nebulosa', commonName: 'Clouded Leopard', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Neofelis', species: 'nebulosa', conservationStatus: 'Vulnerable', habitat: ['Tropical and subtropical forest'], diet: 'Carnivore', lifespan: 17, weight: 23, length: 105 },
    { name: 'Varanus komodoensis', commonName: 'Komodo Dragon', kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia', order: 'Squamata', family: 'Varanidae', genus: 'Varanus', species: 'komodoensis', conservationStatus: 'Endangered', habitat: ['Tropical savanna', 'Forest'], diet: 'Carnivore', lifespan: 30, weight: 70, length: 310 },
    { name: 'Pongo pygmaeus', commonName: 'Bornean Orangutan', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Primates', family: 'Hominidae', genus: 'Pongo', species: 'pygmaeus', conservationStatus: 'Critically Endangered', habitat: ['Tropical rainforest'], diet: 'Omnivore', lifespan: 50, weight: 90, length: 140 },
    { name: 'Lynx lynx', commonName: 'Eurasian Lynx', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae', genus: 'Lynx', species: 'lynx', conservationStatus: 'Least Concern', habitat: ['Boreal forest', 'Mountainous terrain'], diet: 'Carnivore', lifespan: 21, weight: 30, length: 130 },
    { name: 'Tursiops truncatus', commonName: 'Bottlenose Dolphin', kingdom: 'Animalia', phylum: 'Chordata', class: 'Mammalia', order: 'Artiodactyla', family: 'Delphinidae', genus: 'Tursiops', species: 'truncatus', conservationStatus: 'Least Concern', habitat: ['Coastal ocean', 'Open ocean'], diet: 'Carnivore', lifespan: 45, weight: 650, length: 380 },
    { name: 'Geochelone elegans', commonName: 'Indian Star Tortoise', kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia', order: 'Testudines', family: 'Testudinidae', genus: 'Geochelone', species: 'elegans', conservationStatus: 'Vulnerable', habitat: ['Dry scrubland', 'Grassland'], diet: 'Herbivore', lifespan: 80, weight: 7, length: 38 },
  ];
}

// ---------------------------------------------------------------------------
// Plants data — 30 plant species
// ---------------------------------------------------------------------------

export function plantsData(): PlantSpecies[] {
  return [
    { name: 'Quercus robur', commonName: 'English Oak', family: 'Fagaceae', origin: 'Europe and Western Asia', type: 'tree', uses: ['Timber', 'Furniture', 'Charcoal', 'Wildlife habitat'], climate: 'Temperate', height: 4000, endangered: false },
    { name: 'Acer saccharum', commonName: 'Sugar Maple', family: 'Sapindaceae', origin: 'Eastern North America', type: 'tree', uses: ['Maple syrup', 'Timber', 'Furniture', 'Firewood'], climate: 'Temperate', height: 4000, endangered: false },
    { name: 'Sequoia sempervirens', commonName: 'Coast Redwood', family: 'Cupressaceae', origin: 'California, USA', type: 'tree', uses: ['Timber', 'Tourism', 'Carbon sequestration'], climate: 'Temperate oceanic', height: 11000, endangered: false },
    { name: 'Cinnamomum verum', commonName: 'True Cinnamon', family: 'Lauraceae', origin: 'Sri Lanka', type: 'tree', uses: ['Spice', 'Medicine', 'Flavoring', 'Aromatherapy'], climate: 'Tropical', height: 1500, endangered: false },
    { name: 'Coffea arabica', commonName: 'Arabica Coffee', family: 'Rubiaceae', origin: 'Ethiopia', type: 'shrub', uses: ['Coffee beverage', 'Flavoring'], climate: 'Tropical highland', height: 500, endangered: false },
    { name: 'Camellia sinensis', commonName: 'Tea Plant', family: 'Theaceae', origin: 'Southeast Asia', type: 'shrub', uses: ['Tea beverage', 'Medicine', 'Cosmetics'], climate: 'Subtropical', height: 200, endangered: false },
    { name: 'Cannabis sativa', commonName: 'Hemp / Cannabis', family: 'Cannabaceae', origin: 'Central Asia', type: 'herb', uses: ['Fiber', 'Paper', 'Medicine', 'Oil', 'Food (seeds)'], climate: 'Temperate to tropical', height: 500, endangered: false },
    { name: 'Aloe vera', commonName: 'Aloe Vera', family: 'Asphodelaceae', origin: 'Arabian Peninsula', type: 'herb', uses: ['Skin care', 'Medicine', 'Food supplement', 'Cosmetics'], climate: 'Arid and semi-arid', height: 100, endangered: false },
    { name: 'Papaver somniferum', commonName: 'Opium Poppy', family: 'Papaveraceae', origin: 'Mediterranean / Middle East', type: 'herb', uses: ['Medicine (morphine, codeine)', 'Culinary (seeds)', 'Oil'], climate: 'Mediterranean and temperate', height: 150, endangered: false },
    { name: 'Bambusa vulgaris', commonName: 'Common Bamboo', family: 'Poaceae', origin: 'Southeast Asia', type: 'grass', uses: ['Construction', 'Furniture', 'Food (shoots)', 'Paper', 'Textiles'], climate: 'Tropical and subtropical', height: 2000, endangered: false },
    { name: 'Triticum aestivum', commonName: 'Bread Wheat', family: 'Poaceae', origin: 'Fertile Crescent (Middle East)', type: 'grass', uses: ['Bread', 'Pasta', 'Animal feed', 'Flour'], climate: 'Temperate', height: 120, endangered: false },
    { name: 'Oryza sativa', commonName: 'Asian Rice', family: 'Poaceae', origin: 'China', type: 'grass', uses: ['Staple food', 'Wine (sake)', 'Oil', 'Straw'], climate: 'Tropical and subtropical', height: 150, endangered: false },
    { name: 'Zea mays', commonName: 'Corn (Maize)', family: 'Poaceae', origin: 'Mexico', type: 'grass', uses: ['Food', 'Animal feed', 'Biofuel', 'Starch', 'Sweetener'], climate: 'Temperate to tropical', height: 300, endangered: false },
    { name: 'Nicotiana tabacum', commonName: 'Tobacco', family: 'Solanaceae', origin: 'South America', type: 'herb', uses: ['Cigarettes', 'Cigars', 'Nicotine medicine', 'Biopesticides'], climate: 'Warm temperate to tropical', height: 200, endangered: false },
    { name: 'Rosa damascena', commonName: 'Damask Rose', family: 'Rosaceae', origin: 'Middle East', type: 'shrub', uses: ['Perfume', 'Rose water', 'Medicine', 'Culinary'], climate: 'Temperate', height: 250, endangered: false },
    { name: 'Lavandula angustifolia', commonName: 'English Lavender', family: 'Lamiaceae', origin: 'Mediterranean', type: 'shrub', uses: ['Aromatherapy', 'Cosmetics', 'Medicine', 'Culinary'], climate: 'Mediterranean', height: 90, endangered: false },
    { name: 'Piper nigrum', commonName: 'Black Pepper', family: 'Piperaceae', origin: 'Kerala, India', type: 'vine', uses: ['Spice', 'Medicine', 'Preservative'], climate: 'Tropical', height: 1000, endangered: false },
    { name: 'Vanilla planifolia', commonName: 'Vanilla', family: 'Orchidaceae', origin: 'Mexico', type: 'vine', uses: ['Flavoring', 'Perfume', 'Baking'], climate: 'Tropical', height: 3000, endangered: false },
    { name: 'Theobroma cacao', commonName: 'Cacao (Chocolate Tree)', family: 'Malvaceae', origin: 'Mesoamerica', type: 'tree', uses: ['Chocolate', 'Cocoa butter', 'Medicine'], climate: 'Tropical', height: 1000, endangered: false },
    { name: 'Mangifera indica', commonName: 'Mango', family: 'Anacardiaceae', origin: 'South and Southeast Asia', type: 'tree', uses: ['Fruit', 'Juice', 'Pickles', 'Timber'], climate: 'Tropical', height: 3000, endangered: false },
    { name: 'Musa paradisiaca', commonName: 'Banana', family: 'Musaceae', origin: 'Papua New Guinea / Southeast Asia', type: 'herb', uses: ['Fruit', 'Fiber', 'Leaves for packaging', 'Flour'], climate: 'Tropical', height: 750, endangered: false },
    { name: 'Solanum lycopersicum', commonName: 'Tomato', family: 'Solanaceae', origin: 'Andes, South America', type: 'herb', uses: ['Food', 'Sauces', 'Juice', 'Cosmetics'], climate: 'Warm temperate', height: 200, endangered: false },
    { name: 'Ficus benghalensis', commonName: 'Banyan Tree', family: 'Moraceae', origin: 'Indian subcontinent', type: 'tree', uses: ['Shade', 'Timber', 'Medicine', 'Cultural/religious'], climate: 'Tropical', height: 2000, endangered: false },
    { name: 'Eucalyptus globulus', commonName: 'Blue Gum Eucalyptus', family: 'Myrtaceae', origin: 'Tasmania and SE Australia', type: 'tree', uses: ['Timber', 'Essential oils', 'Paper', 'Medicine'], climate: 'Temperate and Mediterranean', height: 5500, endangered: false },
    { name: 'Taxus brevifolia', commonName: 'Pacific Yew', family: 'Taxaceae', origin: 'Western North America', type: 'tree', uses: ['Taxol (cancer drug)', 'Timber', 'Bows'], climate: 'Temperate', height: 1500, endangered: false },
    { name: 'Nymphaea caerulea', commonName: 'Blue Lotus / Blue Water Lily', family: 'Nymphaeaceae', origin: 'Egypt and East Africa', type: 'herb', uses: ['Ornamental', 'Traditional medicine', 'Ritual use'], climate: 'Tropical', height: 30, endangered: false },
    { name: 'Strelitzia reginae', commonName: 'Bird of Paradise', family: 'Strelitziaceae', origin: 'South Africa', type: 'herb', uses: ['Ornamental flower', 'Cut flower industry'], climate: 'Subtropical', height: 200, endangered: false },
    { name: 'Dionaea muscipula', commonName: 'Venus Flytrap', family: 'Droseraceae', origin: 'North and South Carolina, USA', type: 'herb', uses: ['Ornamental', 'Research (carnivorous mechanism)'], climate: 'Subtropical wetlands', height: 30, endangered: true },
    { name: 'Wollemia nobilis', commonName: 'Wollemi Pine', family: 'Araucariaceae', origin: 'Australia (Wollemi National Park)', type: 'tree', uses: ['Ornamental', 'Conservation research', 'Living fossil study'], climate: 'Temperate', height: 4000, endangered: true },
    { name: 'Rafflesia arnoldii', commonName: 'Corpse Flower / Giant Rafflesia', family: 'Rafflesiaceae', origin: 'Borneo and Sumatra', type: 'herb', uses: ['Medicinal (traditional)', 'Ecotourism'], climate: 'Tropical rainforest', height: 0, endangered: true },
  ];
}

// ---------------------------------------------------------------------------
// Human body reference data
// ---------------------------------------------------------------------------

export function humanBodyReferenceData(): HumanBodySystem[] {
  return [
    {
      system: 'Skeletal System',
      organs: [
        { name: 'Bones', function: 'Provide structural support, protect organs, and enable movement' },
        { name: 'Cartilage', function: 'Cushions joints and provides flexible support at the ends of bones' },
        { name: 'Ligaments', function: 'Connect bone to bone and stabilize joints' },
        { name: 'Bone Marrow', function: 'Produces red blood cells, white blood cells, and platelets' },
      ],
      conditions: ['Osteoporosis', 'Arthritis', 'Fractures', 'Osteoarthritis', 'Scoliosis', 'Rickets'],
      facts: [
        'The adult human skeleton has 206 bones.',
        'The femur (thigh bone) is the longest and strongest bone in the body.',
        'Babies are born with about 270 to 300 bones; many fuse during childhood.',
        'Bones are about 70% mineral (primarily hydroxyapatite) and 30% collagen.',
        'The smallest bones are in the ear: malleus, incus, and stapes.',
      ],
    },
    {
      system: 'Muscular System',
      organs: [
        { name: 'Skeletal Muscles', function: 'Attached to bones; enable voluntary movement' },
        { name: 'Smooth Muscle', function: 'Lines walls of hollow organs; controls involuntary functions' },
        { name: 'Cardiac Muscle', function: 'Makes up the heart wall; pumps blood continuously' },
        { name: 'Tendons', function: 'Connect muscle to bone' },
      ],
      conditions: ['Muscular dystrophy', 'Fibromyalgia', 'Muscle strain', 'Myasthenia gravis', 'Rhabdomyolysis'],
      facts: [
        'The human body has over 600 skeletal muscles.',
        'The gluteus maximus is the largest muscle in the body.',
        'The stapedius muscle in the ear is the smallest skeletal muscle.',
        'Muscles make up about 40% of total body weight.',
        'Cardiac muscle is the only involuntary striated (striped) muscle.',
      ],
    },
    {
      system: 'Nervous System',
      organs: [
        { name: 'Brain', function: 'Central processor for all bodily functions, consciousness, and cognition' },
        { name: 'Spinal Cord', function: 'Transmits neural signals between brain and body; mediates reflexes' },
        { name: 'Peripheral Nerves', function: 'Carry signals between CNS and muscles, organs, and sensory receptors' },
        { name: 'Neurons', function: 'Specialized cells that transmit electrical and chemical signals' },
        { name: 'Glial Cells', function: 'Support, protect, and nourish neurons' },
      ],
      conditions: ['Alzheimer\'s disease', 'Parkinson\'s disease', 'Epilepsy', 'Multiple sclerosis', 'Stroke', 'Meningitis'],
      facts: [
        'The brain contains approximately 86 billion neurons.',
        'Nerve impulses travel at speeds of up to 120 m/s.',
        'The brain uses about 20% of the body\'s total oxygen and energy.',
        'The human brain weighs about 1.4 kg (3 lb) on average.',
        'Neuroplasticity allows the brain to reorganize itself throughout life.',
      ],
    },
    {
      system: 'Cardiovascular System',
      organs: [
        { name: 'Heart', function: 'Pumps blood through the circulatory system' },
        { name: 'Arteries', function: 'Carry oxygenated blood away from the heart to the body' },
        { name: 'Veins', function: 'Return deoxygenated blood to the heart' },
        { name: 'Capillaries', function: 'Enable exchange of oxygen, nutrients, and waste between blood and tissues' },
      ],
      conditions: ['Hypertension', 'Coronary artery disease', 'Heart failure', 'Arrhythmia', 'Atherosclerosis', 'Stroke'],
      facts: [
        'The heart beats approximately 100,000 times per day.',
        'Blood vessels laid end-to-end would stretch about 100,000 km.',
        'The heart pumps about 5 litres of blood per minute at rest.',
        'Red blood cells live for about 120 days.',
        'The left ventricle has the thickest walls because it pumps blood to the entire body.',
      ],
    },
    {
      system: 'Respiratory System',
      organs: [
        { name: 'Lungs', function: 'Facilitate gas exchange: oxygen intake and carbon dioxide expulsion' },
        { name: 'Trachea', function: 'Carries air from the throat to the bronchi' },
        { name: 'Bronchi', function: 'Branch from trachea to deliver air into each lung' },
        { name: 'Alveoli', function: 'Tiny air sacs where gas exchange between air and blood occurs' },
        { name: 'Diaphragm', function: 'Main muscle of breathing; contracts to inflate lungs' },
      ],
      conditions: ['Asthma', 'Chronic obstructive pulmonary disease (COPD)', 'Pneumonia', 'Lung cancer', 'Tuberculosis'],
      facts: [
        'The lungs contain about 300 million alveoli with a total surface area of 70 m².',
        'An adult breathes about 15–20 times per minute at rest.',
        'The right lung has three lobes; the left lung has two lobes.',
        'Air spends only about 0.25 seconds in the alveoli.',
        'The lungs are the only organ that can float on water.',
      ],
    },
    {
      system: 'Digestive System',
      organs: [
        { name: 'Mouth', function: 'Begins digestion through mechanical chewing and salivary enzymes' },
        { name: 'Esophagus', function: 'Muscular tube that moves food from mouth to stomach' },
        { name: 'Stomach', function: 'Mixes food with acid and enzymes; begins protein digestion' },
        { name: 'Small Intestine', function: 'Primary site of nutrient absorption; spans about 6–7 m' },
        { name: 'Large Intestine', function: 'Absorbs water; processes waste into feces' },
        { name: 'Liver', function: 'Produces bile, processes nutrients, detoxifies blood' },
        { name: 'Pancreas', function: 'Secretes digestive enzymes and insulin/glucagon' },
        { name: 'Gallbladder', function: 'Stores and releases bile to aid fat digestion' },
      ],
      conditions: ['Irritable bowel syndrome', 'Crohn\'s disease', 'Ulcerative colitis', 'Gastric ulcer', 'Celiac disease', 'Cirrhosis'],
      facts: [
        'The small intestine is about 6–7 m long; the large intestine about 1.5 m.',
        'The stomach can hold about 1–2 litres of food.',
        'Food takes 24–72 hours to travel through the digestive system.',
        'The liver performs over 500 different functions.',
        'The gut microbiome contains approximately 100 trillion bacteria.',
      ],
    },
    {
      system: 'Endocrine System',
      organs: [
        { name: 'Pituitary Gland', function: 'Master gland; regulates other endocrine glands via hormones' },
        { name: 'Thyroid Gland', function: 'Regulates metabolism, growth, and development' },
        { name: 'Adrenal Glands', function: 'Produce cortisol, adrenaline; regulate stress response and metabolism' },
        { name: 'Pancreas (endocrine)', function: 'Produces insulin and glucagon to regulate blood sugar' },
        { name: 'Gonads (Ovaries/Testes)', function: 'Produce sex hormones and gametes' },
        { name: 'Pineal Gland', function: 'Produces melatonin; regulates sleep-wake cycle' },
        { name: 'Hypothalamus', function: 'Links nervous system to endocrine system; regulates body temperature, hunger, thirst' },
      ],
      conditions: ['Diabetes mellitus', 'Hypothyroidism', 'Hyperthyroidism', 'Cushing\'s syndrome', 'Addison\'s disease', 'Acromegaly'],
      facts: [
        'Hormones travel through the bloodstream to target organs.',
        'Insulin is the main hormone regulating blood glucose levels.',
        'The thyroid gland is the largest endocrine gland.',
        'The adrenal glands sit atop each kidney.',
        'Growth hormone is secreted predominantly during deep sleep.',
      ],
    },
    {
      system: 'Immune System',
      organs: [
        { name: 'White Blood Cells (Leukocytes)', function: 'Primary cells of immunity; identify and destroy pathogens' },
        { name: 'Lymph Nodes', function: 'Filter lymph fluid; site of immune cell activation' },
        { name: 'Spleen', function: 'Filters blood; removes old red blood cells; immune response site' },
        { name: 'Thymus', function: 'Matures T-lymphocytes (T-cells)' },
        { name: 'Bone Marrow', function: 'Produces all blood cells including immune cells' },
        { name: 'Tonsils and Adenoids', function: 'First line of defense against inhaled or swallowed pathogens' },
      ],
      conditions: ['HIV/AIDS', 'Lupus', 'Rheumatoid arthritis', 'Type 1 diabetes (autoimmune)', 'Allergies', 'Primary immunodeficiency'],
      facts: [
        'The immune system can recognize and respond to millions of different antigens.',
        'Antibodies are Y-shaped proteins produced by B-cells.',
        'Vaccines work by training the immune system to recognize specific pathogens.',
        'Fever is an immune response that inhibits pathogen reproduction.',
        'Natural killer (NK) cells can destroy cancer cells without prior sensitization.',
      ],
    },
    {
      system: 'Urinary System',
      organs: [
        { name: 'Kidneys', function: 'Filter blood, produce urine, regulate electrolytes and blood pressure' },
        { name: 'Ureters', function: 'Transport urine from kidneys to the bladder' },
        { name: 'Urinary Bladder', function: 'Stores urine until excretion' },
        { name: 'Urethra', function: 'Carries urine from the bladder to outside the body' },
      ],
      conditions: ['Kidney stones', 'Urinary tract infection', 'Chronic kidney disease', 'Kidney failure', 'Bladder cancer'],
      facts: [
        'Each kidney contains about 1 million functional units called nephrons.',
        'The kidneys filter about 180 litres of blood per day.',
        'Urine is 95% water and 5% waste products.',
        'The kidneys also produce the hormone erythropoietin to stimulate red blood cell production.',
        'Normal adult urine output is 800–2000 mL per day.',
      ],
    },
    {
      system: 'Integumentary System',
      organs: [
        { name: 'Skin', function: 'Largest organ; protects body, regulates temperature, senses environment' },
        { name: 'Hair', function: 'Insulates, senses, and protects the scalp and body' },
        { name: 'Nails', function: 'Protect fingertips and toes; aid in grasping' },
        { name: 'Sweat Glands', function: 'Regulate body temperature through evaporative cooling' },
        { name: 'Sebaceous Glands', function: 'Produce sebum to lubricate and waterproof skin and hair' },
      ],
      conditions: ['Eczema', 'Psoriasis', 'Acne', 'Melanoma', 'Burns', 'Rosacea'],
      facts: [
        'Skin is the largest organ, covering about 1.5–2 m².',
        'The skin accounts for about 15% of total body weight.',
        'Skin has three main layers: epidermis, dermis, and hypodermis.',
        'The outermost layer of skin is completely replaced every 2–4 weeks.',
        'Melanin pigment protects skin cells from UV radiation damage.',
      ],
    },
  ];
}
