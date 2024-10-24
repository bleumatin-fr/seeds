import { Parameter } from '@arviva/core';
import styled from '@emotion/styled';
import { Paper, Popper } from '@mui/material';
import { MouseEvent } from 'react';

const Title = styled.div`
  text-align: center;
  font-weight: bold;
  padding-bottom: 24px;
`;

const Li = styled.li`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

interface CompletionDetailsProps {
  placement: any;
  open: boolean;
  anchorEl: any;
  onClose: () => void;
  uncompleted: Partial<Parameter>[] | undefined;
}

const CompletionDetails = ({
  onClose,
  uncompleted,
  ...props
}: CompletionDetailsProps) => {
  const handleClick =
    (parameterIndex: number) => (event: MouseEvent<HTMLLIElement>) => {
      const scrollHandle = document.getElementById(
        `parameter-${parameterIndex}`,
      );
      if (!scrollHandle) return;

      const container = scrollHandle.parentElement;
      if (!container) return;

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              container.classList.add('blink');
              setTimeout(() => {
                container.classList.remove('blink');
              }, 1600);
            }, 400);
            observer.unobserve(entry.target);
          }
        });
      });

      observer.observe(container);

      scrollHandle.scrollIntoView({ block: 'center', behavior: 'smooth' });

      onClose();
    };

  return (
    <Popper {...props}>
      <Paper style={{ padding: '24px', maxWidth: '420px' }}>
        <Title>
          {uncompleted?.length === 0 && (
            <>Tous les paramètres sont complétés</>
          )}
          {uncompleted?.length !== 0 && (
            <>{uncompleted?.length} paramètres restant à compléter</>
          )}
        </Title>
        <ul style={{ marginLeft: '24px' }}>
          {uncompleted?.slice(0, 8).map((parameter) => (
            <Li
              onClick={handleClick(parameter.index ?? -1)}
              key={parameter.index}
            >
              {parameter.name || parameter.possibleValues?.join(' / ')}
            </Li>
          ))}
          <li>...</li>
        </ul>
      </Paper>
    </Popper>
  );
};

export default CompletionDetails;
