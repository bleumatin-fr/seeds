import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEvent } from 'react';

type DateInputProps = Omit<TextFieldProps, 'type' | 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement>, value: Date) => void;
};

const DateInput = ({ onChange, defaultValue, ...props }: DateInputProps) => {
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event, new Date(event.target.value));
  };

  let defaultValueProp = null;
  if (defaultValue instanceof Date) {
    const year = defaultValue.getFullYear();
    const month = `${defaultValue.getMonth() + 1}`.padStart(2, '0');
    const day = `${defaultValue.getDate()}`.padStart(2, '0');
    defaultValueProp = `${year}-${month}-${day}`;
  }

  return (
    <TextField
      {...props}
      onChange={handleOnChange}
      type="date"
      defaultValue={defaultValueProp}
    />
  );
};
export default DateInput;
