import { useEffect, useRef } from 'react';
import { Edit, useRecordContext, useSidebarState } from 'react-admin';

import classNames from 'classnames';
import OnlyOffice from './OnlyOffice';

const SpreadsheetTitle = () => {
  const record = useRecordContext();
  return <span>{record?.title}</span>;
};

const DocumentEdit = () => {
  const [isSidebarOpened, toggleSidebar] = useSidebarState();
  const initialSidebarState = useRef(isSidebarOpened);

  useEffect(() => {
    toggleSidebar(false);
    return () => {
      //eslint-disable-next-line react-hooks/exhaustive-deps
      toggleSidebar(initialSidebarState.current);
    };
  }, [toggleSidebar]);

  return (
    <Edit title={<SpreadsheetTitle />}>
      <OnlyOffice
        className={classNames({
          'sidebar-opened': isSidebarOpened,
        })}
      />
    </Edit>
  );
};

export default DocumentEdit;
