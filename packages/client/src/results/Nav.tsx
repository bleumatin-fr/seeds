import { Nav, NavElement } from '@arviva/core';
import styled from '@emotion/styled';
import { SortButton } from '../ui/Button';
import { scopeIcons } from './ResultsSimple';

const Container = styled.div`
  margin: 32px 0 16px;
  width: 100%;
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
`;

const NavComponent = ({ result }: { result: Nav }) => {
  if (result.data.length === 0) return null;
  return (
    <Container>
      {result.data.map((element) => (
        <NavElementComponent key={element.title} element={element} />
      ))}
    </Container>
  );
};

export const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  flex-shrink: 1;
`;

const NavElementComponent = ({ element }: { element: NavElement }) => {
  const { link, title, icon } = element;
  const elementIcon = scopeIcons[icon];
  return (
    <a href={`#results_${link}`}>
      <SortButton
        startIcon={<IconContainer>{elementIcon}</IconContainer>}
        className={'result'}
      >
        {title}
      </SortButton>
    </a>
  );
};

export default NavComponent;
