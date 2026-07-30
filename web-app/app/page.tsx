"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "@/components/MermaidDiagram";

import { toast } from "sonner";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

interface Project {
  id: number;
  name: string;
  description: string | null;
}
interface Artifact {
  id: number;
  artifact_type: string;
}

interface ArtifactVersion {
  id: number;
  version: number;
  content: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);


  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [artifacts, setArtifacts] = useState<any[]>([]);


  const [selectedArtifact, setSelectedArtifact] =
    useState<Artifact | null>(null);

  const [versions, setVersions] =
    useState<ArtifactVersion[]>([]);

  const [selectedVersion, setSelectedVersion] =
    useState<number | null>(null);

  const [content, setContent] =
    useState("");

  const [newProject, setNewProject] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    projects: 0,
    artifacts: 0,
    versions: 0,
  });

  useEffect(() => {
    api.get("/projects").then(async (res) => {

      setProjects(res.data);

      let artifactCount = 0;
      let versionCount = 0;

      for (const project of res.data) {

        const artifactsRes = await api.get(
          `/projects/${project.id}/artifacts`
        );

        artifactCount += artifactsRes.data.length;

        for (const artifact of artifactsRes.data) {

          const versionsRes = await api.get(
            `/artifacts/${artifact.id}/versions`
          );

          versionCount += versionsRes.data.length;
        }
      }

      setStats({
        projects: res.data.length,
        artifacts: artifactCount,
        versions: versionCount,
      });

    });
  }, []);

  const loadArtifacts = async (project: Project) => {

    setSelectedProject(project);
    setSelectedVersion(null);

    // Reset old data
    setSelectedArtifact(null);
    setVersions([]);
    setContent("");

    const res = await api.get(
      `/projects/${project.id}/artifacts`
    );

    setArtifacts(res.data);
  };

  const loadVersions = async (artifact: Artifact) => {

    setSelectedArtifact(artifact);
    setContent("");

    const res = await api.get(
      `/artifacts/${artifact.id}/versions`
    );

    setVersions(res.data);

    if (res.data.length > 0) {

      const latest = res.data[res.data.length - 1];

      await loadContent(artifact, latest);

    }

    return res.data;
  };


  const loadContent = async (
    artifact: Artifact,
    version: ArtifactVersion
  ) => {

    const res = await api.get(
      `/artifacts/${artifact.id}/versions/${version.version}`
    );

    setSelectedVersion(version.version);
    setContent(res.data.content);
  };

  const [artifactType, setArtifactType] =
    useState("architecture");

  const [prompt, setPrompt] =
    useState("");

  const [provider, setProvider] =
    useState("auto");

  const [loading, setLoading] =
    useState(false);

  const generate = async () => {

    if (!selectedProject) {
      toast.warning(
        "Select a project first"
      );
      return;
    }

    setLoading(true);

    try {

      await api.post("/generate", {

        project_id: selectedProject.name,

        artifact_type: artifactType,

        user_prompt: prompt,

        provider: provider,

        regenerate: false,

      });
      toast.success("Artifact generated successfully 🎉");

      await loadArtifacts(selectedProject);

      const artifactRes = await api.get(
        `/projects/${selectedProject.id}/artifacts`
      );

      setArtifacts(artifactRes.data);

      const artifact = artifactRes.data.find(
        (a: Artifact) => a.artifact_type === artifactType
      );

      if (artifact) {

        const versions = await loadVersions(artifact);

        if (versions.length > 0) {

          const latest = versions[versions.length - 1];

          setSelectedArtifact(artifact);

          const contentRes = await api.get(
            `/artifacts/${artifact.id}/versions/${latest.version}`
          );

          setContent(contentRes.data.content);
        }
      }
    }
    catch {
      toast.error("Generation failed");
    }
    finally {

      setLoading(false);

    }

  };

  const [regenerating, setRegenerating] =
    useState(false);

  const regenerate = async () => {

    if (!selectedProject || !selectedArtifact) {
      toast.warning(
        "Select an artifact first"
      );
      return;
    }

    setRegenerating(true);

    try {

      await api.post("/generate", {
        project_id: selectedProject.name,
        artifact_type: selectedArtifact.artifact_type,
        user_prompt: prompt,
        provider: provider,
        regenerate: true,
      });
      toast.success("New version created 🔄");

      const versions = await loadVersions(selectedArtifact);

      if (versions.length > 0) {

        const latest = versions[versions.length - 1];

        await loadContent(selectedArtifact, latest);

      }

    } catch {

      toast.error("Regeneration failed");

    }
    finally {

      setRegenerating(false);

    }

  };


  const artifactIcons: Record<string, string> = {
    architecture: "🏗️",
    database: "🗄️",
    api: "🔌",
    deployment: "🚀",
    folder_structure: "📁",
  };

  const [search, setSearch] = useState("");

  const createProject = async () => {

    if (!newProject.trim()) return;

    try {

      await api.post("/projects", {
        name: newProject,
      });

      toast.success("Project created successfully 🚀");

    } catch {

      toast.error("Failed to create project");

    }
    const res = await api.get("/projects");

    setProjects(res.data);

    setNewProject("");

    setShowModal(false);

  };

  const [darkMode, setDarkMode] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard 📋");
  };

  const examplePrompts: Record<string, string> = {
    architecture:
      "Design a scalable software architecture with authentication, caching, monitoring and CI/CD.",

    database:
      "Design a normalized PostgreSQL database schema including tables, relationships, indexes and constraints.",

    api:
      "Generate a complete REST API including authentication, CRUD endpoints, validation and OpenAPI documentation.",

    deployment:
      "Generate a production deployment architecture using Docker, Kubernetes, Nginx and CI/CD.",

    folder_structure:
      "Generate an enterprise folder structure following Clean Architecture best practices.",
  };

  const [showMobileMenu, setShowMobileMenu] = useState(false);



  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);

  const [renameProjectName, setRenameProjectName] =
    useState("");
  const openRename = () => {

    if (!selectedProject) return;

    setRenameProjectName(selectedProject.name);

    setShowRenameModal(true);

  };

  const renameProject = async () => {
    try {
      console.log("1");

      if (!selectedProject) return;

      console.log("2");

      const res = await api.put(
        `/projects/${selectedProject.id}`,
        {
          name: renameProjectName,
        }
      );

      console.log("3", res.data);

      const projects = await api.get("/projects");

      setProjects(projects.data);

      setSelectedProject({
        ...selectedProject,
        name: renameProjectName,
      });

      setShowRenameModal(false);

    } catch (err: any) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      console.error(err);
    }
  };

  const deleteProject = async () => {

    if (!selectedProject) return;

    await api.delete(
      `/projects/${selectedProject.id}`
    );

    const res = await api.get("/projects");

    setProjects(res.data);

    setSelectedProject(null);

    setArtifacts([]);

    setVersions([]);

    setContent("");

    setShowDeleteModal(false);

  };

  return (
    <div className={`flex flex-col md:flex-row h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar - becomes collapsible on mobile */}
      <aside className={`
      w-full md:w-72 border-r p-5 
      ${showMobileMenu ? 'block' : 'hidden md:block'}
      md:block
      overflow-y-auto
      max-h-[50vh] md:max-h-full
      ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
    `}>
        {/* Mobile menu toggle button - visible only on mobile */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`md:hidden mb-4 w-full rounded-lg border p-2 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          {showMobileMenu ? '✕ Close Menu' : '☰ Open Menu'}
        </button>

        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ArchAI
          </h1>
          {/* Dark mode toggle button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition ${darkMode ? 'border-gray-700 bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Stats Grid - responsive columns */}
        <div className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
          <div className={`rounded-lg border p-2 md:p-3 ${darkMode ? 'border-gray-700 bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Projects
            </p>
            <p className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.projects}
            </p>
          </div>
          <div className={`rounded-lg border p-2 md:p-3 ${darkMode ? 'border-gray-700 bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Artifacts
            </p>
            <p className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.artifacts}
            </p>
          </div>
          <div className={`rounded-lg border p-2 md:p-3 col-span-2 md:col-span-1 ${darkMode ? 'border-gray-700 bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Versions
            </p>
            <p className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.versions}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mb-4 md:mb-5 w-full rounded-lg bg-black py-2 md:py-3 text-white transition hover:bg-gray-800 text-sm md:text-base dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + New Project
        </button>

        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-lg border p-2 mb-3 md:mb-4 text-sm md:text-base ${darkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' : 'bg-white'}`}
        />

        {/* Project list - scrollable */}
        <div className="space-y-2 md:space-y-3 max-h-[200px] md:max-h-none overflow-y-auto">
          {projects
            .filter((project) =>
              project.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((project) => (
              <div
                key={project.id}
                className="relative mb-3"
              >
                <button
                  onClick={() => loadArtifacts(project)}
                  className={`w-full rounded-lg border p-3 pr-12 text-left transition
      ${selectedProject?.id === project.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800"
                    }`}
                >
                  <div className="font-semibold">
                    {project.name}
                  </div>

                  {project.description && (
                    <div className="mt-1 text-sm opacity-70">
                      {project.description}
                    </div>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenMenu(
                      openMenu === project.id
                        ? null
                        : project.id
                    );
                  }}
                  className="absolute right-3 top-3 rounded p-1 hover:bg-black/10"
                >
                  ⋮
                </button>

                {openMenu === project.id && (

                  <div className="absolute right-3 top-12 z-50 w-44 rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">

                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setRenameProjectName(project.name);
                        setShowRenameModal(true);
                        setOpenMenu(null);
                      }}
                      className="block w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                      ✏ Rename
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowDeleteModal(true);
                        setOpenMenu(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      🗑 Delete
                    </button>

                  </div>

                )}

              </div>
            ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
          <div>
            <h2 className={`text-2xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Software Architect
            </h2>
            <h2 className={`text-xl md:text-3xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedProject
                ? selectedProject.name
                : "Select Project"}
            </h2>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {/* Mobile menu toggle - alternative placement */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden rounded-lg border p-2 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              {showMobileMenu ? '✕' : '☰ Menu'}
            </button>

            {/* Dark mode toggle - mobile alternative */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`md:hidden p-2 rounded-lg border transition ${darkMode ? 'border-gray-700 bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
          {/* Controls - responsive grid */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <select
              value={artifactType}
              onChange={(e) => {
                const type = e.target.value;
                setArtifactType(type);
                setPrompt("");
              }}
              className={`border rounded p-2 flex-1 text-sm md:text-base ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : ''}`}
            >
              <option value="architecture">Architecture</option>
              <option value="database">Database</option>
              <option value="api">API</option>
              <option value="deployment">Deployment</option>
              <option value="folder_structure">Folder Structure</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={generate}
                disabled={loading}
                className="flex-1 rounded bg-black px-3 md:px-5 py-2 text-white text-sm md:text-base disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {loading ? "Generating..." : "🚀 Generate"}
              </button>

              <button
                onClick={regenerate}
                disabled={regenerating || !selectedArtifact}
                className="flex-1 rounded bg-blue-600 px-3 md:px-5 py-2 text-white text-sm md:text-base disabled:opacity-50 hover:bg-blue-700"
              >
                {regenerating ? "Regenerating..." : " 🔄 Regenerate"}
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project..."
            className={`w-full rounded border p-3 text-sm md:text-base ${darkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' : ''}`}
          />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 md:gap-4">
            <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              💡 <span className="font-medium">Example:</span>{" "}
              {examplePrompts[artifactType]}
              <br className="hidden sm:block" />
              You can edit or completely replace this prompt.
            </p>

            <button
              type="button"
              onClick={() => setPrompt(examplePrompts[artifactType])}
              className={`whitespace-nowrap rounded-lg border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm transition ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600' : 'hover:bg-blue-600 hover:text-white'}`}
            >
              ✨ Insert Example
            </button>
          </div>
        </div>

        {/* Artifacts - responsive wrap */}
        <div className="mt-6 md:mt-8">
          <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Artifacts
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => loadVersions(artifact)}
                className={`rounded-full border px-3 md:px-5 py-1.5 md:py-2 transition text-sm md:text-base

                ${selectedArtifact?.id === artifact.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : darkMode
                      ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-100"
                  }`}
              >
                {artifactIcons[artifact.artifact_type]}
                {" "}
                {artifact.artifact_type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Versions */}
        <div className="mt-6 md:mt-8">
          <h3 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Versions
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {versions.map((version, index) => (
              <button
                key={version.version}
                onClick={() => {
                  if (selectedArtifact) {
                    loadContent(selectedArtifact, version);
                  }
                }}
                className={`rounded-full border px-3 md:px-4 py-1.5 md:py-2 transition text-sm md:text-base

                ${selectedVersion === version.version
                    ? "bg-green-600 text-white border-green-600"
                    : darkMode
                      ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-100"
                  }`}
              >
                V{version.version}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={`mt-6 md:mt-8 rounded-2xl border shadow ${darkMode ? 'border-gray-700 bg-gray-800' : 'bg-white'}`}>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-4 md:px-6 py-3 md:py-4 gap-3 ${darkMode ? 'border-gray-700' : ''}`}>
            <div>
              <h2 className={`text-lg md:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Generated Content
              </h2>
              <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedArtifact
                  ? selectedArtifact.artifact_type.replace("_", " ")
                  : "No Artifact Selected"}
              </p>
            </div>

            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className={`flex-1 sm:flex-none rounded-lg border px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [content],
                    { type: "text/plain" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${selectedArtifact?.artifact_type}.txt`;
                  a.click();
                  toast.success("Download started ⬇");
                  URL.revokeObjectURL(url);
                }}
                className={`flex-1 sm:flex-none rounded-lg border px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                ⬇ Download
              </button>
            </div>
          </div>

          {loading || regenerating ? (
            <div className="space-y-4 p-4 md:p-6">
              <div className={`h-4 w-1/2 animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-full animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-5/6 animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-4/6 animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              <div className={`h-4 w-full animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ) : (
            <div className={`max-h-[400px] md:max-h-[700px] overflow-auto p-4 md:p-6 prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-[420px] rounded-xl p-6 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`mb-4 text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              New Project
            </h2>
            <input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project name..."
              className={`w-full rounded-lg border p-3 mb-5 text-sm md:text-base ${darkMode ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' : ''}`}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-lg border px-4 py-2 text-sm md:text-base ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm md:text-base hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">

            <h2 className="text-2xl font-bold">
              Delete Project
            </h2>

            <p className="mt-3 text-gray-500">
              Delete
              <span className="font-semibold">
                {" "}
                {selectedProject?.name}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-red-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={deleteProject}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}
      {
        showRenameModal && (

          <div className="fixed inset-0 flex items-center justify-center bg-black/50">

            <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">

              <h2 className="mb-5 text-2xl font-bold">

                Rename Project

              </h2>

              <input

                value={renameProjectName}

                onChange={(e) => setRenameProjectName(e.target.value)}

                className="mb-5 w-full rounded-lg border p-3"

              />

              <div className="flex justify-end gap-3">

                <button

                  onClick={() => setShowRenameModal(false)}

                  className="rounded-lg border px-4 py-2"

                >

                  Cancel

                </button>

                <button

                  onClick={renameProject}

                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"

                >

                  Save

                </button>

              </div>

            </div>

          </div>

        )}
    </div>
  );
}