import { notFound } from 'next/navigation';
import { isFacilityId, getFacility } from '@/data';
import { FacilityHeader } from '@/components/shell/FacilityHeader';
import type { FacilityId } from '@/lib/types';

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'fac-wb-metal' }, { id: 'fac-vz-polymer' }];
}

export default function FacilityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  if (!isFacilityId(params.id)) {
    notFound();
  }

  const facility = getFacility(params.id as FacilityId);

  return (
    <div className="space-y-6">
      <FacilityHeader facility={facility} />
      <div>{children}</div>
    </div>
  );
}
