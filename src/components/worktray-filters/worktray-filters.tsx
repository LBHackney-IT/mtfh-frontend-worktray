import React, { useCallback, useContext, useState } from "react";

import { Button, Details } from "@mtfh/common/lib/components";

import "./styles.scss";
import { WorktrayContext } from "../../context/worktray-context";
import locale from "../../services/locale";
import { WorktrayFilterOptions } from "../../types";
import { FilterBox } from "./filter-box";

const { components } = locale;

export const WorktrayFilters = (): JSX.Element => {
  const {
    dispatch,
    state: { patch, process, status },
  } = useContext(WorktrayContext);

  // TODO: replace with real data
  const filters: { type: string; title: string; options: string[] }[] = [
    {
      type: "process",
      title: "Processes",
      options: ["Process 1", "Process 2", "Process 3"],
    },
    {
      type: "patch",
      title: "Patches",
      options: ["CP1", "CP2", "CP3"],
    },
  ];

  const [selectedFilters, setSelectedFilters] = useState<
    Record<WorktrayFilterOptions, string[]>
  >({
    patch: patch?.split(",") || [],
    process: process?.split(",") || [],
    status: status?.split(",") || [],
  });

  const handleCheckboxFilters = (
    event: React.ChangeEvent<HTMLInputElement>,
    filterType: string,
  ) => {
    const updatedFilters: string[] = [...selectedFilters[filterType]];
    if (event.target.checked) {
      updatedFilters.push(event.target.name);
    } else {
      updatedFilters.splice(selectedFilters[filterType].indexOf(event.target.name), 1);
    }
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: updatedFilters,
    });
  };

  const handleSelectAll = (filterType: string) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: filters.find((filter) => filter.type === filterType)?.options || [],
    });
  };

  const applyFilters = useCallback(
    (data) => {
      (Object.keys(data) as WorktrayFilterOptions[]).forEach((filterType) => {
        dispatch({
          type: "FILTER",
          payload: {
            type: filterType,
            payload: String(data[filterType]),
          },
        });
      });
    },
    [dispatch],
  );

  const clearFilters = () => {
    Object.keys(selectedFilters).forEach((filterType) => {
      selectedFilters[filterType] = [];
    });
    setSelectedFilters(selectedFilters);
    applyFilters(selectedFilters);
  };

  return (
    <Details className="worktray-filters" title="Filter by" open>
      <>
        <div className="worktray-filters__boxes">
          {filters.map(({ title, options, type }) => {
            return (
              <FilterBox
                key={title}
                filterType={type}
                title={title}
                options={options}
                handleSelectAll={handleSelectAll}
                handleCheckboxFilters={handleCheckboxFilters}
                selectedFilters={selectedFilters}
              />
            );
          })}
        </div>

        <div className="worktray-filters__actions">
          <Button
            className="worktray-filters__apply-button"
            onClick={() => applyFilters(selectedFilters)}
          >
            {components.filters.applyFilters}
          </Button>
          <button
            className="worktray-filters__clear-filters select-all lbh-link lbh-link--no-visited-state"
            onClick={() => clearFilters()}
          >
            {components.filters.clearFilters}
          </button>
        </div>
      </>
    </Details>
  );
};
