import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from "@/services/api";
import {
  Typography,
  Button,
  Card,
  CardBody,
  CardFooter,
  Dialog,
  Input,
  Textarea,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { PlusIcon, ChartBarIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext";

function Project() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }
    fetchProjects();
  }, [currentUser, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projects = await projectService.getProjects();
      setProjects(projects || []);
      setError("");
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.error || "Failed to load projects. Please try again.");
      if (err.status === 401) {
        logout();
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      const newProject = await projectService.createProject({
        name: projectName.trim(),
        description: projectDescription,
      });
      
      setProjects([...projects, newProject]);
      setProjectName("");
      setProjectDescription("");
      setOpenDialog(false);
      setError("");

      const encodedProjectName = encodeURIComponent(newProject.name);
      localStorage.setItem('currentProjectId', newProject.id);
      navigate(`/${encodedProjectName}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.error || "Failed to create project. Please try again.");
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/sign-in");
  };

  const handleOpenProject = (project) => {
    if (!project || !project.name) {
      console.error('Invalid project data');
      return;
    }
    const encodedProjectName = encodeURIComponent(project.name);
    localStorage.setItem('currentProjectId', project.id);
    navigate(`/${encodedProjectName}`);
  };

  const handleOpenDashboard = (projectId) => {
    navigate(`/dashboard/${projectId}`);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setDeleteLoading(projectId);
      const newProjects = projects.filter((project) => project.id !== projectId);
      setProjects(newProjects);
      setError("");
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Spinner className="h-12 w-12" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 to-black">
      {/* Background image with blur */}
      <div 
        className="absolute inset-0 bg-[url('/img/sigin.jpeg')] opacity-10 bg-cover bg-center"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative pt-28 px-6 lg:px-28 space-y-6">
        {/* Header with Sign Out Button */}
        <div className="flex justify-between items-center">
          <Typography variant="h2" className="font-bold text-white">Your Projects</Typography>
        </div>

        {/* Error Message */}
        {error && (
          <Alert color="red" className="bg-red-500/10 text-red-500 border border-red-500">
            {error}
          </Alert>
        )}

        {/* Create Project Button */}
        <Button 
          className="flex items-center gap-2 bg-white-500 hover:bg-white-600 shadow-lg transform hover:scale-105 transition-all"
          onClick={() => setOpenDialog(true)}
        >
          <PlusIcon className="h-5 w-5" /> Create New Project
        </Button>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 transition-all shadow-xl text-white">
                <CardBody>
                  <Typography variant="h5" className="mb-2">{project.name}</Typography>
                  <Typography className="text-gray-300 mb-4">
                    {project.description || "No description provided"}
                  </Typography>
                  <div className="flex items-center gap-2 text-blue-400">
                    <ChartBarIcon className="h-5 w-5" />
                    <button
                      onClick={() => handleOpenDashboard(project.id)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Analytics
                    </button>
                  </div>
                </CardBody>
                <CardFooter className="pt-0 flex justify-between gap-2">
                  <Button 
                    className="bg-white-500 hover:bg-white-600 shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 flex-1"
                    onClick={() => handleOpenProject(project)}
                  >
                    Open Project
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all"
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deleteLoading === project.id}
                  >
                    {deleteLoading === project.id ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        <span>Deleting...</span>
                      </div>
                    ) : 'Delete'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <Typography className="mb-4 text-gray-300">You don't have any projects yet.</Typography>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              onClick={() => setOpenDialog(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Create Your First Project
            </Button>
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog 
          open={openDialog} 
          handler={() => setOpenDialog(false)}
          size="sm"
          className="bg-gray-900 text-white"
        >
          <Card className="p-4 space-y-4 bg-gray-900 text-white">
            <Typography variant="h4" className="font-bold">Create New Project</Typography>
            <Input
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="!border-gray-600 focus:!border-gray-900 bg-gray-800/50 text-white"
              labelProps={{
                className: "text-gray-400",
              }}
            />
            <Textarea
              label="Project Description (Optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="!border-gray-600 focus:!border-gray-900 bg-gray-800/50 text-white"
              labelProps={{
                className: "text-gray-400",
              }}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="text"
                className="text-gray-400 hover:bg-gray-800"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all"
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            </div>
          </Card>
        </Dialog>
      </div>
    </div>
  );
}

export default Project;