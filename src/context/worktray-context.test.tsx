import React, { useContext, useEffect } from "react";

import { render, server } from "@hackney/mtfh-test-utils";
import { screen, waitFor } from "@testing-library/react";
import { rest } from "msw";

import {
  LimitOptions,
  OrderByOptions,
  ProcessSortOptions,
  TimePeriodOptions,
  WorktrayFilterOptions,
} from "../types";
import {
  WorktrayActions,
  WorktrayContext,
  WorktrayProvider,
  WorktrayProviderProps,
  WorktrayState,
  WorktrayURLProvider,
} from "./worktray-context";

type WorktrayRenderProps = (
  ui: JSX.Element,
  values: { initial: WorktrayProviderProps["initial"] },
) => void;

const worktrayRender: WorktrayRenderProps = (ui, { initial }) => {
  return render(<WorktrayProvider initial={initial}>{ui}</WorktrayProvider>);
};

const ContextSelector = ({ param }: { param: keyof WorktrayState }) => {
  const { state } = useContext(WorktrayContext);
  return (
    <>
      <div>{!!state.results && "Loading"}</div>
      <div>{`[${state[param]}]`}</div>
    </>
  );
};

interface DispatcherProps {
  action: WorktrayActions;
  param: keyof WorktrayState;
  waitForResults?: boolean;
}

const Dispatcher = ({ action, param, waitForResults = false }: DispatcherProps) => {
  const { dispatch, state } = useContext(WorktrayContext);

  useEffect(() => {
    if (!waitForResults) {
      dispatch(action);
    }

    if (!!state.results && waitForResults) {
      dispatch(action);
    }
  }, [state.results, dispatch, waitForResults, action]);

  return <ContextSelector param={param} />;
};

test("WorktrayProvider dispatches limit", () => {
  worktrayRender(
    <Dispatcher
      action={{ type: "LIMIT", payload: LimitOptions.MEDIUM }}
      param="pageSize"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${LimitOptions.MEDIUM}]`)).toBeInTheDocument();
});

test("WorktrayProvider wont reduce limit dispatches for unknown limits", () => {
  worktrayRender(
    <Dispatcher action={{ type: "LIMIT", payload: 14 }} param="pageSize" />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${LimitOptions.SMALL}]`)).toBeInTheDocument();
});

test("WorktrayProvider dispatches sort", () => {
  worktrayRender(
    <Dispatcher
      action={{ type: "SORT", payload: ProcessSortOptions.STATUS }}
      param="sort"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${ProcessSortOptions.STATUS}]`)).toBeInTheDocument();
});

test("WorktrayProvider wont reduce sort dispatches for unknown sorts", () => {
  worktrayRender(
    <Dispatcher
      action={{ type: "SORT", payload: "street" as ProcessSortOptions }}
      param="sort"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${ProcessSortOptions.STATUS}]`)).toBeInTheDocument();
});

test("WorktrayProvider dispatches order", () => {
  worktrayRender(
    <Dispatcher action={{ type: "ORDER", payload: OrderByOptions.DESC }} param="order" />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${OrderByOptions.DESC}]`)).toBeInTheDocument();
});

test("WorktrayProvider wont dispatch order for unknown order", () => {
  worktrayRender(
    <Dispatcher
      action={{ type: "ORDER", payload: "name" as OrderByOptions }}
      param="order"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${OrderByOptions.ASC}]`)).toBeInTheDocument();
});

test("WorktrayProvider dispatches page", () => {
  worktrayRender(<Dispatcher action={{ type: "PAGE", payload: 2 }} param="page" />, {
    initial: {},
  });
  expect(screen.getByText("[2]")).toBeInTheDocument();
});

test("WorktrayProvider dispatches time period", () => {
  worktrayRender(
    <Dispatcher action={{ type: "TIME_PERIOD", payload: 30 }} param="timePeriod" />,
    {
      initial: {},
    },
  );
  expect(screen.getByText("[30]")).toBeInTheDocument();
});

test("WorktrayProvider wont dispatch time period for unknown timePeriod", () => {
  worktrayRender(
    <Dispatcher
      action={{ type: "TIME_PERIOD", payload: 100 as TimePeriodOptions }}
      param="timePeriod"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[30]`)).toBeInTheDocument();
});

test("WorktrayProvider dispatches filter", () => {
  worktrayRender(
    <Dispatcher
      action={{
        type: "FILTER",
        payload: { type: WorktrayFilterOptions.PATCH, payload: "CP1,CP2" },
      }}
      param="patch"
    />,
    {
      initial: {},
    },
  );
  expect(screen.getByText("[CP1,CP2]")).toBeInTheDocument();
});

test("WorktrayProvider will reset page to the maximum when over extended", async () => {
  server.use(
    rest.get("/api/v1/search/processes", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          results: { processes: [] },
          total: 40,
        }),
      );
    }),
  );
  worktrayRender(
    <Dispatcher action={{ type: "PAGE", payload: 100 }} param="page" waitForResults />,
    {
      initial: {},
    },
  );
  await waitFor(() => expect(screen.queryByText("Loading")).not.toBeInTheDocument());

  await waitFor(() => expect(screen.getByText(`[4]`)).toBeInTheDocument());
});

test("WorktrayProvider wont dispatch order for unknown action", () => {
  worktrayRender(
    <Dispatcher action={{ type: "UNKNOWN" as "PAGE", payload: 1 }} param="order" />,
    {
      initial: {},
    },
  );
  expect(screen.getByText(`[${OrderByOptions.ASC}]`)).toBeInTheDocument();
});

test("WorktrayURLProvider hydrates from url", () => {
  render(
    <WorktrayURLProvider sessionKey="test">
      <ContextSelector param="page" />
      <ContextSelector param="pageSize" />
      <ContextSelector param="timePeriod" />
    </WorktrayURLProvider>,
    {
      url: "/?p=3&l=40&t=30",
      path: "/",
    },
  );

  expect(screen.getByText("[3]")).toBeInTheDocument();
  expect(screen.getByText("[40]")).toBeInTheDocument();
});

test("WorktrayURLProvider hydrates from url 2", () => {
  render(
    <WorktrayURLProvider>
      <ContextSelector param="page" />
      <ContextSelector param="pageSize" />
    </WorktrayURLProvider>,
    {
      url: "/?p=3&l=40",
      path: "/",
    },
  );

  expect(screen.getByText("[3]")).toBeInTheDocument();
  expect(screen.getByText("[40]")).toBeInTheDocument();
});

test("WorktrayURLProvider persists to sessionStorage", () => {
  render(
    <WorktrayURLProvider sessionKey="test">
      <Dispatcher action={{ type: "PAGE", payload: 3 }} param="page" />
    </WorktrayURLProvider>,
    {
      url: "/?p=3&l=40&t=30&o=desc&sort=name&patch=x&processNames=y&status=z",
      path: "/",
    },
  );

  expect(window.sessionStorage.getItem("test")).toBe(
    "?p=3&l=40&t=30&o=desc&sort=name&patch=x&processNames=y&status=z",
  );
});
