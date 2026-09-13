export interface RegionData {
  id: string;
  name: string;
  workerRate: { min: number; median: number; max: number };
  helperRate: { min: number; median: number; max: number };
  m2Simple: { min: number; max: number };
  m2Medio: { min: number; max: number };
  m2Alto: { min: number; max: number };
  empreitadaM2: { min: number; max: number };
}

export interface CityData {
  name: string;
  state: string;
  region: string;
  workerRate: { min: number; median: number; max: number };
  helperRate: { min: number; median: number; max: number };
}

export const REGIONS: RegionData[] = [
  {
    id: 'sudeste',
    name: 'Sudeste (SP, RJ, MG, ES)',
    workerRate: { min: 260, median: 320, max: 450 },
    helperRate: { min: 140, median: 165, max: 220 },
    m2Simple: { min: 2200, max: 2700 },
    m2Medio: { min: 2800, max: 4000 },
    m2Alto: { min: 4500, max: 7000 },
    empreitadaM2: { min: 650, max: 1000 },
  },
  {
    id: 'sul',
    name: 'Sul (PR, SC, RS)',
    workerRate: { min: 240, median: 300, max: 400 },
    helperRate: { min: 130, median: 155, max: 200 },
    m2Simple: { min: 2300, max: 2800 },
    m2Medio: { min: 3000, max: 4200 },
    m2Alto: { min: 4800, max: 7500 },
    empreitadaM2: { min: 600, max: 950 },
  },
  {
    id: 'centro_oeste',
    name: 'Centro-Oeste (DF, GO, MT, MS)',
    workerRate: { min: 230, median: 280, max: 380 },
    helperRate: { min: 125, median: 150, max: 190 },
    m2Simple: { min: 2000, max: 2600 },
    m2Medio: { min: 2700, max: 3800 },
    m2Alto: { min: 4200, max: 6500 },
    empreitadaM2: { min: 550, max: 900 },
  },
  {
    id: 'nordeste',
    name: 'Nordeste (BA, PE, CE, MA, etc.)',
    workerRate: { min: 200, median: 250, max: 350 },
    helperRate: { min: 110, median: 135, max: 180 },
    m2Simple: { min: 1800, max: 2300 },
    m2Medio: { min: 2400, max: 3400 },
    m2Alto: { min: 3800, max: 5500 },
    empreitadaM2: { min: 450, max: 800 },
  },
  {
    id: 'norte',
    name: 'Norte (PA, AM, RO, AC, etc.)',
    workerRate: { min: 220, median: 270, max: 380 },
    helperRate: { min: 120, median: 145, max: 190 },
    m2Simple: { min: 1900, max: 2500 },
    m2Medio: { min: 2600, max: 3600 },
    m2Alto: { min: 4000, max: 6000 },
    empreitadaM2: { min: 500, max: 850 },
  },
];

export const MAJOR_CITIES: CityData[] = [
  { name: 'São Paulo', state: 'SP', region: 'sudeste', workerRate: { min: 300, median: 380, max: 600 }, helperRate: { min: 150, median: 190, max: 280 } },
  { name: 'Rio de Janeiro', state: 'RJ', region: 'sudeste', workerRate: { min: 300, median: 370, max: 550 }, helperRate: { min: 150, median: 185, max: 260 } },
  { name: 'Belo Horizonte', state: 'MG', region: 'sudeste', workerRate: { min: 260, median: 330, max: 480 }, helperRate: { min: 140, median: 170, max: 230 } },
  { name: 'Vitória', state: 'ES', region: 'sudeste', workerRate: { min: 250, median: 310, max: 440 }, helperRate: { min: 135, median: 160, max: 210 } },
  { name: 'Curitiba', state: 'PR', region: 'sul', workerRate: { min: 270, median: 340, max: 500 }, helperRate: { min: 140, median: 175, max: 240 } },
  { name: 'Florianópolis', state: 'SC', region: 'sul', workerRate: { min: 280, median: 350, max: 520 }, helperRate: { min: 145, median: 180, max: 250 } },
  { name: 'Porto Alegre', state: 'RS', region: 'sul', workerRate: { min: 270, median: 340, max: 500 }, helperRate: { min: 140, median: 175, max: 240 } },
  { name: 'Brasília', state: 'DF', region: 'centro_oeste', workerRate: { min: 320, median: 420, max: 700 }, helperRate: { min: 160, median: 210, max: 320 } },
  { name: 'Goiânia', state: 'GO', region: 'centro_oeste', workerRate: { min: 230, median: 290, max: 400 }, helperRate: { min: 125, median: 155, max: 200 } },
  { name: 'Cuiabá', state: 'MT', region: 'centro_oeste', workerRate: { min: 230, median: 280, max: 380 }, helperRate: { min: 120, median: 150, max: 190 } },
  { name: 'Campo Grande', state: 'MS', region: 'centro_oeste', workerRate: { min: 220, median: 270, max: 370 }, helperRate: { min: 120, median: 145, max: 185 } },
  { name: 'Salvador', state: 'BA', region: 'nordeste', workerRate: { min: 200, median: 270, max: 380 }, helperRate: { min: 110, median: 145, max: 200 } },
  { name: 'Recife', state: 'PE', region: 'nordeste', workerRate: { min: 200, median: 260, max: 360 }, helperRate: { min: 110, median: 140, max: 190 } },
  { name: 'Fortaleza', state: 'CE', region: 'nordeste', workerRate: { min: 180, median: 240, max: 350 }, helperRate: { min: 100, median: 130, max: 180 } },
  { name: 'Manaus', state: 'AM', region: 'norte', workerRate: { min: 200, median: 270, max: 380 }, helperRate: { min: 110, median: 145, max: 200 } },
  { name: 'Belém', state: 'PA', region: 'norte', workerRate: { min: 200, median: 260, max: 360 }, helperRate: { min: 110, median: 140, max: 190 } },
  { name: 'Porto Velho', state: 'RO', region: 'norte', workerRate: { min: 210, median: 270, max: 370 }, helperRate: { min: 115, median: 145, max: 190 } },
  { name: 'Rio Branco', state: 'AC', region: 'norte', workerRate: { min: 200, median: 250, max: 340 }, helperRate: { min: 110, median: 135, max: 175 } },
  { name: 'Macapá', state: 'AP', region: 'norte', workerRate: { min: 190, median: 240, max: 330 }, helperRate: { min: 105, median: 130, max: 170 } },
  { name: 'Boa Vista', state: 'RR', region: 'norte', workerRate: { min: 200, median: 260, max: 350 }, helperRate: { min: 110, median: 140, max: 185 } },
];

export function getRegionById(id: string): RegionData | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getCityByName(name: string): CityData | undefined {
  return MAJOR_CITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}

export function getDefaultRatesForRegion(regionId: string) {
  const region = getRegionById(regionId);
  if (!region) return { workerRate: 280, helperRate: 150 };
  return { workerRate: region.workerRate.median, helperRate: region.helperRate.median };
}

export function getDefaultRatesForCity(cityName: string) {
  const city = getCityByName(cityName);
  if (!city) return null;
  return { workerRate: city.workerRate.median, helperRate: city.helperRate.median };
}
