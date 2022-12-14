import React from "react";

import jwt_decode from "jwt-decode";
import { stringify } from "query-string";

import {
  Center,
  ErrorSummary,
  Heading,
  Layout,
  Spinner,
  Text,
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
  const { email: emailAddress } = token
    ? (jwt_decode(token) as { email: string })
    : { email: "" };

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

  const { id: patchId, areaId } =
    emailAddress && data?.results.staff[0].emailAddress === emailAddress
      ? data.results.staff[0].patches[0]
      : { id: "", areaId: "" };

  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        {error && (
          <ErrorSummary
            id="worktray-error"
            title={locale.errors.unableToFetchRecord}
            description={locale.errors.unableToFetchRecordDescription}
          />
        )}

        {patchId ? (
          <WorktrayURLProvider sessionKey="worktray" patchId={patchId} areaId={areaId}>
            <WorktrayFilters />
            <WorktrayControls />
            <WorktrayList />
          </WorktrayURLProvider>
        ) : (
          <Text>
            You are not assigned to any patches. Please speak to your manager to be
            assigned a patch.
          </Text>
        )}
      </Layout>
    </>
  );
};
