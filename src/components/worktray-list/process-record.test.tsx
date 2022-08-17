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

import { Table } from "@mtfh/common/lib/components";

import { TenureProcessRecord } from "./tenure-record";

describe("process-record-component", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("it renders TenureProcessRecord correctly", async () => {
    server.use(getTenureV1(mockActiveTenureV1, 200));
    const { container } = render(
      <Table>
        <TenureProcessRecord
          process={{
            ...mockProcessV1,
            relatedEntities: [
              {
                id: mockPersonV1.id,
                description: `${mockPersonV1.firstName} ${mockPersonV1.surname}`,
                targetType: "person",
                subType: "",
              },
            ],
            title: "Test Title",
            status: "Status",
            state: "Initiated",
            stateDate: "01/01/2022",
          }}
        />
      </Table>,
    );
    await expect(
      screen.findByText(mockActiveTenureV1.tenuredAsset.fullAddress),
    ).resolves.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
