import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { PlusIcon } from "@heroicons/react/24/solid";
import api from "../services/api";
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
      // Mock API call for now
      const mockProjects = [
        { id: 1, name: "Project 1", description: "Description 1" },
        { id: 2, name: "Project 2", description: "Description 2" },
      ];
      setProjects(mockProjects);
      setError("");
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
      if (err.response?.status === 401) {
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
      // Mock API call for now
      const newProject = {
        id: Date.now(),
        name: projectName,
        description: projectDescription,
      };
      
      setProjects([...projects, newProject]);
      setProjectName("");
      setProjectDescription("");
      setOpenDialog(false);
      setError("");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/sign-in");
  };

  const handleOpenProject = (projectName) => {
    navigate(`/forms/${projectName}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-12 w-12" color="white" />
      </div>
    );
  }

  return (
    <div className="relative bg-black text-white min-h-screen">
      <div className="pt-28 px-6 lg:px-28 space-y-6">
        {/* Header with Sign Out Button */}
        <div className="flex justify-between items-center">
          <Typography variant="h2" className="font-bold">Your Projects</Typography>
          <Button onClick={handleSignOut} className="bg-red-500 hover:bg-red-700">
            Sign Out
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert color="red" className="my-4">
            {error}
          </Alert>
        )}

        {/* Create Project Button */}
        <Button 
          className="flex items-center gap-2 bg-white text-black"
          onClick={() => setOpenDialog(true)}
        >
          <PlusIcon className="h-5 w-5" /> Create New Project
        </Button>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-gray-800 text-white">
                <CardBody>
                  <Typography variant="h5" className="mb-2">{project.name}</Typography>
                  <Typography className="text-gray-300">
                    {project.description || "No description provided"}
                  </Typography>
                </CardBody>
                <CardFooter className="pt-0">
                  <Button 
                    fullWidth
                    className="bg-white text-black"
                    onClick={() => handleOpenProject(project.name)}
                  >
                    Open Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-800 rounded-lg">
            <Typography className="mb-4">You don't have any projects yet.</Typography>
            <Button 
              className="bg-white text-black"
              onClick={() => setOpenDialog(true)}
            >
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
              className="text-white"
              labelProps={{
                className: "text-white",
              }}
            />
            <Textarea
              label="Project Description (Optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="text-white"
              labelProps={{
                className: "text-white",
              }}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outlined" 
                color="red" 
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-white text-black"
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
