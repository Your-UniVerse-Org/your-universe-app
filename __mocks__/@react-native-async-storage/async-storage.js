// Jest manual mock for @react-native-async-storage/async-storage — a node_modules package
// mock placed here (adjacent to node_modules, not under __tests__) is applied automatically
// to every test, with no jest.mock() call needed, per Jest's manual-mock convention. Without
// this, any test that transitively imports the real native module (e.g. via
// components/SessionContext.tsx) fails with "[@RNC/AsyncStorage]: NativeModule: AsyncStorage
// is null" — there is no native module to link under Jest. Re-exports the package's own
// official in-memory mock; see https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
module.exports = require("@react-native-async-storage/async-storage/jest/async-storage-mock");
