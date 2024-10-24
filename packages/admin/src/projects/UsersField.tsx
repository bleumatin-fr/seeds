import { ProjectUser } from '@arviva/core';
import styled from '@emotion/styled';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Chip from '@mui/material/Chip';
import { get } from 'lodash';
import { MouseEvent } from 'react';
import { useGetMany, useRecordContext, useRedirect } from 'react-admin';

const ChipsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const UsersField = ({ source }: { source: string }) => {
  const redirect = useRedirect();
  const record = useRecordContext();

  const value: ProjectUser[] = get(record, source);

  const { data } = useGetMany('users', {
    ids: value.map(({ id }: ProjectUser) => id.toString()),
  });

  const handleClick = (id: string) => (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    redirect('edit', 'users', id);
  };

  return (
    <ChipsContainer>
      {(data || []).map((user) => (
        <Chip
          key={user.id}
          onClick={handleClick(user.id)}
          icon={
            value.find((pu) => pu.id === user.id)?.role === 'owner' ? (
              <AdminPanelSettingsIcon />
            ) : undefined
          }
          label={`${user.firstName} ${user.lastName}`}
          variant="outlined"
          size="small"
        />
      ))}
    </ChipsContainer>
  );
};

export default UsersField;
