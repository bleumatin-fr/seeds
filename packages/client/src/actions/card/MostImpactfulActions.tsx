import { Action, Impact } from '@arviva/core';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import BaseBlock from '../../ui/Block';
import Button from '../../ui/Button';
import ActionRow from './ActionRow';

import Tooltip from '@mui/material/Tooltip';
import Help from '../../ui/icons/help.svg?react';

const Block = styled(BaseBlock)`
  justify-content: flex-start;
  gap: 16px;
  background-color: var(--yellow);
  height: auto;
`;

const getImpactWithHighestValue = (impacts: Impact[]): Impact | undefined => {
  return impacts
    .sort((impactA, impactB) => impactA.value - impactB.value)
    .at(0);
};

const getActionWithMostImpact = (
  actions?: Action[],
  scope?: string | undefined,
) => {
  if (!scope) {
    return null;
  }
  return (actions || [])
    .filter((action) => action.impacts.some((impact) => impact.scope === scope))
    .sort((actionA, actionB) => {
      const actionAImpact = getImpactWithHighestValue(
        actionA.impacts.filter((impact) => impact.scope === scope),
      );

      const actionBImpact = getImpactWithHighestValue(
        actionB.impacts.filter((impact) => impact.scope === scope),
      );

      return (
        (actionBImpact?.absolutePercentage || -1) -
        (actionAImpact?.absolutePercentage || -1)
      );
    })
    .at(0);
};

const TooltipContent = () => {
  return (
    <p className="hxr">
      Des actions seront affichées dès que vous aurez répondu à suffisament de
      questions
    </p>
  );
};

const NoDisplayContainer = styled.div`
  cursor: pointer;
  height: 100px;
  z-index: 1000;
  svg {
    width: 100%;
    height: 100%;
  }
`;

const NoDisplay = () => {
  return (
    <Tooltip sx={{ backgroundColor: 'white' }} title={<TooltipContent />}>
      <NoDisplayContainer>
        <Help />
      </NoDisplayContainer>
    </Tooltip>
  );
};

const EmptyActionsContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  svg {
    max-height: 100px;
  }
`;

const EmptyActions = () => {
  return (
    <EmptyActionsContainer>
      <NoDisplay />
    </EmptyActionsContainer>
  );
};
const ActionsCard = ({ actions }: { actions?: Action[] }) => {
  const navigate = useNavigate();
  const scopes = ['biodiv', 'ressources', 'co2'];
  const mostImpactfulActionsByScope = scopes.reduce((acc, scope) => {
    const action = getActionWithMostImpact(actions, scope);
    if (action) {
      acc[scope] = action;
    }
    return acc;
  }, {} as { [key: string]: Action });

  return (
    <Block>
      <h2>Mon plan d'action</h2>
      {Object.keys(mostImpactfulActionsByScope).length === 0 && (
        <EmptyActions />
      )}

      {Object.keys(mostImpactfulActionsByScope).length > 0 && (
        <div>
          {Object.keys(mostImpactfulActionsByScope).map((scope) => {
            const action = mostImpactfulActionsByScope[scope];
            return <ActionRow action={action} scope={scope} key={scope} />;
          })}
        </div>
      )}
      {(actions || []).length > 0 && (
        <Button
          variant="contained"
          onClick={() => navigate(`./actions`)}
          fullWidth
        >
          {actions?.length === 1 && <>Voir mon action</>}
          {(actions || []).length > 1 && (
            <>Voir mes {actions?.length} actions</>
          )}
        </Button>
      )}
    </Block>
  );
};

export default ActionsCard;
