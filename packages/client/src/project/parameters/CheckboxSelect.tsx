import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ChangeEvent, useState } from 'react';

const CheckboxSelect = ({
  possibleValues,
  onChange,
  defaultValue,
  ...props
}: {
  possibleValues: string[];
  defaultValue: string[];
  onChange: (event: ChangeEvent<HTMLInputElement>, values: string[]) => void;
}) => {
  const [values, setValues] = useState(defaultValue);

  const handleOnChange =
    (value: string) => (event: ChangeEvent<HTMLInputElement>) => {
      let newValues: string[];
      if (event.target.checked) {
        newValues = [...values, value].filter((v) => !!v);
      } else {
        newValues = values.filter((v) => v !== value).filter((v) => !!v);
      }
      setValues(newValues);
      onChange && onChange(event, newValues);
    };

  return (
    <FormGroup {...props}>
      {possibleValues.map((possibleValue) => (
        <FormControlLabel
          key={possibleValue}
          control={
            <Checkbox
              checked={values.includes(possibleValue)}
              onChange={handleOnChange(possibleValue)}
            />
          }
          label={possibleValue}
        />
      ))}
    </FormGroup>
  );
};

export default CheckboxSelect;
