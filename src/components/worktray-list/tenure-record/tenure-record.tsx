import React from "react";

import { Process, RelatedEntity } from "@mtfh/common/lib/api/process/v1";
import { useTenure } from "@mtfh/common/lib/api/tenure/v1";
import { IProcess } from "@mtfh/processes";

import { ProcessRecord } from "../process-record";

interface TenureProcessRecordProps {
  process: Process;
  processConfig: IProcess;
  simple?: boolean;
}

export const TenureProcessRecord = (props: TenureProcessRecordProps): JSX.Element => {
  const { targetId, relatedEntities } = props.process;
  const relatedEntity = (relatedEntities as RelatedEntity[])?.[0];
  const { data: tenure } = useTenure(targetId);

  return (
    <ProcessRecord
      person={{
        id: relatedEntity?.id,
        fullName: relatedEntity?.description,
      }}
      property={{
        id: tenure?.tenuredAsset.id,
        address: tenure?.tenuredAsset.fullAddress,
      }}
      {...props}
    />
  );
};
