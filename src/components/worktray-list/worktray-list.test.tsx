import React from "react";

import { mockPersonV1, mockProcessV1, render, server } from "@hackney/mtfh-test-utils";
import { fireEvent, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { subDays } from "date-fns";
import { rest } from "msw";

import { WorktrayProvider, WorktrayURLProvider } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayList } from "./worktray-list";

const apiUrl = "/api/v1/search/processes";

const mockWorktrayResults = [
  {
    ...mockProcessV1,
    processName: "soletojoint",
    targetType: "tenure",
    state: "BreachChecksPassed",
    stateStartedAt: subDays(new Date(), 2).toISOString(),
    processCreatedAt: "2022-08-20T07:49:07.7892599Z",
    relatedEntities: [
      {
        id: mockPersonV1.id,
        description: `${mockPersonV1.firstName} ${mockPersonV1.surname}`,
        targetType: "person",
        subType: "",
      },
    ],
    patchAssignment: {
      patchId: "19400185-a8d2-4f3f-b217-dc5d485a1210",
      patchName: "CP7",
      responsibleEntityId: "5f93ea0f-0986-4e49-9093-b033559ed8f0",
      responsibleName: null,
    },
  },
];

describe("worktray-list-component", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("it renders correctly", async () => {
    const worktrayResult = { ...mockWorktrayResults[0], processName: 0 };
    server.use(
      rest.get(apiUrl, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            results: { processes: [...mockWorktrayResults, worktrayResult] },
          }),
        );
      }),
    );
    const { container } = render(
      <WorktrayProvider initial={{}}>
        <WorktrayList />
      </WorktrayProvider>,
    );
    await waitForElementToBeRemoved(screen.queryByText(/Loading/));
    expect(container).toMatchSnapshot();
  });

  test("it renders correctly when no results", async () => {
    server.use(
      rest.get(apiUrl, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ results: { processes: [] } }));
      }),
    );
    const { container } = render(
      <WorktrayProvider initial={{}}>
        <WorktrayList />
      </WorktrayProvider>,
    );
    await waitForElementToBeRemoved(screen.queryByText(/Loading/));
    expect(container).toMatchSnapshot();
  });

  test("it renders error", async () => {
    server.use(
      rest.get(apiUrl, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({}));
      }),
    );
    render(
      <WorktrayProvider initial={{}}>
        <WorktrayList />
      </WorktrayProvider>,
    );
    await waitForElementToBeRemoved(screen.queryByText(/Loading/));
    await expect(
      screen.findByText(locale.errors.unableToFetchRecord),
    ).resolves.toBeInTheDocument();
  });

  [
    ["Name / Address", "name"],
    ["Process", "process"],
    ["Patch", "patch"],
    ["State", "state"],
    [/Time left/, "time_left"],
  ].forEach((entry) => {
    test(`Table headers dispatch actions for ${entry[0]}`, async () => {
      server.use(
        rest.get(apiUrl, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ results: { processes: mockWorktrayResults } }),
          );
        }),
      );
      render(
        <WorktrayURLProvider sessionKey="test">
          <WorktrayList />
        </WorktrayURLProvider>,
      );

      await waitForElementToBeRemoved(screen.queryAllByText(/Loading/));
      fireEvent.click(screen.getByText(entry[0]));
      expect(window.sessionStorage.getItem("test")).toBe(`?t=30&sort=${entry[1]}`);

      await waitForElementToBeRemoved(screen.queryAllByText(/Loading/));
      fireEvent.click(screen.getByText(entry[0]));
      expect(window.sessionStorage.getItem("test")).toBe(`?t=30&o=desc&sort=${entry[1]}`);
    });
  });
});
