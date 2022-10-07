export interface StaffResult {
  firstName: string;
  lastName: string;
  emailAddress: string;
  patchId: string | null;
}

export interface StaffResults {
  results: {
    staff: StaffResult[];
  };
  total: number;
}
