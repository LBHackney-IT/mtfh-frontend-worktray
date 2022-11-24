export interface StaffResult {
  firstName: string;
  lastName: string;
  emailAddress: string;
  patches: Patches[];
}

export interface Patches {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
}

export interface StaffResults {
  results: {
    staff: StaffResult[];
  };
  total: number;
}
