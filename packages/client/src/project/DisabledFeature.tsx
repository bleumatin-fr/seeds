import styled from '@emotion/styled';
import OriginalBlock from '../ui/Block';
import { ReactComponent as CompassIcon } from '../ui/icons/compass.svg';

const Block = styled(OriginalBlock)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;

  p {
    margin: 8px 0;
  }
  .title {
    font-weight: 600;
  }
  .left svg {
    width: 100px;
    height: 100px;
  }
`;

const DisabledFeature = () => {
  return (
    <Block accent>
      <div className="left">
        <CompassIcon />
      </div>
      <div className="right">
        Une fonctionnalité permettant de faciliter la saisie de ces champs est
        temporairement désactivée car vous êtes dans le tutoriel.
      </div>
    </Block>
  );
};

export default DisabledFeature;
