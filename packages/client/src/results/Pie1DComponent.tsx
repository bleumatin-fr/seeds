import styled from '@emotion/styled';
import { Pie1D, Pie1DData } from '@arviva/core';
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { NoDataContainer } from './Bar1DComponent';
import {
  SeedsTooltipComponent,
  SeedsTooltipRow,
} from './SeedsTooltipComponent';

interface CustomTooltip extends TooltipProps<ValueType, NameType> {
  unit: string | undefined;
}

const CustomTooltipComponent = ({
  active,
  payload,
  unit,
}: CustomTooltip) => {
  if (active && payload && payload.length > 0) {
    return (
      <SeedsTooltipComponent>
        <SeedsTooltipRow
          color={payload[0].payload.fill}
          category={payload[0].payload.name}
          value={payload[0].payload.value}
          unit={unit}
        />
      </SeedsTooltipComponent>
    );
  }
  return null;
};

const Pie1DComponent = ({ result }: { result: Pie1D }) => {
  if (
    !result?.data?.length ||
    result?.data?.length === 0 ||
    result.data.reduce((total, elem) => total + elem.value, 0) === 0
  ) {
    return (
      <NoDataContainer>
        <p className="hzb">Aucune donnée</p>
        <p className="hzr">
          Le graph sera affiché dès que vous aurez répondu aux premières
          questions associés
        </p>
      </NoDataContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={result.data}
          cx={'50%'}
          cy={'50%'}
          innerRadius="0%"
          outerRadius="100%"
          dataKey="value"
        />
        <Tooltip
          content={<CustomTooltipComponent unit={result.unit} />}
          allowEscapeViewBox={{ x: true, y: true }}
          wrapperStyle={{ zIndex: 1000 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
`;

export const Pie1DLegend = ({ result }: { result: Pie1D }) => {
  const unit = result.unit;
  const data = JSON.parse(
    JSON.stringify(result.data?.sort((a, b) => b.value - a.value)),
  );
  const total = data.reduce(
    (total: number, row: Pie1DData) => total + row.value,
    0,
  );
  return (
    <LegendContainer>
      <p className="h6r underline">Légende</p>
      <div>
        {data.map((row: Pie1DData) => (
          <>
            {row.value > 0 && (
              <SeedsTooltipRow
                key={row.name}
                link={row.link}
                coefficient={row.coefficient}
                color={row.fill}
                category={row.name}
                value={row.value.toString()}
                unit={unit}
                percent={row.value / total}
              />
            )}
          </>
        ))}
      </div>
    </LegendContainer>
  );
};

export default Pie1DComponent;
