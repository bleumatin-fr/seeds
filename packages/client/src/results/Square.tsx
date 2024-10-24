import styled from '@emotion/styled';

const SquareWrapper = styled.div`
  height: auto;
  padding: 4px;
  border: solid black 4px;
  display: flex;
  gap: 4px;
  flex-direction: column;
  align-items: center;
`;

export const Square = ({
  mainText,
  subtitle,
}: {
  mainText: string;
  subtitle: string;
}) => (
  <SquareWrapper>
    <p className="h4b">{mainText}</p>
    <p className="hxr">{subtitle}</p>
  </SquareWrapper>
);

export default Square;
