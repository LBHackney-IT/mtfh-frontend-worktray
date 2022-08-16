import { ProcessState } from "@mtfh/common/lib/api/process/v1";

export interface WorktrayResult {
  id: string;
  processName: string;
  targetType: string;
  targetId: string;
  currentState: ProcessState;
  relatedEntities: Record<string, string>[];
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

export enum WorktrayFilterOptions {
  PROCESS = "process",
  PATCH = "patch",
  STATUS = "status",
}
