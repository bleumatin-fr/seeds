import { ScoreCard } from '@arviva/core';
import styled from '@emotion/styled';

interface AbacusContainerProps {
  visible: boolean;
}

const AbacusContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
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
    p {
      width: calc(100% / 6);
      min-width: 20px;
      text-align: center;
    }
  }
`;

interface LetterWrapperProps {
  isPrimary: boolean;
}

const LetterWrapper = styled.p`
  display: flex;
  justify-content: center;
  flex-direction: column;
  border: 2px solid var(--lightgreen);
  border-right: 0;
  background-color: ${(props: LetterWrapperProps) =>
    props.isPrimary ? 'var(--lightgreen)' : 'white'};
  color: ${(props: LetterWrapperProps) =>
    props.isPrimary ? 'white' : 'var(--lightgreen)'};
  font-weight: bold;

  &:last-child {
    border-right: 2px solid var(--lightgreen);
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  &:first-child {
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
  }
`;

const ScoreWrapper = styled.p`
  text-align: center;
  font-weight: bold;
  color: var(--lightgreen);
  line-height: 12px;
`;

interface AbacusProps {
  result: ScoreCard;
  visible: boolean;
}

export const PdfAbacus = ({ result, visible }: AbacusProps) => {
  const isPrimary = (letter: string, level: string) => {
    return level === letter;
  };
  const level = result.level!;
  const abacus = result.abacus!;
  const { scores, letters } = abacus;

  return (
    <AbacusContainer visible={visible}>
      <div className="abacus_letters">
        {letters.map((letter: string, index: number) => (
          <LetterWrapper
            isPrimary={isPrimary(level, letter)}
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
