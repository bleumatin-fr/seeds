import styled from '@emotion/styled';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';

const CompletionFieldContainer = styled.div`
  position: relative;
  width: 40px;
  height: 40px;

  .foreground {
    position: absolute;
    svg {
      stroke-linecap: round;
    }
  }

  .background {
    position: absolute;
    svg {
      color: lightgray;
    }
  }
`;

const CompletionField = ({ source }: { source: string }) => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <CompletionFieldContainer>
      <CircularProgress
        variant="determinate"
        className="background"
        value={100}
        thickness={4}
      />
      <CircularProgress
        variant="determinate"
        className="foreground"
        value={record[source]}
        thickness={4}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.primary"
        >{`${Math.round(record[source])}%`}</Typography>
      </Box>
    </CompletionFieldContainer>
  );
};

export default CompletionField;
