import styled from '@emotion/styled';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGemoji from 'remark-gemoji';
import remarkGfm from 'remark-gfm';

interface MarkdownProps {
  children: string;
}

const MarkdownContainer = styled.div`
  white-space: pre-wrap;

  ul {
    margin-left: 1rem;

    li {
      white-space: collapse;
    }
  }
`;

const Markdown = ({ children }: MarkdownProps) => {
  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkGemoji]}
      >
        {children}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default Markdown;
