import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { addDays, differenceInDays, differenceInHours, parseISO } from "date-fns";

import { Process } from "@mtfh/common/lib/api/process/v1";
import { Link, Td, Text, Tr } from "@mtfh/common/lib/components";
import { formatDate } from "@mtfh/common/lib/utils";
import { IProcess, ProcessStateInfo } from "@mtfh/processes";

import "./styles.scss";

export interface ProcessRecordProps {
  person: {
    id: string;
    fullName: string;
  };
  property: {
    id?: string;
    address?: string;
  };
  process: Process;
  processConfig: IProcess | undefined;
  simple?: boolean;
}

enum ProcessStates {
  PROCESS_CLOSED = "ProcessClosed",
  PROCESS_CANCELLED = "ProcessCancelled",
  PROCESS_COMPLETED = "ProcessCompleted",
}

export const ProcessRecord = ({
  person,
  property,
  process,
  processConfig,
  simple = false,
}: ProcessRecordProps): JSX.Element => {
  const processName = processConfig?.name || process.processName;
  const timeConstraint =
    processConfig?.states[
      process.currentState.state.charAt(0).toLowerCase() +
        process.currentState.state.slice(1)
    ]?.timeConstraint;
  let status;
  if (processConfig) {
    const statesInfo: ProcessStateInfo[] = Object.values(processConfig?.states);
    status = statesInfo.find((item) => item.state === process.currentState.state)?.status;
  }

  let daysDiff = 0;
  let hoursLeft = 48;
  if (timeConstraint) {
    daysDiff =
      timeConstraint -
      differenceInDays(new Date(), parseISO(process.currentState.createdAt));
    const completionDate = addDays(
      parseISO(process.currentState.createdAt),
      timeConstraint,
    );
    hoursLeft = differenceInHours(completionDate, new Date());
  }

  const isClosed =
    status &&
    [
      ProcessStates.PROCESS_CLOSED,
      ProcessStates.PROCESS_CANCELLED,
      ProcessStates.PROCESS_COMPLETED,
    ].includes(status);

  const getState = () => {
    if (process.currentState.state === ProcessStates.PROCESS_CANCELLED) {
      return { title: "Cancelled", date: formatDate(process.currentState.createdAt) };
    }
    if (process.currentState.state === ProcessStates.PROCESS_CLOSED) {
      return { title: "Closed", date: formatDate(process.currentState.createdAt) };
    }
    if (process.currentState.state === ProcessStates.PROCESS_COMPLETED) {
      return { title: "Completed", date: formatDate(process.currentState.createdAt) };
    }
    return {
      title: "Initiated",
      date: formatDate(
        process.previousStates[0]
          ? process.previousStates[0].createdAt
          : process.currentState.createdAt,
      ),
    };
  };

  const state = getState();

  const getStatusColor = () => {
    if (
      status &&
      (
        [ProcessStates.PROCESS_CLOSED, ProcessStates.PROCESS_CANCELLED] as string[]
      ).includes(process.currentState.state)
    ) {
      return "orange";
    }
    if (status && process.currentState.state === ProcessStates.PROCESS_COMPLETED) {
      return "green";
    }
    if (daysDiff === timeConstraint) {
      return "grey";
    }
    if (hoursLeft >= 48) {
      return "aqua";
    }
    if (hoursLeft > 0 && hoursLeft < 48) {
      return "amber";
    }
    return "red";
  };

  return (
    <Tr className="govuk-table__row process-record">
      <Td className="process-record__item">
        <Link
          as={RouterLink}
          to={`/person/${person.id}`}
          variant="link"
          target="_blank"
          className="lbh-heading-h4"
        >
          {person.fullName}
        </Link>
        {property.id && property.address && (
          <Link
            className="--address"
            as={RouterLink}
            to={`/property/${property.id}`}
            variant="link"
            target="_blank"
          >
            {property.address}
          </Link>
        )}
      </Td>
      <Td className="process-record__item --processName">
        <Link
          as={RouterLink}
          to={`/processes/${process.processName}/${process.id}`}
          variant="link"
          target="_blank"
          className="lbh-heading-h4"
        >
          {processName}
        </Link>
      </Td>
      {!simple && (
        <Td className="process-record__item">
          {/*TODO*/}
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
      )}
      <Td className="process-record__item">
        <Text className="title">{state.title}</Text>
        <Text className="createdAt">{state.date}</Text>
      </Td>
      {!simple && (
        <Td className="process-record__item">
          <Text>
            {isClosed || !timeConstraint
              ? "-"
              : `${Math.abs(daysDiff)} days ${daysDiff > 0 ? "left" : "overdue"}`}
          </Text>
        </Td>
      )}
      <Td className="process-record__item --status">
        <span className={`govuk-tag lbh-tag box ${getStatusColor()}`}>
          {status || ""}
        </span>
        {!simple && (
          <Text size="sm">
            {!isClosed &&
              timeConstraint &&
              `${Math.abs(daysDiff)} days ${daysDiff > 0 ? "left" : "overdue"}`}
          </Text>
        )}
      </Td>
    </Tr>
  );
};
