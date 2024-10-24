import { Travel, TravelType } from '../context/types';
import useTour from '../context/useTour';

import TravelsForm from './TravelsForm';
import TravelsLayout from './TravelsLayout';

const TravelsView = ({
  travels,
  disabledTravelTypes,
}: {
  travels: Travel[];
  disabledTravelTypes: TravelType[];
}) => {
  const { tour } = useTour();

  if (!tour) {
    return null;
  }

  const directTravels = travels
    .filter((travel) => travel.type === TravelType.DIRECT)
    .sort((a, b) => a.order - b.order);
  const outTravels = travels
    .filter((travel) => travel.type === TravelType.OUT)
    .sort((a, b) => a.order - b.order);
  const inTravels = travels
    .filter((travel) => travel.type === TravelType.IN)
    .sort((a, b) => a.order - b.order);

  let left = null;
  let rightTop = null;
  let rightBottom = null;

  if (!disabledTravelTypes.includes(TravelType.DIRECT)) {
    left = <TravelsForm travels={directTravels} type={TravelType.DIRECT} />;
  }
  if (!disabledTravelTypes.includes(TravelType.OUT)) {
    rightTop = <TravelsForm travels={outTravels} type={TravelType.OUT} />;
  }
  if (!disabledTravelTypes.includes(TravelType.IN)) {
    rightBottom = <TravelsForm travels={inTravels} type={TravelType.IN} />;
  }

  return (
    <TravelsLayout
      left={left}
      rightTop={rightTop}
      rightBottom={rightBottom}
      bottom={null}
    />
  );
};

export default TravelsView;
