import styled from '@emotion/styled';
import { useState } from 'react';

import { BarData, BarStacked2D, BarStacked2DData } from '@arviva/core';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
} from './SeedsTooltipComponent';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  > div {
    height: 100%;
    width: calc(50% - 8px);
  }
  > div:last-of-type {
    display: flex;
    align-items: center;
    justify-content: center;
    border: dashed lightgrey 1px;
  }
`;

const CustomTooltipComponent = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>): JSX.Element => {
  if (active && payload && payload.length > 0) {
    const categoryData = payload[0].payload.subCategoryData.categoryData;
    const barData = payload[0].payload.subCategoryData.barData;
    const data = categoryData.map((category: any) => {
      const name = category.name;
      const color = barData.find((bar: any) => bar.dataKey === name).color;
      const value = `${category[name]} / ${category[name] + category.rest}`;
      return { name, color, value };
    });
    return (
      <SeedsTooltipComponent>
        {data.map((row: any) => (
          <SeedsTooltipRow
            key={row.name}
            color={row.color}
            category={row.name}
            value={row.value}
            unit={''}
          />
        ))}
      </SeedsTooltipComponent>
    );
  }
  return <></>;
};

interface SubCategoryBarChartProps {
  subCategoryData: BarStacked2DData;
}

const SubCategoryBarChart = ({ subCategoryData }: SubCategoryBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={subCategoryData.categoryData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {subCategoryData.barData.map((barData: BarData) => (
          <Bar
            dataKey={barData.dataKey}
            stackId="a"
            fill={barData.color as string}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const BarStacked2DComponent = ({ result }: { result: BarStacked2D }) => {
  const [subCategoryData, setSubCategoryData] =
    useState<BarStacked2DData | null>(null);
  const handleMouseMove = (event: any) => {
    if (result.data?.categoryData[event.activeTooltipIndex]?.subCategoryData) {
      setSubCategoryData(
        result.data?.categoryData[event.activeTooltipIndex].subCategoryData,
      );
    }
  };
  const handleMouseLeave = () => {
    setSubCategoryData(null);
  };
  return (
    <Container>
      <div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            width={500}
            height={300}
            data={result.data!.categoryData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltipComponent />} />
            {result.data!.barData.map((barData: BarData) => (
              <Bar
                dataKey={barData.dataKey}
                stackId="a"
                fill={barData.color as string}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        {!subCategoryData && (
          <p>
            <i>
              Survolez une barre du graphique ci-contre :<br />
              vous visualiserez le détail par sous-catégorie
            </i>
          </p>
        )}
        {subCategoryData && subCategoryData.categoryData.length > 0 && (
          <SubCategoryBarChart subCategoryData={subCategoryData} />
        )}
        {subCategoryData && subCategoryData.categoryData.length === 0 && (
          <p>Cette sous catégorie ne contient aucune sous cat</p>
        )}
      </div>
    </Container>
  );
};

export default BarStacked2DComponent;
