
export interface CarSpecs {
  horsepower: number;
  torque: number;
  zeroToSixty: number; // in seconds
  topSpeed: number; // in mph
  engineType: string;
  transmission: string;
  driveType: string;
  fuelEconomy: string;
}

export interface CarInfo {
  id: string;
  make: string;
  model: string;
  yearRange: string;
  priceRange: string;
  description: string;
  history: string;
  specs: CarSpecs;
  benefits: string[];
  drawbacks: string[];
  similarCars: string[];
  groundingLinks?: { title: string; uri: string }[];
}

export interface AppState {
  searchQuery: string;
  loading: boolean;
  error: string | null;
  carData: CarInfo | null;
  carImageUrl: string | null;
}
