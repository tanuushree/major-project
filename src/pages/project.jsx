import React, { useState } from "react";
import { Button, Card, Input, Dialog } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom"; // Import navigation hook

function Project() {
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [aboutProject, setAboutProject] = useState("");
  const navigate = useNavigate(); // Hook for navigation

  const createProject = () => {
    if (projectName && aboutProject) {
      setProjects([...projects, { name: projectName, about: aboutProject }]);
      setProjectName("");
      setAboutProject("");
      setOpenDialog(false);
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Header & Button Row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          {/* Create Project Button */}
          <Button onClick={() => setOpenDialog(true)} className="text-black bg-white w-full sm:w-auto">
            Create New Project
          </Button>
        </div>

        {/* Create Project Dialog */}
        <Dialog open={openDialog} handler={setOpenDialog} size="sm">
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Create New Project</h2>
            <Input
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              label="About Project"
              value={aboutProject}
              onChange={(e) => setAboutProject(e.target.value)}
            />
            <Button onClick={createProject} className="bg-black text-white">
              Create
            </Button>
          </Card>
        </Dialog>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {projects.map((project, index) => (
            <Card key={index} className="p-4 space-y-4">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <p className="text-gray-300">{project.about}</p>

              {/* Open Project Button (Navigates to Forms Page) */}
              <Button
                className="bg-red-500 text-white w-full shadow-none border-none outline-none hover:bg-red-600"
                onClick={() => navigate(`/forms/${encodeURIComponent(project.name)}`)}
              >
                Open Project
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Project;
