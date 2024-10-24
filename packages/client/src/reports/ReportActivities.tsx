import {
  Alert,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormGroup,
  TextField,
} from '@mui/material';
import * as yup from 'yup';

import styled from '@emotion/styled';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import useProjects from '../project/context/useProjects';
import Button from '../ui/Button';
import useReports from './context/useReports';

import { Project } from '@arviva/core';
import { useState } from 'react';

const validationSchema = yup.object({
  projects: yup.array().required('Champ obligatoire'),
  name: yup.string().required('Champ obligatoire'),
});

type ProjectAndValue = {
  id: string;
  value?: number;
};

const isRowDisabled = (project: Project): boolean => {
  const isIndicatorNumber = getIsIndicatorNumber(project);
  return !isIndicatorNumber;
};
interface Props {
  onCancel: () => void;
}

const ReportActivities = ({ onCancel }: Props) => {
  const navigate = useNavigate();
  const { create } = useReports();
  const { projects } = useProjects();

  let initialValues: ProjectAndValue[] = [] as ProjectAndValue[];

  projects?.forEach((project) => {
    if (!isRowDisabled(project)) {
      initialValues.push({
        id: project._id.toString(),
        value: 1,
      });
    }
  });

  const formik = useFormik({
    initialValues: { projects: initialValues, name: '' },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const result = await create({
        name: values.name,
        projects: values.projects,
        startDate: new Date(),
        endDate: new Date(),
      });
      onCancel();
      navigate(`/reports/${result._id}`);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent dividers={true}>
        <DialogContentText
          id="scroll-dialog-description"
          tabIndex={-1}
          component="div"
        >
          <TextField
            id="name"
            name="name"
            label="Nom"
            autoComplete="off"
            tabIndex={0}
            placeholder={`Rapport annuel ${new Date().getFullYear()}`}
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            autoFocus
            fullWidth
          />
          <FormGroup sx={{ gap: '1rem' }}>
            {projects?.map((project) => {
              return (
                <>
                  <ProjectRow
                    project={project}
                    formik={formik}
                  />
                </>
              );
            })}
          </FormGroup>
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{ position: 'sticky', bottom: 0, background: 'white' }}
      >
        <Button onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="contained" color="primary">
          Créer le rapport
        </Button>
      </DialogActions>
    </form>
  );
};

const ProjectRowContainer = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  &.activity_disabled {
    background-color: var(--light-grey) !important;
  }
  &.activity_checked {
    background-color: var(--color-secondary) !important;
    color: white;
  }
  &.activity_unchecked {
    padding: 7px;
    border: solid black 1px;
    background-color: white !important;
  }
  > .title {
    width: 200px;
  }
  > :nth-child(3) {
    width: 300px;
  }
  > .data {
    flex: 0;
    max-width: 350px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .activity_success {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const getIsIndicatorNumber = (project: Project): boolean => {
  const indicator = project.data?.mainIndicator;
  const number = convertToNumber(indicator?.number);
  return indicator && number && number !== 0;
};

interface ProjectRowProps {
  project: Project;
  formik: any;
}

const ProjectRow = ({ project, formik }: ProjectRowProps) => {
  const [data] = useState<any>(null);
  const checked = !!(formik.values.projects || []).find(
    (p: ProjectAndValue) => p.id === project._id.toString(),
  );
  const isIndicatorNumber = getIsIndicatorNumber(project);

  const isDisabled = isRowDisabled(project);
  const className = isDisabled
    ? 'activity_disabled'
    : checked
    ? 'activity_checked'
    : 'activity_unchecked';

  return (
    <ProjectRowContainer className={className}>
      <Checkbox
        disabled={isDisabled}
        checked={isDisabled ? false : checked}
        onChange={(e) => {
          if (e.target.checked) {
            formik.setFieldValue('projects', [
              ...formik.values.projects,
              { id: project._id.toString(), value: data },
            ]);
          } else {
            formik.setFieldValue(
              'projects',
              formik.values.projects.filter(
                (p: ProjectAndValue) => p.id !== project._id.toString(),
              ),
            );
          }
        }}
        value={project._id.toString()}
        name="projects"
      />

      <div className="title">
        <p className="h5b" style={{ color: 'black' }}>
          {project.name}
        </p>
        <p className="hxr" style={{ color: 'black' }}>
          {project.model.singularName}
        </p>
      </div>

      {!isIndicatorNumber && (
        <Alert severity="error" sx={{ alignItems: 'center' }}>
          Pas d'impact calculé pour ce projet
        </Alert>
      )}

      {isIndicatorNumber && (
        <div className="data">
          <Indicator project={project} />
        </div>
      )}
    </ProjectRowContainer>
  );
};

const convertToNumber = (data: string | number): number | null => {
  if (!data) return null;
  if (typeof data === 'number') {
    return data;
  }
  const parsedNumber = parseFloat(data as string);
  if (isNaN(parsedNumber)) {
    return null;
  }
  return parsedNumber;
};

const IndicatorContainer = styled.p`
  height: 48px;
  display: flex;
  flex-direction: column;
  background-color: lightgreen;
  justify-content: center;
  padding: 0 16px;
  color: black;
  flex-shrink: 1;
`;

const Indicator = ({ project }: { project: Project }) => {
  const indicator = project.data?.mainIndicator;
  const number = convertToNumber(indicator?.number);
  if (!number) return null;
  const { unit } = indicator;
  return (
    <IndicatorContainer>
      <p className="hxr">
        <b style={{ whiteSpace: 'nowrap' }}>
          {Math.round(number)} {unit}
        </b>
      </p>
    </IndicatorContainer>
  );
};

export default ReportActivities;
