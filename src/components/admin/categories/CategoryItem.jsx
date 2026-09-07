import { GripVertical, Pencil, Trash2 } from "lucide-react";

export default function CategoryItem({ category, onEdit, onDelete }) {
  const isStatusActive = category.status?.toLowerCase() === "active";

  return (
    <li
      draggable="true"
      className="panel flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-xs transition-all hover:shadow-md"
    >
      <span className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="size-4" />
      </span>

      <img
        src={category.image}
        alt={category.name}
        loading="lazy"
        className="size-11 rounded-md border border-border object-cover shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {category.name}
        </p>
        <p className="num text-xs text-muted-foreground">
          {category.productsCount} products · /{category.slug}
        </p>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
          isStatusActive
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
            : "bg-muted text-muted-foreground border-border"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${
            isStatusActive ? "bg-emerald-500" : "bg-muted-foreground"
          }`}
        />
        {category.status}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit && onEdit(category)}
          aria-label={`Edit ${category.name}`}
          className="inline-flex items-center justify-center rounded-md size-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        >
          <Pencil className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete && onDelete(category.id)}
          aria-label={`Delete ${category.name}`}
          className="inline-flex items-center justify-center rounded-md size-9 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
