import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Link, Td, Text, Tr } from "@mtfh/common/lib/components";

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
  process: {
    id: string;
    processName: string;
    title: string;
    state: string;
    stateDate: string;
    status: string;
  };
}

export const ProcessRecord = ({
  person,
  property,
  process,
}: ProcessRecordProps): JSX.Element => {
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
          {process.title}
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
        <Text className="title">{process.state}</Text>
        <Text className="createdAt">{process.stateDate}</Text>
      </Td>
      <Td>
        {/*TODO*/}
        <Text>3 days left</Text>
      </Td>
      <Td className="process-record__item --status">
        <span className="govuk-tag lbh-tag">{process.status}</span>
      </Td>
    </Tr>
  );
};
