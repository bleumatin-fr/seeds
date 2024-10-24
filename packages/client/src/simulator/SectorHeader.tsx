import { Sector } from '@arviva/core';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import { SimulatorOptions } from '../project/Project';

type SectorHeaderWrapperProps = {
  backgroundColor: string;
};

const SectorHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  color: black;
  margin-bottom: 8px;
  justify-content: space-between;
  &.level0 {
    top: 248px;
    border-radius: 50px;
    position: sticky;
    padding: 14px 16px;
    margin-bottom: 16px;
    background-color: ${(props: SectorHeaderWrapperProps) =>
      props.backgroundColor || 'lightgrey'};
    z-index: 110;
  }
  &.level0 p {
    padding-left: 8px;
    color: black;
  }
  &.level1 {
    width: 100%;
    padding: 30px 0 16px 20px;
    top: 267px;
    background-color: white;
    position: sticky;
    z-index: 100;
  }
  &.level1 p {
    line-height: 18px;
  }
  &.level1 p::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: ${(props: SectorHeaderWrapperProps) =>
      props.backgroundColor || 'lightgrey'};
    left: 0;
    display: block;
    line-height: 18px;
    margin-top: 1px;
  }
  &.level2 p {
    font-style: italic;
  }
`;

const headerClassName: { [key: number]: string } = {
  0: 'h4b',
  1: 'h5b',
  2: 'hxb',
};

const CategoriesWrapper = styled.div`
  display: flex;
`;

interface SectorHeaderProps {
  sector: Sector;
  upperSector: Sector | null;
  depth: number;
  sectorId: string;
  information: {
    color: string;
    name: string;
  };
  subsectors: Sector[];
  options: SimulatorOptions;
  externalModules?: {
    [key: string]: string[];
  };
}

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

export const SectorHeader = ({
  sector,
  upperSector,
  depth,
  information,
  sectorId,
  subsectors,
  options,
  externalModules,
}: SectorHeaderProps) => {
  if (depth > 0) return null;
  const { color, name } = information;
  const navigation = subsectors.map((subsector) => ({
    name: subsector.information.name,
    key: `${sector.information.name}-${subsector.information.name}-${
      depth + 1
    }`,
    color: subsector.information.color,
  }));

  const handleButtonClicked = (hash: string) => () => {
    document?.getElementById(hash)?.scrollIntoView();
  };

  if (!name) {
    return null;
  }

  return (
    <SectorHeaderWrapper backgroundColor={color} className={`level${depth}`}>
      <p className={headerClassName[depth]}>{name}</p>
      {depth === 0 && options.secondaryNav && navigation.length > 0 && (
        <CategoriesWrapper className="categories_wrapper">
          {navigation.map(({ name, key, color }) => (
            <Button
              key={key}
              onClick={handleButtonClicked(key)}
              size="small"
              sx={{
                '&:hover': {
                  bgcolor: color,
                  color: contrastColor(color || '#ffffff'),
                },
              }}
            >
              {name}
            </Button>
          ))}
        </CategoriesWrapper>
      )}
    </SectorHeaderWrapper>
  );
};
