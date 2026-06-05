import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  projects: [
    {
      displayName: "nodemailer",
      testMatch: ["<rootDir>/packages/nodemailer/tests/**/*.test.ts"],
      moduleFileExtensions: ["ts", "js"],
      transform: {
        "^.+\\.ts$": "ts-jest"
      }

    },
    {
      displayName: "sendlix",
      testMatch: ["<rootDir>/packages/sendlix/tests/**/*.test.ts"],
      moduleFileExtensions: ["ts", "js"],
      transform: {
        "^.+\\.ts$": "ts-jest"
      }
    }
  ]
};

export default config;
