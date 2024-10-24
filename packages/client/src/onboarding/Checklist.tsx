import styled from '@emotion/styled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BaseBlock from '../ui/Block';
import { ReactComponent as LockIcon } from '../ui/icons/change-password.svg';
import { ReactComponent as CheckIcon } from '../ui/icons/check.svg';
import { ReactComponent as CompassIcon } from '../ui/icons/compass.svg';
import useOnboarding from './useOnboarding';

const Block = styled(BaseBlock)`
  position: fixed;
  overflow: hidden;
  max-height: calc(100vh - 96px - 16px - 64px);
  max-width: 450px;
  bottom: -100%;
  right: 16px;
  z-index: 1200;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  height: auto;
  transition: bottom 0.3s ease-in-out;
  padding: 0;

  &.visible {
    bottom: 96px;
  }

  .accordion-item {
    &:not(.Mui-expanded) {
      font-size: 14px;
      svg {
        width: 24px;
        height: 24px;
      }
    }
    &.Mui-expanded {
      font-weight: 600;
    }
    > div {
      align-items: center;

      svg {
        flex-shrink: 0;
        flex-grow: 0;
      }
    }
  }
`;

const Content = styled.div`
  font-size: 14px;
  ol,
  ul {
    margin-top: 8px;
    margin-left: 24px;

    li {
      margin: 8px 0;
    }
  }
`;

const SideActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  font-size: 0.8rem;
  margin-top: 16px;
  align-items: center;
  justify-content: center;
`;

const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  z-index: 1200;
  text-align: center;
  justify-content: center;

  h3 {
    margin: 0;
    padding: 16px;
  }

  a {
    text-decoration: underline;

    &:hover {
      font-weight: 600;
    }
  }

  > svg {
    position: absolute;
    top: -28px;
    left: -34px;
    width: 100px;
    height: 100px;
    fill: var(--grey);
  }
`;

const AccordionContainer = styled.div`
  overflow-y: auto;
`;

interface ChecklistProps {
  visible: boolean;
  onDone: () => void;
  onDismiss: () => void;
}

const Checklist = ({ visible, onDone, onDismiss }: ChecklistProps) => {
  const { steps, collapsed, setCollapsed, checklistStep, setChecklistStep } =
    useOnboarding();
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (accordionRef.current) {
      accordionRef.current
        .querySelector(`.MuiPaper-root:nth-child(${checklistStep})`)
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [checklistStep]);

  return (
    <Block className={visible && !collapsed ? 'visible' : ''}>
      <HeaderContainer>
        <CompassIcon />
        <SideActionsContainer>
          <Link
            to="/"
            onClick={(event) => {
              event.preventDefault();
              onDone();
            }}
          >
            Passer cette étape
          </Link>
          <Divider orientation="vertical" flexItem />
          <Link
            to="/"
            onClick={(event) => {
              event.preventDefault();
              setCollapsed(true);
            }}
          >
            Cacher
          </Link>
        </SideActionsContainer>
        <h3>Votre parcours sur SEEDS</h3>
      </HeaderContainer>
      <AccordionContainer style={{ flexGrow: 1 }} ref={accordionRef}>
        {steps.map(({ title, success, content, locked }, index) => (
          <Accordion
            key={index}
            expanded={checklistStep === index}
            onChange={() => setChecklistStep(index)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className="accordion-item"
            >
              {locked ? (
                <LockIcon fill="lightgray"></LockIcon>
              ) : (
                <CheckIcon
                  width="40px"
                  height="40px"
                  stroke={success ? 'green' : 'lightgray'}
                  fill={success ? 'green' : 'lightgray'}
                />
              )}
              <p>{title}</p>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'lightgray' }}>
              <Content>{content}</Content>
            </AccordionDetails>
          </Accordion>
        ))}
      </AccordionContainer>
    </Block>
  );
};

export default Checklist;
