import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import Project from "@/pages/project";
import FormsPage from "@/pages/FormsPage";
import FormDetailPage from "@/pages/FormDetailPage";
import Landing from "@/pages/Landing";
import { AuthProvider } from "./context/AuthContext";
import { SignIn } from "./pages/sign-in";
import { SignUp } from "./pages/sign-up";
import { Home } from "./pages/home";
import { DashboardPage } from "./pages/dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SavedFormsPage } from "./pages/SavedFormsPage";

function App() {
  const { pathname } = useLocation();

  return (
    <AuthProvider>
      {!(pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/Landing" || pathname === "/dashboard") && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )}

      <Routes>
        {/* Root route shows projects list */}
        <Route path="/" element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        } />

        {/* Auth routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Project and Form routes with new URL pattern */}
        <Route path="/:projectName" element={
          <ProtectedRoute>
            <FormsPage />
          </ProtectedRoute>
        } />
        <Route path="/:projectName/:formId" element={
          <ProtectedRoute>
            <FormDetailPage />
          </ProtectedRoute>
        } />

        {/* Other protected routes */}
        <Route path="/dashboard/:projectId" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route 
          path="/saved-forms" 
          element={
            <ProtectedRoute>
              <SavedFormsPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
