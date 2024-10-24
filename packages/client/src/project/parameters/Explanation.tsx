import styled from '@emotion/styled';
import BaseBlock from '../../ui/Block';
import Markdown from '../../ui/Markdown';

interface ExplanationProps {
  value: string;
}

const Block = styled(BaseBlock)`
  text-align: left;

  > div {
    width: 100%;
  }
`;

const Explanation = ({ value }: ExplanationProps) => {
  if (!value) return null;
  return (
    <Block accent>
      <Markdown>{value}</Markdown>
    </Block>
  );
};

export default Explanation;
