import Checklist from './Checklist';
import SuccessModal from './SuccessModal';
import useOnboarding, { OnboardingStep } from './useOnboarding';
import WelcomeModal from './WelcomeModal';

const Onboarding = () => {
  const { step, setStep, setCollapsed } = useOnboarding();

  const nextStep = () => {
    setStep(step + 1);
  };

  const finish = () => {
    setStep(OnboardingStep.DONE);
    setCollapsed(true);
  };

  if (step === OnboardingStep.DONE) return null;

  return (
    <>
      <WelcomeModal
        open={step === OnboardingStep.WELCOME}
        onConfirm={nextStep}
        onCancel={finish}
      />
      <Checklist
        visible={step === OnboardingStep.CHECKLIST}
        onDone={nextStep}
        onDismiss={finish}
      ></Checklist>
      <SuccessModal open={step === OnboardingStep.SUCCESS} onClose={finish} />
    </>
  );
};

export default Onboarding;
