"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "@/components/MermaidDiagram";

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
      alert("Select a project first");
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

    } finally {

      setLoading(false);

    }

  };

  const [regenerating, setRegenerating] =
    useState(false);

  const regenerate = async () => {

    if (!selectedProject || !selectedArtifact) {
      alert("Select an artifact first");
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

      const versions = await loadVersions(selectedArtifact);

      if (versions.length > 0) {

        const latest = versions[versions.length - 1];

        await loadContent(selectedArtifact, latest);

      }

    } finally {

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

    await api.post("/projects", {
      name: newProject,
    });

    const res = await api.get("/projects");

    setProjects(res.data);

    setNewProject("");

    setShowModal(false);

  };

  const [darkMode, setDarkMode] = useState(false);


  return (

    <div className="flex h-screen">

      <aside className="w-72 border-r p-5">

        <h1 className="text-3xl font-bold mb-6">
          ArchAI
        </h1>
        <div className="mb-6 grid grid-cols-1 gap-3">

          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="text-sm text-gray-500">
              Projects
            </p>
            <p className="text-2xl font-bold">
              {stats.projects}
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="text-sm text-gray-500">
              Artifacts
            </p>
            <p className="text-2xl font-bold">
              {stats.artifacts}
            </p>
          </div>

          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="text-sm text-gray-500">
              Versions
            </p>
            <p className="text-2xl font-bold">
              {stats.versions}
            </p>
          </div>

        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mb-5 w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800"
        >
          + New Project
        </button>

        <input
          type="text"
          placeholder="🔍 Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border p-2 mb-4"
        />



        {projects
          .filter((project) =>
            project.name
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((project) => (
            <button
              key={project.id}
              onClick={() => loadArtifacts(project)}
              className={`mb-3 w-full rounded-lg border p-3 text-left transition

      ${selectedProject?.id === project.id
                  ? "border-blue-600 bg-blue-600 text-white shadow"
                  : "bg-white hover:bg-gray-100"
                }`}
            >
              <div className="font-semibold">
                {project.name}
              </div>

              {project.description && (
                <div
                  className={`mt-1 text-sm ${selectedProject?.id === project.id
                    ? "text-blue-100"
                    : "text-gray-500"
                    }`}
                >
                  {project.description}
                </div>
              )}
            </button>
          ))}

      </aside>

      <main className="flex-1 p-8">

        <h2 className="text-4xl font-bold">
          AI Software Architect
        </h2>
        <h2 className="text-3xl font-bold">

          {selectedProject
            ? selectedProject.name
            : "Select Project"}

        </h2>

        <div className="mt-6 space-y-4">

          <select
            value={artifactType}
            onChange={(e) => setArtifactType(e.target.value)}
            className="border rounded p-2"
          >

            <option value="architecture">
              architecture
            </option>

            <option value="database">
              Database
            </option>

            <option value="api">
              API
            </option>

            <option value="deployment">
              Deployment
            </option>

            <option value="folder_structure">
              Folder Structure
            </option>

          </select>

          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project..."
            className="w-full rounded border p-3"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="rounded bg-black px-5 py-2 text-white"
          >
            {loading ? "Generating..." : "🚀 Generate"}
          </button>

          <button
            onClick={regenerate}
            disabled={regenerating || !selectedArtifact}
            className="ml-3 rounded bg-blue-600 px-5 py-2 text-white"
          >
            {regenerating ? "Regenerating..." : " 🔄 Regenerate"}
          </button>

        </div>

        <h3 className="mt-8 mb-4 text-xl font-bold">
          Artifacts
        </h3>

        <div className="flex flex-wrap gap-3">

          {artifacts.map((artifact) => (

            <button
              key={artifact.id}
              onClick={() => loadVersions(artifact)}
              className={`rounded-full border px-5 py-2 transition

      ${selectedArtifact?.id === artifact.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
                }`}
            >

              {artifactIcons[artifact.artifact_type]}

              {" "}

              {artifact.artifact_type.replace("_", " ")}

            </button>

          ))}

        </div>


        <h3 className="mt-8 text-2xl font-bold">

          Versions

        </h3>

        <div className="flex flex-wrap gap-3">

          {versions.map((version, index) => (

            <button
              key={version.version}
              onClick={() => {
                if (selectedArtifact) {
                  loadContent(selectedArtifact, version);
                }
              }}
              className={`rounded-full border px-4 py-2 transition

      ${selectedVersion === version.version
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white hover:bg-gray-100"
                }`}
            >

              V{version.version}

            </button>

          ))}

        </div>



        {/* Content */}

        <div className="mt-8 rounded-2xl border bg-white shadow">

          <div className="flex items-center justify-between border-b px-6 py-4">

            <div>

              <h2 className="text-xl font-bold">
                Generated Content
              </h2>

              <p className="text-sm text-gray-500">

                {selectedArtifact
                  ? selectedArtifact.artifact_type.replace("_", " ")
                  : "No Artifact Selected"}

              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() => navigator.clipboard.writeText(content)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
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

                  URL.revokeObjectURL(url);

                }}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                ⬇ Download
              </button>

            </div>

          </div>

          {loading || regenerating ? (


            <div className="space-y-4 p-6">

              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>

              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>

              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>

              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200"></div>

              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>

            </div>

          ) : (

            <div className="max-h-[700px] overflow-auto p-6 prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>


          )}

        </div>

      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

            <h2 className="mb-4 text-2xl font-bold">
              New Project
            </h2>

            <input
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Project name..."
              className="mb-5 w-full rounded-lg border p-3"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={createProject}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Create
              </button>

            </div>

          </div>

        </div>
      )}


    </div>

  );
}