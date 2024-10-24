import styled from '@emotion/styled';
import { ReactNode, RefObject, useEffect, useRef } from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { ArcherContainerHandle } from 'react-archer/lib/ArcherContainer/ArcherContainer.types';

const GridContainer = styled.div`
  position: relative;
  padding: 80px 40px;
  display: flex;
  justify-content: space-between;
  gap: 60px;
  margin: ;
`;

const LeftColumn = styled.div`
  display: flex;
  align-items: center;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  position: relative;
  justify-content: space-between;
`;

const RightTopCell = styled.div`
  position: relative;
  display: inline-block;
  cursor: default;
`;

const RightBottomCell = styled.div`
  position: relative;
  display: inline-block;
  cursor: default;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
  pointer-events: none;
  & button {
    pointer-events: auto;
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

interface TravelsContainerProps {
  left: ReactNode;
  rightTop: ReactNode;
  rightBottom: ReactNode;
  bottom: ReactNode;
}

const TravelsLayout = ({
  left,
  rightTop,
  rightBottom,
  bottom,
}: TravelsContainerProps) => {
  const archerRef = useRef<ArcherContainerHandle>();

  // ugly trick so the arrows are in sync with the events
  useEffect(() => {
    archerRef.current?.refreshScreen();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      archerRef.current?.refreshScreen();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <ArcherContainer
      ref={archerRef as RefObject<ArcherContainerHandle>}
      strokeColor="grey"
      strokeWidth={2}
    >
      <GridContainer>
        {left && (
          <>
            <ArcherElement
              id="toNext1"
              relations={[
                {
                  targetId: 'toNext2',
                  targetAnchor: 'top',
                  sourceAnchor: 'bottom',
                  style: { strokeDasharray: '5,5' },
                },
              ]}
            >
              <div style={{ position: 'absolute', top: 0, left: '48%' }}></div>
            </ArcherElement>

            <LeftColumn>
              <div style={{ position: 'relative' }}>
                <ArcherElement id="toNext2" relations={[]}>
                  <div
                    style={{ position: 'absolute', top: 0, left: '50%' }}
                  ></div>
                </ArcherElement>
                <ArcherElement
                  id="toNext3"
                  relations={[
                    {
                      targetId: 'toNext4',
                      targetAnchor: 'top',
                      sourceAnchor: 'bottom',
                      style: { strokeDasharray: '5,5' },
                    },
                  ]}
                >
                  <div
                    style={{ position: 'absolute', bottom: 0, left: '50%' }}
                  ></div>
                </ArcherElement>
                {left}
              </div>
            </LeftColumn>

            <ArcherElement id="toNext4">
              <div
                style={{ position: 'absolute', bottom: 0, left: '48%' }}
              ></div>
            </ArcherElement>
          </>
        )}
        <RightColumn>
          {rightTop && (
            <RightTopCell>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <ArcherElement id="out2">
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                    }}
                  ></div>
                </ArcherElement>
                <ArcherElement
                  id="out3"
                  relations={[
                    {
                      targetId: 'out4',
                      targetAnchor: 'left',
                      sourceAnchor: 'right',
                      style: { strokeDasharray: '5,5' },
                    },
                  ]}
                >
                  <div
                    style={{ position: 'absolute', top: '50%', right: 0 }}
                  ></div>
                </ArcherElement>

                {rightTop}
              </div>
              <ArcherElement id="out4">
                <div
                  style={{ position: 'absolute', top: '50%', right: -40 }}
                ></div>
              </ArcherElement>
            </RightTopCell>
          )}

          {rightBottom && (
            <RightBottomCell>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <ArcherElement
                  id="in1"
                  relations={[
                    {
                      targetId: 'in2',
                      targetAnchor: 'right',
                      sourceAnchor: 'left',
                      style: { strokeDasharray: '5,5' },
                    },
                  ]}
                >
                  <div
                    style={{ position: 'absolute', top: '50%', right: -400 }}
                  ></div>
                </ArcherElement>

                <ArcherElement id="in2">
                  <div
                    style={{ position: 'absolute', top: '50%', right: 0 }}
                  ></div>
                </ArcherElement>

                <ArcherElement
                  id="in3"
                  relations={[
                    {
                      targetId: 'in4',
                      targetAnchor: 'top',
                      sourceAnchor: 'left',
                      style: { strokeDasharray: '5,5' },
                    },
                  ]}
                >
                  <div
                    style={{ position: 'absolute', top: '50%', left: '50%' }}
                  ></div>
                </ArcherElement>

                {rightBottom}
              </div>
            </RightBottomCell>
          )}
        </RightColumn>
        <ArcherElement
          id="out1"
          relations={[
            {
              targetId: 'out2',
              targetAnchor: 'left',
              sourceAnchor: 'bottom',
              style: { strokeDasharray: '5,5', endMarker: false },
            },
          ]}
        >
          <div style={{ position: 'absolute', top: 0, left: '52%' }}></div>
        </ArcherElement>
        <ArcherElement id="in4">
          <div style={{ position: 'absolute', bottom: 0, left: '52%' }}></div>
        </ArcherElement>
      </GridContainer>
      {bottom && <Bottom>{bottom}</Bottom>}
    </ArcherContainer>
  );
};

export default TravelsLayout;
