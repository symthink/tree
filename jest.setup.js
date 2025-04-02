import '@testing-library/jest-native/extend-expect';

// Mock react-native-web
jest.mock('react-native-web', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Platform: {
      ...rn.Platform,
      OS: 'web',
      select: jest.fn((obj) => obj.web),
    },
  };
});

// Mock react-native
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    Platform: {
      ...rn.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
  };
}); 