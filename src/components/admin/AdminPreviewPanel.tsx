import type { MenuItem, UploadImage } from "@/components/admin/types";

interface Props {
  menuItems: MenuItem[];
  uploads: UploadImage[];
}

export default function AdminPreviewPanel({ menuItems, uploads }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-8 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Latest uploads</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Media preview</h2>
          </div>
          <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-yellow-200">
            {uploads.length} files
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {uploads.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-yellow-300/30 bg-white/5 p-8 text-center text-slate-400">
              No uploads found yet.
            </div>
          ) : (
            uploads.slice(0, 6).map((image) => (
              <div
                key={image.asset_id}
                className="group overflow-hidden rounded-3xl border border-yellow-300/20 bg-[#0b0b0b]/90 transition hover:-translate-y-1 hover:border-yellow-300/40"
              >
                <img
                  src={image.secure_url}
                  alt={image.public_id}
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="space-y-1 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">{image.public_id}</p>
                  <p>{new Date(image.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-yellow-300/20 bg-[#070707]/95 p-8 shadow-[0_24px_80px_-50px_rgba(255,214,0,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/70">Recent menu items</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Dish catalogue</h2>
          </div>
          <span className="rounded-full border border-yellow-300/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">
            {menuItems.length} items
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          {menuItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-yellow-300/30 bg-white/5 p-8 text-center text-slate-400">
              No menu items created yet.
            </div>
          ) : (
            menuItems.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-3xl border border-yellow-300/20 bg-[#0b0b0b]/90 p-4 transition hover:-translate-y-1 hover:border-yellow-300/40">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-200">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.category}</p>
                {item.description ? <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
