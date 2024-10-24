import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';
import useProjects from '../project/context/useProjects';
import { ReactComponent as AddIcon } from '../ui/icons/add.svg';

import CompletionBar from '../project/CompletionBar';

const TextIcon = styled.div`
  display: inline;
  white-space: nowrap;
  background-color: var(--yellow);
  padding: 4px 8px;
  border-radius: 4px;

  svg {
    position: relative;
    top: 4px;
    width: 20px;
    height: 20px;
  }
`;

const Indicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const useSteps = () => {
  const [active, setActive] = useLocalStorage(
    'seeds-onboarding-checklist-step',
    0,
  );

  const navigate = useNavigate();

  const { projects } = useProjects();

  const mostCompletedBuilding = projects
    ?.filter((project) => project.model.type === 'building')
    .sort((a, b) => b.completionRate - a.completionRate)[0];

  const mostCompletedOperation = projects
    ?.filter((project) => project.model.type === 'operation')
    .sort((a, b) => b.completionRate - a.completionRate)[0];

  const mostCompletedProject = projects
    ?.filter((project) => project.model.type === 'project')
    .sort((a, b) => b.completionRate - a.completionRate)[0];

  const moveChecklistStep = (amount: number) => {
    setActive(active + amount);
  };

  const steps = [
    {
      title: 'Créez un projet',
      content: (
        <div>
          Pour créer un projet:
          <ol>
            <li>
              Rendez-vous sur{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigate('/');
                }}
              >
                la page d'accueil
              </a>
            </li>
            <li>
              Cliquez sur le bouton{' '}
              <TextIcon style={{ backgroundColor: 'var(--green)' }}>
                <AddIcon /> projet
              </TextIcon>{' '}
              en <b>bas</b> de l'interface.
            </li>
            <li>Laissez vous guider</li>
          </ol>
        </div>
      ),
      success: projects?.some((project) => project.model.type === 'project'),
    },
    {
      title: 'Renseignez votre projet à plus de 50%',
      content: (
        <div>
          {mostCompletedProject && (
            <>
              <Indicator>
                <p>
                  Complété à <b>{mostCompletedProject.completionRate}%</b>
                </p>
                <CompletionBar
                  completion={mostCompletedProject.completionRate}
                ></CompletionBar>
              </Indicator>
              <ol>
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (mostCompletedProject) {
                        navigate('/project/' + mostCompletedProject?._id);
                      }
                    }}
                  >
                    la page du projet
                  </a>
                </li>
                <li>
                  Continuez de compléter le formulaire jusqu'à atteindre 50% de
                  complétion
                </li>
              </ol>
            </>
          )}
          {!mostCompletedProject && (
            <>
              Commencez par{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  moveChecklistStep(-1);
                }}
              >
                créer un projet
              </a>
            </>
          )}
        </div>
      ),
      locked: !projects?.some((project) => project.model.type === 'project'),
      success: projects?.some(
        (project) =>
          project.model.type === 'project' && project.completionRate > 50,
      ),
    },

    {
      title:
        "Utilisez le module mobilité pour calculer les émissions des trajets d'un projet",
      content: (
        <>
          {mostCompletedProject &&
            mostCompletedProject.completionRate > 50 && (
              <ol>
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (mostCompletedProject) {
                        navigate('/project/' + mostCompletedProject?._id, {
                          state: { scrollTo: `#Mobilit__des__quipes_0` },
                        });
                      }
                    }}
                  >
                    la page projet
                  </a>
                </li>
                <li>
                  Ouvrez{' '}
                  <a
                    href="/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (mostCompletedProject) {
                        navigate(
                          '/project/' + mostCompletedProject?._id + '/tour',
                        );
                      }
                    }}
                  >
                    le calculateur mobilité
                  </a>
                </li>
                <li>Laissez vous guider</li>
                <li>Créez au moins 2 trajets</li>
              </ol>
            )}
          {!mostCompletedProject && (
            <>
              Commencez par{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  moveChecklistStep(-2);
                }}
              >
                créer votre projet
              </a>
            </>
          )}
          {mostCompletedProject &&
            !(mostCompletedProject.completionRate > 50) && (
              <>
                Continuez à{' '}
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    moveChecklistStep(-1);
                  }}
                >
                  compléter votre projet
                </a>
              </>
            )}
        </>
      ),
      locked: !projects?.some(
        (project) =>
          project.model.type === 'project' && project.completionRate > 50,
      ),
      success: projects?.some(
        (project) =>
          project?.tour?.steps?.reduce((totalNb: number, step: any) => {
            return totalNb + step.travels.length;
          }, 0) >= 2,
      ),
    },
    {
      title: 'Créez un bâtiment / site',
      content: (
        <div>
          Pour créer un bâtiment / site:
          <ol>
            <li>
              Rendez-vous sur{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigate('/');
                }}
              >
                la page d'accueil
              </a>
            </li>
            <li>
              Cliquez sur le bouton{' '}
              <TextIcon>
                <AddIcon /> bâtiment / site
              </TextIcon>{' '}
              en haut à gauche de l'interface.
            </li>
            <li>Laissez vous guider</li>
          </ol>
        </div>
      ),
      success: projects?.some((project) => project.model.type === 'building'),
    },
    {
      title: 'Renseignez un bâtiment / site à plus de 50%',
      content: (
        <div>
          {mostCompletedBuilding && (
            <>
              <Indicator>
                <p>
                  Complété à <b>{mostCompletedBuilding.completionRate}%</b>
                </p>
                <CompletionBar
                  completion={mostCompletedBuilding.completionRate}
                ></CompletionBar>
              </Indicator>
              <ol>
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (mostCompletedBuilding) {
                        navigate('/project/' + mostCompletedBuilding?._id);
                      }
                    }}
                  >
                    la page d'un bâtiment / site
                  </a>
                </li>
                <li>
                  Continuez de compléter le formulaire jusqu'à atteindre 50% de
                  complétion
                </li>
              </ol>
            </>
          )}
          {!mostCompletedBuilding && (
            <>
              Commencez par{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  moveChecklistStep(-1);
                }}
              >
                créer un bâtiment / site
              </a>
            </>
          )}
        </div>
      ),
      locked: !projects?.some((project) => project.model.type === 'building'),
      success: projects?.some(
        (project) =>
          project.model.type === 'building' && project.completionRate > 50,
      ),
    },
    {
      title: 'Créez un fonctionnement',
      content: (
        <div>
          Pour créer un fonctionnement:
          <ol>
            <li>
              Rendez-vous sur{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  navigate('/');
                }}
              >
                la page d'accueil
              </a>
            </li>
            <li>
              Cliquez sur le bouton{' '}
              <TextIcon>
                <AddIcon /> fonctionnement
              </TextIcon>{' '}
              en haut à <b>droite</b> de l'interface.
            </li>
            <li>Laissez vous guider</li>
          </ol>
        </div>
      ),
      success: projects?.some((project) => project.model.type === 'operation'),
    },
    {
      title: 'Renseignez un fonctionnement à plus de 50%',
      content: (
        <div>
          {mostCompletedOperation && (
            <>
              <Indicator>
                <p>
                  Complété à <b>{mostCompletedOperation.completionRate}%</b>
                </p>
                <CompletionBar
                  completion={mostCompletedOperation.completionRate}
                ></CompletionBar>
              </Indicator>
              <ol>
                <li>
                  Rendez-vous sur{' '}
                  <a
                    href="/"
                    onClick={(event) => {
                      event.preventDefault();
                      if (mostCompletedOperation) {
                        navigate('/project/' + mostCompletedOperation?._id);
                      }
                    }}
                  >
                    la page d'un fonctionnement
                  </a>
                </li>
                <li>
                  Continuez de compléter le formulaire jusqu'à atteindre 50% de
                  complétion
                </li>
              </ol>
            </>
          )}
          {!mostCompletedOperation && (
            <>
              Commencez par{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  moveChecklistStep(-1);
                }}
              >
                créer un fonctionnement
              </a>
            </>
          )}
        </div>
      ),
      locked: !projects?.some((project) => project.model.type === 'operation'),
      success: projects?.some(
        (project) =>
          project.model.type === 'operation' && project.completionRate > 50,
      ),
    },
    {
      title: 'Utilisez bâtiment / site et fonctionnement dans un projet',
      content: (
        <>
          {mostCompletedProject && (
            <ol>
              <li>
                Rendez-vous sur{' '}
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    if (mostCompletedProject) {
                      navigate('/project/' + mostCompletedProject?._id, {
                        state: { scrollTo: `#Fonctionnement_0` },
                      });
                    }
                  }}
                >
                  la page projet
                </a>
              </li>
              <li>
                Sur{' '}
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    if (mostCompletedProject) {
                      navigate('/project/' + mostCompletedProject?._id, {
                        state: { scrollTo: `#Fonctionnement_0` },
                      });
                    }
                  }}
                >
                  la partie fonctionnement
                </a>{' '}
                :
                <ul>
                  <li>Choisissez le fonctionnement créé précédemment</li>
                  <li>
                    Indiquez le pourcentage du temps de travail à attribuer à ce
                    projet
                  </li>
                </ul>
              </li>

              <li>
                Sur{' '}
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    if (mostCompletedProject) {
                      navigate('/project/' + mostCompletedProject?._id, {
                        state: { scrollTo: `#Energie_0` },
                      });
                    }
                  }}
                >
                  la partie énérgie
                </a>{' '}
                :
                <ul>
                  <li>Choisissez le bâtiment / site créé précédemment</li>
                  <li>Indiquez le nombre de jour d'utilisation</li>
                </ul>
              </li>
            </ol>
          )}
          {!mostCompletedProject && (
            <>
              Commencez par{' '}
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  setActive(0);
                }}
              >
                créer un projet
              </a>
            </>
          )}
        </>
      ),
      locked: !projects?.some((project) => project.model.type === 'project'),
      success: projects?.some(
        (project) =>
          project.references?.filter((ref) => ref.value.length > 0).length >= 2,
      ),
    },
  ];

  return { active, setActive, steps };
};

export default useSteps;
