import { Action, Impact } from '@arviva/core';
import styled from '@emotion/styled';
import { MouseEvent, ReactElement, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import BaseBlock from '../../ui/Block';
import BiodivIcon from '../../ui/icons/biodiv.svg?react';
import Identity from '../../ui/icons/categories/infos générales.svg?react';
import Co2Icon from '../../ui/icons/co2.svg?react';
import CostIcon from '../../ui/icons/cost.svg?react';
import ResourcesIcon from '../../ui/icons/ressources.svg?react';
import TimeframeIcon from '../../ui/icons/timeframe.svg?react';

const ImpactsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  flex-grow: 0;
  width: 100%;
`;

const Title = styled.h3`
  margin-bottom: 8px;
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  display: flex;
  align-items: center;
  text-align: center;
  flex-grow: 1;
`;

const Block = styled(BaseBlock.withComponent('a'))`
  cursor: pointer;
  transition: border 0.5s ease-in-out;
  border: 1px solid white;
  padding: 16px 16px 24px;
  h3 {
    transition: text-decoration-color 0.5s ease-in-out;
    text-decoration: underline;
    text-decoration-color: transparent;
  }
  &:hover {
    border: 1px solid var(--yellow);

    h3 {
      text-decoration-color: #060606;
    }
  }
`;

const ImpactContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  > div:first-of-type {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const IconContainer = styled.div`
  height: 40px;
  display: flex;
`;

const scopeIcons: { [key: string]: ReactElement } = {
  biodiv: <BiodivIcon />,
  ressources: <ResourcesIcon />,
  co2: <Co2Icon />,
  none: <Co2Icon />,
};

const numberFormatter = Intl.NumberFormat(undefined, {
  signDisplay: 'exceptZero',
});

const PercentageContainer = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  white-space: nowrap;

  > span {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
  }
`;

const ImpactComponent = ({
  impact,
  maxImpactPercentage,
}: {
  impact: Impact;
  maxImpactPercentage: number;
}) => {
  // useful when action contains multiple impacts with at least one generic and one not generic
  const isGenericImpact = impact.value !== -1;
  if (!isGenericImpact) return <></>;

  const iconKey = Object.keys(scopeIcons).find((key) =>
    (impact.scope || 'none').trim().startsWith(key),
  );
  const icon = iconKey ? scopeIcons[iconKey] ?? <Identity /> : <Identity />;

  const percentage = impact.absolutePercentage ?? 0;
  return (
    <BaseBlock
      outlined
      style={{ margin: '8px 0', height: '125px', flexGrow: 1 }}
    >
      <ImpactContainer>
        <div>
          <IconContainer>{icon}</IconContainer>
        </div>
        <Indicator
          value={impact.value}
          unit={impact.unit}
          percentage={(percentage / maxImpactPercentage) * 100}
        />
      </ImpactContainer>
      {impact.scope === 'co2' && percentage !== null && (
        <PercentageContainer>
          {percentage}% <span>de réduction</span>
        </PercentageContainer>
      )}
    </BaseBlock>
  );
};

const SectorContainer = styled.div`
  margin-bottom: 8px;
  flex-grow: 0;
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-grow: 0;
  width: 100%;
  justify-content: center;
  gap: 16px;
`;

interface ChipData {
  icon: ReactElement;
  title: string;
  colors: {
    [key: string]: string;
  };
}

const chipDatas: { [key: string]: ChipData } = {
  cost: {
    icon: <CostIcon />,
    title: 'Coût',
    colors: {
      Négatif: '#8746AE',
      Nul: '#B790CE',
      Faible: '#DBC7E7',
      Moyen: '#F3ECF7',
    },
  },
  duration: {
    icon: <TimeframeIcon />,
    title: '',
    colors: {
      Immédiat: '#FED169',
      'Moyen terme': '#FEE3A5',
      'Long terme': '#FFF1D2',
    },
  },
};

const ChipContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 0;
  border-radius: 16px;
  padding: 2px 12px 2px 10px;
`;

// https://stackoverflow.com/a/72595895/1665540
const contrastColor = (backgroundColor: string) => {
  try {
    return ['black', 'white'][
      ~~(
        [1, 3, 5]
          .map((p) => parseInt(backgroundColor.substr(p, 2), 16))
          .reduce((r, v, i) => [0.299, 0.587, 0.114][i] * v + r, 0) < 128
      )
    ];
  } catch (e) {
    return 'black';
  }
};

const ChipCompoment = ({
  label,
  chipData,
}: {
  label: string;
  chipData: ChipData;
}) => {
  const color = chipData.colors[label as keyof typeof chipData.colors];
  const textColor = contrastColor(color);
  return (
    <ChipContainer
      style={{ backgroundColor: color, color: textColor, stroke: textColor }}
    >
      {chipData.icon}
      <p className="hzr">
        {chipData.title ? `${chipData.title} ${label.toLowerCase()}` : label}
      </p>
    </ChipContainer>
  );
};

interface ActionProps {
  action: Action;
  maxImpactPercentage: number;
}

const ActionCard = ({ action, maxImpactPercentage }: ActionProps) => {
  const [noLinkYetModalOpen, setNoLinkYetModalOpen] = useState(false);
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!action.link) {
      event.preventDefault();
      event.stopPropagation();
      setNoLinkYetModalOpen(true);
    }
  };

  const handleClose = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setNoLinkYetModalOpen(false);
  };

  const isGenericAction = action.impacts.every((impact) => impact.value === -1);

  return (
    <Block
      href={action.link}
      onClick={handleClick}
      target="_blank"
      style={{
        maxWidth: 335,
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
      }}
    >
      <SectorContainer className="hzr">{action.sector}</SectorContainer>
      <Title className="hxc" style={{ width: '100%', textOverflow: 'clip' }}>
        {action.title}
      </Title>
      {!isGenericAction && (
        <ImpactsContainer>
          {action.impacts.map((impact, index) => (
            <ImpactComponent
              impact={impact}
              key={index}
              maxImpactPercentage={maxImpactPercentage}
            />
          ))}
        </ImpactsContainer>
      )}
      <ChipsContainer>
        {Object.entries(chipDatas).map(([chipKey, chipData]) => (
          <ChipCompoment
            key={chipKey}
            label={action[chipKey as keyof typeof action] as string}
            chipData={chipData}
          />
        ))}
      </ChipsContainer>

      <Dialog open={noLinkYetModalOpen} onClose={handleClose}>
        <DialogTitle>A venir</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              fontFamily: "'Montserrat', sans-serif",
              margin: '16px 0 32px',
            }}
          >
            Ici vous pourrez bientôt consulter des fiches détaillées sur les
            actions proposées.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Block>
  );
};

const interpolateColor = (percentage: number) => {
  const startColor = { r: 220, g: 238, b: 239 }; // #dceeef
  const endColor = { r: 22, g: 131, b: 143 }; // #16838f
  const r = Math.round(
    startColor.r + (endColor.r - startColor.r) * (percentage / 100),
  );
  const g = Math.round(
    startColor.g + (endColor.g - startColor.g) * (percentage / 100),
  );
  const b = Math.round(
    startColor.b + (endColor.b - startColor.b) * (percentage / 100),
  );
  return `rgb(${r}, ${g}, ${b})`;
};

const IndicatorContainer = styled.div<{ percentage: number }>`
  padding: 8px 16px;
  border-radius: 16px;
  background-color: ${({ percentage }) => interpolateColor(percentage)};
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  color: #060606;
  display: flex;
  flex-direction: column;
  align-content: center;
  overflow: hidden;

  position: relative;
  z-index: 1;

  > span {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 15px;
    text-align: center;
    letter-spacing: -0.06em;
  }
`;

const Indicator = ({
  value,
  unit,
  percentage,
}: {
  value: number;
  unit: string;
  percentage: number;
}) => {
  return (
    <IndicatorContainer percentage={percentage}>
      {numberFormatter.format(value)}
      <span>{unit}</span>
    </IndicatorContainer>
  );
};

export default ActionCard;
