import React from "react";

import { Process, RelatedEntity } from "@mtfh/common/lib/api/process/v1";
import { useTenure } from "@mtfh/common/lib/api/tenure/v1";

import { ProcessRecord } from "../process-record";

interface TenureProcessRecordProps {
  process: Pick<Process, "id" | "processName" | "targetId" | "relatedEntities"> & {
    title: string;
    status: string;
    state: string;
    stateDate: string;
  };
}

export const TenureProcessRecord = ({
  process: {
    id,
    processName,
    title,
    status,
    state,
    stateDate,
    targetId,
    relatedEntities,
  },
}: TenureProcessRecordProps): JSX.Element => {
  const relatedEntity = (relatedEntities as RelatedEntity[])?.[0];
  const { data: tenure } = useTenure(targetId);

  return (
    <ProcessRecord
      person={{
        id: relatedEntity.id,
        fullName: relatedEntity.description,
      }}
      property={{
        id: tenure?.tenuredAsset.id,
        address: tenure?.tenuredAsset.fullAddress,
      }}
      process={{
        id,
        processName,
        title,
        state,
        stateDate,
        status,
      }}
    />
  );
};
