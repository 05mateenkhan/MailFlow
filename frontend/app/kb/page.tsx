"use client";

import { DragEvent, useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/components/Toast";
import { uploadKnowledgeBase } from "@/lib/api";

export default function KnowledgeBasePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadKnowledgeBase(file);
      showToast(`Indexed ${result.chunks} chunks`);
      setFile(null);
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen md:flex bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 space-y-4">
        <h1 className="text-xl font-semibold text-zinc-100">Knowledge Base</h1>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="border border-dashed border-zinc-600 rounded p-10 text-center text-zinc-300"
        >
          Drag PDF or TXT files here
          <div className="mt-3">
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
        </div>

        {file ? (
          <div className="border border-zinc-800 rounded p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-200 truncate">{file.name}</p>
            <button
              className="px-3 py-2 border border-amber-500 text-amber-300 rounded disabled:opacity-50"
              disabled={uploading}
              onClick={upload}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        ) : null}

        <p className="text-sm text-zinc-400 border border-zinc-800 rounded p-4">
          Uploaded documents are used to generate grounded auto-replies.
        </p>
      </main>
    </div>
  );
}
