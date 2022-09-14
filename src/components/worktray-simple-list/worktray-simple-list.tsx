import React, { useMemo } from "react";

import { ProcessesResponse, useProcesses } from "@mtfh/common/lib/api/process/v1";
import {
  Center,
  ErrorSummary,
  SimplePagination,
  SimplePaginationButton,
  Spinner,
  Table,
  Tbody,
} from "@mtfh/common/lib/components";
import { processes as processesConfig } from "@mtfh/processes";

import { locale } from "../../services";
import { TenureProcessRecord } from "../worktray-list";

export interface WorktraySimpleListProps {
  targetId: string;
}

const NoProcesses = () => {
  return <p>No processes</p>;
};

const processRecordComponents = {
  tenure: TenureProcessRecord,
};

export const WorktraySimpleList = ({
  targetId,
}: WorktraySimpleListProps): JSX.Element => {
  const { data, size, setSize, error } = useProcesses(targetId);
  const response = useMemo<ProcessesResponse | null>(() => {
    if (!data) {
      return null;
    }
    return data[size - 1];
  }, [data, size]);

  if (error) {
    return (
      <ErrorSummary
        id="worktray-result-error"
        title={locale.errors.unableToFetchRecord}
        description={locale.errors.unableToFetchRecordDescription}
      />
    );
  }

  if (!response) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  const {
    results: processes,
    paginationDetails: { nextToken },
  } = response;

  if (!processes.length) {
    return <NoProcesses />;
  }

  return (
    <div className="worktray-simple-list">
      <Table>
        <Tbody>
          {processes.map((process) => {
            const processConfig = processesConfig[process.processName];
            const Result = processRecordComponents[process.targetType];
            return (
              <Result
                key={process.id}
                process={process}
                processConfig={processConfig}
                simple
              />
            );
          })}
        </Tbody>
      </Table>
      {(size > 1 || nextToken) && (
        <SimplePagination>
          {size !== 1 && (
            <SimplePaginationButton variant="previous" onClick={() => setSize(size - 1)}>
              Previous
            </SimplePaginationButton>
          )}
          {nextToken && (
            <SimplePaginationButton variant="next" onClick={() => setSize(size + 1)}>
              Next
            </SimplePaginationButton>
          )}
        </SimplePagination>
      )}
    </div>
  );
};
