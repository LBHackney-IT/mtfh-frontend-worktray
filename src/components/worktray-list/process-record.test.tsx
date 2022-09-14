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
import { Tenure } from "@mtfh/common/lib/api/tenure/v1";
import * as tenureV1 from "@mtfh/common/lib/api/tenure/v1/service";
import { Table, Tbody } from "@mtfh/common/lib/components";
import { processes } from "@mtfh/processes";

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
              currentState: {
                ...mockProcess.currentState,
                state: "BreachChecksPassed",
                createdAt: new Date("2022-08-20").toISOString(),
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "BreachChecksPassed",
                createdAt: subDays(new Date(), 9).toISOString(),
              },
              previousStates: [],
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
              currentState: {
                ...mockProcess.currentState,
                state: "BreachChecksPassed",
                createdAt: subDays(new Date(), 5).toISOString(),
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "BreachChecksPassed",
                createdAt: subDays(new Date(), 12).toISOString(),
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "ProcessClosed",
                createdAt: "2022-01-01T00:00:00Z",
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "ProcessCancelled",
                createdAt: "2022-01-01T00:00:00Z",
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "ProcessCompleted",
                createdAt: "2022-01-01T00:00:00Z",
              },
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
              currentState: {
                ...mockProcess.currentState,
                state: "ProcessCompleted",
                createdAt: "2022-01-01T00:00:00Z",
              },
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
});
