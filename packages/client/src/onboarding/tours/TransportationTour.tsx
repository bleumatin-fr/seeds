import styled from '@emotion/styled';
import { TourProvider } from '@reactour/tour';
import useOnboarding from '../useOnboarding';

interface TransportationTourProps {
  children: React.ReactNode;
  active?: boolean;
}

const StepContainer = styled.div`
  p {
    margin: 16px 0;
  }
`;

const steps = [
  {
    selector: '[data-tour="tour-transport-title"]',
    resizeObservables: ['[data-tour="tour-transport-title"]'],
    content: (
      <StepContainer>
        <p>Bienvenue dans le module mobilité !</p>
        <p>
          Ce module vous permettra de calculer l'ensemble de des transports de
          personnes et de matériel pour votre projet.
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '[data-tour="tour-transport-step"]',
    resizeObservables: ['[data-tour="tour-transport-step"]'],
    content: (
      <StepContainer>
        <p>
          Si vous êtes un lieu ou un festival : renseignez ici le lieu de votre
          projet (par exemple, Avignon pour le festival).
        </p>
        <p>
          Si vous êtes une structure en tournée : renseignez ici le premier lieu
          de votre tournée.
        </p>
        <p>
          Plus tard, SEEDS vous permettra d'intégrer une partie de l'impact
          carbone du lieu qui vous accueille pour cette représentation.
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.start-step .IN',
    resizeObservables: ['.start-step .IN'],
    action: () => {
      document.querySelector<HTMLDivElement>('.start-step')?.click();
    },
    content: (
      <StepContainer>
        <p>C'est parti !</p>
        <p>
          Cliquez ici pour renseigner les différents trajets pour rejoindre
          votre représentation.
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.start-step #add-person',
    resizeObservables: ['.start-step #add-person'],
    action: () => {
      document
        .querySelector<HTMLDivElement>('.start-step .travel-synthesis')
        ?.click();
    },
    content: (
      <StepContainer>
        <p>
          Pour les trajets des équipes artistiques, techniques et de production,
          c'est ici !
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.start-step #add-merchandise',
    resizeObservables: ['.start-step #add-merchandise'],
    content: (
      <StepContainer>
        <p>Pour le matériel, c'est ici !</p>
      </StepContainer>
    ),
  },
  {
    selector: '.start-step [data-tour="tour-transport-select-means"]',
    resizeObservables: [
      '.start-step [data-tour="tour-transport-select-means"]',
    ],
    action: () => {
      document
        .querySelector<HTMLDivElement>('.start-step #add-person')
        ?.click();
    },
    content: (
      <StepContainer>
        <p>
          Pour chaque trajet, vous pouvez indiquer un ou plusieurs moyens de
          transports.
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.end-step .OUT',
    resizeObservables: ['.end-step .OUT'],
    action: () => {
      document.querySelector<HTMLDivElement>('.end-step')?.click();
    },
    content: (
      <StepContainer>
        <p>
          Même chose pour les personnes et le matériel quittant le lieu de
          représentation !
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '#add-step',
    resizeObservables: ['#add-step'],
    content: (
      <StepContainer>
        <p>
          Pour les équipes en tournée : cliquez ici pour ajouter une nouvelle
          étape, et recommencez !{' '}
        </p>
      </StepContainer>
    ),
    actionAfter: () => {
      document.querySelector<HTMLDivElement>('#add-step')?.click();
    },
  },
  {
    selector: '.middle-step .DIRECT',
    resizeObservables: ['.middle-step .DIRECT', '#tour-layout'],
    content: (
      <StepContainer>
        <p>
          Renseignez ici les personnes et le matériel se déplaçant directement
          entre deux étapes...
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.middle-step .OUT',
    resizeObservables: ['.middle-step .OUT'],
    content: (
      <StepContainer>
        <p>
          ...ici les personnes quittant la tournée (ou qui rentrent à domicile)
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '.middle-step .IN',
    resizeObservables: ['.middle-step .IN'],
    content: (
      <StepContainer>
        <p>
          ...et ici les personnes qui intègrent la tournée en cours de route
        </p>
      </StepContainer>
    ),
  },
  {
    selector: '#validate-tour',
    resizeObservables: ['#validate-tour'],
    content: (
      <StepContainer>
        <p>
          Une fois vos étapes et trajets renseignés, cliquez ici pour valider
        </p>
      </StepContainer>
    ),
  },
];

const TransportationTour = ({ children }: TransportationTourProps) => {
  const { setCollapsed } = useOnboarding();

  return (
    <TourProvider
      steps={steps}
      afterOpen={() => {
        setCollapsed(true);
      }}
      onClickMask={() => {}}
      beforeClose={() => {
        setCollapsed(false);
      }}
    >
      {children}
    </TourProvider>
  );
};

export default TransportationTour;
