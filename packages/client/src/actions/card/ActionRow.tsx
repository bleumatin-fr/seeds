import { Action } from '@arviva/core';
import styled from '@emotion/styled';
import { ReactElement } from 'react';

import BiodivIcon from '../../ui/icons/biodiv.svg?react';
import Identity from '../../ui/icons/categories/infos générales.svg?react';
import Co2Icon from '../../ui/icons/co2.svg?react';
import ResourcesIcon from '../../ui/icons/ressources.svg?react';

const ActionWrapper = styled.div`
  padding: 6px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  > p {
    text-align: right;
  }
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
`;

const Title = styled.div`
  flex-grow: 1;
`;

interface ActionProps {
  action: Action;
  scope: string;
}

const scopeIcons: { [key: string]: ReactElement } = {
  biodiv: <BiodivIcon />,
  ressources: <ResourcesIcon />,
  co2: <Co2Icon />,
};

const numberFormatter = Intl.NumberFormat(undefined, {
  signDisplay: 'exceptZero',
});

const ActionRow = ({ action, scope }: ActionProps) => {
  const impact = action.impacts.find((impact) => impact.scope === scope);

  const iconKey = Object.keys(scopeIcons).find((key) => scope.startsWith(key));

  const icon = iconKey ? scopeIcons[iconKey] ?? <Identity /> : <Identity />;
  return (
    <ActionWrapper>
      <IconContainer>{icon}</IconContainer>
      <Title className="hzr">{action.title}</Title>
      {impact && (
        <p className="hzr" style={{ whiteSpace: 'nowrap' }}>
          {numberFormatter.format(impact.value)} {impact.unit}
        </p>
      )}
    </ActionWrapper>
  );
};

export default ActionRow;
