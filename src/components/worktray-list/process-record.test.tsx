import React from "react";

import {
  getTenureV1,
  mockActiveTenureV1,
  mockPersonV1,
  mockProcessV1,
  render,
  server,
} from "@hackney/mtfh-test-utils";
import { screen } from "@testing-library/react";
import { subDays } from "date-fns";

import { AxiosSWRResponse } from "@mtfh/common";
import { Person } from "@mtfh/common/lib/api/person/v1";
import * as personV1 from "@mtfh/common/lib/api/person/v1/service";
import { Tenure } from "@mtfh/common/lib/api/tenure/v1";
import * as tenureV1 from "@mtfh/common/lib/api/tenure/v1/service";
import { Table, Tbody } from "@mtfh/common/lib/components";
import { processes } from "@mtfh/processes";

import { PersonProcessRecord } from "./person-record";
import { TenureProcessRecord } from "./tenure-record";

const { states } = processes.soletojoint;

mockProcessV1.previousStates[0].createdAt = "2022-08-20T07:49:07.7892599Z";
const mockProcess = {
  ...mockProcessV1,
  relatedEntities: [
    {
      id: mockPersonV1.id,
      description: `${mockPersonV1.firstName} ${mockPersonV1.surname}`,
      targetType: "person",
      subType: "",
    },
  ],
  patchAssignment: {
    patchId: "19400185-a8d2-4f3f-b217-dc5d485a1210",
    patchName: "CP7",
    responsibleEntityId: "5f93ea0f-0986-4e49-9093-b033559ed8f0",
    responsibleName: null,
  },
};

describe("process-record-component", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("it renders TenureProcessRecord correctly", async () => {
    jest.useFakeTimers("modern").setSystemTime(new Date("2022-08-20"));
    jest.spyOn(tenureV1, "useTenure").mockReturnValue({
      data: mockActiveTenureV1,
    } as AxiosSWRResponse<Tenure>);
    const { container } = render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "BreachChecksPassed",
              stateStartedAt: new Date("2022-08-20").toISOString(),
              processCreatedAt: "2022-08-20T07:49:07.7892599Z",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(
      screen.findByText(mockActiveTenureV1.tenuredAsset.fullAddress),
    ).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.breachChecksPassed.status);
    expect(status.className).toContain("grey");
    expect(container).toMatchSnapshot();
  });

  test("it renders TenureProcessRecord correctly, 1 day left", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "BreachChecksPassed",
              stateStartedAt: subDays(new Date(), 9).toISOString(),
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(
      screen.findByText(mockActiveTenureV1.tenuredAsset.fullAddress),
    ).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.breachChecksPassed.status);
    expect(status.className).toContain("amber");
  });

  test("it renders TenureProcessRecord correctly, 5 days left", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "BreachChecksPassed",
              stateStartedAt: subDays(new Date(), 5).toISOString(),
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(
      screen.findByText(mockActiveTenureV1.tenuredAsset.fullAddress),
    ).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.breachChecksPassed.status);
    expect(status.className).toContain("aqua");
  });

  test("it renders TenureProcessRecord correctly, overdue", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "BreachChecksPassed",
              stateStartedAt: subDays(new Date(), 12).toISOString(),
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(
      screen.findByText(mockActiveTenureV1.tenuredAsset.fullAddress),
    ).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.breachChecksPassed.status);
    expect(status.className).toContain("red");
  });

  test("it renders TenureProcessRecord correctly, state=ProcessClosed", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "ProcessClosed",
              stateStartedAt: "2022-01-01T00:00:00Z",
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(screen.findByText("-")).resolves.toBeInTheDocument();
    await expect(screen.findByText("Closed")).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.processClosed.status);
    expect(status.className).toContain("orange");
  });

  test("it renders TenureProcessRecord correctly, state=ProcessCancelled", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "ProcessCancelled",
              stateStartedAt: "2022-01-01T00:00:00Z",
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(screen.findByText("-")).resolves.toBeInTheDocument();
    await expect(screen.findByText("Cancelled")).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.processCancelled.status);
    expect(status.className).toContain("orange");
  });

  test("it renders TenureProcessRecord correctly, state=TenureUpdated", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "ProcessCompleted",
              stateStartedAt: "2022-01-01T00:00:00Z",
              processCreatedAt: "",
            }}
            processConfig={processes.soletojoint}
          />
        </Tbody>
      </Table>,
    );
    await expect(screen.findByText("-")).resolves.toBeInTheDocument();
    await expect(screen.findByText("Completed")).resolves.toBeInTheDocument();
    const status = await screen.findByText(states.processCompleted.status);
    expect(status.className).toContain("green");
  });

  test("it renders TenureProcessRecord correctly if processConfig not provided", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    render(
      <Table>
        <Tbody>
          <TenureProcessRecord
            process={{
              ...mockProcess,
              state: "ProcessCompleted",
              stateStartedAt: "2022-01-01T00:00:00Z",
              processCreatedAt: "",
            }}
            processConfig={undefined}
          />
        </Tbody>
      </Table>,
    );
    await expect(screen.findByText("-")).resolves.toBeInTheDocument();
    await expect(screen.findByText("Completed")).resolves.toBeInTheDocument();
    await expect(
      screen.findByText(mockProcessV1.processName),
    ).resolves.toBeInTheDocument();
  });

  test("it renders PersonProcessRecord correctly", async () => {
    jest.useFakeTimers("modern").setSystemTime(new Date("2022-08-20"));
    jest.spyOn(personV1, "usePerson").mockReturnValue({
      data: mockPersonV1,
    } as AxiosSWRResponse<Person>);
    const { container } = render(
      <Table>
        <Tbody>
          <PersonProcessRecord
            process={{
              ...mockProcess,
              state: "NameSubmitted",
              stateStartedAt: new Date("2022-08-20").toISOString(),
              processCreatedAt: "2022-08-20T07:49:07.7892599Z",
            }}
            processConfig={processes.changeofname}
          />
        </Tbody>
      </Table>,
    );
    await expect(
      screen.findByText(`${mockPersonV1.firstName} ${mockPersonV1.surname}`),
    ).resolves.toBeInTheDocument();
    const status = await screen.findByText(
      processes.changeofname.states.nameSubmitted.status,
    );
    expect(status.className).toContain("aqua");
    expect(container).toMatchSnapshot();
  });
});
