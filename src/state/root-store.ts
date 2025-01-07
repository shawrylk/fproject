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
    immer((...state) => {
      const [set, get, store] = state;
      return {
        ...createInteractionSlice(set as any, get, store as any),
        reset: () => {
          console.log(state);
        },
      };
    })
  )
);
