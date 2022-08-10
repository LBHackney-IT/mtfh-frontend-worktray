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
  WorktrayResult,
} from "../types";

interface WorktrayResults {
  results: WorktrayResult[];
  total: number;
}

export type WorktrayState = {
  searchText: string;
  page: number;
  pageSize: LimitOptions;
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
      type: "SEARCH";
      payload: string;
    }
  | {
      type: "LIMIT";
      payload: LimitOptions;
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
    searchText: options.searchText || "",
    pageSize: options.pageSize || LimitOptions.SMALL,
    sort: options.sort || ProcessSortOptions.STATUS, // TODO ??
    order: options.order || OrderByOptions.ASC,
  };
};

export const WorktrayContext = createContext<{
  state: WorktrayState;
  dispatch: Dispatch<WorktrayActions>;
}>({
  state: getInitialState(),
  dispatch: /* istanbul ignore next */ () => {},
});

export const WorktrayProvider: FC<WorktrayProviderProps> = ({ children, initial }) => {
  const reducer: Reducer<WorktrayState, WorktrayActions> = (state, action) => {
    switch (action.type) {
      case "SEARCH": {
        return {
          ...state,
          searchText: action.payload,
        };
      }
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

  const inititalState = getInitialState(initial);

  const [state, dispatch] = useReducer(reducer, inititalState);
  const { ...query } = state;

  const { data, error } = useAxiosSWR<WorktrayResults>(
    `${config.worktrayApiUrl}?${stringify(
      {
        searchText: query.searchText,
        page: query.page,
        pageSize: query.pageSize,
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

export const PersistWorktrayContextURL = (): null => {
  const {
    state: { page, pageSize, order, sort },
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

    if (order && order !== OrderByOptions.ASC) {
      query.set("o", order);
    }

    if (sort) {
      query.set("sort", sort);
    }

    const path = `?${query.toString()}`;
    push(path);
  }, [page, pageSize, order, sort, push]);

  return null;
};

export const WorktrayURLProvider: FC = ({ children }): JSX.Element => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const page = Number(query.get("p") || 1);
  const pageSize = Number(query.get("l") || 12);
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
      }}
    >
      {children}
      <PersistWorktrayContextURL />
    </WorktrayProvider>
  );
};
