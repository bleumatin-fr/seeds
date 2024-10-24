import {
  FormControlLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';

const RadioSelect = ({
  possibleValues,
  ...props
}: RadioGroupProps & { possibleValues: string[] }) => (
  <RadioGroup
    {...props}
    sx={{
      flexDirection: 'row',
      '.MuiFormControlLabel-label': {
        margin: '4px',
      },
    }}
  >
    {possibleValues.map((possibleValue) => (
      <FormControlLabel
        key={possibleValue}
        value={possibleValue}
        control={<Radio />}
        label={possibleValue}
      />
    ))}
  </RadioGroup>
);

export default RadioSelect;
