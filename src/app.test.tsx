import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { screen, waitFor } from "@testing-library/react";

import App from "./app";
import { locale } from "./services";

describe("<App />", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value:
        "hackneyToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTUwOTc4MjMzNDMwODYzNjM3NzkiLCJlbWFpbCI6InRlc3RzQGhhY2tuZXkuZ292LnVrIiwiaXNzIjoiSGFja25leSIsIm5hbWUiOiJUZXN0IFRlc3QiLCJpYXQiOjEyMzQ1Njc4OTB9.MRnNHSYMi9majpommvHmSuLMb0tnMvYlX7AXs2DyO6U",
    });
  });

  test("it renders correctly", async () => {
    render(<App />, { url: "/" });
    await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
    expect(screen.getAllByText(locale.title));
  });
});
