import React from "react";

import { Checkbox, Text } from "@mtfh/common/lib/components";

import { locale } from "../../services";

import "./styles.scss";

const { components } = locale;

export const FilterBox = ({
  filterType,
  title,
  options,
  handleSelectAll,
  handleCheckboxFilters,
  selectedFilters,
}: {
  filterType: string;
  title: string;
  options: string[];
  handleSelectAll: (value: string) => void;
  handleCheckboxFilters: (
    value: React.ChangeEvent<HTMLInputElement>,
    filterType: string,
  ) => void;
  selectedFilters: Record<string, string[]>;
}): JSX.Element => {
  return (
    <div className="filter-box">
      <div className="filter-header">
        <Text>{title}</Text>
        <button
          className="select-all lbh-link lbh-link--no-visited-state"
          onClick={() => handleSelectAll(filterType)}
        >
          {components.filters.selectAll}
        </button>
      </div>

      <div className="filter-box-options">
        {options.map((option) => {
          return (
            <Checkbox
              key={option.toLowerCase().replace(/\s/g, "-")}
              id={option.toLowerCase().replace(/\s/g, "-")}
              name={option}
              checked={selectedFilters[filterType].includes(option)}
              onChange={(event) => handleCheckboxFilters(event, filterType)}
            >
              {option}
            </Checkbox>
          );
        })}
      </div>
    </div>
  );
};
