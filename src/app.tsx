import React from "react";
import { Route, Switch } from "react-router-dom";

import { WorktrayView } from "./views";

const App = (): JSX.Element => (
  <Switch>
    <Route path="/">
      <WorktrayView />
    </Route>
  </Switch>
);

export default App;
