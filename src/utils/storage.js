import { Preferences } from '@capacitor/preferences';

export const Storage = {
  get: async (key) => {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },
  set: async (key, value) => {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  },
  remove: async (key) => {
    await Preferences.remove({ key });
  },
  clear: async () => {
    await Preferences.clear();
  },
};