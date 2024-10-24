import styled from '@emotion/styled';
import React from 'react';
import { GraphTitle } from './ResultGraph';

const GlobalScoreContainer = styled.div`
  width: 100%;
  background-color: white;
  position: relative;
  padding: 32px;
  > div:last-of-type {
    margin-top: 16px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
    > p {
      flex: 1;
    }
    > p:first-of-type {
      text-align: center;
      background: #dceeef;
      padding: 6px 0;
      border-radius: 24px;
    }
  }
`;

interface GlobalScoreComponentProps {
  title?: string;
  score?: string;
  children: React.ReactNode;
}

const GlobalScoreComponent = ({
  title,
  score,
  children,
}: GlobalScoreComponentProps) => {
  return (
    <GlobalScoreContainer>
      <GraphTitle text={title!} />
      <div>
        <p className="h3b">{score}</p>
        {children}
      </div>
    </GlobalScoreContainer>
  );
};

export default GlobalScoreComponent;
