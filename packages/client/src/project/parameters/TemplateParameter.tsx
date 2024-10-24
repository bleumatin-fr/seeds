import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close';
import { Chip, IconButton, TextFieldProps } from '@mui/material';
import { ChangeEvent, useState } from 'react';

type TemplateParameterProps = Omit<TextFieldProps, 'type' | 'onChange'> & {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  possibleValues: string[];
};

const TemplateParameterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TemplateParameter = ({
  onChange,
  possibleValues,
  defaultValue,
  ...props
}: TemplateParameterProps) => {
  const [value, setValue] = useState(defaultValue || '');

  const handleOnClick =
    (possibleValue: string) => (event: React.MouseEvent) => {
      setValue(possibleValue);
      onChange({
        target: {
          value: possibleValue,
        },
      } as ChangeEvent<HTMLInputElement>);
    };

  const handleResetClicked = () => {
    setValue('');
    onChange({
      target: {
        value: '',
      },
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <TemplateParameterContainer>
      {possibleValues.map((possibleValue) => (
        <Chip
          key={possibleValue}
          label={possibleValue}
          onClick={handleOnClick(possibleValue)}
          color={value === possibleValue ? 'primary' : 'default'}
        />
      ))}
      <IconButton onClick={handleResetClicked} size="small">
        <CloseIcon />
      </IconButton>
    </TemplateParameterContainer>
  );
};
export default TemplateParameter;
