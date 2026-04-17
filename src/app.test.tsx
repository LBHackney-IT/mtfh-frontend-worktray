import React from "react";

import { render, server } from "@hackney/mtfh-test-utils";
import { screen, waitFor } from "@testing-library/react";
import { rest } from "msw";

import { Patch } from "@mtfh/common/lib/api/patch/v1";

import App from "./app";
import { locale } from "./services";

function base64UrlEncode(string) {
    const base64 = Buffer.from(string).toString('base64');
    return base64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createJwt(payload) {
    const header = {
        alg: "none",
        typ: "JWT"
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    return `${encodedHeader}.${encodedPayload}.`;
}

const cookieValue = ({tokenPayload, isCognito}) =>
  `${isCognito ? "hackneyCognitoToken" : "hackneyToken"}=${createJwt(tokenPayload)}`

const tokenPayloadUserNoPatches = {
  email: "no.patches@hackney.gov.uk",
  name: "No Patches",
}

const tokenPayloadUserWithPatches = {
  email: "yes.patches@hackney.gov.uk",
  name: "Yes Patches",
}

const examplePatch = (responsibleEmail: string): Patch => {
  return {
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
          emailAddress: responsibleEmail,
        },
        responsibleType: "HousingOfficer",
      },
    ],
    versionNumber: 0,
  };
}

const token = createJwt({ user: "exampleUser" });

describe("<App />", () => {
  test("it renders correctly without cookie", async () => {
    server.use(
      rest.get("/api/v1/patch/all", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([examplePatch("tests@hackney.gov.uk")]));
      }),
    );

    try {
        render(<App />, { url: "/" });
        await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
        throw new Error("The component rendered successfully, but an error was expected.");
    } catch (error) {
        expect(error).toHaveProperty('message', 'No token found!');
    }
  });

  test.each([false, true])("it renders correctly with cookie", async (isCognitoToken: boolean) => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: cookieValue({tokenPayload: tokenPayloadUserWithPatches, isCognito: isCognitoToken}),
    });

    server.use(
      rest.get("/api/v1/patch/all", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([examplePatch(tokenPayloadUserWithPatches.email)]));
      }),
    );

    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
  });

  test("it renders correctly with cookie but no matching email", async () => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: cookieValue({tokenPayload: tokenPayloadUserNoPatches, isCognito: false}),
    });

    server.use(
      rest.get("/api/v1/patch/all", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([examplePatch("non-matching-email@hackney.gov.uk")]));
      }),
    );

    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
  });
});
