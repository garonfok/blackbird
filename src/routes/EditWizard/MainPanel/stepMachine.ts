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

export const stepsMachine = createMachine({
  id: "steps",
  predictableActionArguments: true,
  initial: "generalInfo",
  states: {
    generalInfo: {
      on: {
        NEXT: "musicians",
      },
    },
    musicians: {
      on: {
        NEXT: "parts",
        PREVIOUS: "generalInfo",
      },
    },
    parts: {
      on: {
        NEXT: "scores",
        PREVIOUS: "musicians",
      },
    },
    scores: {
      on: {
        NEXT: "files",
        PREVIOUS: "parts",
      },
    },
    files: {
      on: {
        FINISH: "generalInfo",
        PREVIOUS: "parts",
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
