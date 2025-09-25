import { lazy } from "react";
import { Navigate } from "react-router-dom";

import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";

import materialRoutes from "app/views/material-kit/MaterialRoutes";
import { GlobalLibrary } from "./views/global/GlobalLibrary";
import { EditTest } from "./views/global/EditTest";
import { Practice } from "./views/PracticeTest/PracticeTest";
import { ListOfTests } from "./views/PracticeTest/ListOfTest";
import { Importing } from "./views/ImportingQuestions/Importing";
import { Batch } from "./views/Batches/Batch";
import { QuestionBank } from "./views/QuestionBank/QuestionBank";
import { PreviewBatch } from "./views/Batches/PreviewBatches";
import SolutionForm from "./views/QuestionDialogBox/SolutionForm";
import { Class } from "./views/class/Class";
import { Subject } from "./views/subject/Subject";
import { ChapterName } from "./views/chapter/ChapterName";
import { Topic } from "./views/topic/Topic";
import Course from "./views/Course/Course";
import PreviewTest from "./views/global/PreviewTest";

const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtRegister = Loadable(
  lazy(() => import("app/views/sessions/JwtRegister"))
);
const ForgotPassword = Loadable(
  lazy(() => import("app/views/sessions/ForgotPassword"))
);

const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const routes = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,
      {
        path: "/dashboard/default",
        element: <Analytics />,
        auth: authRoles.admin,
      },
      {
        path: "/global-library",
        element: <GlobalLibrary />,
        auth: authRoles.admin,
      },
{
  path: "/global-library/:folderId?",
  element: <GlobalLibrary />,
  auth: authRoles.admin,
},
{
  path: "/solution/:questionId",
  element: <SolutionForm />,
  auth: authRoles.admin,
},
{
  path: "/editTest/:fileId",
  element: <EditTest />,
  auth: authRoles.admin,
},
{
        path: "/practice-test",
        element: <Practice />,
        auth: authRoles.admin,
      },
{
  path: "/tests/:folderId?",
  element: <ListOfTests />,
  auth: authRoles.admin,
},
{
 path : "/importing/:sectionId",
 element: <Importing />,
  auth: authRoles.admin,
},

{
        path: "/question-bank",
        element: <QuestionBank />,
        auth: authRoles.admin,
      },
{
  path: "/question-bank/:folderId?",
  element: <QuestionBank />,
  auth: authRoles.admin,
},
{
        path: "/batch",
        element: <Batch />,
        auth: authRoles.admin,
      },
      {
        path: "/batch/:batchId",
        element: <PreviewBatch />,
        auth: authRoles.admin,
      },
      {
        path: "/course",
        element: <Course />,
        auth: authRoles.admin,
      },
      {
        path: "/class",
        element: <Class />,
        auth: authRoles.admin,
      },
       {
        path: "/subject",
        element: <Subject />,
        auth: authRoles.admin,
      },
       {
        path: "/chapter",
        element: <ChapterName />,
        auth: authRoles.admin,
      },
      {
        path: "/preview/:id",
        element: <PreviewTest />,
        auth: authRoles.admin,
      },
       {
        path: "/topic",
        element: <Topic />,
        auth: authRoles.admin,
      },
    ],
  },

  // session pages route
  { path: "/session/404", element: <NotFound /> },
  { path: "/session/signin", element: <JwtLogin /> },
  { path: "/session/signup", element: <JwtRegister /> },
  { path: "/session/forgot-password", element: <ForgotPassword /> },

  { path: "/", element: <Navigate to="dashboard/default" /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
