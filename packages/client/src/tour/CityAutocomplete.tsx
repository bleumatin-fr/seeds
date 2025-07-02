import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts';
import { TravelLocation } from './context/types';

export const geocode = async (q: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q,
  )}&addressdetails=1&namedetails=1`;

  const response = await fetch(url);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

type Option = {
  id: string;
  label: string;
  shortLabel: string;
  country: string;
  [key: string]: any;
};

const CityAutocomplete = ({
  label,
  onChange,
  defaultValue,
  size = 'medium',
}: {
  label?: string;
  onChange: (value: TravelLocation) => void;
  defaultValue?: TravelLocation;
  size?: 'small' | 'medium';
}) => {
  const [value, setValue] = useState<Option | null>(
    defaultValue
      ? {
        label: defaultValue.name,
        shortLabel: defaultValue.name,
        id: '',
        country: defaultValue.country || '',
      }
      : null,
  );
  const [, setDebouncedValue] = useDebounceValue(value, 1000);
  const [inputValue, setInputValue] = useDebounceValue('', 1000);
  const [options, setOptions] = useState<Option[]>([]);

  const updateOptions = useDebounceCallback(async (inputValue: string) => {
    const results = await geocode(inputValue);
    let newOptions = [] as Option[];
    if (value) {
      newOptions = [value];
    }

    if (results) {
      newOptions = [
        ...newOptions,
        ...results.map((d: any) => ({
          ...d,
          label: d.display_name,
          shortLabel: d.name,
          id: `${d.osm_id}`,
          country: d.address?.country,
        })),
      ];
    }

    setOptions(newOptions);
  }, 500);

  useEffect(() => {
    if (inputValue === '' || inputValue === value?.label) {
      setOptions(value ? [value] : []);
      return;
    }

    updateOptions(inputValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputValue]);

  const handleAutocompleteChange = async (
    event: any,
    newValue: Option | null,
  ) => {
    setOptions(newValue ? [newValue, ...options] : options);
    setValue(newValue);
    setDebouncedValue(newValue);
    if (!newValue?.id) {
      return;
    }
    const latitude = parseFloat(newValue?.lat);
    const longitude = parseFloat(newValue?.lon);
    if (!latitude || !longitude) {
      return;
    }
    onChange({
      name: newValue?.name,
      coordinates: {
        latitude,
        longitude,
      },
      country: newValue?.address?.country || '',
    });
  };

  return (
    <Autocomplete
      options={options}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      fullWidth
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={handleAutocompleteChange}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size={size}
          fullWidth
          sx={{ minWidth: '200px' }}
        />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
    />
  );
};

export default CityAutocomplete;
