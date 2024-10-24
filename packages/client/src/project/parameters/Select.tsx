import { MenuItem, Select as MuiSelect, SelectProps } from '@mui/material';

const Select = ({
  possibleValues,
  ...props
}: SelectProps & { possibleValues: string[] }) => {
  return (
    <MuiSelect {...props}>
      <MenuItem key={''} value={''} sx={{ color: 'text.secondary' }}>
        Non renseigné
      </MenuItem>
      {possibleValues.map((possibleValue) => (
        <MenuItem key={possibleValue} value={possibleValue}>
          {possibleValue}
        </MenuItem>
      ))}
    </MuiSelect>
  );
};
export default Select;
