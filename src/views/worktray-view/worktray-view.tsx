import React from "react";

import { Heading, Layout } from "@mtfh/common/lib/components";

import "./styles.scss";
import { WorktrayFilters } from "../../components/worktray-filters/worktray-filters";
import locale from "../../services/locale";

export const WorktrayView = (): JSX.Element => {
  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        <WorktrayFilters />
      </Layout>
    </>
  );
};
