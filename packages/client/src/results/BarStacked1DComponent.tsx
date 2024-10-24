import styled from '@emotion/styled';

import { BarData, BarStacked1D } from '@arviva/core';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
} from 'recharts';

import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import {
  SeedsTooltipComponent,
  SeedsTooltipRow,
} from './SeedsTooltipComponent';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const NoDataContainer = styled.div`
  width: 100%;
  padding: 16px;
  height: 100%;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  gap: 4px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  p {
    text-align: center;
  }
`;

const BarStacked1DComponent = ({ result }: { result: BarStacked1D }) => {
  if (!result?.data?.data.length || result?.data?.data.length === 0) {
    return (
      <NoDataContainer>
        <p className="hxb">Aucune donnée</p>
        <p className="hxr">
          Votre score sera affiché dès que vous aurez répondu aux premières
          questions associés
        </p>
      </NoDataContainer>
    );
  }
  return (
    <Container>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={result.data?.data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey="categoryName" />
          <Tooltip content={<CustomTooltipComponent />} />
          {result.data!.barData.map((barData: BarData) => (
            <Bar
              key={barData.name}
              dataKey={barData.name}
              stackId="a"
              fill={barData.color as string}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Container>
  );
};

const CustomTooltipComponent = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>): JSX.Element | null => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    const category = `${data.dataKey}`;
    return (
      <SeedsTooltipComponent>
        <SeedsTooltipRow
          key={data.dataKey}
          color={data.color}
          category={category}
          value={data.payload.score}
          unit={''}
        />
      </SeedsTooltipComponent>
    );
  }
  return null;
};

export default BarStacked1DComponent;
