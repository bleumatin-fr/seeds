import styled from '@emotion/styled';
import { ReactNode } from 'react';

const Main = styled.main`
  width: 100%;
  margin: auto;
`;

interface AppLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

const AppLayout = ({ header, children }: AppLayoutProps) => {
  return (
    <>
      {header}
      <Main>{children}</Main>
    </>
  );
};

export default AppLayout;
