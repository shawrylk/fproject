import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import {
  createInteractionSlice,
  InteractionSlice,
} from "./slices/interaction-slice";

interface StoreProps {
  reset: () => void;
}

type RootStore = StoreProps & InteractionSlice;

export const useRootStore = createWithEqualityFn<RootStore>()(
  subscribeWithSelector(
    immer((...states) => ({
      ...createInteractionSlice(...states),
      reset: () => {
        console.log(states);
      },
    }))
  )
);
