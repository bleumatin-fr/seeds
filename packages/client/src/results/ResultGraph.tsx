import { BarStacked1D, BarStacked2D, Pie1D, Treemap } from '@arviva/core';

import styled from '@emotion/styled';
import Markdown from '../ui/Markdown';

interface ResultGraphProps {
  result: Treemap | Pie1D | BarStacked2D | BarStacked1D;
  graph: JSX.Element;
  legend?: JSX.Element;
  fullWidth?: boolean;
}

const ResultGraphContainer = styled.div`
  width: 100%;
  padding: 16px 32px;
  background-color: white;
  border-radius: 0 0 8px 8px;
  position: relative;
}
`;

interface GraphContentProps {
  fullWidth?: boolean;
}

const GraphContent = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin: 22px 0;
  > * {
    width: ${({ fullWidth }: GraphContentProps) =>
      fullWidth ? '100%' : 'calc(50% - 8px)'};
  }
`;

const GraphContainer = styled.div`
    height: 300px;
}
`;

const ResultGraph = ({
  result,
  fullWidth,
  graph,
  legend,
}: ResultGraphProps) => {
  return (
    <ResultGraphContainer key={result.title}>
      <GraphTitle text={result.title || ''} />
      <GraphSubTitle text={result.subtitle || ''} />
      <GraphContent fullWidth={fullWidth}>
        {graph && <GraphContainer>{graph}</GraphContainer>}
        <GraphDetail fullWidth={fullWidth}>
          <GraphDescription text={result.description || ''} />
          {legend}
        </GraphDetail>
      </GraphContent>
    </ResultGraphContainer>
  );
};

const GraphTitleContainer = styled.p`
  display: flex;
  align-items: center;
  padding-left: 24px;
  ::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: var(--lightgreen);
    left: 32px;
    display: block;
    line-height: 18px;
    margin-top: 1px;
  }
`;

export const GraphTitle = ({ text }: { text: string }) => (
  <GraphTitleContainer className="h5b" style={{ marginBottom: '6px' }}>
    {text}
  </GraphTitleContainer>
);

const GraphSubTitle = ({ text }: { text: string }) => (
  <p>
    <Markdown>{text}</Markdown>
  </p>
);

interface GraphDetailProps {
  fullWidth?: boolean;
}

const GraphDetail = styled.div`
    display: flex;
    flex-direction: ${({ fullWidth }: GraphDetailProps) =>
      fullWidth ? 'row' : 'column'};
    gap: 16px;
    > * {
      flex: ${({ fullWidth }: GraphDetailProps) => fullWidth && '1'};
    }
}
`;

const GraphDescriptionContainer = styled.div`
    margin: 0;
    > p {
      margin-bottom: 8px;
    }
}
`;

const GraphDescription = ({ text }: { text: string }) => (
  <GraphDescriptionContainer>
    <p className="h6r underline">Description</p>
    <Markdown>{text}</Markdown>
  </GraphDescriptionContainer>
);

export default ResultGraph;
