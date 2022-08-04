import React from "react";

import { ConfirmationRouter } from "@mtfh/common/lib/components";
import { useFeatureToggle } from "@mtfh/common/lib/hooks";

import App from "./app";

const Root = (): JSX.Element => {
  const hasWorktray = useFeatureToggle("MMH.Worktray");

  return hasWorktray ? (
    <ConfirmationRouter>
      <App />
    </ConfirmationRouter>
  ) : (
    <div />
  );
};

export default Root;
