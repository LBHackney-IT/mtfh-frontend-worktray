import React from "react";

import { Heading, Layout } from "@mtfh/common/lib/components";

import "./styles.scss";
import { WorktrayFilters } from "../../components/worktray-filters/worktray-filters";
import { WorktrayList } from "../../components/worktray-list/worktray-list";
import { WorktrayURLProvider } from "../../context/worktray-context";
import locale from "../../services/locale";

export const WorktrayView = (): JSX.Element => {
  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        <WorktrayFilters />
        <WorktrayURLProvider>
          <WorktrayList />
        </WorktrayURLProvider>
      </Layout>
    </>
  );
};
