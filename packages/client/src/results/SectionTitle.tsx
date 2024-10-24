import { Title } from '@arviva/core';
import styled from '@emotion/styled';
import { IconContainer, scopeIcons } from './ResultsSimple';

const SectionTitleContainer = styled.div`
  position: relative;
  padding: 16px;
  background-color: white;
  border-radius: 8px 8px 0 0;
  margin-top: 16px;
  > div:not(.result_anchor) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 16px;
    color: black;
  }
  .result_anchor {
    visibility: hidden;
    position: absolute;
    top: -48px;
  }
`;

const SectionTitle = ({ result }: { result: Title }) => {
  const icon = scopeIcons[result.icon!];
  return (
    <SectionTitleContainer>
      <div id={`results_${result.icon}`} className="result_anchor"></div>
      <div>
        <IconContainer>{icon}</IconContainer>
        <p className="h4b">{result.text}</p>
      </div>
    </SectionTitleContainer>
  );
};

export default SectionTitle;
