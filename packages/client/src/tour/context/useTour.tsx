import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import { initialState, reducer, TourActionType, TourState } from './reducer';
import { Step, Tour, TourEvent, Travel, TravelLoad, TravelType } from './types';

interface TourContextType {
  tour?: Step[];
  expanded: {
    index: number;
    type: string;
  } | null;

  addStep: (afterStepId?: string) => void;
  removeStep: (stepId: string) => void;
  updateStep: (stepId: string, data: any) => void;

  addEvent: (stepId: string) => void;
  removeEvent: (stepId: string, eventId: string) => void;
  updateEvent: (stepId: string, eventId: string, data: any) => void;

  addTravel: (stepId: string, type: TravelType, load: TravelLoad) => void;
  removeTravel: (stepId: string, travelId: string) => void;
  updateTravel: (stepId: string, travelId: string, data: any) => void;
  setExpanded: (index: number | null, type?: string) => void;
}

export const TourContext = createContext<TourContextType>({
  expanded: null,
  addStep: () => {},
  removeStep: () => {},
  updateStep: () => {},
  addEvent: () => {},
  removeEvent: () => {},
  updateEvent: () => {},
  addTravel: () => {},
  removeTravel: () => {},
  updateTravel: () => {},
  setExpanded: () => {},
});

TourContext.displayName = 'TourContext';

export const Provider = ({
  children,
  value,
  onChange,
}: {
  children: ReactNode;
  value?: TourState;
  onChange?: (tour: Tour) => void;
}) => {
  const [state, dispatch] = useReducer(reducer, value || initialState);

  useEffect(() => {
    onChange && onChange(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const newValue = {
    tour: state.steps,
    expanded: state.expanded,

    addStep: (afterStepId?: string) => {
      dispatch({ type: TourActionType.ADD_STEP, payload: { afterStepId } });
    },
    removeStep: (stepId: string) => {
      dispatch({ type: TourActionType.REMOVE_STEP, payload: { stepId } });
    },
    updateStep: (stepId: string, data: Partial<Step>) => {
      dispatch({ type: TourActionType.UPDATE_STEP, payload: { stepId, data } });
    },

    addEvent: (stepId: string) => {
      dispatch({ type: TourActionType.ADD_EVENT, payload: { stepId } });
    },
    removeEvent: (stepId: string, eventId: string) => {
      dispatch({
        type: TourActionType.REMOVE_EVENT,
        payload: { stepId, eventId },
      });
    },
    updateEvent: (
      stepId: string,
      eventId: string,
      data: Partial<TourEvent>,
    ) => {
      dispatch({
        type: TourActionType.UPDATE_EVENT,
        payload: { stepId, eventId, data },
      });
    },

    addTravel: (stepId: string, type: TravelType, load: TravelLoad) => {
      dispatch({
        type: TourActionType.ADD_TRAVEL,
        payload: { stepId, type, load },
      });
    },
    removeTravel: (stepId: string, travelId: string) => {
      dispatch({
        type: TourActionType.REMOVE_TRAVEL,
        payload: { stepId, travelId },
      });
    },
    updateTravel: (stepId: string, travelId: string, data: Partial<Travel>) => {
      dispatch({
        type: TourActionType.UPDATE_TRAVEL,
        payload: { stepId, travelId, data },
      });
    },

    setExpanded: (index: number | null, type?: string) => {
      if (index === null) {
        dispatch({
          type: TourActionType.SET_EXPANDED,
          payload: null,
        });
        return;
      }
      dispatch({
        type: TourActionType.SET_EXPANDED,
        payload: { index, type },
      });
    },
  };

  return (
    <TourContext.Provider value={newValue}>{children}</TourContext.Provider>
  );
};

const useTour = () => useContext(TourContext);

export default useTour;
