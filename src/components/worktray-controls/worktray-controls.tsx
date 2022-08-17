import React, { useCallback, useContext } from "react";

import { FormGroup, Select } from "@mtfh/common/lib/components";

import { WorktrayContext } from "../../context/worktray-context";
import { locale } from "../../services";
import { LimitOptions, TimePeriodOptions } from "../../types";

import "./styles.scss";

const { timePeriodOptions, limitOption } = locale.components.controls;

export const WorktrayControls = (): JSX.Element | null => {
  const {
    state: { pageSize, timePeriod },
    dispatch,
  } = useContext(WorktrayContext);

  const handleTimePeriod = useCallback(
    (option: TimePeriodOptions) => {
      dispatch({ type: "TIME_PERIOD", payload: option });
    },
    [dispatch],
  );

  const handleLimit = useCallback(
    (limit: LimitOptions) => {
      dispatch({ type: "LIMIT", payload: limit });
    },
    [dispatch],
  );

  return (
    <div className="mtfh-worktray-controls">
      <div className="mtfh-worktray-controls__controls">
        <FormGroup id="time-period" label="Show:">
          <Select
            data-testid="mtfh-worktray-time-period"
            onChange={(e) => handleTimePeriod(e.currentTarget.value as TimePeriodOptions)}
            value={timePeriod}
          >
            {Object.values(TimePeriodOptions)
              .filter((value) => typeof value === "number" || value === "")
              .map((value) => (
                <option key={value} value={value}>
                  {timePeriodOptions[value] || `All of ${new Date().getFullYear()}`}
                </option>
              ))}
          </Select>
        </FormGroup>

        <FormGroup id="limit" label="">
          <Select
            data-testid="mtfh-worktray-limit"
            onChange={(e) => handleLimit(Number(e.currentTarget.value))}
            value={pageSize}
          >
            {(Object.values(LimitOptions) as number[])
              .filter((value) => typeof value === "number")
              .map((value) => (
                <option key={value} value={value}>
                  {limitOption(value)}
                </option>
              ))}
          </Select>
        </FormGroup>
      </div>
    </div>
  );
};
