import React, { useCallback, useContext, useState } from "react";

import { Button, Details } from "@mtfh/common/lib/components";
import { useAxiosSWR } from "@mtfh/common/lib/http";
import { Process, processes } from "@mtfh/processes";

import { WorktrayContext } from "../../context/worktray-context";
import { config } from "../../services";
import locale from "../../services/locale";
import { WorktrayFilterOptions } from "../../types";
import { Patch } from "../../types/patch";
import { FilterBox, Option } from "./filter-box";

import "./styles.scss";

const { components } = locale;

enum FilterType {
  PROCESS_NAMES = "processNames",
  PATCH = "patch",
}

export const WorktrayFilters = (): JSX.Element => {
  const {
    dispatch,
    state: { patch, areaId, processNames, status },
  } = useContext(WorktrayContext);

  const { data: patches } = useAxiosSWR<Patch[]>(
    `${config.patchesAndAreasApiUrl}/patch?parentId=${areaId}`,
  );

  const filters: { type: string; title: string; options: Option[]; isRadio?: boolean }[] =
    [
      {
        type: FilterType.PROCESS_NAMES,
        title: "Processes",
        options: (Object.values(Process) as string[]).map((processName) => {
          const key = processes[processName].processName;
          const value = processes[processName].name;
          return {
            key,
            value,
          };
        }),
        isRadio: false,
      },
    ];

  if (patches) {
    filters.push({
      type: FilterType.PATCH,
      title: "Patches",
      options: patches
        ?.map((item) => ({ key: item.id, value: item.name }))
        .sort((a, b) => a.value.localeCompare(b.value)),
      isRadio: true,
    });
  }

  const [selectedFilters, setSelectedFilters] = useState<
    Record<WorktrayFilterOptions, string[]>
  >({
    patch: patch?.split(",") || [],
    processNames: processNames?.split(",") || [],
    status: status?.split(",") || [],
  });

  const handleCheckboxFilters = (
    event: React.ChangeEvent<HTMLInputElement>,
    filterType: string,
  ) => {
    let updatedFilters: string[] = [...selectedFilters[filterType]];
    if (event.target.checked) {
      const { options, isRadio } =
        filters.find((filter) => filter.type === filterType) || {};
      if (event.target.value === "show-all") {
        updatedFilters = options?.map((option) => option.key) || [];
      } else if (isRadio) {
        updatedFilters = [event.target.value];
      } else {
        updatedFilters.push(event.target.name);
      }
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

  const handleRemoveAll = (filterType: string) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: [],
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
      if (filterType === FilterType.PATCH) {
        selectedFilters[filterType] =
          filters
            .find((filter) => filter.type === FilterType.PATCH)
            ?.options.map((option) => option.key) || [];
      } else {
        selectedFilters[filterType] = [];
      }
    });
    applyFilters(selectedFilters);
  };

  return (
    <Details className="worktray-filters" title="Filter by" open>
      <>
        <div className="worktray-filters__boxes">
          {filters.map(({ title, options, type, isRadio }) => {
            return (
              <FilterBox
                key={title}
                filterType={type}
                title={title}
                options={options}
                handleSelectAll={handleSelectAll}
                handleRemoveAll={handleRemoveAll}
                handleCheckboxFilters={handleCheckboxFilters}
                selectedFilters={selectedFilters}
                isRadio={isRadio}
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
