import { moduleCatalog } from '@/data';
import type { ModuleTagProps } from '@/lib/types';

export function ModuleTag({ id }: ModuleTagProps) {
  const mod = moduleCatalog.find((m) => m.id === id);
  const title = mod ? mod.title : id;
  return (
    <span title={`Source module §${id}: ${title}`} className="inline-flex max-w-full items-center rounded-full border border-brand-300 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      {title}
    </span>
  );
}
