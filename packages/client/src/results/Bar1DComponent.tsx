import styled from '@emotion/styled';

import { Bar1D, Bar1DBar } from '@arviva/core';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import {
  SeedsTooltipComponent,
  SeedsTooltipRow,
  SimpleTooltipRow,
} from './SeedsTooltipComponent';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

export const NoDataContainer = styled.div`
  flex: 1;
  width: 100%;
  padding: 16px;
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

const Bar1DComponent = ({
  result,
  simple,
}: {
  result: Bar1D;
  simple?: boolean;
}) => {
  const yAxisProps = simple ? { hide: true } : {};
  const xAxisProps = simple ? { tickLine: false, axisLine: false } : {};
  if (
    !result?.data?.length ||
    result?.data?.length === 0 ||
    result.data.reduce((total, bar) => {
      const barValue = Object.values(bar).reduce((tot: number, val) => {
        if (typeof val !== 'number') {
          return tot;
        } else {
          return tot + val;
        }
      }, 0);
      return total + barValue;
    }, 0) === 0
  ) {
    return (
      <NoDataContainer>
        <p className="hzb">No data yet</p>
        <p className="hzr">
          Graph will be displayed as soon as you have entered sufficient
          information
        </p>
      </NoDataContainer>
    );
  }
  return (
    <Container>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={result.data}>
          <XAxis
            dataKey="name"
            stroke="black"
            {...xAxisProps}
            tick={{ fontSize: 12 }}
            height={12}
          />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltipComponent />} />
          {(result.bars || []).map((bar: Bar1DBar) => (
            <Bar
              key={bar.name}
              dataKey={bar.name}
              unit={result.unit}
              stackId="a"
              fill={bar.color as string}
              radius={[30, 30, 30, 30]}
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
    const reversedData = [...payload].reverse();
    return (
      <SeedsTooltipComponent>
        {reversedData.map((d: any) => (
          <SeedsTooltipRow
            key={d.name}
            color={d.color}
            category={d.name}
            value={d.value}
            unit={d.unit}
          />
        ))}
      </SeedsTooltipComponent>
    );
  }
  return null;
};

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
`;

export const Bar1DLegend = ({ result }: { result: Bar1D }) => {
  const { bars, data } = result;
  const unit = result.unit;
  const reversedBars = bars ? [...bars].reverse() : [];
  if (data?.length && data?.length > 1) {
    return (
      <LegendContainer>
        <p className="h6r underline">Légende</p>
        <div>
          {reversedBars?.map((row: Bar1DBar) => (
            <>
              {
                <SimpleTooltipRow
                  key={row.name}
                  color={row.color}
                  category={row.name}
                  unit={unit}
                />
              }
            </>
          ))}
        </div>
      </LegendContainer>
    );
  } else {
    let total: number = 0;
    const row = data![0];
    for (const key in row) {
      if (typeof row[key] === 'number' && key !== 'name') {
        total += row[key] as number;
      }
    }
    return (
      <LegendContainer>
        <p className="h6r underline">Légende</p>
        <div>
          {reversedBars?.map((bar: Bar1DBar) => (
            <>
              {data![0][bar.name] && (
                <SeedsTooltipRow
                  key={bar.name}
                  color={bar.color}
                  category={bar.name}
                  value={data![0][bar.name].toString() || ''}
                  unit={unit}
                  percent={Number(data![0][bar.name]) / total}
                />
              )}
            </>
          ))}
        </div>
      </LegendContainer>
    );
  }
};

export default Bar1DComponent;
