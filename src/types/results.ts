import { RelatedEntity } from "@mtfh/common/lib/api/process/v1";

export interface Process {
  id: string;
  processName: string | number;
  targetType: string;
  targetId: string;
  relatedEntities: RelatedEntity[];
  state: string;
  stateStartedAt: string;
  processCreatedAt: string;
  patchAssignment: {
    patchId: string;
    patchName: string;
    responsibleEntityId: string;
    responsibleName: string | null;
  };
}

export enum ProcessSortOptions {
  STATUS = "status",
  TIME_LEFT = "time_left",
  STATE = "state",
  PATCH = "patch",
  PROCESS = "process",
  NAME = "name",
  ADDRESS = "address",
}

export enum OrderByOptions {
  ASC = "asc",
  DESC = "desc",
}

export enum LimitOptions {
  SMALL = 10,
  MEDIUM = 25,
  LARGE = 50,
  EXTRA_LARGE = 100,
}

export enum TimePeriodOptions {
  DAYS_30 = 30,
  DAYS_60 = 60,
  MONTHS_3 = 3,
  MONTHS_6 = 6,
  MONTHS_12 = 12,
  ALL = "",
}

export enum WorktrayFilterOptions {
  PROCESS = "process",
  PATCH = "patch",
  STATUS = "status",
}
