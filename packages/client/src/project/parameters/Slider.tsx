import {
  Slider as MuiSlider,
  SliderProps,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type SliderInputProps = SliderProps & {
  unit: string | undefined;
};

const Slider = ({ onChange, unit, ...props }: SliderInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<number | number[]>(
    props.defaultValue || 0,
  );

  useEffect(() => {
    setValue(props.defaultValue || 0);
  }, [props.defaultValue]);

  const handleChange = (event: Event, value: number | number[]) => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = value.toString();
    setValue(value as number);
    onChange && onChange(event, value, 0);
  };

  const actualUnit = unit ? unit : '%';

  return (
    <Stack
      spacing={2}
      direction="row"
      sx={{ marginBottom: '40px' }}
      alignItems="center"
    >
      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
        {`${props.min} ${actualUnit}`}
      </Typography>
      <MuiSlider
        {...props}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => `${value} ${actualUnit}`}
        ref={inputRef}
        sx={{
          '.MuiSlider-valueLabel': {
            transform: 'translateY(135%) scale(1) !important',
            '&:before': {
              top: -8,
            },
          },
        }}
      />
      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
        {`${props.max} ${actualUnit}`}
      </Typography>
    </Stack>
  );
};
export default Slider;
