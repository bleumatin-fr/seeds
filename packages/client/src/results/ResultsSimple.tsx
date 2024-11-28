import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { Indicator, Pie1D, Result, ScoreCard } from '@arviva/core';
import styled from '@emotion/styled';
import { IconButton, LinearProgress, Tooltip } from '@mui/material';
import BaseBlock from '../ui/Block';
import Button from '../ui/Button';

import IndicatorComponent from './IndicatorComponent';
import ScoreCardComponent from './ScoreCardComponent';

import HelpIcon from '@mui/icons-material/Help';
import BiodivIcon from '../ui/icons/biodiv.svg?react';
import Co2Icon from '../ui/icons/co2.svg?react';
import ResourcesIcon from '../ui/icons/ressources.svg?react';
import Pie1DComponent, { Pie1DLegend } from './Pie1DComponent';
const Block = styled(BaseBlock)`
  background-color: var(--lightgreen);
  height: auto;
  .simulator & {
    border-radius: 30px;
  }
`;

interface ResultsSimpleProps {
  results?: Result[];
  loading: boolean;
  button?: React.ReactNode;
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin: 16px 0;
`;

const ResultsSimple = ({ results, loading, button }: ResultsSimpleProps) => {
  const navigate = useNavigate();
  const actualButton = button ? (
    button
  ) : (
    <Button variant="contained" onClick={() => navigate(`./results`)} fullWidth>
      Résultats complets
    </Button>
  );
  return (
    <Block>
      <p className="h4b">Mon empreinte</p>
      <ResultsContainer>
        {(results || [])
          .filter(
            (result) =>
              result.scope === 'simple' &&
              ((typeof result.display !== 'undefined' && result.display) ||
                typeof result.display === 'undefined' ||
                result.type === 'scoreCard'),
          )
          .map((result, index) => {
            return (
              <ResultDispatch result={result} loading={loading} key={index} />
            );
          })}
      </ResultsContainer>
      {actualButton}
    </Block>
  );
};

interface ResultDispatchProps {
  result: Result;
  loading: boolean;
}

const ResultSectionWithTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap: 16px;
  > div:first-of-type {
    flex: 1;
    min-height: 250px;
    order: 1;
  }
  p {
    text-align: center;
  }
`;


const ResultDispatch = ({ result, loading }: ResultDispatchProps) => {
  switch (result.type) {
    case 'indicator':
      return (
        <ResultSection result={result} loading={loading}>
          <IndicatorComponent result={result} />
        </ResultSection>
      );
    case 'pie1D':
      const hasData =
        result?.data?.length &&
        result?.data?.length !== 0 &&
        result.data.reduce((total, elem) => total + elem.value, 0) !== 0;
      return (
        <ResultSection result={result} loading={loading} flex="1">
          <ResultSectionWithTitleContainer>
            <p className="hxb">
              {result.title}
              {hasData && (
                <Tooltip
                  title={
                    <div
                      style={{
                        padding: '8px',
                      }}
                    >
                      <Pie1DLegend result={result} />
                    </div>
                  }
                  arrow
                  placement="bottom-end"
                >
                  <IconButton size="small">
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              )}
            </p>
            <Pie1DComponent result={result} />
          </ResultSectionWithTitleContainer>
        </ResultSection>
      );
    case 'scoreCard':
      return (
        <ResultSection result={result} loading={loading}>
          <ScoreCardComponent result={result} />
        </ResultSection>
      );
  }
  return null;
};

interface ResultSectionContainerProps {
  height?: string;
  flex?: string;
}

const ResultSectionContainer = styled.div`
  height: ${(props: ResultSectionContainerProps) => props.height};
  flex: ${(props: ResultSectionContainerProps) => props.flex};
  width: 100%;
  position: relative;
  padding: 16px;
  overflow: hidden;
  @media screen and (max-height: 800px) {
    padding: 8px;
  }
  @media screen and (max-height: 600px) {
    padding: 6px;
  }
`;

interface ResultSectionProps {
  result: Indicator | ScoreCard | Pie1D;
  children: JSX.Element | JSX.Element[];
  loading: boolean;
  height?: string;
  flex?: string;
}

export const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  flex-shrink: 1;
  @media screen and (max-height: 700px) {
    width: 30px;
    height: 30px;
  }
  @media screen and (max-height: 600px) {
    width: 20px;
    height: 20px;
  }
`;

export const scopeIcons: { [key: string]: ReactElement } = {
  biodiv: <BiodivIcon />,
  ressources: <ResourcesIcon />,
  co2: <Co2Icon />,
  co2j: <Co2Icon />,
};

export const ResultSection = ({
  result,
  loading,
  children,
  height,
  flex,
}: ResultSectionProps) => {
  return (
    <ResultSectionContainer key={result.title} height={height} flex={flex}>
      <LoadingIndicator loading={loading} />
      {children}
    </ResultSectionContainer>
  );
};

export const TitleScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

const LoadingIndicatorContainer = styled.div`
  height: 4px;
  opacity: 0;
  transition: opacity 250ms;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  &.loading {
    opacity: 0.4;
  }
`;

const LoadingIndicator = ({ loading }: { loading: boolean }) => (
  <LoadingIndicatorContainer className={loading ? 'loading' : ''}>
    <LinearProgress />
  </LoadingIndicatorContainer>
);

export default ResultsSimple;
