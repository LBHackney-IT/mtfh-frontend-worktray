import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, Details, Link } from "@mtfh/common/lib/components";

import "./styles.scss";
import locale from "../../services/locale";
import { FilterBox } from "./filter-box";

const { components } = locale;

export const WorktrayFilters = (): JSX.Element => {
  // TODO: replace with real data
  const filters: { type: string; title: string; options: string[] }[] = [
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

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    Object.fromEntries(filters.map((filter) => [filter.type, []])),
  );

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

  const clearFilters = () => {
    const clearedFilters = {};
    Object.keys(selectedFilters).forEach((filterType) => {
      clearedFilters[filterType] = [];
    });
    setSelectedFilters(clearedFilters);
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
          <Button className="worktray-filters__apply-button">
            {components.filters.applyFilters}
          </Button>
          <Link
            className="worktray-filters__clear-filters"
            as={RouterLink}
            to=""
            onClick={clearFilters}
          >
            {components.filters.clearFilters}
          </Link>
        </div>
      </>
    </Details>
  );
};
