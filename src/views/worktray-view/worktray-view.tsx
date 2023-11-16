import React, { useEffect } from "react";

import jwt_decode from "jwt-decode";

import { Patch, getAllPatchesAndAreas } from "@mtfh/common/lib/api/patch/v1";
import {
  Center,
  ErrorSummary,
  Heading,
  Layout,
  Spinner,
  Text,
} from "@mtfh/common/lib/components";

import { WorktrayControls, WorktrayFilters, WorktrayList } from "../../components";
import { WorktrayURLProvider } from "../../context/worktray-context";
import locale from "../../services/locale";

import "./styles.scss";

const getCookieValue = (name) =>
  document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || "";

export const WorktrayView = (): JSX.Element => {
  const [showSpinner, setShowSpinner] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [assignedPatch, setAssignedPatch] = React.useState<Patch>();
  const token = getCookieValue("hackneyToken");
  const { email: emailAddress } = token
    ? (jwt_decode(token) as { email: string })
    : { email: "" };

  useEffect(() => {
    setShowSpinner(true);
    getAllPatchesAndAreas()
      .then((data) => {
        const patch = data.filter(
          (patchOrArea) =>
            patchOrArea.responsibleEntities[0].contactDetails.emailAddress ===
            emailAddress,
        )[0];
        setAssignedPatch(patch);
      })
      .catch((e) => {
        setErrorMessage(e.message);
      })
      .finally(() => {
        setShowSpinner(false);
      });
  }, [emailAddress]);

  if (showSpinner) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <>
      <hr className="divider" />
      <Layout>
        <Heading as="h1">{locale.title}</Heading>
        {errorMessage && (
          <ErrorSummary
            id="worktray-error"
            title={locale.errors.unableToFetchRecord}
            description={`${locale.errors.unableToFetchRecordDescription} - ${errorMessage}`}
          />
        )}

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
