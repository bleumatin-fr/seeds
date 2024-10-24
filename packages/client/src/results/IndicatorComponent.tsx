import { Indicator } from '@arviva/core';
import styled from '@emotion/styled';

import { ReactComponent as Identity } from '../ui/icons/categories/infos générales.svg';
import { IconContainer, scopeIcons } from './ResultsSimple';

import { TitleScoreContainer } from './ResultsSimple';

const IndicatorComponentContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 16px;
  row-gap: 4px;
`;

const IndicatorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
`;

interface IndicatorProps {
  result: Indicator;
}

const IndicatorComponent = ({ result }: IndicatorProps) => {
  const iconKey = Object.keys(scopeIcons).find((key) =>
    result.code?.startsWith(key),
  );
  const icon = iconKey ? scopeIcons[iconKey] ?? <Identity /> : <Identity />;
  return (
    <IndicatorComponentContainer>
      <IconContainer>{icon}</IconContainer>
      <TitleScoreContainer>
        <p>{result.title}</p>
      </TitleScoreContainer>
      <IndicatorWrapper>
        <p className="h5r">
          <b>{result.number || 0}</b>{' '}
          <span className="hzr">{result.unit || ''}</span>
        </p>
      </IndicatorWrapper>
    </IndicatorComponentContainer>
  );
};

export default IndicatorComponent;
