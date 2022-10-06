import React from "react";

import jwt_decode from "jwt-decode";
import { stringify } from "query-string";

import {
  Center,
  ErrorSummary,
  Heading,
  Layout,
  Spinner,
} from "@mtfh/common/lib/components";
import { useAxiosSWR } from "@mtfh/common/lib/http";

import { WorktrayControls, WorktrayFilters, WorktrayList } from "../../components";
import { WorktrayURLProvider } from "../../context/worktray-context";
import { config } from "../../services";
import locale from "../../services/locale";
import { StaffResults } from "../../types/staff";

import "./styles.scss";

const getCookieValue = (name) =>
  document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || "";

export const WorktrayView = (): JSX.Element => {
  const token = getCookieValue("hackneyToken");
  const { email: emailAddress } = jwt_decode(token) as { email: string };

  const { data, error } = useAxiosSWR<StaffResults>(
    `${config.searchApiUrl}/search/staff/?${stringify({
      searchText: emailAddress,
    })}`,
  );

  if (!data && !error) {
    return (
      <Center className="mtfh-worktray__loading">
        <Spinner />
      </Center>
    );
  }

  const patchId =
    data?.results.staff[0].emailAddress === emailAddress
      ? data.results.staff[0].patchId
      : null;

  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        {error ? (
          <ErrorSummary
            id="worktray-error"
            title={locale.errors.unableToFetchRecord}
            description={locale.errors.unableToFetchRecordDescription}
          />
        ) : (
          <WorktrayURLProvider sessionKey="worktray" patchId={patchId}>
            <WorktrayFilters />
            <WorktrayControls />
            <WorktrayList />
          </WorktrayURLProvider>
        )}
      </Layout>
    </>
  );
};
