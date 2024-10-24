import styled from '@emotion/styled';

import { BarData, BarStacked1D } from '@arviva/core';
import { Bar, BarChart, XAxis } from 'recharts';

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
const PdfBarStacked1DComponent = ({ result }: { result: BarStacked1D }) => {
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
      <BarChart width={700} height={300} data={result.data?.data}>
        <XAxis dataKey="categoryName" tick={{ fontSize: 12 }}/>
        {result.data!.barData.map((barData: BarData) => (
          <Bar
            isAnimationActive={false}
            key={barData.name}
            dataKey={barData.name}
            stackId="a"
            fill={barData.color as string}
            label={{ position: 'top' }}
          />
        ))}
      </BarChart>
    </Container>
  );
};

export default PdfBarStacked1DComponent;
