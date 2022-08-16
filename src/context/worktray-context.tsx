import React, {
  Dispatch,
  FC,
  Reducer,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useHistory, useLocation } from "react-router-dom";

import { stringify } from "query-string";

import { AxiosSWRError, useAxiosSWR } from "@mtfh/common/lib/http";

import { config } from "../services";
import {
  LimitOptions,
  OrderByOptions,
  ProcessSortOptions,
  TimePeriodOptions,
  WorktrayResult,
} from "../types";

interface WorktrayResults {
  results: WorktrayResult[];
  total: number;
}

export type WorktrayState = {
  page: number;
  pageSize: LimitOptions;
  timePeriod: TimePeriodOptions;
  sort: ProcessSortOptions;
  order: OrderByOptions;
  results?: WorktrayResult[];
  total?: number;
  error?: AxiosSWRError;
};

export type WorktrayActions =
  | {
      type: "PAGE";
      payload: number;
    }
  | {
      type: "LIMIT";
      payload: LimitOptions;
    }
  | {
      type: "TIME_PERIOD";
      payload: TimePeriodOptions;
    }
  | {
      type: "SORT";
      payload: ProcessSortOptions;
    }
  | {
      type: "ORDER";
      payload: OrderByOptions;
    };

export interface WorktrayProviderProps {
  initial: Partial<WorktrayState>;
}

const getInitialState = (
  options: WorktrayProviderProps["initial"] = {},
): WorktrayState => {
  return {
    page: options.page || 1,
    pageSize: options.pageSize || LimitOptions.SMALL,
    timePeriod: options.timePeriod || TimePeriodOptions.DAYS_30,
    sort: options.sort || ProcessSortOptions.STATUS, // TODO ??
    order: options.order || OrderByOptions.ASC,
  };
};

export const WorktrayContext = createContext<{
  state: WorktrayState;
  dispatch: Dispatch<WorktrayActions>;
}>({
  state: getInitialState(),
  dispatch: () => {},
});

export const WorktrayProvider: FC<WorktrayProviderProps> = ({ children, initial }) => {
  const reducer: Reducer<WorktrayState, WorktrayActions> = (state, action) => {
    switch (action.type) {
      case "PAGE": {
        return {
          ...state,
          page: action.payload,
        };
      }
      case "LIMIT": {
        if (Object.values(LimitOptions).includes(action.payload)) {
          return {
            ...state,
            pageSize: action.payload,
          };
        }
        return state;
      }
      case "TIME_PERIOD": {
        if (Object.values(TimePeriodOptions).includes(action.payload)) {
          return {
            ...state,
            timePeriod: action.payload,
          };
        }
        return state;
      }
      case "SORT": {
        if (Object.values(ProcessSortOptions).includes(action.payload)) {
          return {
            ...state,
            sort: action.payload,
          };
        }
        return state;
      }
      case "ORDER": {
        if (Object.values(OrderByOptions).includes(action.payload)) {
          return {
            ...state,
            order: action.payload,
          };
        }
        return state;
      }
      default: {
        return state;
      }
    }
  };

  const initialState = getInitialState(initial);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { ...query } = state;

  const { data, error } = useAxiosSWR<WorktrayResults>(
    `${config.worktrayApiUrl}?${stringify(
      {
        page: query.page,
        pageSize: query.pageSize,
        timePeriod: query.timePeriod,
        sortBy: query.sort,
        isDesc: query.order === "asc",
      },
      {
        skipEmptyString: true,
      },
    )}`,
    {
      refreshWhenHidden: false,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (data?.total && data.total > 0) {
      const totalPages = Math.ceil(data.total / state.pageSize);
      if (state.page > totalPages) {
        dispatch({ type: "PAGE", payload: totalPages });
      }
    }
  }, [state.page, data?.total, state.pageSize]);

  const value = useMemo(
    () => ({
      state: {
        ...state,
        results: data?.results,
        total: data?.total,
        error,
      },
      dispatch,
    }),
    [state, data, error, dispatch],
  );

  return <WorktrayContext.Provider value={value}>{children}</WorktrayContext.Provider>;
};

export const PersistWorktrayContextURL = ({
  sessionKey,
}: {
  sessionKey?: string;
}): null => {
  const {
    state: { page, pageSize, order, sort, timePeriod },
  } = useContext(WorktrayContext);
  const { push } = useHistory();

  useEffect(() => {
    const query = new URLSearchParams();
    if (page > 1) {
      query.set("p", String(page));
    }

    if (pageSize !== LimitOptions.SMALL) {
      query.set("l", String(pageSize));
    }

    if (timePeriod !== "") {
      query.set("t", String(timePeriod));
    }

    if (order && order !== OrderByOptions.ASC) {
      query.set("o", order);
    }

    if (sort) {
      query.set("sort", sort);
    }

    const path = `?${query.toString()}`;
    push(path);

    if (sessionKey) {
      window.sessionStorage.setItem(sessionKey, path);
    }
  }, [page, pageSize, order, sort, sessionKey, push, timePeriod]);

  return null;
};

export const WorktrayURLProvider: FC<{ sessionKey: string }> = ({
  children,
  sessionKey,
}): JSX.Element => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const page = Number(query.get("p") || 1);
  const pageSize = Number(query.get("l") || 12);
  const timePeriod = String(query.get("t") || "") as TimePeriodOptions;
  const sortBy = query.get("sort");
  const orderBy = query.get("o");

  const sort = useMemo(() => {
    if (sortBy === "name") {
      return ProcessSortOptions.NAME;
    }
    return ProcessSortOptions.STATUS;
  }, [sortBy]);

  const order = useMemo(() => {
    if (orderBy === "desc") {
      return OrderByOptions.DESC;
    }
    return OrderByOptions.ASC;
  }, [orderBy]);

  return (
    <WorktrayProvider
      initial={{
        page,
        sort,
        order,
        pageSize,
        timePeriod,
      }}
    >
      {children}
      <PersistWorktrayContextURL sessionKey={sessionKey} />
    </WorktrayProvider>
  );
};
