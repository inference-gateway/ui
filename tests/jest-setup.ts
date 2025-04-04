import { jest } from "@jest/globals";
import "@testing-library/jest-dom";

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      expires: "1",
    },
    status: "authenticated",
  })),
  getSession: jest.fn(() =>
    Promise.resolve({
      user: {
        name: "Test User",
        email: "test@example.com",
      },
      expires: "1",
    })
  ),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
