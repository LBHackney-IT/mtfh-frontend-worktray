import React from "react";

import { render } from "@hackney/mtfh-test-utils";
import { screen } from "@testing-library/react";

import App from "./app";
import { locale } from "./services";

describe("<App />", () => {
  test("it renders correctly", () => {
    render(<App />, { url: "/" });
    expect(screen.getAllByText(locale.title));
  });
});
