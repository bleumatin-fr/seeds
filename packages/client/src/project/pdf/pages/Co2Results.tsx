import { Box } from '@mui/material';

import { User } from '../../../authentication/context/useUser';
import { Indicator, Parameter, Pie1D, Project } from '@arviva/core';
import { Pie, PieChart } from 'recharts';
import co2 from '../images/co2.svg';
import leafsBlackAndWhite from '../images/leaf-bnw.svg';
import { ContentLayout, PageLayout, Text } from '../layout';
import { Footer } from './Footer';
import { Header } from './Header';

export const Co2Results = ({
  project,
  user,
  parameters,
}: {
  project: Project;
  user: User;
  parameters: Parameter[];
}) => {
  if (!project || !user) {
    return null;
  }
  const co2Details = project.results.find(
    (result) => (result as Pie1D).code === 'co2_detailed',
  );
  const co2DetailsData = co2Details
    ? (co2Details as Pie1D).data?.sort((a, b) => b.value - a.value)
    : null;

  const co2TotalKg =
    (co2Details as Pie1D)?.data?.reduce((acc, curr) => acc + curr.value, 0) ||
    0;
  const co2DetailsUnit = 'kgCO2e';
  const totalCo2 = project.results.find(
    (result) => (result as Indicator).code === 'co2',
  ) as Indicator;
  const totalCo2PerRepresentation = project.results.find(
    (result) => (result as Indicator).code === 'co2bis',
  ) as Indicator;

  return (
    <PageLayout>
      <Header project={project} pageNumber={1} />
      <ContentLayout>
        <Box height="30px" />
        <Box display="flex" columnGap={1}>
          <Text fontSize="70px" fontWeight="bold">
            Émissions de
          </Text>
          <img src={co2} width="80px" alt="Co2 cloud" />
        </Box>
        <Text fontSize="70px" fontWeight="bold">
          gaz à effet de serre
        </Text>
        <Box height="30px" />
        <Box
          height="1px"
          width="100%"
          marginBottom={5}
          sx={{
            background:
              'repeating-linear-gradient(90deg,var(--lightgreen) 0 20px,white 0 40px)',
          }}
        />
        <Box
          display="flex"
          justifyContent="space-evenly"
          alignItems="center"
          columnGap={5}
        >
          {co2DetailsData ? (
            <Box position="relative">
              <PieChart width={270} height={270}>
                <Pie
                  isAnimationActive={false}
                  data={co2DetailsData}
                  dataKey="value"
                  innerRadius="60%"
                  outerRadius="100%"
                />
              </PieChart>
              <img
                height="90px"
                src={leafsBlackAndWhite}
                alt="Black and white leafs"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </Box>
          ) : null}
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            height="100%"
            alignItems="flex-start"
          >
            <Text fontSize="25px" fontWeight="bold">
              {totalCo2.title}
            </Text>
            <Box
              height="30px"
              borderBottom="solid 1px"
              marginBottom="30px"
              width="100%"
            ></Box>
            <Box display="flex" columnGap={2} alignItems="baseline">
              <Text fontSize="80px" color="var(--lightgreen)" fontWeight="bold">
                {totalCo2 ? totalCo2.number : null}
              </Text>
              <Text fontSize="25px" color="var(--lightgreen)" fontWeight="bold">
                {totalCo2.unit}
              </Text>
            </Box>
            <Box
              height="30px"
              borderBottom="solid 1px"
              marginBottom="30px"
              width="100%"
            ></Box>

            {totalCo2PerRepresentation && totalCo2PerRepresentation.number ? (
              <Box
                display="flex"
                width="100%"
                alignItems="center"
                columnGap={2}
              >
                <Text fontSize="16px" fontWeight="bold">
                  Impact carbone
                </Text>
                <Box
                  display="flex"
                  flexDirection="column"
                  rowGap={1}
                  borderLeft={1}
                  borderColor="var(--lightgreen)"
                  paddingLeft={2}
                >
                  <Box display="flex">
                    {/* totalCo2PerRepresentation use title/number/unit */}
                    <Text
                      fontSize="12px"
                      fontWeight="bold"
                      color="var(--lightgreen)"
                    >
                      ({parseFloat(totalCo2PerRepresentation.number).toFixed(2)}
                      &nbsp;
                      {totalCo2PerRepresentation.unit?.split('/')[0]})
                    </Text>
                    <Text fontSize="12px">
                      &nbsp;/&nbsp;
                      {totalCo2PerRepresentation.unit?.split('/')[1]}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box height="30px" />
        <Box display="flex">
          <Text fontSize="12px">
            Ce graphique détaille les émissions de&nbsp;
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              gaz à effet de serre&nbsp;
            </span>
            liées à votre projet, selon plusieurs catégories.
          </Text>
        </Box>
        <Box height="20px" />
        <Box
          height="1px"
          marginBottom={5}
          sx={{
            background:
              'repeating-linear-gradient(90deg,var(--lightgreen) 0 20px,white 0 40px)',
          }}
        />
        <Box
          display="grid"
          width="100%"
          gridTemplateColumns="50% 50%"
          rowGap={2}
          flexWrap="wrap"
        >
          {/*  sort by co2 value, display on 2 lines */}
          {co2DetailsData
            ? co2DetailsData.map((data, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  rowGap={2}
                  columnGap={3}
                >
                  <Box
                    width="20px"
                    height="20px"
                    borderRadius="50%"
                    bgcolor={data.fill}
                  ></Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    flexWrap="wrap"
                    rowGap={1}
                    paddingRight={1}
                  >
                    <Text fontSize="12px" fontWeight="bold">
                      {data.name} :&nbsp;
                    </Text>
                    <Text fontSize="12px">
                      {data.value}&nbsp;{co2DetailsUnit},&nbsp;
                    </Text>
                    {data.value > 0 ? (
                      <Text fontSize="12px">
                        soit {Math.round((data.value / co2TotalKg) * 100)}%
                      </Text>
                    ) : null}
                  </Box>
                </Box>
              ))
            : null}
        </Box>
      </ContentLayout>
      <Footer project={project} user={user} parameters={parameters} />
    </PageLayout>
  );
};
