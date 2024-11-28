import styled from '@emotion/styled';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useEffect, useState } from 'react';
import { useRecordContext } from 'react-admin';

import classNames from 'classnames';
import useScript from './useScript';

const OfficeContainer = styled.div`
  position: absolute;
  top: calc(16px + 48px);
  bottom: 16px;
  right: 16px;
  left: 58px;
  height: calc(100vh - 16px - 48px - 16px);

  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
    0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  z-index: 1200;

  &.fullscreen {
    top: 50px;
    bottom: 0;
    right: 0;
    left: 0;
    height: calc(100vh - 50px);
  }

  &.sidebar-opened {
    left: 160px;
  }
`;

const FullscreenButton = styled.button`
  position: absolute;
  top: 0;
  right: 80px;
  width: 40px;
  height: 32px;

  display: inline-block;
  margin-bottom: 0;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  border: 1px solid transparent;
  padding: 1px 3px;
  font-size: 11px;
  line-height: 1.42857143;
  border-radius: 0;
  user-select: none;

  stroke-width: 1px;
  stroke: #f7f7f7;
  background-color: transparent;

  svg {
    margin-top: 2px;
  }

  &:hover {
    background-color: #e0e0e0;
  }
`;

const OnlyOffice = ({ className }: { className: string }) => {
  const document = useRecordContext();
  const [fullscreen, setFullscreen] = useState(false);
  const status = useScript(
    `${import.meta.env.VITE_DOCUMENTSERVER_URL}/web-apps/apps/api/documents/api.js`,
  );

  const config = {
    token: document.token,
    ...document.config,
  };

  const isOnlyOfficeLoaded = () => status === 'ready';
  const isDocumentReady = () => !!document.id;

  useEffect(() => {
    let docEditor: any = null;

    if (isOnlyOfficeLoaded() && isDocumentReady()) {
      DocsAPI.DocEditor.defaultConfig = {
        type: 'desktop',
        width: '100%',
        height: '100%',
        editorConfig: {
          lang: 'en',
          canCoAuthoring: true,
          customization: {
            about: false,
            feedback: false,
          },
        },
      };
      docEditor = new DocsAPI.DocEditor('placeholder', config);
    }

    return () => docEditor && docEditor.destroyEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, document]);

  const toggleFullScreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <OfficeContainer
      className={classNames({
        [className]: true,
        fullscreen: fullscreen,
      })}
    >
      <div id="placeholder" style={{ height: '100%' }}></div>
      <FullscreenButton onClick={toggleFullScreen}>
        {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </FullscreenButton>
    </OfficeContainer>
  );
};

export default OnlyOffice;
