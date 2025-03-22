import { Home, Profile, SignIn, SignUp } from "@/pages";
import Project from "@/pages/project";
import FormsPage from "@/pages/FormsPage";
import FormDetailPage from "@/pages/FormDetailPage";

export const routes = [
  {
    name: "projects",
    path: "/",  // Root path shows all projects
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
];

export default routes;
