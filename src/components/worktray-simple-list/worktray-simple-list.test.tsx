import React from "react";

import {
  getTenureV1,
  mockActiveTenureV1,
  mockProcessV1,
  render,
  server,
} from "@hackney/mtfh-test-utils";
import { screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";

import { locale } from "../../services";
import { WorktraySimpleList } from "./worktray-simple-list";

const get = (path: string, data: unknown, code = 200): void => {
  server.use(
    rest.get(path, (req, res, ctx) => {
      return res(ctx.status(code), ctx.json(data));
    }),
  );
};

const mockProcessesResponse = {
  results: [
    {
      ...mockProcessV1,
      targetId: "103f3080-16d6-40fb-9273-f741ec73f7e4",
      targetType: "tenure",
      relatedEntities: [
        {
          id: "103f3080-16d6-40fb-9273-f741ec73f7e40",
          targetType: "person",
          subType: "householdMember",
          description: "Mr Ersan Kuneri",
        },
      ],
      processName: "soletojoint",
      currentState: {
        state: "DocumentsRequestedAppointment",
        createdAt: "2022-06-24T07:49:07.7892599Z",
        updatedAt: "2022-06-24T07:49:07.78926Z",
      },
    },
    {
      ...mockProcessV1,
      id: "39273cf3-6a78-45e1-32d4-b9637e310527",
      targetId: "39273cf3-6a78-45e1-32d4-b9637e310527",
      targetType: "tenure",
      relatedEntities: [
        {
          id: "39273cf3-6a78-45e1-32d4-b9637e310527",
          targetType: "person",
          subType: "householdMember",
          description: "Miss Perihan Abla",
        },
      ],
      processName: "soletojoint",
      currentState: {
        state: "AutomatedChecksPassed",
        createdAt: "2022-05-10T07:49:07.7892599Z",
        updatedAt: "2022-07-24T07:49:07.78926Z",
      },
    },
  ],
  paginationDetails: {
    nextToken: "nextToken",
  },
};

describe("WorktraySimpleList", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("WorktraySimpleList renders correctly", async () => {
    get("/api/v1/process", mockProcessesResponse);
    server.use(getTenureV1(mockActiveTenureV1, 200));

    const { container } = render(<WorktraySimpleList targetId="123" />);
    await waitForElementToBeRemoved(screen.queryByText(/Loading/));
    expect(container).toMatchSnapshot();
  });

  test("it renders WorktraySimpleList with no results", async () => {
    get("/api/v1/process", { paginationDetails: { nextToken: null }, results: [] });
    render(<WorktraySimpleList targetId="123" />);
    await expect(screen.findByText(/No processes/)).resolves.toBeInTheDocument();
  });

  test("it pages the results", async () => {
    get("/api/v1/process", mockProcessesResponse);
    render(<WorktraySimpleList targetId="123" />);

    await expect(screen.findByText(/Next/)).resolves.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/Previous/)).toBe(null));

    await userEvent.click(screen.getByText(/Next/));
    await waitFor(() => expect(screen.queryByText(/Next/)).toBe(null));
    await expect(screen.findByText(/Previous/)).resolves.toBeInTheDocument();

    await userEvent.click(screen.getByText(/Previous/));
    await waitFor(() => expect(screen.queryByText(/Previous/)).toBe(null));
  });

  test("it does not render pagination unnecessarily", async () => {
    get("/api/v1/process", {
      ...mockProcessesResponse,
      paginationDetails: { nextToken: null },
    });
    render(<WorktraySimpleList targetId="123" />);

    await waitFor(() => expect(screen.queryByText(/Next/)).toBe(null));
  });

  test("it renders error", async () => {
    get("/api/v1/process", null, 500);
    render(<WorktraySimpleList targetId="123" />);

    await expect(
      screen.findByText(locale.errors.unableToFetchRecord),
    ).resolves.toBeInTheDocument();
  });
});
