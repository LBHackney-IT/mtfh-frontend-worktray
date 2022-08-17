import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WorktrayProvider } from "../../context/worktray-context";
import { LimitOptions, TimePeriodOptions } from "../../types";
import { WorktrayControls } from "./worktray-controls";

describe("worktray-controls-component", () => {
  test("WorktrayControls renders correctly", () => {
    const { container } = render(
      <WorktrayProvider initial={{}}>
        <WorktrayControls />
      </WorktrayProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  test("WorktrayControls changes time period", async () => {
    render(
      <WorktrayProvider initial={{}}>
        <WorktrayControls />
      </WorktrayProvider>,
    );

    const timePeriod = screen.getByTestId(
      "mtfh-worktray-time-period",
    ) as HTMLSelectElement;

    await userEvent.selectOptions(timePeriod, String(TimePeriodOptions.DAYS_60));
    expect(timePeriod.value).toBe(String(TimePeriodOptions.DAYS_60));
  });

  test("WorktrayControls changes limit", async () => {
    render(
      <WorktrayProvider initial={{}}>
        <WorktrayControls />
      </WorktrayProvider>,
    );

    const limit = screen.getByTestId("mtfh-worktray-limit") as HTMLSelectElement;

    await userEvent.selectOptions(limit, String(LimitOptions.MEDIUM));
    expect(limit.value).toBe(String(LimitOptions.MEDIUM));
  });
});
