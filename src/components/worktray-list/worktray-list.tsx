import React, { useContext } from "react";

import {
  Center,
  ErrorSummary,
  Spinner,
  Table,
  Text,
  Th,
  Tr,
} from "@mtfh/common/lib/components";
import { formatDate } from "@mtfh/common/lib/utils";
import { ProcessStateInfo, processes } from "@mtfh/processes";

import { WorktrayContext } from "../../context/worktray-context";
import { locale } from "../../services";
import { WorktrayPagination } from "../worktray-pagination/worktray-pagination";
import { TenureProcessRecord } from "./tenure-record";

export const WorktrayList = (): JSX.Element => {
  const {
    state: { results, error },
  } = useContext(WorktrayContext);

  const processRecordComponents = {
    tenure: TenureProcessRecord,
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
          <Tr>
            <Th>Name / Address</Th>
            <Th>Process</Th>
            <Th>Patch</Th>
            <Th>State</Th>
            <Th>Time left Full process</Th>
            <Th>Process status</Th>
          </Tr>
          {results.map((process) => {
            const processConfig = processes[process.processName];
            const statesInfo: ProcessStateInfo[] = Object.values(processConfig.states);
            const stateInfo = statesInfo.find(
              (item) => item.state === process.currentState.state,
            );

            const Result = processRecordComponents[process.targetType];
            return (
              <Result
                key={process.id}
                process={{
                  ...process,
                  relatedEntities: process.relatedEntities,
                  title: processConfig?.name,
                  status: stateInfo?.status,
                  state: "Initiated",
                  stateDate: formatDate(process.currentState.createdAt),
                }}
              />
            );
          })}
        </Table>
        <WorktrayPagination />
      </div>
    </div>
  );
};
