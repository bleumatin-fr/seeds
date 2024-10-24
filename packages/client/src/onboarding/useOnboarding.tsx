import { useEffect } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';

import useSteps from './useSteps';

export enum OnboardingStep {
  WELCOME = 0,
  CHECKLIST = 1,
  SUCCESS = 2,
  DONE = 3,
}

const useOnboarding = () => {
  const [tooltipShown, setTooltipShown] = useSessionStorage(
    'seeds-onboarding-tooltip-shown',
    false,
  );
  const [forceChecklist, setForceChecklist] = useLocalStorage(
    'seeds-onboarding-force-checklist',
    false,
  );
  const [step, setStep] = useLocalStorage(
    'seeds-onboarding-step',
    OnboardingStep.WELCOME,
  );

  const [collapsed, setCollapsed] = useLocalStorage(
    'seeds-onboarding-collapsed',
    false,
  );

  const { active, setActive, steps } = useSteps();

  useEffect(() => {
    if (step !== OnboardingStep.CHECKLIST) {
      return;
    }
    if (!forceChecklist) {
      if (active === steps.length) {
        setStep(OnboardingStep.SUCCESS);
        setActive(0);
        return;
      }
      if (steps[active]?.success) {
        setActive(active + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, setActive, steps]);

  return {
    tooltipShown,
    setTooltipShown,
    step,
    steps,
    setStep: (step: OnboardingStep, force = false) => {
      if (force) {
        setForceChecklist(force);
        setActive(0);
      }
      setStep(step);
    },
    collapsed,
    setCollapsed,
    checklistStep: active,
    setChecklistStep: setActive,
    enabledTour:
      step === OnboardingStep.CHECKLIST && active === 2 ? 'transport' : null,
    disabledModules: {
      transport: step === OnboardingStep.CHECKLIST && active < 2,
      multimodel: step === OnboardingStep.CHECKLIST && active !== 7,
    },
  };
};

export default useOnboarding;
