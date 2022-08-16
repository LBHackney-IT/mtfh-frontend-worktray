import { ProcessState } from "@mtfh/common/lib/api/process/v1";

export interface WorktrayResult {
  id: string;
  processName: string;
  targetType: string;
  targetId: string;
  currentState: ProcessState;
  relatedEntities: Record<string, string>[];
}

export enum ProcessSortOrderOptions {
  STATUS = "status",
  TIME_LEFT_ASC = "time-left-asc",
  TIME_LEFT_DESC = "time-left-desc",
  STATE_ASC = "state-asc",
  STATE_DESC = "state-desc",
  PATCH_ASC = "patch-asc",
  PATCH_DESC = "patch-desc",
  PROCESS_ASC = "process-asc",
  PROCESS_DESC = "process-desc",
  NAME_ASC = "name-asc",
  NAME_DESC = "name-desc",
  ADDRESS_ASC = "address-asc",
  ADDRESS_DESC = "address-desc",
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
  DAYS_30 = "30",
  DAYS_60 = "60",
  MONTHS_3 = "3",
  MONTHS_6 = "6",
  MONTHS_12 = "12",
  ALL = "",
}
