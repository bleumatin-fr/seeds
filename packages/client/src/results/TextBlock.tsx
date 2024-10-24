import { TextResult } from '@arviva/core';
import styled from '@emotion/styled';
import Markdown from '../ui/Markdown';

const TextBlockContainer = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  color: black;
  margin-bottom: 16px;
  background-color: var(--color-primary-light);

  > img:first-of-type {
    width: 240px;
  }

  a {
    color: var(--green) !important;
    text-decoration: underline !important;
  }

  &.small {
    > img:first-of-type {
      width: 120px;
    }
  }
`;

const TextBlock = ({
  result,
  className,
}: {
  result: TextResult;
  className?: string;
}) => {
  return (
    <TextBlockContainer className={className}>
      <Markdown>{result.text || ''}</Markdown>
    </TextBlockContainer>
  );
};

export default TextBlock;
