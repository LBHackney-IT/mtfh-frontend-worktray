import React, { useCallback, useContext } from "react";

import {
  Center,
  ErrorSummary,
  Spinner,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@mtfh/common/lib/components";
import { processes } from "@mtfh/processes";

import { WorktrayContext } from "../../context/worktray-context";
import { locale } from "../../services";
import { OrderByOptions, ProcessSortOptions } from "../../types";
import { WorktrayPagination } from "../worktray-pagination";
import { PersonProcessRecord } from "./person-record";
import { TenureProcessRecord } from "./tenure-record";

export const WorktrayList = (): JSX.Element => {
  const {
    state: { results, error, order, sort },
    dispatch,
  } = useContext(WorktrayContext);

  const dispatchSort = useCallback(
    (sortOption) => {
      dispatch({ type: "SORT", payload: sortOption });
      dispatch({
        type: "ORDER",
        payload:
          sort === sortOption && order === OrderByOptions.ASC
            ? OrderByOptions.DESC
            : OrderByOptions.ASC,
      });
    },
    [dispatch, sort, order],
  );

  const processRecordComponents = {
    tenure: TenureProcessRecord,
    person: PersonProcessRecord,
  };

  if (error) {
    return (
      <ErrorSummary
        id="worktray-result-error"
        title={locale.errors.unableToFetchRecord}
        description={locale.errors.unableToFetchRecordDescription}
      />
    );
  }

  if (results === undefined) {
    return (
      <Center className="mtfh-worktray__loading">
        <Spinner />
      </Center>
    );
  }

  if (results?.length === 0) {
    return <Text>{locale.views.worktray.noWorktrayResults}</Text>;
  }

  return (
    <div>
      <div className="worktray-list">
        <Table>
          <Thead>
            <Tr>
              <Th>
                <button
                  className="select-all lbh-link lbh-link--no-visited-state"
                  onClick={() => dispatchSort(ProcessSortOptions.NAME)}
                >
                  Name / Address
                </button>
              </Th>
              <Th>
                <button
                  className="select-all lbh-link lbh-link--no-visited-state"
                  onClick={() => dispatchSort(ProcessSortOptions.PROCESS)}
                >
                  Process
                </button>
              </Th>
              <Th>
                <button
                  className="select-all lbh-link lbh-link--no-visited-state"
                  onClick={() => dispatchSort(ProcessSortOptions.PATCH)}
                >
                  Patch
                </button>
              </Th>
              <Th>
                <button
                  className="select-all lbh-link lbh-link--no-visited-state"
                  onClick={() => dispatchSort(ProcessSortOptions.STATE)}
                >
                  State
                </button>
              </Th>
              <Th>
                <button
                  className="select-all lbh-link lbh-link--no-visited-state"
                  onClick={() => dispatchSort(ProcessSortOptions.TIME_LEFT)}
                >
                  Time left
                  <br />
                  Full process
                </button>
              </Th>
              <Th>Process status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map((process) => {
              const processConfig = processes[process.processName];
              const Result = processRecordComponents[process.targetType];
              return (
                <Result
                  key={process.id}
                  process={process}
                  processConfig={processConfig}
                />
              );
            })}
          </Tbody>
        </Table>
        <WorktrayPagination />
      </div>
    </div>
  );
};
