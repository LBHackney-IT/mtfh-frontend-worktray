import React, { useContext, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useTenure } from "@mtfh/common/lib/api/tenure/v1";
import {
  Center,
  ErrorSummary,
  Link,
  Spinner,
  Table,
  Td,
  Text,
  Th,
  Tr,
} from "@mtfh/common/lib/components";
import { formatDate } from "@mtfh/common/lib/utils";
import { ProcessStateInfo, processes } from "@mtfh/processes";

import { WorktrayContext } from "../../context/worktray-context";
import { WorktrayResult } from "../../types";
import { WorktrayPagination } from "../worktray-pagination/worktray-pagination";

export interface WorktrayResultsProp {
  children: (results: WorktrayResult[]) => JSX.Element[];
}

export interface WorktrayResultProps {
  result: WorktrayResult;
}

enum TargetType {
  PERSON = "person",
  TENURE = "tenure",
  PROPERTY = "property",
}

export const Result = ({ result, ...props }: WorktrayResultProps): JSX.Element | null => {
  console.log(result);
  const { processName, id: processId, currentState, relatedEntities } = result;
  const processConfig = processes[processName];

  const stateInfoArray: ProcessStateInfo[] = Object.values(processConfig.states);
  const stateInfo = stateInfoArray.find((item) => item.state === currentState.state);

  const status = stateInfo?.status || "";

  const person = relatedEntities.find(
    (entity) => entity.targetType === TargetType.PERSON,
  );

  const createdAtStr = useMemo(
    () => formatDate(currentState.createdAt),
    [currentState.createdAt],
  );

  const { error: tenureError, data: tenure } = useTenure(result.targetId);

  if (tenureError) {
    return <ErrorSummary title="Tenure error" id="tenure-error" />;
  }

  const tenuredAsset = tenure?.tenuredAsset;

  return (
    <Tr className="govuk-table__row mtfh-worktray-list" {...props}>
      <Td>
        {person && (
          <div>
            <Link
              as={RouterLink}
              to={`/person/${person.id}`}
              variant="link"
              target="_blank"
              className="lbh-heading-h4"
            >
              {person.description}
            </Link>
          </div>
        )}
        {tenuredAsset && (
          <div style={{ marginTop: 0 }}>
            <Link
              as={RouterLink}
              to={`/property/${tenuredAsset.id}`}
              variant="link"
              target="_blank"
            >
              {tenuredAsset.fullAddress}
            </Link>
          </div>
        )}
      </Td>
      <Td>
        <Link
          as={RouterLink}
          to={`/processes/${processName}/${processId}`}
          variant="link"
          target="_blank"
          className="lbh-heading-h4"
        >
          {processes[processName]?.name}
        </Link>
      </Td>
      <Td>
        <Link
          as={RouterLink}
          to=""
          variant="link"
          target="_blank"
          className="lbh-heading-h4"
        >
          CP*
        </Link>
      </Td>
      <Td>
        <Text>Initiated</Text>
        <Text>{createdAtStr}</Text>
      </Td>
      <Td>
        <Text className="process__title">3 days left</Text>
      </Td>
      <Td>
        <div className="process__item --status">
          <span className="govuk-tag lbh-tag">{status}</span>
        </div>
      </Td>
    </Tr>
  );
};

export const WorktrayList = (): JSX.Element => {
  const {
    state: { results, error },
  } = useContext(WorktrayContext);

  console.log(results);

  if (error) {
    return (
      <ErrorSummary id="worktray-result-error" title="Error" description="descrtiption" />
    );
  }

  if (results === undefined) {
    return (
      <Center className="mtfh-worktray__loading">
        <Spinner />
      </Center>
    );
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
          {results.map((result) => (
            <Result key={result.id} result={result} />
          ))}
        </Table>
        <WorktrayPagination />
      </div>
    </div>
  );
};
