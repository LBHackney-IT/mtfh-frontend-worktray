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
  processConfig: IProcess;
}

export const ProcessRecord = ({
  person,
  property,
  process,
  processConfig,
}: ProcessRecordProps): JSX.Element => {
  const { processClosed, processCancelled, tenureUpdated } = processConfig.states;
  const processName = processConfig?.name;
  const timeConstraint = 10; // TODO
  const statesInfo: ProcessStateInfo[] = Object.values(processConfig.states);
  const status = statesInfo.find(
    (item) => item.state === process.currentState.state,
  )?.status;

  const daysDiff =
    timeConstraint -
    differenceInDays(new Date(), parseISO(process.currentState.createdAt));
  const completionDate = addDays(
    parseISO(process.currentState.createdAt),
    timeConstraint,
  );
  const hoursLeft = differenceInHours(completionDate, new Date());

  const isClosed =
    status &&
    [processClosed.status, processCancelled.status, tenureUpdated.status].includes(
      status,
    );

  const getState = () => {
    if (process.currentState.state === "ProcessCancelled") {
      return { title: "Cancelled", date: formatDate(process.currentState.createdAt) };
    }
    if (process.currentState.state === "ProcessClosed") {
      return { title: "Closed", date: formatDate(process.currentState.createdAt) };
    }
    if (process.currentState.state === "TenureUpdated") {
      return { title: "Completed", date: formatDate(process.currentState.createdAt) };
    }
    return { title: "Initiated", date: formatDate(process.previousStates[0].createdAt) };
  };

  const state = getState();

  const getStatusColor = () => {
    if (status && [processClosed.status, processCancelled.status].includes(status)) {
      return "orange";
    }
    if (status && status.includes(tenureUpdated.status)) {
      return "green";
    }
    if (daysDiff === timeConstraint) {
      return "grey";
    }
    if (hoursLeft > 48) {
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
      <Td className="process-record__item">
        <Text className="title">{state.title}</Text>
        <Text className="createdAt">{state.date}</Text>
      </Td>
      <Td className="process-record__item">
        <Text>
          {isClosed
            ? "-"
            : `${Math.abs(daysDiff)} days ${daysDiff > 0 ? "left" : "overdue"}`}
        </Text>
      </Td>
      <Td className="process-record__item --status">
        <span className={`govuk-tag lbh-tag box ${getStatusColor()}`}>{status}</span>
        <Text size="sm">
          {!isClosed && `${Math.abs(daysDiff)} days ${daysDiff > 0 ? "left" : "overdue"}`}
        </Text>
      </Td>
    </Tr>
  );
};
