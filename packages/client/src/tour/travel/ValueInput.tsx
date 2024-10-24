import styled from '@emotion/styled';
import { FormHelperText, InputLabel, TextField } from '@mui/material';

const ValueInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const ValueInput = ({
  label,
  helperText,
  ...rest
}: {
  label?: string;
  helperText?: string;
  [key: string]: any;
}) => {
  return (
    <ValueInputContainer>
      {label && <InputLabel htmlFor="value-input">{label}</InputLabel>}
      <TextField
        type="number"
        inputProps={{ min: 0 }}
        id="value-input"
        aria-describedby="my-helper-text"
        variant="outlined"
        {...rest}
      />
      {helperText && (
        <FormHelperText id="my-helper-text">{helperText}</FormHelperText>
      )}
    </ValueInputContainer>
  );
};

export default ValueInput;
