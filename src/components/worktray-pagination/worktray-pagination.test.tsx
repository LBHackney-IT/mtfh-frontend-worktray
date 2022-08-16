import React from "react";

import { render, server } from "@hackney/mtfh-test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { rest } from "msw";

import { WorktrayProvider } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayPagination } from "./worktray-pagination";

const getMockWorktrayResults = (data = {}) =>
  rest.get("/api/worktray", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: [],
        total: 40,
        ...data,
      }),
    );
  });

const pageNumbersCheck = () => {
  expect(screen.queryByText("2")).not.toBeInTheDocument();
  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getByText("4")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();
  expect(screen.getByText("6")).toBeInTheDocument();
  expect(screen.getByText("7")).toBeInTheDocument();
  expect(screen.queryByText("8")).not.toBeInTheDocument();
};

describe("worktray-pagination", () => {
  test("Pagination displays range from start if range exceeds start", async () => {
    server.use(getMockWorktrayResults());
    render(
      <WorktrayProvider initial={{}}>
        <WorktrayPagination />
      </WorktrayProvider>,
    );

    expect(
      await screen.findByText(locale.components.pagination.next),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(locale.components.pagination.previous),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  test("Pagination displays range", async () => {
    server.use(getMockWorktrayResults({ total: 100 }));
    render(
      <WorktrayProvider initial={{ page: 5 }}>
        <WorktrayPagination />
      </WorktrayProvider>,
    );

    await expect(
      screen.findByText(locale.components.pagination.next),
    ).resolves.toBeInTheDocument();
    expect(screen.getByText(locale.components.pagination.previous)).toBeInTheDocument();
    pageNumbersCheck();
  });

  test("Pagination displays range from end if range exceeds end", async () => {
    server.use(getMockWorktrayResults({ total: 70 }));
    render(
      <WorktrayProvider initial={{ page: 7 }}>
        <WorktrayPagination />
      </WorktrayProvider>,
    );

    await expect(
      screen.findByText(locale.components.pagination.previous),
    ).resolves.toBeInTheDocument();
    expect(screen.queryByText(locale.components.pagination.next)).not.toBeInTheDocument();
    pageNumbersCheck();
  });

  test("Pagination wont display if the range is empty", async () => {
    server.use(getMockWorktrayResults({ total: 12 }));
    render(
      <WorktrayProvider initial={{ page: 1 }}>
        <WorktrayPagination />
      </WorktrayProvider>,
    );

    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  test("Pagination navigation triggers state changes", async () => {
    server.use(getMockWorktrayResults());
    render(
      <WorktrayProvider initial={{ page: 1 }}>
        <WorktrayPagination />
      </WorktrayProvider>,
    );

    expect(await screen.findByText("1")).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByText(locale.components.pagination.next));
    expect(await screen.findByText("2")).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByText(locale.components.pagination.previous));
    expect(await screen.findByText("1")).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByText("3"));
    expect(await screen.findByText("3")).toHaveAttribute("aria-current", "page");
  });
});
