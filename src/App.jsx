import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import Project from "@/pages/project";
import FormsPage from "@/pages/FormsPage";
import FormDetailPage from "@/pages/FormDetailPage";
import Landing from "@/pages/Landing";

function App() {
  const { pathname } = useLocation();

  return (
    <>
      {!(pathname === "/sign-in" || pathname === "/sign-up" || pathname === "/Landing") && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )}

      <Routes>
        {/* Landing page redirect */}
        <Route path="/" element={<Navigate to="/Landing" replace />} />
        <Route path="/Landing" element={<Landing />} /> {/* Add this route */}
        
        {/* Dynamic Routes */}
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}

        {/* Projects Route */}
        <Route path="/project" element={<Project />} />
        <Route path="/forms/:projectName" element={<FormsPage />} />
        <Route path="/form/:formId" element={<FormDetailPage />} />

        {/* Catch-all Route */}
        {/* <Route path="*" element={<Navigate to="/home" replace />} /> */}
      </Routes>
    </>
  );
}

export default App;
