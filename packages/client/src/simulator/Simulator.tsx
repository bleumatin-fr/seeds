import { Value } from '@arviva/core';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';

import Nav from './Nav';

import React, { useEffect, useState } from 'react';
import BaseLoadingIllustration from '../project/images/water-crops.svg?react';
import ResultsSimple from '../results/ResultsSimple';
import Button from '../ui/Button';
import { SectorComponent } from './SectorComponent';
import { useSimulation } from './useSimulation';

const Container = styled.div`
    width: 100%;
    background-color: var(--backgroundColor);
    display: flex;
    gap: 16px;
    padding: 0 16px;
  }
`;

const LeftColumn = styled.div`
  width: min(65%, calc(100% - 400px));
  position: sticky;
  top: 64px;
`;

const RightColumn = styled.div`
  width: max(35%, 400px);
  height: calc(100vh - 96px);
  position: sticky;
  top: 64px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
`;

const SectorWrapper = styled.div`
  width: 100%;
  background-color: white;
  padding: 0 16px;
  border-radius: 0 0 30px 30px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  margin-top: 184px;
  button {
    margin-top: 40px;
  }
`;

const LoadingIllustration = styled(BaseLoadingIllustration)`
  width: 600px;
  filter: grayscale(95%) brightness(120%);
  opacity: 0.8;
`;

export const Loading = () => (
  <LoadingContainer>
    <LoadingIllustration />
    <p className="h2b">
      Préparation de votre environnement de travail en cours...
    </p>
  </LoadingContainer>
);

const HeaderContainer = styled.div`
  padding-top: 16px;
  background-color: var(--backgroundColor);
  position: sticky;
  top: 64px;
  z-index: 120;
`;

const NavContainer = styled.div`
  background-color: white;
  border-radius: 30px 30px 0 0;
`;

const MainContainer = styled.div`
  padding: 0;
  background-color: var(--backgroundColor);
`;

export const SimulatorForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { simulation, updateParameter } = useSimulation('simulation');

  useEffect(() => {
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      const element = document.querySelector(scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    }
  }, [location]);

  const handleParameterUpdate = (index: number, value: Value) => {
    updateParameter(index, value);
  };

  if (!simulation) return <Loading />;

  return (
    <Container className="simulator">
      <Helmet>
        <meta charSet="utf-8" />
        <title>{`Arviva - SEEDy`}</title>
      </Helmet>
      <LeftColumn>
        <HeaderContainer>
          <NavContainer>
            <Nav project={simulation} />
          </NavContainer>
        </HeaderContainer>
        <MainContainer>
          <SectorWrapper>
            <SectorComponent
              sectors={simulation?.sectors}
              depth={0}
              upperSector={null}
              options={{ secondaryNav: false }}
              onUpdateParameter={handleParameterUpdate}
            />
          </SectorWrapper>
        </MainContainer>
      </LeftColumn>
      <RightColumn>
        <ResultsSimple
          results={simulation?.results}
          loading={false}
          button={
            <Button
              variant="contained"
              onClick={() => navigate(`/authentication/register`)}
              fullWidth
              style={{height: 'auto'}}
            >
              Inscrivez-vous à SEEDS
              <br />
              pour calculer votre empreinte détaillée
            </Button>
          }
        />
      </RightColumn>
    </Container>
  );
};

const ScrollHandleContainer = styled.div`
  position: relative;
  top: -200px;
`;

export const ScrollHandle = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => {
    const [top, setTop] = useState(0);

    useEffect(() => {
      const categoriesWrapper = document.querySelector('.categories_wrapper');
      if (!categoriesWrapper) return;
      const bottom = categoriesWrapper.getBoundingClientRect().bottom;
      setTop(bottom + (props.offset || 0) + 20);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <ScrollHandleContainer
        {...props}
        ref={ref}
        style={{ top: -top }}
      ></ScrollHandleContainer>
    );
  },
);
