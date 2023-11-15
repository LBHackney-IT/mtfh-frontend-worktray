import React from "react";

import { render, server } from "@hackney/mtfh-test-utils";
import { screen, waitFor } from "@testing-library/react";
import { rest } from "msw";

import { Patch } from "@mtfh/common/lib/api/patch/v1";

import App from "./app";
import { locale } from "./services";

const cookieValue =
  "hackneyToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTUwOTc4MjMzNDMwODYzNjM3NzkiLCJlbWFpbCI6InRlc3RzQGhhY2tuZXkuZ292LnVrIiwiaXNzIjoiSGFja25leSIsIm5hbWUiOiJUZXN0IFRlc3QiLCJpYXQiOjEyMzQ1Njc4OTB9.MRnNHSYMi9majpommvHmSuLMb0tnMvYlX7AXs2DyO6U";

const examplePatch: Patch = {
  id: "5d59f3af-a692-49ae-9483-f631772ae3ec",
  name: "Fake_Rupert Fake_Cruickshank",
  parentId: "26e9426a-59a5-4863-9077-f8cad9d3c82b",
  domain: "MMH",
  patchType: "patch",
  responsibleEntities: [
    {
      id: "5d59f3af-a692-49ae-9483-f631772ae3ec",
      name: "",
      contactDetails: {
        emailAddress: "tests@hackney.gov.uk",
      },
      responsibleType: "HousingOfficer",
    },
  ],
  versionNumber: 0,
};

describe("<App />", () => {
  test("it renders correctly without cookie", async () => {
    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
    expect(screen.getAllByText(locale.noPatchAssigned));
  });

  test("it renders correctly with cookie", async () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: cookieValue,
    });

    server.use(
      rest.get("/api/v1/patch/all", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([examplePatch]));
      }),
    );

    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
  });

  test("it renders correctly with cookie but no matching email", async () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: cookieValue,
    });

    const mismatchedPatch = {
      ...examplePatch,
      responsibleEntities: [
        {
          ...examplePatch.responsibleEntities[0],
          contactDetails: {
            emailAddress: "not-matching@hackney.gov.uk",
          },
        },
      ],
    };

    server.use(
      rest.get("/api/v1/patch/all", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([mismatchedPatch]));
      }),
    );

    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
  });
});
