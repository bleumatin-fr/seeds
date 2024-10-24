import styled from '@emotion/styled';
import { CSSProperties } from 'react';

import { Tour } from './context/types';

import TourView from './Tour';
import TourSynthesis from './TourSynthesis';

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  background-color: var(--backgroundColor);
  display: flex;
  gap: 16px;
  padding: 16px;
  justify-content: space-between;
  max-width: 1400px;
  margin: auto;
`;

const TourContainer = styled.div`
  width: calc(100% - 340px);
`;
const TourSynthesisContainer = styled.div`
  width: 320px;
  z-index: 2;
`;

interface TourComponentProps {
  style?: CSSProperties | undefined;
  onValidate: (tour: Tour) => Promise<void>;
}

const TourComponent = ({ style, onValidate }: TourComponentProps) => {
  return (
    <Container>
      <TourContainer>
        <TourView style={style} />
      </TourContainer>
      <TourSynthesisContainer>
        <TourSynthesis onValidate={onValidate} />
      </TourSynthesisContainer>
    </Container>
  );
};

export default TourComponent;
