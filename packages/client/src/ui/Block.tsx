import styled from '@emotion/styled';

interface BlockProps {
  accent?: boolean;
  outlined?: boolean;
}

const Block = styled.div`
  background: ${({ accent }: BlockProps) =>
    accent ? 'var(--lightgreen)' : '#ffffff'};
  border-radius: 8px;
  border: ${({ outlined }: BlockProps) =>
    outlined ? '1px solid #eee' : 'none'};
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  height: 100%;
  h2 {
    font-weight: 600;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
  }
`;

interface TitleBlockProps {
  background: string;
}

export const TitleBlock = styled(Block)`
  background-color: ${({ background }: TitleBlockProps) => background};
  font-family: Montserrat;
  h3 {
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: 0em;
    text-align: center;
  }

  p {
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: center;
    margin-bottom: 16px;
  }
`;

export default Block;
