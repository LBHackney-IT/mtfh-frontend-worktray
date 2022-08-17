import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";

import { WorktrayURLProvider } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayFilters } from "./worktray-filters";

const { components } = locale;

const filters = [
  {
    type: "processes",
    title: "Processes",
    options: ["Process 1", "Process 2", "Process 3"],
  },
  {
    type: "patches",
    title: "Patches",
    options: ["CP1", "CP2", "CP3"],
  },
];

describe("worktray-filters", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("it renders WorktrayFilters correctly", async () => {
    const { container } = render(<WorktrayFilters />);
    expect(container).toMatchSnapshot();
  });

  test("it selects and unselects filter options", async () => {
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
      {
        url: "/?t=30&sort=status&process=%2CProcess+2&patch=%2CCP1",
        path: "/",
      },
    );
    await expect(
      screen.findByLabelText(filters[0].options[0]),
    ).resolves.not.toBeChecked();
    fireEvent.click(screen.getByLabelText(filters[0].options[0]));
    await expect(screen.findByLabelText(filters[0].options[0])).resolves.toBeChecked();
    fireEvent.click(screen.getByText(locale.components.filters.applyFilters));
    expect(window.sessionStorage.getItem("test")).toBe(
      "?t=30&sort=status&patch=%2CCP1&process=%2CProcess+2%2CProcess+1",
    );
    fireEvent.click(screen.getByLabelText(filters[0].options[0]));
    await expect(
      screen.findByLabelText(filters[0].options[0]),
    ).resolves.not.toBeChecked();
  });

  test("it selects all options and clears filters correctly", async () => {
    render(
      <WorktrayURLProvider sessionKey="test">
        <WorktrayFilters />
      </WorktrayURLProvider>,
    );

    await expect(
      screen.findByLabelText(filters[0].options[0]),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(filters[0].options[1]),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(filters[0].options[2]),
    ).resolves.not.toBeChecked();

    fireEvent.click(screen.getAllByText(components.filters.selectAll)[0]);

    await expect(screen.findByLabelText(filters[0].options[0])).resolves.toBeChecked();
    await expect(screen.findByLabelText(filters[0].options[1])).resolves.toBeChecked();
    await expect(screen.findByLabelText(filters[0].options[2])).resolves.toBeChecked();

    fireEvent.click(screen.getByText(components.filters.clearFilters));

    await expect(
      screen.findByLabelText(filters[0].options[0]),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(filters[0].options[1]),
    ).resolves.not.toBeChecked();
    await expect(
      screen.findByLabelText(filters[0].options[2]),
    ).resolves.not.toBeChecked();
  });
});
