import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useEffect } from 'react';
import { useSessionStorage } from 'usehooks-ts';

import { IndexParameterInput, Model, Parameter, Value } from '@arviva/core';
import { useTour } from '@reactour/tour';
import { FormEvent, useRef, useState } from 'react';
import Button from '../ui/Button';
import Parameters from './Parameters';

interface CreateProjectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: any;
  onSave?: (values: IndexParameterInput[], modelType: string) => void;
  model: Model;
}

const CreateProjectModal = ({
  open,
  setOpen,
  onSave,
  onClose,
  model,
}: CreateProjectModalProps) => {
  const [initialParameters, setInitialParameters] = useState([] as Parameter[]);
  const [parameterValues, setParameterValues] = useState(
    [] as IndexParameterInput[],
  );

  const [savedParameters, setSavedParameters] = useSessionStorage<
    string | null
  >(`new_project_${model.type}`, null);

  const called = useRef(false);
  const autofocusFirst = useRef(true);

  const { isOpen, currentStep, setCurrentStep } = useTour();

  useEffect(() => {
    if (isOpen && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [isOpen, currentStep, setCurrentStep]);

  useEffect(() => {
    let parameters: Parameter[] = JSON.parse(JSON.stringify(model?.parameters));
    if (savedParameters) {
      const savedParametersValues: IndexParameterInput[] =
        JSON.parse(savedParameters);
      parameters.map((parameter) => {
        const savedParameter = savedParametersValues.find(
          (savedParameterValues) =>
            savedParameterValues.index === parameter.index,
        );
        if (savedParameter) {
          parameter.value = savedParameter.value;
        }
        return parameter;
      });
    }
    setInitialParameters(parameters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialParameters.length === 0) return null;

  const handleClose = () => {
    called.current = false;
    autofocusFirst.current = true;
    onClose && onClose();
    setOpen(false);
  };

  const handleCancel = () => {
    setSavedParameters(null);
    handleClose();
  };

  const handleSave = () => {
    called.current = false;
    autofocusFirst.current = true;
    setSavedParameters(null);
    setCurrentStep(2);
    onSave && onSave(parameterValues, model.type);
  };

  const handleParameterUpdated = (index: number, value: Value) => {
    if (autofocusFirst) {
      autofocusFirst.current = false;
    }
    const parameterValuesUpdated: IndexParameterInput[] = [
      ...parameterValues.filter((p) => p.index !== index),
      { type: 'index', index, value },
    ];
    setParameterValues(parameterValuesUpdated);
    setSavedParameters(JSON.stringify(parameterValuesUpdated));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSave();
  };

  return (
    <Dialog open={open} onClose={handleClose} scroll="paper" id="create_modal">
      <form onSubmit={handleFormSubmit}>
        <DialogTitle id="scroll-dialog-title">
          Création {model.singularName?.toLowerCase()}
        </DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              fontFamily: "'Montserrat', sans-serif",
              margin: '16px 0 32px',
            }}
          >
            Merci de répondre aux questions suivantes : nous vous proposerons à
            la suite un formulaire répondant aux caractéristiques de votre
            projet. <br /> Vous pourrez revenir sur ces questions par la suite.
          </DialogContentText>
          <DialogContentText
            id="scroll-dialog-description"
            tabIndex={-1}
            component="div"
          >
            <Parameters
              autofocusFirst={autofocusFirst.current}
              parameters={initialParameters || []}
              style={{ padding: 0 }}
              onUpdateParameter={handleParameterUpdated}
              debounced={false}
            ></Parameters>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{ position: 'sticky', bottom: 0, background: 'white' }}
        >
          <Button onClick={handleCancel}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            Créer le {model.singularName?.toLowerCase()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectModal;
