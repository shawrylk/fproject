import { WritableDraft } from "immer";
export interface BaseObject {
  uuid: string;
  partIndex?: number;
}

type MapType<T> = Record<string, T>;
export interface SliceProps<T> {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;

  byUid: MapType<T>;
  items: T[];

  add: (items: T | T[]) => boolean;
  remove: (items: T | T[]) => boolean;
  clear: () => void;
}

export function getSliceInitialState<T>(): Partial<SliceProps<T>> {
  return {
    isEnabled: true,
    byUid: {},
    items: [],
  };
}

export const getObjectStoreKey = (obj: BaseObject) =>
  `${obj.uuid}${obj.partIndex !== undefined ? `-${obj.partIndex}` : ""}`;

export interface TStore<TSliceProps> {
  [key: string]: {
    [key: string]: TSliceProps;
  };
}

export function createObjectSlice<
  TObj extends BaseObject,
  TSliceProps extends SliceProps<TObj>
>(
  sliceName: keyof TStore<TSliceProps>,
  propName: keyof TStore<TSliceProps>[keyof TStore<TSliceProps>]
) {
  return (
    set: (fn: (state: WritableDraft<TStore<TSliceProps>>) => void) => void,
    get: () => TStore<TSliceProps>
  ): SliceProps<TObj> => ({
    isEnabled: true,
    setIsEnabled: (enabled: boolean) => {
      set((draft) => {
        const slice = draft[sliceName] as WritableDraft<
          TStore<TSliceProps>[keyof TStore<TSliceProps>]
        >;
        const prop = slice[propName];
        prop.isEnabled = enabled;
      });
    },

    byUid: {} as MapType<TObj>,
    items: [],

    add: (objects: TObj | TObj[]) => {
      const slice = get()[sliceName][propName];
      if (!slice.isEnabled) return false;

      const arr = Array.isArray(objects) ? objects : [objects];

      let byUid: MapType<TObj> | null = null;
      for (const obj of arr) {
        const key = getObjectStoreKey(obj);
        if (slice.byUid[key] !== obj) {
          byUid ??= { ...slice.byUid };
          byUid[key] = obj;
        }
      }
      if (byUid) {
        set((draft) => {
          const obj = draft[sliceName][propName] as any;
          obj.byUid = byUid;
          obj.items = Object.values(byUid);
        });
      }
      return !!byUid;
    },

    remove: (objects: TObj | TObj[]) => {
      const slice = get()[sliceName][propName];
      if (!slice.isEnabled) return false;

      const arr = Array.isArray(objects) ? objects : [objects];

      let byUid: MapType<TObj> | null = null;
      for (const obj of arr) {
        const key = getObjectStoreKey(obj);
        if (slice.byUid[key]) {
          byUid ??= { ...slice.byUid };
          delete byUid[key];
        }
      }

      if (byUid) {
        set((draft) => {
          const obj = draft[sliceName][propName] as any;
          obj.byUid = byUid;
          obj.items = Object.values(byUid);
        });
      }
      return !!byUid;
    },

    clear: () => {
      const { isEnabled, items } = get()[sliceName][propName];
      if (!isEnabled || !items.length) return;
      set((draft) => {
        const obj = draft[sliceName][propName];
        obj.byUid = {};
        obj.items = [];
      });
    },
  });
}
