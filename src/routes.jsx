import { Home, Profile, SignIn, SignUp } from "@/pages";
import Project from "@/pages/project";
import FormsPage from "@/pages/FormsPage";
import FormDetailPage from "@/pages/FormDetailPage";
import { Analytics } from "@/pages/analytics";

export const routes = [
  {
    name: "projects",
    path: "/projects",  // Root path shows all projects
    element: <Project />,
  },
  {
    name: "projectForms",
    path: "/:projectName",  // Shows forms for a specific project
    element: <FormsPage />,
  },
  {
    name: "formDetail",
    path: "/:projectName/:formId",  // Shows specific form
    element: <FormDetailPage />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "analytics",
    path: "/analytics",
    element: <Analytics />,
  },
];

export default routes;
