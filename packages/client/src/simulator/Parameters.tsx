import { Parameter, Value } from '@arviva/core';
import styled from '@emotion/styled';
import { useState } from 'react';
import { ReactComponent as BaseHelp } from '../ui/icons/help.svg';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import Markdown from '../ui/Markdown';

import ParameterFactory from '../project/parameters/Factory';

const Help = styled(BaseHelp)`
  cursor: pointer;
`;

const ParametersWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: 16px 0;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
  margin-bottom: 0;
`;

const Parameters = ({
  autofocusFirst,
  parameters,
  onUpdateParameter,
  style,
  debounced = true,
}: {
  autofocusFirst: boolean;
  parameters: Parameter[];
  onUpdateParameter: (index: number, value: Value) => void;
  style?: any;
  debounced?: boolean;
}) => {
  return (
    <ParametersWrapper style={style}>
      {parameters.map((parameter: Parameter, index: number) => (
        <ParameterComponent
          id={`parameter-${parameter.index}`}
          key={`${parameter.index}`}
          autofocus={autofocusFirst && index === 0}
          parameter={parameter}
          onUpdateParameter={onUpdateParameter}
          debounced={debounced}
        />
      ))}
    </ParametersWrapper>
  );
};

const ParameterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  scroll-padding-top: 2500px;
  transition: background 0.3s ease-in-out;
  padding: 16px;
  border-radius: 8px;
  background-opacity: 0.5;

  &.blink {
    background: var(--lightgreen);
  }

  .parameter_input {
    margin-top: 8px;
    display: flex;
    justify-content: center;
    font-style: italic;
  }

  &.model-reference {
    grid-column: 1 / -1;
  }
`;

const ParameterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  svg {
    cursor: pointer;
    flex-shrink: 0;
  }
`;

interface ParameterComponentProps {
  id?: string;
  autofocus: boolean;
  parameter: Parameter;
  onUpdateParameter: (index: number, value: Value) => void;
  debounced: boolean;
}

const ParameterComponent = ({
  id,
  autofocus,
  parameter,
  onUpdateParameter,
  debounced,
}: ParameterComponentProps) => {
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const { name, description, information } = parameter;

  return (
    <>
      <ParameterInfoModal
        open={openInfo}
        setOpen={setOpenInfo}
        name={name}
        information={information || ''}
      />
      <ParameterWrapper>
        <div id={id}></div>
        <ParameterTitle>
          <p className="hxc">{name}</p>
          {information && <Help onClick={() => setOpenInfo(true)} />}
        </ParameterTitle>
        <p className="hxr">{description}</p>
        <ParameterFactory
          autofocus={autofocus}
          parameter={parameter}
          onUpdateParameter={onUpdateParameter}
        />
      </ParameterWrapper>
    </>
  );
};

interface ParameterInfoModalProps {
  open: boolean;
  name: string | undefined;
  information: string;
  setOpen: (open: boolean) => void;
}

const ParameterInfoModal = ({
  open,
  name,
  information,
  setOpen,
}: ParameterInfoModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onClose={handleClose} scroll="paper" id="create_modal">
      <DialogTitle id="scroll-dialog-title">{name}</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText
          sx={{
            fontWeight: '400',
            fontSize: '16px',
            fontFamily: "'Montserrat', sans-serif",
            margin: '16px 0 32px',
          }}
        >
          <Markdown>{information}</Markdown>
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ position: 'sticky', bottom: 0, background: 'white' }}
      >
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Parameters;
