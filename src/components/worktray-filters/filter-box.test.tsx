import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";

import { locale } from "../../services";
import { FilterBox } from "./filter-box";

const handleSelectAll = jest.fn();
const handleCheckboxFilters = jest.fn();

const { components } = locale;

describe("filter-box-component", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("it renders FilterBox correctly", async () => {
    const filter = {
      type: "processes",
      title: "Processes",
      options: ["Process 1", "Process 2", "Process 3"],
    };
    const { container } = render(
      <FilterBox
        filterType={filter.type}
        title={filter.title}
        options={filter.options}
        handleSelectAll={handleSelectAll}
        handleCheckboxFilters={handleCheckboxFilters}
        selectedFilters={{ [filter.type]: [] }}
      />,
    );

    await expect(screen.findByText(filter.title)).resolves.toBeInTheDocument();
    await expect(
      screen.findByText(components.filters.selectAll),
    ).resolves.toBeInTheDocument();
    fireEvent.click(screen.getByText(components.filters.selectAll));
    expect(handleSelectAll.mock.calls.length).toBe(1);
    await expect(screen.findByText(filter.options[0])).resolves.toBeInTheDocument();
    await expect(screen.findByText(filter.options[1])).resolves.toBeInTheDocument();
    await expect(screen.findByText(filter.options[2])).resolves.toBeInTheDocument();
    fireEvent.click(screen.getByText(filter.options[0]));
    expect(handleCheckboxFilters.mock.calls.length).toBe(1);
    expect(container).toMatchSnapshot();
  });
});
