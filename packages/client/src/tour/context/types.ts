export enum LocationType {
  THEATER = 'THEATER',
  CONCERT = 'CONCERT',
  FESTIVAL = 'FESTIVAL',
}

export interface TourEvent {
  id: string;
  date?: Date;
  order: number;
  name: string | null;
  numberOfSeats: number;
}

export interface TravelLocation {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  country?: string;
}

export enum TravelMean {
  BIKE = 'BIKE',
  CARSHARE = 'CARSHARE',
  CAR = 'CAR',
  ECAR = 'ECAR',
  BUS = 'BUS',
  REGIONAL_TRAIN = 'REGIONAL_TRAIN',
  TRAIN = 'TRAIN',
  PLANE = 'PLANE',
  VAN = 'VAN',
  SMALL_TRUCK = 'SMALL_TRUCK',
  TRUCK = 'TRUCK',
  BOAT = 'BOAT',
}

export interface TravelMeanRepartition {
  type: TravelMean;
  percentage: number;
}

export enum TravelType {
  DIRECT = 'DIRECT',
  OUT = 'OUT',
  IN = 'IN',
}
export enum TravelLoad {
  PASSENGER = 'PASSENGER',
  FREIGHT = 'FREIGHT',
}

export interface DirectTravel extends Travel {
  type: TravelType.DIRECT;
}

export interface OutTravel extends Travel {
  type: TravelType.OUT;
  to?: TravelLocation;
}

export interface InTravel extends Travel {
  type: TravelType.IN;
  from?: TravelLocation;
}

export interface Travel {
  id: string;
  order: number;
  type: TravelType;
  load: TravelLoad;
  mean?: TravelMeanRepartition[];
  value?: number; // number of persons or freight weight
  alternateValue?: number; // number of cars when carshare
  from?: TravelLocation;
  to?: TravelLocation;
}

export interface Step {
  id: string;
  order: number;
  location?: TravelLocation;
  events: TourEvent[];
  travels: Travel[];
  disabledTravelTypes?: TravelType[];
}

export interface Tour {
  steps: Step[];
}
