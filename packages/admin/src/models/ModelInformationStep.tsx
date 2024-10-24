import styled from '@emotion/styled';
import { Card, CardActions, Typography } from '@mui/material';
import { SaveButton, TextInput } from 'react-admin';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  gap: 3rem;
  width: 100%;
  flex-wrap: wrap;

  > div {
    max-width: 600px;
    width: 100%;
  }
`;

const UserInfoContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 1rem;
  background-color: #fed169;
`;

const ModelInformationStep = () => {
  return (
    <Card
      sx={{
        marginBottom: 2,
        padding: 2,
      }}
    >
      <Typography variant="h5" component="div">
        Informations du nouveau modèle
      </Typography>
      <Container>
        <div style={{ padding: '1rem' }}>
          <TextInput
            source="changelog"
            fullWidth
            multiline
            inputProps={{
              style: {
                paddingTop: 0,
                paddingBottom: 0,
                minHeight: '150px',
              },
            }}
          />
        </div>
        <UserInfoContainer>
          <TextInput
            source="userInformation"
            fullWidth
            multiline
            inputProps={{
              style: {
                paddingTop: 0,
                paddingBottom: 0,
                minHeight: '150px',
              },
            }}
          />
        </UserInfoContainer>
      </Container>
      <CardActions>
        <SaveButton />
      </CardActions>
    </Card>
  );
};

export default ModelInformationStep;
