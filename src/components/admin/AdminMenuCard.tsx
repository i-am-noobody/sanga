import type { ChangeEvent, FormEvent } from "react";
import { MENU_TAXONOMY, getSubcategoryOptions } from "@/lib/menuTaxonomy";

interface Props {
  form: {
    name: string;
    category: string;
    subcategory: string;
    price: string;
    description: string;
  };
  imageFile: File | null;
  loading: boolean;
  onFormChange: (updated: Partial<Props["form"]>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AdminMenuCard({ form, imageFile, loading, onFormChange, onFileChange, onSubmit }: Props) {
  return (
    <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-4 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Menu creation</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Add a new dish</h2>
        </div>
        <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-yellow-200">
          Live update
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        Add a menu item to the restaurant feed with a polished description and price.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => onFormChange({ name: event.target.value })}
            placeholder="Dish name"
            required
            className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
          />
          <select
            value={form.category}
            onChange={(event) => onFormChange({ category: event.target.value, subcategory: "" })}
            className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
          >
            {MENU_TAXONOMY.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <input
          value={form.subcategory}
          onChange={(event) => onFormChange({ subcategory: event.target.value })}
          placeholder="Subcategory (optional)"
          list="admin-menu-subcategories"
          className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
        />
        <datalist id="admin-menu-subcategories">
          {getSubcategoryOptions(form.category).map((subcategory) => (
            <option key={subcategory} value={subcategory} />
          ))}
        </datalist>
        <input
          value={form.price}
          onChange={(event) => onFormChange({ price: event.target.value })}
          placeholder="Price"
          required
          className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
        />
        <label className="block text-sm text-slate-300">
          Select image
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="mt-3 w-full rounded-3xl border border-yellow-300/20 bg-white/5 p-4 text-white outline-none transition focus:border-yellow-300"
          />
        </label>
        {imageFile && <p className="text-sm text-slate-400">Selected file: {imageFile.name}</p>}
        <textarea
          value={form.description}
          onChange={(event) => onFormChange({ description: event.target.value })}
          placeholder="Description"
          rows={4}
          className="w-full rounded-3xl border border-yellow-300/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-yellow-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving item..." : "Create menu item"}
        </button>
      </form>
    </div>
  );
}
