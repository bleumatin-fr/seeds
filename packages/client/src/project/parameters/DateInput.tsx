import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEvent } from 'react';

type DateInputProps = Omit<TextFieldProps, 'type' | 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement>, value: Date) => void;
};

const DateInput = ({ onChange, ...props }: DateInputProps) => {
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event, new Date(event.target.value));
  };

  return <TextField {...props} onChange={handleOnChange} type="date" />;
};
export default DateInput;
