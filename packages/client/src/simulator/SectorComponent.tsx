import { Sector, Value } from '@arviva/core';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import Parameters from './Parameters';
import { SimulatorOptions } from '../project/Project';
import { SectorHeader } from './SectorHeader';

type SectorComponentWrapperProps = {
  depth: number;
};

const SectorComponentWrapper = styled.div`
  margin-bottom: ${(props: SectorComponentWrapperProps) =>
    props.depth === 0 ? '16px' : '0px'};
  background-color: white;
`;

const ScrollHandleContainer = styled.div`
  position: relative;
  top: -200px;
`;

export const ScrollHandle = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => {
    const [top, setTop] = useState(0);

    useEffect(() => {
      const categoriesWrapper = document.querySelector('.categories_wrapper');
      if (!categoriesWrapper) return;
      const bottom = categoriesWrapper.getBoundingClientRect().bottom;
      setTop(bottom + (props.offset || 0) + 20);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <ScrollHandleContainer
        {...props}
        ref={ref}
        style={{ top: -top }}
      ></ScrollHandleContainer>
    );
  },
);

export const SectorComponent = ({
  sectors,
  depth,
  upperSector,
  options,
  onUpdateParameter,
}: {
  sectors?: Sector[];
  depth: number;
  upperSector: Sector | null;
  options: SimulatorOptions;
  onUpdateParameter: (index: number, value: Value) => void;
}) => {
  const getSectorId = (
    sector: Sector,
    upperSector: Sector | null,
    depth: number,
  ) => {
    return upperSector && depth > 0
      ? `${upperSector.information.name}-${sector.information.name}-${depth}`.replace(
          /\W/g,
          '_',
        )
      : `${sector.information.name}-${depth}`.replace(/\W/g, '_');
  };

  return (
    <>
      {(sectors || []).map((sector) => {
        const displayHeader =
          (sector.parameters.length > 0 || sector.sectors.length > 0) &&
          depth < 3;
        const sectorId = getSectorId(sector, upperSector, depth);

        return (
          <SectorComponentWrapper
            key={`${sector.information.name}-${depth}`}
            depth={depth}
          >
            <ScrollHandle id={sectorId}></ScrollHandle>
            {displayHeader && (
              <SectorHeader
                upperSector={upperSector}
                sector={sector}
                depth={depth}
                information={sector.information}
                subsectors={sector.sectors}
                sectorId={sectorId}
                options={options}
              />
            )}
            {sector.parameters.length > 0 && (
              <Parameters
                autofocusFirst={false}
                parameters={sector.parameters}
                onUpdateParameter={onUpdateParameter}
              />
            )}
            {sector.sectors.length > 0 && (
              <SectorComponent
                sectors={sector.sectors}
                depth={depth + 1}
                upperSector={sector}
                options={options}
                onUpdateParameter={onUpdateParameter}
              />
            )}
          </SectorComponentWrapper>
        );
      })}
    </>
  );
};
