import type { ChangeEvent, FormEvent } from "react";

interface Props {
  imageFile: File | null;
  loading: boolean;
  message: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AdminUploadCard({
  imageFile,
  loading,
  message,
  onFileChange,
  onSubmit,
}: Props) {
  return (
    <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-8 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Photo upload</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Add a new image</h2>
        </div>
        <div className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-sm text-yellow-200">
          Ready to upload
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="block text-sm text-slate-300">
          Select image
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="mt-3 w-full rounded-3xl border border-yellow-300/20 bg-white/5 p-4 text-white outline-none transition focus:border-yellow-300"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload image"}
        </button>
        {message ? <p className="text-sm text-yellow-200">{message}</p> : null}
        {imageFile ? <p className="text-sm text-slate-400">Selected file: {imageFile.name}</p> : null}
      </form>
    </div>
  );
}
