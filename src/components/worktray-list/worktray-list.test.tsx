import React from "react";

import { mockPersonV1, mockProcessV1, render, server } from "@hackney/mtfh-test-utils";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { rest } from "msw";

import { WorktrayProvider } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayList } from "./worktray-list";

describe("worktray-list-component", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("it renders correctly", async () => {
    server.use(
      rest.get("/api/worktray", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            results: [
              {
                ...mockProcessV1,
                processName: "soletojoint",
                targetType: "tenure",
                currentState: {
                  createdAt: "2022-01-09T00:00:00.000Z",
                },
                relatedEntities: [
                  {
                    id: mockPersonV1.id,
                    description: `${mockPersonV1.firstName} ${mockPersonV1.surname}`,
                    targetType: "person",
                    subType: "",
                  },
                ],
              },
            ],
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
      rest.get("/api/worktray", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ results: [] }));
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
      rest.get("/api/worktray", (req, res, ctx) => {
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
});
