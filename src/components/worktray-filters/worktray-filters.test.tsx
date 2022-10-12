import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";

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
    await expect(
      screen.findByText("Awaiting Housing Officer review"),
    ).resolves.toBeInTheDocument();
  });

  test("it selects and unselects filter options", async () => {
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
      {
        url: "/?t=30&sort=status&process=%2Cchange-of-name&patch=%2CCP1",
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
      "?t=30&sort=status&patch=%2CCP1&process=%2Cchange-of-name%2Csole-to-joint",
    );
    fireEvent.click(screen.getByLabelText(processes.soletojoint.name));
    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
  });

  test("it selects all options and clears filters correctly", async () => {
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

    fireEvent.click(screen.getByText(components.filters.clearFilters));

    await expect(
      screen.findByLabelText(processes.soletojoint.name),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(processes.changeofname.name),
    ).resolves.not.toBeChecked();
  });
});
