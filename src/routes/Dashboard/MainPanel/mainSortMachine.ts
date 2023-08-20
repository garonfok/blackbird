import {
  AnyEventObject,
  BaseActionObject,
  Event,
  EventData,
  ResolveTypegenMeta,
  SCXML,
  ServiceMap,
  SingleOrArray,
  State,
  TypegenDisabled,
  createMachine,
} from "xstate";

export const mainSortMachine = createMachine({
  id: "steps",
  predictableActionArguments: true,
  initial: "neutral",
  states: {
    neutral: {
      on: {
        CLICK: "titleAsc",
        RESET: "neutral",
      },
    },
    titleAsc: {
      on: {
        CLICK: "titleDesc",
        RESET: "neutral",
      },
    },
    titleDesc: {
      on: {
        CLICK: "composersAsc",
        RESET: "neutral",
      },
    },
    composersAsc: {
      on: {
        CLICK: "composersDesc",
        RESET: "neutral",
      },
    },
    composersDesc: {
      on: {
        CLICK: "neutral",
        RESET: "neutral",
      },
    },
  },
});

export type StepState = State<
  unknown,
  AnyEventObject,
  any,
  {
    value: any;
    context: unknown;
  },
  ResolveTypegenMeta<
    TypegenDisabled,
    AnyEventObject,
    BaseActionObject,
    ServiceMap
  >
>;

export type StepEvent = (
  event: SCXML.Event<AnyEventObject> | SingleOrArray<Event<AnyEventObject>>,
  payload?: EventData | undefined
) => any;
