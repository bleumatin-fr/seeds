import styled from '@emotion/styled';
import { Action, Impact } from '@arviva/core';
import { useNavigate, useParams } from 'react-router-dom';

import { useState } from 'react';
import { useProject } from '../../project/context/useProject';
import { TitleBlock } from '../../ui/Block';
import Button, { SortButton } from '../../ui/Button';
import { PageContainer } from '../../ui/Container';
import CostIcon from '../../ui/icons/cost.svg?react';
import ImpactIcon from '../../ui/icons/impact.svg?react';
import SkipIcon from '../../ui/icons/skip.svg?react';
import SortIcon from '../../ui/icons/sort.svg?react';
import TimeframeIcon from '../../ui/icons/timeframe.svg?react';
import ActionCard from './ActionCard';

const ActionsGrid = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  flex-wrap: wrap;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-bottom: 16px;
  flex-grow: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const CountContainer = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: center;

  span {
    font-size: 16px;
    font-weight: 400;
  }
`;

const SortContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  align-items: center;
`;

const sortOrders = {
  duration: ['Immédiat', 'Moyen terme', 'Long terme'],
  cost: ['Négatif', 'Nul', 'Faible', 'Moyen', 'Élevé'],
};

const ActionsPage = () => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const [sortOrder, setSortOrder] = useState<'impact' | 'duration' | 'cost'>(
    'impact',
  );
  const navigate = useNavigate();
  if (!project) {
    return null;
  }
  const actionsWithImpact = project.actions.sort((a, b) => {
    if (sortOrder === 'impact') return b.impactValue - a.impactValue;
    return (
      sortOrders[sortOrder].indexOf(a[sortOrder]) -
      sortOrders[sortOrder].indexOf(b[sortOrder])
    );
  });
  const maxImpactPercentage = Math.max(...actionsWithImpact.flatMap((action: Action) => action.impacts.map((impact: Impact) => impact.absolutePercentage)))
  return (
    <PageContainer>
      <TitleBlock background="var(--yellow)">
        <h3>{project.name} - Mes actions</h3>
        <p>
          Découvrez les actions à mettre en oeuvre pour un projet responsable
        </p>
        <Button
          onClick={() => navigate(`/project/${projectId}/results`)}
          startIcon={<SkipIcon />}
        >
          Voir les résultats complets
        </Button>
      </TitleBlock>
      <FiltersContainer>
        <CountContainer>
          {actionsWithImpact.length}
          <span> Action(s)</span>
        </CountContainer>
        <SortContainer>
          <SortIcon /> Trier par :
          <SortButton
            startIcon={<ImpactIcon />}
            className={sortOrder === 'impact' ? 'selected' : ''}
            onClick={() => setSortOrder('impact')}
          >
            Impact
          </SortButton>
          <SortButton
            startIcon={<TimeframeIcon />}
            className={sortOrder === 'duration' ? 'selected' : ''}
            onClick={() => setSortOrder('duration')}
          >
            Délai
          </SortButton>
          <SortButton
            startIcon={<CostIcon />}
            className={sortOrder === 'cost' ? 'selected' : ''}
            onClick={() => setSortOrder('cost')}
          >
            Coût
          </SortButton>
        </SortContainer>
      </FiltersContainer>
      <ActionsGrid>
        {actionsWithImpact.map((action, index) => {
          return <ActionCard action={action} key={index} maxImpactPercentage={maxImpactPercentage}/>;
        })}
      </ActionsGrid>
    </PageContainer>
  );
};
export default ActionsPage;
