import React from "react";

import { render, server } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { rest } from "msw";

import { processes } from "@mtfh/processes";

import { WorktrayURLProvider } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayFilters } from "./worktray-filters";

const { components } = locale;

describe("worktray-filters", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("it renders WorktrayFilters correctly", async () => {
    render(<WorktrayFilters />);
    await expect(
      screen.findByText(processes.soletojoint.name),
    ).resolves.toBeInTheDocument();
  });

  test("it renders WorktrayFilters correctly with patches", async () => {
    server.use(
      rest.get(`/api/v1/patch/:patchId`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            parentId: "1b384367-f42e-4bad-959a-0a8c9248c085",
          }),
        );
      }),
    );
    server.use(
      rest.get(`/api/v1/patch/`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: "19400185-a8d2-4f3f-b217-dc5d485a1210",
              name: "CP7",
            },
          ]),
        );
      }),
    );
    render(<WorktrayFilters />);
    await expect(
      screen.findByText(processes.soletojoint.name),
    ).resolves.toBeInTheDocument();
    await expect(screen.findByText("CP7")).resolves.toBeInTheDocument();
  });

  test("it selects and unselects filter options", async () => {
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
      {
        url: "/?t=30&sort=status&processNames=%2Cchange-of-name&patch=%2CCP1",
        path: "/",
      },
    );
    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    fireEvent.click(screen.getByLabelText(processes.soletojoint.name));
    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.toBeChecked();
    fireEvent.click(screen.getByText(locale.components.filters.applyFilters));
    expect(window.sessionStorage.getItem("test")).toBe(
      "?t=30&sort=status&patch=%2CCP1&processNames=%2Cchange-of-name%2Csoletojoint",
    );
    fireEvent.click(screen.getByLabelText(processes.soletojoint.name));
    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
  });

  test("it selects all options and clears filters correctly", async () => {
    server.use(
      rest.get(`/api/v1/patch/`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            {
              id: "19400185-a8d2-4f3f-b217-dc5d485a1210",
              name: "CP7",
            },
          ]),
        );
      }),
    );
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
      {
        url: "/?t=30&sort=status&patch=19400185-a8d2-4f3f-b217-dc5d485a1210",
      },
    );

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.not.toBeChecked();

    await expect(screen.findByLabelText("CP7")).resolves.toBeChecked();

    fireEvent.click(screen.getAllByText(components.filters.selectAll)[0]);

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.toBeChecked();

    fireEvent.click(screen.getByText(components.filters.clearFilters));

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.not.toBeChecked();

    await expect(screen.findByLabelText("CP7")).resolves.toBeChecked();
  });

  test("it selects all options and remove all options correctly", async () => {
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
    );

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.not.toBeChecked();

    fireEvent.click(screen.getAllByText(components.filters.selectAll)[0]);

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.toBeChecked();

    fireEvent.click(screen.getByText(components.filters.removeAll));

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.not.toBeChecked();
  });
});
