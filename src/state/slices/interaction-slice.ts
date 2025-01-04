import { StateCreator } from "zustand";
import { Object3D, Vector2Like } from "three";
import {
  createObjectSlice,
  getSliceInitialState,
  SliceProps,
} from "../utils/createObjectStore";

export type InteractiveObjectsPredicate = <TObject extends Object3D>(
  object: TObject
) => boolean;
export type CurryingInterativeObjectsPredicate = <TObject extends Object3D>(
  currentObjects: TObject[] | undefined
) => InteractiveObjectsPredicate;
export type InteractiveObjectInfo = Object3D & { partIndex?: number };
export enum InteractionMode {
  Full,
  Partial,
}
export interface InteractionSliceProps {
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;

  interactionRadius: number;
  setInteractionRadius: (radius?: number) => void;
  interactiveObjectsPredicate: InteractiveObjectsPredicate | undefined;
  setInteractiveObjectsPredicate: (
    predicate: InteractiveObjectsPredicate | undefined
  ) => void;
  reset: () => void;
  // Misc
  selected: SliceProps<InteractiveObjectInfo> & {
    rangeSelectionEnabled: boolean;
    setRangeSelectionEnabled: (enabled: boolean) => void;
  };
  hovered: SliceProps<InteractiveObjectInfo>;
  preview: SliceProps<InteractiveObjectInfo> & {
    selectionPoints: Vector2Like[];
    setSelectedPoints: (points: Vector2Like[]) => void;
  };
}
export interface InteractionSlice extends TStore<SliceProps<InteractionMode>> {
  interaction: InteractionSliceProps;
}

const selectedSliceCreator = createObjectSlice<
  InteractiveObjectInfo,
  SliceProps<InteractiveObjectInfo>
  // Record<string, Record<string, SliceProps<InteractiveObjectInfo>>>
>("interaction", "selected");
const hoveredSliceCreator = createObjectSlice<
  InteractiveObjectInfo,
  SliceProps<InteractiveObjectInfo>
>("interaction", "hovered");
const previewSliceCreator = createObjectSlice<
  InteractiveObjectInfo,
  SliceProps<InteractiveObjectInfo>
>("interaction", "preview");

const DEFAULT_QUERY_RADIUS = 5;
export const createInteractionSlice: StateCreator<
  InteractionSlice,
  [["zustand/immer", never]],
  [],
  InteractionSlice
> = (set, get) => {
  return {
    interaction: {
      mode: InteractionMode.Full,
      setMode: (mode: InteractionMode) =>
        set((draft) => {
          draft.interaction.mode = mode;
        }),

      interactionRadius: DEFAULT_QUERY_RADIUS,
      setInteractionRadius: (radius = DEFAULT_QUERY_RADIUS) =>
        set((draft) => {
          draft.interaction.interactionRadius = radius;
        }),
      interactiveObjectsPredicate: undefined,
      setInteractiveObjectsPredicate: (predicate) =>
        set((draft) => {
          draft.interaction.interactiveObjectsPredicate = predicate;
        }),
      reset: () =>
        set((draft) => {
          const state = get().interaction;
          draft.interaction = {
            ...state,
            mode: InteractionMode.Full,
            interactionRadius: DEFAULT_QUERY_RADIUS,
            interactiveObjectsPredicate: undefined,
            // Misc
            selected: {
              ...state.selected,
              ...getSliceInitialState<InteractiveObjectInfo>(),
              rangeSelectionEnabled: true,
            },
            hovered: {
              ...state.hovered,
              ...getSliceInitialState<InteractiveObjectInfo>(),
            },
            preview: {
              ...state.preview,
              ...getSliceInitialState<InteractiveObjectInfo>(),
              selectionPoints: [],
            },
          };
        }),
      // Misc
      selected: {
        ...selectedSliceCreator(set, get),
        rangeSelectionEnabled: true,
        setRangeSelectionEnabled: (enabled: boolean) =>
          set((draft) => {
            draft.interaction.selected.rangeSelectionEnabled = enabled;
          }),
      },
      hovered: { ...hoveredSliceCreator(set, get) },
      preview: {
        ...previewSliceCreator(set, get),
        selectionPoints: [],
        setSelectedPoints: (points: Vector2Like[]) => {
          if (
            points.length === 0 &&
            get().interaction.preview.selectionPoints.length === 0
          )
            return;
          set((draft) => {
            draft.interaction.preview.selectionPoints = points;
          });
        },
      },
    },
  };
};
