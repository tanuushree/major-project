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
        {/* Change default route to project page */}
        <Route path="/" element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        } />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        
        {/* Other protected routes */}
        <Route path="/dashboard/:projectId" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/project" element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        } />
        <Route path="/forms/:projectName" element={
          <ProtectedRoute>
            <FormsPage />
          </ProtectedRoute>
        } />
        <Route path="/form/:formId" element={
          <ProtectedRoute>
            <FormDetailPage />
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

        {/* Dynamic Routes */}
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
