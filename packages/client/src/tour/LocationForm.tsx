import { FormControl } from '@mui/material';
import { ReactNode } from 'react';

import { TravelLocation } from './context/types';
import useTour from './context/useTour';

import CityAutocomplete from './CityAutocomplete';
import useStep from './context/useStep';

const LocationForm = ({
  label,
  location,
  icon,
  disabled,
}: {
  label: string;
  location?: TravelLocation;
  icon: ReactNode;
  disabled?: boolean;
}) => {
  const { updateStep } = useTour();
  const { stepId } = useStep();

  const handleTextChanged = (value: TravelLocation) => {
    stepId && updateStep(stepId, { location: value });
  };

  return (
    <FormControl variant="filled" fullWidth>
      <CityAutocomplete
        defaultValue={location}
        label={label}
        onChange={handleTextChanged}
      ></CityAutocomplete>
    </FormControl>
  );
};

export default LocationForm;
