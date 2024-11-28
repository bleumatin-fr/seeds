import { ScoreCard } from '@arviva/core';
import styled from '@emotion/styled';

import { IconContainer, scopeIcons } from './ResultsSimple';

import { TitleScoreContainer } from './ResultsSimple';

import Tooltip from '@mui/material/Tooltip';
import Identity from '../ui/icons/categories/infos générales.svg?react';
import Help from '../ui/icons/help.svg?react';

interface ScoreCardProps {
  result: ScoreCard;
}

interface ScoreCardComponentContainerProps {
  visible: boolean;
}

const ScoreCardComponentContainer = styled.div`
  display: relative;
  .content {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: center;
    filter: ${(props: ScoreCardComponentContainerProps) =>
      !props.visible && 'blur(1px)'};
    opacity: ${(props: ScoreCardComponentContainerProps) =>
      !props.visible && '0.2'};
  }
`;

const ScoreCardComponent = ({ result }: ScoreCardProps) => {
  const iconKey = Object.keys(scopeIcons).find((key) =>
    result.code?.startsWith(key),
  );
  const icon = iconKey ? scopeIcons[iconKey] ?? <Identity /> : <Identity />;

  const scores = result.score!.split('/');
  return (
    <ScoreCardComponentContainer visible={result.displayData!}>
      {!result.displayData && <NoDisplay title={result.title!} />}
      <div className="content">
        <IconContainer>{icon}</IconContainer>
        {result.displayData && (
          <TitleScoreContainer>
            <p>{result.title}</p>
            <p>
              <b>{scores[0]}</b> / {scores[1]}
            </p>
          </TitleScoreContainer>
        )}
        <Abacus result={result} visible={result.displayData!} />
      </div>
    </ScoreCardComponentContainer>
  );
};

const NoDisplayContainer = styled.div`
  position: absolute;
  cursor: pointer;
  filter: none !important;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 80%;
  z-index: 1000;
  svg {
    width: 100%;
    height: 100%;
  }
`;

const NoDisplay = ({ title }: { title: string }) => {
  return (
    <Tooltip
      sx={{ backgroundColor: 'white' }}
      title={<TooltipContent title={title} />}
    >
      <NoDisplayContainer>
        <Help />
      </NoDisplayContainer>
    </Tooltip>
  );
};

const TooltipContent = ({ title }: { title: string }) => {
  return (
    <>
      <p className="hxr">
        Votre score <b>{title}</b> n'est pas affiché. Deux possibilités :
      </p>
      <ul style={{ marginLeft: '20px' }}>
        <li className="hxr">
          vous n'avez pas répondu aux questions concernées,
        </li>
        <li className="hxr">vous n'êtes pas concerné.</li>
      </ul>
    </>
  );
};

interface AbacusContainerProps {
  visible: boolean;
}

const AbacusContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  flex-grow: 1;
  margin-left: auto;
  max-width: 50%;
  align-items: center;
  > div {
    display: flex;
    justify-content: space-between;
  }
  .abacus_letters {
    height: 28px;
    width: ${(props: AbacusContainerProps) =>
      props.visible ? 'calc(100% * 5 / 6)' : '100%'};
    p {
      width: calc(100% / 5);
      min-width: 20px;
      text-align: center;
    }
  }
  .abacus_scores {
    width: 100%;
    @media screen and (max-height: 600px) {
      display: none;
    }
    p {
      width: calc(100% / 6);
      min-width: 20px;
      text-align: center;
    }
  }
`;

interface LetterWrapperProps {
  isPrimary: boolean;
  colorPrimary: string;
  colorSecondary: string;
}

const LetterWrapper = styled.p`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border: ${(props: LetterWrapperProps) =>
    props.isPrimary ? '3px solid black' : '1px solid #0003'};
  ${(props: LetterWrapperProps) =>
    !props.isPrimary ? 'border-right: 0;' : ''};

  font-weight: ${(props: LetterWrapperProps) =>
    props.isPrimary ? 'bold' : 'normal'};
  background-color: ${(props: LetterWrapperProps) =>
    props.isPrimary ? props.colorPrimary : props.colorSecondary};

  &:last-child {
    border-right: ${(props: LetterWrapperProps) =>
      props.isPrimary ? '3px solid black' : '1px solid #0003'};
  }
`;

const ScoreWrapper = styled.p`
  text-align: center;
  line-height: 12px;
`;

interface AbacusProps {
  result: ScoreCard;
  visible: boolean;
}

export const Abacus = ({ result, visible }: AbacusProps) => {
  const isPrimary = (letter: string, level: string) => {
    return level === letter;
  };
  const level = result.level!;
  const abacus = result.abacus!;
  const { scores, letters, colors } = abacus;
  if (!visible) {
    return (
      <AbacusContainer visible={visible}>
        <div className="abacus_letters">
          {letters.map((letter: string, index: number) => (
            <LetterWrapper
              isPrimary={false}
              colorPrimary={colors[index].primary}
              colorSecondary={colors[index].secondary}
              className="h5r"
              key={letter}
            >
              {letter}
            </LetterWrapper>
          ))}
        </div>
      </AbacusContainer>
    );
  }
  return (
    <AbacusContainer visible={visible}>
      <div className="abacus_letters">
        {letters.map((letter: string, index: number) => (
          <LetterWrapper
            isPrimary={isPrimary(level, letter)}
            colorPrimary={colors[index].primary}
            colorSecondary={colors[index].secondary}
            className="h5r"
            key={letter}
          >
            {letter}
          </LetterWrapper>
        ))}
      </div>
      <div className="abacus_scores">
        {scores.map((score, index) => (
          <ScoreWrapper className="hzr" key={index}>
            {score}
          </ScoreWrapper>
        ))}
      </div>
    </AbacusContainer>
  );
};

export default ScoreCardComponent;
