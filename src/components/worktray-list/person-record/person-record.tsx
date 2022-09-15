import React from "react";

import { usePerson } from "@mtfh/common/lib/api/person/v1";
import { Process } from "@mtfh/common/lib/api/process/v1";
import { IProcess } from "@mtfh/processes";

import { ProcessRecord } from "../process-record";

interface PersonProcessRecordProps {
  process: Process;
  processConfig: IProcess | undefined;
  simple?: boolean;
}

export const PersonProcessRecord = (props: PersonProcessRecordProps): JSX.Element => {
  const { targetId } = props.process;
  const { data: person } = usePerson(targetId);

  return (
    <ProcessRecord
      person={{
        id: person?.id,
        fullName: `${person?.firstName} ${person?.surname}`,
      }}
      {...props}
    />
  );
};
