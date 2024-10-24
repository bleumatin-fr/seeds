import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  WheelEvent,
} from 'react';

type NumberInputProps = Omit<TextFieldProps, 'type' | 'onChange'> & {
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
    value: number | undefined,
  ) => void;
  unit: string | undefined;
};

const NumberInput = ({ onChange, unit, ...props }: NumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOnChange = (event: FocusEvent<HTMLInputElement>) => {
    let value: number | undefined = parseFloat(event.target.value);
    if (isNaN(value)) {
      value = undefined;
    }
    if (typeof value !== 'undefined' && Number.isFinite(value)) {
      if (
        Number.isFinite(props.inputProps?.min) &&
        value < props.inputProps?.min
      ) {
        value = props.inputProps?.min;
      } else if (
        Number.isFinite(props.inputProps?.max) &&
        value > props.inputProps?.max
      ) {
        value = props.inputProps?.max;
      }
    }

    onChange && onChange(event, value);
  };

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value =
      typeof props.defaultValue !== 'undefined' && props.defaultValue !== null
        ? (props.defaultValue as any).toString() || ''
        : '';
  }, [props.defaultValue]);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).blur();
  };

  const handleOnKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!value) {
      return;
    }

    if (
      (Number.isFinite(props.inputProps?.min) &&
        value < props.inputProps?.min) ||
      (Number.isFinite(props.inputProps?.max) && value > props.inputProps?.max)
    ) {
      input.value = input.value.slice(0, -1);
    }
  };

  return (
    <TextField
      {...props}
      onBlur={handleOnChange}
      onWheel={handleWheel}
      type="number"
      inputRef={inputRef}
      onKeyUp={handleOnKeyUp}
      InputProps={{
        endAdornment: !!unit ? (
          <InputAdornment position="end">{unit}</InputAdornment>
        ) : null,
      }}
    />
  );
};
export default NumberInput;
