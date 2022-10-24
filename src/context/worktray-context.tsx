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
  Process,
  ProcessSortOptions,
  TimePeriodOptions,
  WorktrayFilterOptions,
} from "../types";

interface WorktrayResults {
  results: {
    processes: Process[];
  };
  total: number;
}

export type WorktrayState = {
  page: number;
  pageSize: LimitOptions;
  timePeriod: TimePeriodOptions;
  sort: ProcessSortOptions;
  order: OrderByOptions;
  patch?: string;
  areaId?: string | null;
  processNames?: string;
  status?: string;
  results?: Process[];
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
      type: "FILTER";
      payload: {
        type: WorktrayFilterOptions;
        payload: string;
      };
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
    sort: options.sort || ProcessSortOptions.STATUS,
    order: options.order || OrderByOptions.ASC,
    processNames: options.processNames || undefined,
    patch: options.patch || undefined,
    areaId: options.areaId || undefined,
    status: options.status || undefined,
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
        if (Object.values(TimePeriodOptions).includes(Number(action.payload))) {
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
      case "FILTER": {
        return {
          ...state,
          [action.payload.type]: action.payload.payload,
        };
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
    `${config.searchApiUrl}/search/processes?${stringify(
      {
        searchText: query.patch,
        page: query.page,
        pageSize: query.pageSize,
        timePeriod: query.timePeriod,
        processNames: query.processNames,
        status: query.status,
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
        results: data?.results.processes,
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
    state: { page, pageSize, order, sort, timePeriod, patch, processNames, status },
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

    query.set("t", String(timePeriod));

    if (order && order !== OrderByOptions.ASC) {
      query.set("o", order);
    }

    query.set("sort", String(sort));

    if (patch) {
      query.set("patch", patch);
    }

    if (processNames) {
      query.set("processNames", processNames);
    }

    if (status) {
      query.set("status", status);
    }

    const path = `?${query.toString()}`;
    push(path);

    if (sessionKey) {
      window.sessionStorage.setItem(sessionKey, path);
    }
  }, [
    page,
    pageSize,
    order,
    sort,
    sessionKey,
    push,
    timePeriod,
    patch,
    processNames,
    status,
  ]);

  return null;
};

export const WorktrayURLProvider: FC<{
  sessionKey?: string;
  patchId?: string | null;
  areaId?: string | null;
}> = ({ children, sessionKey, patchId, areaId }): JSX.Element => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const page = Number(query.get("p") || 1);
  const pageSize = Number(query.get("l") || 10);
  const timePeriod = (query.get("t") || "") as TimePeriodOptions;
  const patch = query.get("patch") || patchId || "";
  const processNames = query.get("processNames") || "";
  const status = query.get("status") || "";
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
        patch,
        areaId,
        processNames,
        status,
      }}
    >
      {children}
      <PersistWorktrayContextURL sessionKey={sessionKey} />
    </WorktrayProvider>
  );
};
