import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";

import { locale } from "../../services";
import { FilterBox } from "./filter-box";

const handleSelectAll = jest.fn();
const handleRemoveAll = jest.fn();
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
      options: [
        { key: "process-1", value: "Process 1" },
        { key: "process-2", value: "Process 2" },
        { key: "process-3", value: "Process 3" },
      ],
    };
    const { container } = render(
      <FilterBox
        filterType={filter.type}
        title={filter.title}
        options={filter.options}
        handleSelectAll={handleSelectAll}
        handleRemoveAll={handleRemoveAll}
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
    await expect(screen.findByText(filter.options[0].value)).resolves.toBeInTheDocument();
    await expect(screen.findByText(filter.options[1].value)).resolves.toBeInTheDocument();
    await expect(screen.findByText(filter.options[2].value)).resolves.toBeInTheDocument();
    fireEvent.click(screen.getByText(filter.options[0].value));
    expect(handleCheckboxFilters.mock.calls.length).toBe(1);
    expect(container).toMatchSnapshot();
  });

  test("it renders FilterBox with remove all correctly", async () => {
    const filter = {
      type: "processes",
      title: "Processes",
      options: [{ key: "process-1", value: "Process 1" }],
    };
    render(
      <FilterBox
        filterType={filter.type}
        title={filter.title}
        options={filter.options}
        handleSelectAll={handleSelectAll}
        handleRemoveAll={handleRemoveAll}
        handleCheckboxFilters={handleCheckboxFilters}
        selectedFilters={{ [filter.type]: ["process-1"] }}
      />,
    );

    await expect(screen.findByText(filter.title)).resolves.toBeInTheDocument();
    await expect(
      screen.findByText(components.filters.removeAll),
    ).resolves.toBeInTheDocument();
    fireEvent.click(screen.getByText(components.filters.removeAll));
    expect(handleRemoveAll.mock.calls.length).toBe(1);
  });
});
