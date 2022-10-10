import React, { useCallback, useContext, useState } from "react";

import { Button, Details } from "@mtfh/common/lib/components";
import { useAxiosSWR } from "@mtfh/common/lib/http";
import { Process, Status, processes } from "@mtfh/processes";

import { WorktrayContext } from "../../context/worktray-context";
import { config } from "../../services";
import locale from "../../services/locale";
import { WorktrayFilterOptions } from "../../types";
import { Patch } from "../../types/patch";
import { FilterBox, Option } from "./filter-box";

import "./styles.scss";

const { components } = locale;

export const WorktrayFilters = (): JSX.Element => {
  const {
    dispatch,
    state: { patch, patchId, process, status },
  } = useContext(WorktrayContext);

  const { data: patchData } = useAxiosSWR<Patch>(
    `${config.patchesAndAreasApiUrl}/patch/${patchId}`,
  );

  const { data: patches } = useAxiosSWR<Patch[]>(
    `${config.patchesAndAreasApiUrl}/patch?parentId=${patchData?.parentId}`,
  );

  const filters: { type: string; title: string; options: Option[] }[] = [
    {
      type: "process",
      title: "Processes",
      options: (Object.values(Process) as string[]).map((processName) => {
        const value = processes[processName].name;
        return {
          key: value.toLowerCase().replace(/\s/g, "-"),
          value,
        };
      }),
    },
  ];

  if (patches) {
    filters.push({
      type: "patch",
      title: "Patches",
      options: patches?.map((item) => ({ key: item.id, value: item.name })),
    });
  }

  filters.push({
    type: "status",
    title: "Process Status",
    options: (Object.values(Status) as string[]).map((value) => {
      return {
        key: value.toLowerCase().replace(/\s/g, "-"),
        value,
      };
    }),
  });

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
      [filterType]:
        filters
          .find((filter) => filter.type === filterType)
          ?.options.map((option) => option.key) || [],
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
