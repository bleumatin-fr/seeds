import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const SeedsTooltipContainer = styled.div`
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    gap: 6px;
    padding: 12px;
    background-color: var(--backgroundColor);
  }
`;

export const SeedsTooltipComponent = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <SeedsTooltipContainer>{children}</SeedsTooltipContainer>;
};

const SeedsTooltipRowContainer = styled.div`
    display: flex;
    align-items: center;
    .square_color {
        min-width: 12px;
        width: 12px;
        height: 12px;
        margin-right: 8px;
    }
  }
`;

interface SeedsTooltipProps {
  color: string | undefined;
  category: string | undefined;
  value: string | undefined;
  unit: string | undefined;
  percent?: number;
  link?: string;
  coefficient?: number;
}

export const SeedsTooltipRow = ({
  color,
  category,
  value,
  unit,
  percent,
  link,
  coefficient,
}: SeedsTooltipProps) => {
  const formattedPercent =
    unit !== '%' && percent ? (
      <>
        soit <b>{Math.round(Number(percent) * 100)}</b> %
      </>
    ) : (
      ''
    );

  const numberValue = parseFloat(value || '0');

  let categoryComponent = <>{category}</>;
  if (link) {
    if (link[0] === '#') {
      categoryComponent = <a href={link}>{category}</a>;
    } else {
      categoryComponent = <Link to={link}>{category}</Link>;
    }
  }

  let valueComponent = (
    <>
      {' '}
      <b>{value}</b> {unit} {formattedPercent}
    </>
  );
  if (coefficient && coefficient > 1) {
    valueComponent = (
      <>
        <b>{value}</b> {unit} {formattedPercent} ({coefficient} x{' '}
        {numberValue / coefficient} {unit})
      </>
    );
  }

  return (
    <SeedsTooltipRowContainer>
      <div className="square_color" style={{ backgroundColor: color }} />
      <p className="hxr">
        {categoryComponent} : {valueComponent}
      </p>
    </SeedsTooltipRowContainer>
  );
};

interface SimpleTooltipProps {
  color: string | undefined;
  category: string | undefined;
  unit: string | undefined;
  link?: string;
}

export const SimpleTooltipRow = ({
  color,
  category,
  unit,
  link,
}: SimpleTooltipProps) => {
  return (
    <SeedsTooltipRowContainer>
      <div className="square_color" style={{ backgroundColor: color }} />
      <p className="hxr">
        {link ? (
          link[0] === '#' ? (
            <>
              <a href={link}>{category}</a> ({unit})
            </>
          ) : (
            <>
              <Link to={link}>{category}</Link> ({unit})
            </>
          )
        ) : (
          <>
            {category} ({unit})
          </>
        )}
      </p>
    </SeedsTooltipRowContainer>
  );
};
