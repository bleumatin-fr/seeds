import {
  Step,
  Tour,
  Travel,
  TravelLoad,
  TravelMean,
} from '../tour/context/types';
import computeDistance from '../tour/travel/computeDistance';

const defaultParametersValues = {
  passenger_bike: 0,
  passenger_car: 0,
  passenger_ecar: 0,
  passenger_regional_train: 0,
  passenger_train_france: 0,
  passenger_train_france_europe: 0,
  passenger_train_europe: 0,
  passenger_bus: 0,
  passenger_boat: 0,
  passenger_plane_short_haul: 0,
  passenger_plane_medium_haul: 0,
  passenger_plane_long_haul: 0,
  passenger_carshare: 0,
  freight_van: 0,
  freight_truck: 0,
  freight_train: 0,
  freight_boat: 0,
  freight_plane: 0,
};

const fillMissingLocations =
  (tour: Tour) => (travels: Travel[], step: Step, index: number) => {
    const from = step.location;
    const to = tour.steps[index + 1] ? tour.steps[index + 1].location : null;
    return [
      ...travels,
      ...step.travels.map((travel) => {
        return {
          ...travel,
          from: travel.from ? travel.from : from,
          to: travel.to ? travel.to : to,
        } as Travel;
      }),
    ] as Travel[];
  };

const getFreightStats = (meanType: TravelMean, value: number): any => {
  return {
    [`freight_${meanType.toLowerCase()}`]: value,
  };
};
const getPassengerStats = (
  travel: Travel,
  meanType: TravelMean,
  value: number,
  distance: number,
): any => {
  switch (meanType) {
    case TravelMean.TRAIN:
      let variant = '';
      const fromTo = [travel.from?.country, travel.to?.country];
      if (fromTo.every((country) => country === 'France')) {
        variant = 'france';
      } else {
        if (fromTo[0] === 'France' || fromTo[1] === 'France') {
          variant = 'france_europe';
        } else {
          variant = 'europe';
        }
      }
      return {
        [`passenger_train_${variant}`]: value,
      };
    case TravelMean.PLANE:
      //https://bilans-ges.ademe.fr/forum/viewtopic.php?t=4192#:~:text=Les%20moyens%20courriers%20ont%20un,de%20vols%20transoc%C3%A9aniques%20par%20exemple.
      const haul =
        distance < 1000
          ? 'short_haul'
          : distance > 3500
          ? 'long_haul'
          : 'medium_haul';
      return {
        [`passenger_plane_${haul}`]: value,
      };
    case TravelMean.CAR:
    case TravelMean.ECAR:
    case TravelMean.CARSHARE:
    case TravelMean.REGIONAL_TRAIN:
    case TravelMean.BUS:
    case TravelMean.BIKE:
    case TravelMean.BOAT:
      return {
        [`passenger_${meanType.toLowerCase()}`]: value,
      };
  }
};

const kgToTonFactor = 1000;

const computeTravelStats = (travel: Travel) => {
  const valuePerMean = travel.mean?.map((mean) => {
    let numberOfPersonsOrKg =
      travel.load === TravelLoad.FREIGHT
        ? (travel.value || 0) / kgToTonFactor
        : travel.value || 0;

    if (mean.type === TravelMean.CARSHARE) {
      numberOfPersonsOrKg = travel.alternateValue || 1;
    }
    const distance = computeDistance(
      travel.from?.coordinates,
      travel.to?.coordinates,
    );

    return {
      type: mean.type,
      distance,
      value: (mean.percentage / 100) * numberOfPersonsOrKg * distance,
    };
  });

  return valuePerMean?.reduce((stats, { type, value, distance }) => {
    const valuePerMeanStat =
      travel.load === TravelLoad.FREIGHT
        ? getFreightStats(type, value)
        : getPassengerStats(travel, type, value, distance);
    return {
      ...stats,
      ...valuePerMeanStat,
    };
  }, {});
};

const sumAll = (sum: any, current: any) => {
  const summed = {
    ...sum,
    ...Object.keys(current).reduce((newCurrent, key) => {
      return {
        ...newCurrent,
        [key]: (sum[key] || 0) + current[key],
      };
    }, {}),
  };

  return Object.keys(summed).reduce((object, key) => {
    return {
      ...object,
      [key]: Math.round(summed[key] * 100) / 100,
    };
  }, defaultParametersValues);
};

const getParametersFromTour = (tour: Tour): any => {
  return tour.steps
    .reduce<Travel[]>(fillMissingLocations(tour), [] as Travel[])
    .map(computeTravelStats)
    .filter((stat) => !!stat)
    .reduce(sumAll, {});
};

export default getParametersFromTour;
