module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s$",
};
