import React from "react";

import jwt_decode from "jwt-decode";

import { Patch } from "@mtfh/common/lib/api/patch/v1";
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

import "./styles.scss";

const getCookieValue = (name) =>
  document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || "";

export const WorktrayView = (): JSX.Element => {
  const token = getCookieValue("hackneyToken");
  const { email: emailAddress } = token
    ? (jwt_decode(token) as { email: string })
    : { email: "" };

  const { data, error } = useAxiosSWR<Patch[]>(
    `${config.patchesAndAreasApiUrl}/patch/all`,
  );
  if (error) {
    return (
      <ErrorSummary
        id="worktray-error"
        title={locale.errors.unableToFetchRecord}
        description={`${locale.errors.unableToFetchRecordDescription} - ${error.message}`}
      />
    );
  }
  if (!data) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  const assignedPatch = data.filter(
    (patchOrArea) =>
      patchOrArea.responsibleEntities[0]?.contactDetails?.emailAddress === emailAddress,
  )[0];

  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        {assignedPatch ? (
          <WorktrayURLProvider
            sessionKey="worktray"
            patchId={assignedPatch.id}
            areaId={assignedPatch.parentId}
          >
            <WorktrayFilters />
            <WorktrayControls />
            <WorktrayList />
          </WorktrayURLProvider>
        ) : (
          <Text>{locale.noPatchAssigned}</Text>
        )}
      </Layout>
    </>
  );
};
