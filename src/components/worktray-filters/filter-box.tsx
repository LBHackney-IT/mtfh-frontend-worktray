import React from "react";

import { Checkbox, Radio, RadioGroup, Text } from "@mtfh/common/lib/components";

import { locale } from "../../services";

import "./styles.scss";

const { components } = locale;

export type Option = {
  key: string;
  value: string;
};

export const FilterBox = ({
  filterType,
  title,
  options,
  handleSelectAll,
  handleRemoveAll,
  handleCheckboxFilters,
  selectedFilters,
  isRadio = false,
}: {
  filterType: string;
  title: string;
  options: Option[];
  handleSelectAll: (value: string) => void;
  handleRemoveAll: (value: string) => void;
  handleCheckboxFilters: (
    value: React.ChangeEvent<HTMLInputElement>,
    filterType: string,
  ) => void;
  selectedFilters: Record<string, string[]>;
  isRadio?: boolean;
}): JSX.Element => {
  return (
    <div className="filter-box">
      <div className="filter-header">
        <Text>{title}</Text>
        {!isRadio && (
          <button
            className="select-all lbh-link lbh-link--no-visited-state"
            onClick={
              options.length === selectedFilters[filterType].length
                ? () => handleRemoveAll(filterType)
                : () => handleSelectAll(filterType)
            }
            data-testid={`filter-box-${
              options.length === selectedFilters[filterType].length
                ? "remove-all"
                : "select-all"
            }`}
          >
            {options.length === selectedFilters[filterType].length
              ? components.filters.removeAll
              : components.filters.selectAll}
          </button>
        )}
      </div>

      <div className="filter-box-options">
        {isRadio && (
          <RadioGroup>
            {options.length > 1 && (
              <Radio
                id="show-all"
                key="show-all"
                value="show-all"
                onChange={(event) => handleCheckboxFilters(event, filterType)}
                checked={selectedFilters[filterType].length === options.length}
              >
                Show All
              </Radio>
            )}
            {options.map((option) => {
              console.log(
                options.length === 1 && selectedFilters[filterType].includes(option.key),
              );
              return (
                <Radio
                  id={option.key}
                  key={option.key}
                  value={option.key}
                  onChange={(event) => handleCheckboxFilters(event, filterType)}
                  checked={
                    (selectedFilters[filterType].length !== options.length ||
                      options.length === 1) &&
                    selectedFilters[filterType].includes(option.key)
                  }
                >
                  {option.value}
                </Radio>
              );
            })}
          </RadioGroup>
        )}
        {!isRadio &&
          options.map((option) => {
            return (
              <Checkbox
                key={option.key}
                id={option.key}
                name={option.key}
                checked={selectedFilters[filterType].includes(option.key)}
                onChange={(event) => handleCheckboxFilters(event, filterType)}
                data-testid={`filter-option-${option.key}`}
              >
                {option.value}
              </Checkbox>
            );
          })}
      </div>
    </div>
  );
};
