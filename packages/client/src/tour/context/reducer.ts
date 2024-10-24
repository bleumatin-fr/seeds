import { v4 as uuidv4 } from 'uuid';

import { Step, Tour, TourEvent } from './types';

type ExpandedAddon = {
  expanded: {
    index: number;
    type: string;
  } | null;
};

export type TourState = Tour & ExpandedAddon;

export const initialState: TourState = {
  expanded: { index: 1, type: 'location' },
  steps: [
    {
      id: uuidv4(),
      order: 0,
      events: [
        {
          id: uuidv4(),
          order: 0,
          name: '',
          numberOfSeats: 0,
        },
      ],
      travels: [],
    },
    {
      id: uuidv4(),
      order: 1,
      events: [
        {
          id: uuidv4(),
          order: 0,
          name: '',
          numberOfSeats: 0,
        },
      ],
      travels: [],
    },
  ],
};

const defaultEvent: Partial<TourEvent> = {
  name: null,
  numberOfSeats: 0,
};
const defaultStep: Partial<Step> = {
  events: [{ id: uuidv4(), order: 0, name: '', numberOfSeats: 0 }],
  travels: [],
};

const defaultTravel: Partial<TourEvent> = {
  name: null,
  numberOfSeats: 0,
};

export enum TourActionType {
  ADD_STEP = 'ADD_STEP',
  REMOVE_STEP = 'REMOVE_STEP',
  UPDATE_STEP = 'UPDATE_STEP',

  ADD_EVENT = 'ADD_EVENT',
  REMOVE_EVENT = 'REMOVE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',

  ADD_TRAVEL = 'ADD_TRAVEL',
  REMOVE_TRAVEL = 'REMOVE_TRAVEL',
  UPDATE_TRAVEL = 'UPDATE_TRAVEL',

  SET_EXPANDED = 'SET_EXPANDED',
}

interface TourAction {
  type: TourActionType;
  payload?: any;
}

const hasId = (id: string) => (entity: any) => id === entity.id;
const notHasId = (id: string) => (entity: any) => id !== entity.id;

const orderBelow = (order: number) => (entity: any) => entity.order < order;
const orderAboveOrEqual = (order: number) => (entity: any) =>
  entity.order >= order;

const increaseOrder = (entity: any) => ({ ...entity, order: entity.order + 1 });

export const reducer = (state: TourState, action: TourAction) => {
  const { type, payload } = action;
  switch (type) {
    case TourActionType.ADD_STEP: {
      const { afterStepId } = payload;

      let order;
      if (afterStepId) {
        let afterStep = state.steps.find(hasId(afterStepId));
        if (!afterStep) {
          return state;
        }
        order = afterStep.order + 1;
      } else {
        order = state.steps.length;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(orderBelow(order)),
          ...state.steps.filter(orderAboveOrEqual(order)).map(increaseOrder),
          {
            ...defaultStep,
            id: uuidv4(),
            order,
          },
        ],
      };
    }
    case TourActionType.REMOVE_STEP: {
      const { stepId } = payload;
      return {
        ...state,
        steps: state.steps.filter(notHasId(stepId)),
      };
    }
    case TourActionType.UPDATE_STEP: {
      const { stepId, data } = payload;
      const stepToChange = state.steps.find(hasId(stepId));
      if (!stepToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            ...data,
          },
        ],
      };
    }
    case TourActionType.ADD_EVENT: {
      const { stepId } = payload;
      const stepToChange = state.steps.find(hasId(stepId));

      if (!stepToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            events: [
              ...stepToChange.events,
              {
                ...defaultEvent,
                id: uuidv4(),
                order: stepToChange.events.length,
              },
            ],
          },
        ],
      };
    }
    case TourActionType.REMOVE_EVENT: {
      const { stepId, eventId } = payload;
      const stepToChange = state.steps.find(hasId(stepId));

      if (!stepToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            events: [...stepToChange.events.filter(notHasId(eventId))],
          },
        ],
      };
    }
    case TourActionType.UPDATE_EVENT: {
      const { stepId, eventId, data } = payload;

      const stepToChange = state.steps.find(hasId(stepId));
      if (!stepToChange) {
        return state;
      }

      const eventToChange = stepToChange.events.find(hasId(eventId));
      if (!eventToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            events: [
              ...stepToChange.events.filter(notHasId(eventId)),
              {
                ...eventToChange,
                ...data,
              },
            ],
          },
        ],
      };
    }
    case TourActionType.ADD_TRAVEL: {
      const { stepId, type: travelType, load: travelLoad } = payload;

      const stepToChange = state.steps.find(hasId(stepId));
      if (!stepToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            travels: [
              ...stepToChange.travels,
              {
                ...defaultTravel,
                id: uuidv4(),
                type: travelType,
                load: travelLoad,
                order: stepToChange.travels.length,
              },
            ],
          },
        ],
      };
    }
    case TourActionType.REMOVE_TRAVEL: {
      const { stepId, travelId } = payload;

      const stepToChange = state.steps.find(hasId(stepId));
      if (!stepToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            travels: [...stepToChange.travels.filter(notHasId(travelId))],
          },
        ],
      };
    }
    case TourActionType.UPDATE_TRAVEL: {
      const { stepId, travelId, data } = payload;

      const stepToChange = state.steps.find(hasId(stepId));
      if (!stepToChange) {
        return state;
      }

      const travelToChange = stepToChange.travels.find(hasId(travelId));
      if (!travelToChange) {
        return state;
      }

      return {
        ...state,
        steps: [
          ...state.steps.filter(notHasId(stepId)),
          {
            ...stepToChange,
            travels: [
              ...stepToChange.travels.filter(notHasId(travelId)),
              {
                ...travelToChange,
                ...data,
              },
            ],
          },
        ],
      };
    }
    case TourActionType.SET_EXPANDED: {
      return {
        ...state,
        expanded: payload,
      };
    }
    default:
      return state;
  }
};
