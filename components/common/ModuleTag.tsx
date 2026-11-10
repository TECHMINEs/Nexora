import { moduleCatalog } from '@/data';
import type { ModuleTagProps } from '@/lib/types';

export function ModuleTag({ id }: ModuleTagProps) {
  const mod = moduleCatalog.find((m) => m.id === id);
  const title = mod ? mod.title : id;
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-300 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
      <span className="font-mono">§{id}</span>
      <span>{title}</span>
    </span>
  );
}
