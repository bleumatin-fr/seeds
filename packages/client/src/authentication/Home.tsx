import styled from '@emotion/styled';

import { useNavigate } from 'react-router-dom';
import BaseBlock from '../ui/Block';

import { useEffect } from 'react';
import Button from '../ui/Button';
import { ReactComponent as WishesIllustration } from '../ui/icons/intro.svg';
import useConfiguration from '../useConfiguration';

import bike from '../project/pdf/images/bike.svg';
import leafs from '../project/pdf/images/leafs-yellow.svg';
import marquee from '../project/pdf/images/marquee.svg';
import person from '../project/pdf/images/person.svg';

const Title = styled.h1`
  font-size: 32px;
  color: white;
  text-align: center;
  margin: 32px;
  font-weight: normal;
  max-width: 900px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 50px;
  align-items: center;
  position: relative;
`;

const Illustration = styled.img`
  position: absolute;
  z-index: -1;
`;

const Subcontainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: small;
  gap: 16px;
`;

const Block = styled(BaseBlock)`
  display: flex;
  max-width: 800px;
  height: auto;
  margin: 16px auto;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  position: relative;
  border-radius: 28px;

  > svg {
    width: 30%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    background: var(--yellow);
    border-bottom-left-radius: 28px;
    border-top-left-radius: 28px;
  }

  > :not(svg) {
    margin-left: 35%;
  }
`;

const Subblock = styled.div`
  background: white;
  padding: 16px;
  flex-grow: 0;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 28px;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;

  h1 {
    font-size: 48px;
  }

  hr {
    width: 50%;
    max-width: 100px;
    margin: auto;
    border: 0;
    border-top: 2px solid #0f8d96;
  }

  h2 {
    color: #0f8d96;
    font-size: 14px;
    margin: auto;
    align-self: center;
    text-align: center;
  }
`;

const BottomNote = styled.p`
  font-weight: 12;
  font-style: italic;
  text-align: center;
  max-width: 1150px;
  margin-top: 32px;
  position: absolute;
  top: 100%;
  margin-left: 0 !important;
  color: white !important;
`;

const BottomNoteSeparator = styled.hr`
  width: 50%;
  max-width: 400px;
  margin: auto;
  border: 0;
  border-top: 2px dashed white;
  margin-bottom: 16px;
`;

const Pill = styled.div`
  padding: 8px 24px;
  border-radius: 16px;
  font-size: small;
  font-weight: bold;
  border: 1px solid black;
  align-self: flex-start;
  font-size: 10px;
`;

const SeedyTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;

  h1 {
    font-size: 48px;
  }

  hr {
    width: 50%;
    max-width: 100px;
    margin: auto;
    border: 0;
    border-top: 2px solid #7bd7ff;
  }

  h2 {
    color: #7bd7ff;
    font-size: 14px;
    margin: auto;
    align-self: center;
    text-align: center;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
`;

const OrContainer = styled.div`
  color: white;
  font-size: 18px;
`;

const BottomMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  font-size: 14px;
`;

const appendWelcomeTagLine = (message?: string) => {
  if (!message) {
    return '';
  }
  const h1Index = message.indexOf('</h1>') + 5;

  if (h1Index === -1 + 5) {
    return message;
  }

  return `${message.slice(
    0,
    h1Index,
  )}<hr/><h2>La solution complète</h2>${message.slice(h1Index)}`;
};

const appendSimulatorTagLine = (message?: string) => {
  if (!message) {
    return '';
  }
  const h1Index = message.indexOf('</h1>') + 5;

  if (h1Index === -1 + 5) {
    return message;
  }

  return `${message.slice(
    0,
    h1Index,
  )}<hr/><h2>La solution rapide</h2>${message.slice(h1Index)}`;
};

const stripStyleAttributes = (message?: string) => {
  if (!message) {
    return '';
  }
  return message.replace(/style="[^"]*"/g, '');
};

const Home = () => {
  const { configuration } = useConfiguration();
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelector('body')?.classList.add('home');
    return () => {
      document.querySelector('body')?.classList.remove('home');
    };
  }, []);

  const welcomeMessageTitle = appendWelcomeTagLine(
    configuration['home.welcomeMessageTitle'],
  );

  const welcomeMessage = appendWelcomeTagLine(
    configuration['home.welcomeMessage'],
  );

  const simulatorMessage = appendSimulatorTagLine(
    configuration['home.simulatorMessage'],
  );

  const bottomMessage = stripStyleAttributes(
    configuration['home.bottomMessage'],
  );

  return (
    <Container>
      <Illustration
        src={bike}
        alt=""
        height="60px"
        style={{
          top: '-5%',
          left: '20%',
        }}
      />
      <Illustration
        src={leafs}
        alt=""
        height="60px"
        style={{
          top: '5%',
          left: '90%',
        }}
      />
      <Illustration
        src={person}
        alt=""
        height="60px"
        style={{
          top: '40%',
          left: '10%',
        }}
      />
      <Illustration
        src={marquee}
        alt=""
        height="60px"
        style={{
          top: '90%',
          left: '80%',
        }}
      />

      <Title
        dangerouslySetInnerHTML={{
          __html: welcomeMessageTitle,
        }}
      ></Title>

      <Subcontainer>
        <Block>
          <WishesIllustration />
          <MessageContainer
            dangerouslySetInnerHTML={{
              __html: welcomeMessage,
            }}
          ></MessageContainer>
          <ButtonsContainer>
            <Button
              variant="contained"
              onClick={() => navigate(`/authentication/register`)}
              color="primary"
              style={{ backgroundColor: 'var(--yellow)' }}
            >
              S'inscrire
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/authentication/login`)}
            >
              Se connecter
            </Button>
          </ButtonsContainer>
        </Block>
        <OrContainer>ou</OrContainer>
        <Subblock>
          <Pill>Nouveau</Pill>
          <SeedyTextContainer
            dangerouslySetInnerHTML={{
              __html: simulatorMessage,
            }}
          ></SeedyTextContainer>
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate(`/simulator`)}
            style={{ alignSelf: 'center', backgroundColor: '#7BD7FF' }}
          >
            Commencer
          </Button>
        </Subblock>
      </Subcontainer>
      <BottomNote>
        <BottomNoteSeparator />
        <BottomMessageContainer
          dangerouslySetInnerHTML={{
            __html: bottomMessage,
          }}
        ></BottomMessageContainer>
      </BottomNote>
    </Container>
  );
};

export default Home;
