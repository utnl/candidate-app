import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

interface AddCandidateProps {
  user: any;
  onCandidateAdded: () => void;
}

export default function AddCandidate({
  user,
  onCandidateAdded,
}: AddCandidateProps) {
  const [fullName, setFullName] = useState("");
  const [appliedPosition, setAppliedPosition] = useState("");
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumeFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeFiles.length === 0 || !fullName || !appliedPosition) {
      toast.error("Please fill all fields and select at least one resume.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(
      `Step 1/2: Uploading ${resumeFiles.length} files...`
    );

    try {
      const uploadPromises = resumeFiles.map(async (file, index) => {
        const candidateName = `${fullName} (${index + 1})`;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}-${index}.${fileExt}`;

        const { error } = await supabase.storage
          .from("resumes")
          .upload(fileName, file);
        if (error)
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);

        const { data: urlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);

        return {
          full_name: candidateName,
          applied_position: appliedPosition,
          resume_url: urlData.publicUrl,
        };
      });

      const candidatesData = await Promise.all(uploadPromises);

      toast.loading(
        `Step 2/2: Adding ${candidatesData.length} records to database...`,
        { id: toastId }
      );

      const { error: functionError } = await supabase.functions.invoke(
        "add-batch-candidates",
        {
          body: candidatesData,
        }
      );

      if (functionError)
        throw new Error(`Database Error: ${functionError.message}`);

      toast.success(`Successfully added ${candidatesData.length} candidates!`, {
        id: toastId,
      });
      onCandidateAdded();

      setFullName("");
      setAppliedPosition("");
      setResumeFiles([]);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-700 p-4 rounded-lg space-y-4 mb-8"
    >
      <h3 className="text-xl font-bold">Add New Candidates (Batch Upload)</h3>
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-300"
        >
          Full Name (Template)
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 block w-full bg-gray-800 rounded p-2 text-white border border-gray-600"
          placeholder="e.g., John Doe"
        />
      </div>
      <div>
        <label
          htmlFor="position"
          className="block text-sm font-medium text-gray-300"
        >
          Applied Position (Template)
        </label>
        <input
          id="position"
          type="text"
          value={appliedPosition}
          onChange={(e) => setAppliedPosition(e.target.value)}
          required
          className="mt-1 block w-full bg-gray-800 rounded p-2 text-white border border-gray-600"
          placeholder="e.g., Frontend Developer"
        />
      </div>
      <div>
        <label
          htmlFor="resume"
          className="block text-sm font-medium text-gray-300"
        >
          Resumes (select multiple)
        </label>
        <input
          id="resume"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          required
          className="w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
        />
      </div>
      {resumeFiles.length > 0 && (
        <div className="bg-gray-800 p-3 rounded-md">
          <p className="text-sm font-medium text-gray-300 mb-2">
            Selected files ({resumeFiles.length}):
          </p>
          <ul className="list-disc list-inside text-sm text-gray-400 max-h-32 overflow-y-auto">
            {resumeFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-sky-500 hover:bg-sky-600 p-2 rounded font-bold disabled:bg-gray-500"
      >
        {uploading ? `Uploading...` : `Add ${resumeFiles.length} Candidates`}
      </button>
    </form>
  );
}
