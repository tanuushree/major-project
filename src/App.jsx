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
import { Analytics } from "./pages/analytics";

function App() {
  const { pathname } = useLocation();

  // Updated condition to also check for dashboard route pattern
  const hideNavbar = pathname === "/" || 
                    pathname === "/sign-in" || 
                    pathname === "/sign-up" || 
                    pathname === "/Landing" || 
                    pathname.startsWith("/dashboard");  // Added analytics to hidden navbar paths

  return (
    <AuthProvider>
      {!hideNavbar && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )}

      <Routes>
        {/* Root route shows Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Home route (unprotected) */}
        <Route path="/home" element={<Home />} />

        {/* Projects route (protected) */}
        <Route path="/projects" element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        } />

        {/* Auth routes */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Analytics route */}
        <Route path="/analytics/:projectId" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        
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
