import React from "react";
import ReactDOM from "react-dom";

import singleSpaReact from "single-spa-react";

import { ErrorSummary } from "@mtfh/common/lib/components";

import Root from "./root";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(error, info, props) {
    console.error(error);
    console.error(info);
    console.error(props);

    return (
      <ErrorSummary
        id="mtfh-worktray"
        title="Error"
        description="Unable to load worktray"
      />
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
