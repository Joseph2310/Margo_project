/* eslint-env jest */

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const values = new Map();
    return {
      getString: key => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: key => values.delete(key),
      clearAll: () => values.clear(),
      contains: key => values.has(key),
      getAllKeys: () => Array.from(values.keys()),
    };
  },
}));
