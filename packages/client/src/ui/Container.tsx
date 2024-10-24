import styled from '@emotion/styled';

interface ContainerProps {
  noGap?: boolean;
}

export const PageContainer = styled.div`
  width: 100%;
  max-width: 1038px;
  margin: 24px auto;
  background-color: #ebebeb;
  display: flex;
  gap: ${({ noGap }: ContainerProps) => (noGap ? '0px' : '16px')};
  flex-direction: column;
`;
