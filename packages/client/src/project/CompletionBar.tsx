import styled from '@emotion/styled';

interface CompletionBarProps {
  completion: number;
  width?: string;
}

type CompletionContainerProps = {
  width?: string;
};
const CompletionContainer = styled.div`
  display: flex;
  min-width: ${(props: CompletionContainerProps) =>
    props.width ? props.width : '100%'};
  overflow: hidden;
  height: 8px;
  border-radius: 4px;
  border: 1px solid #00000033;
`;

const CompletionBarComponent = styled.div`
  background-color: var(--green);
  transition: width 0.5s ease-in-out;
`;

const CompletionBar = ({ completion, width }: CompletionBarProps) => (
  <CompletionContainer width={width}>
    <CompletionBarComponent style={{ width: `${completion}%` }} />
  </CompletionContainer>
);

export default CompletionBar;
