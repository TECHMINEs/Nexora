'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { modeForState } from '@/lib/engines/stateMachine';
import type { ModeCardsProps, OperationalMode } from '@/lib/types';
import { Shield, AlertTriangle, Ambulance, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeCards({ facilityId, current }: ModeCardsProps): JSX.Element {
  const activeModes = modeForState(current);

  const modes: {
    id: OperationalMode;
    title: string;
    description: string;
    targetRoute: string;
    icon: typeof Shield;
  }[] = [
    {
      id: 'prepare',
      title: 'Prepare Mode',
      description: 'BCP process declarations, emergency shift training, tabletop exercises and contact trees.',
      targetRoute: '/lifecycle',
      icon: Shield,
    },
    {
      id: 'prevent',
      title: 'Prevent Mode',
      description: 'Prioritised mitigation actions, equipment elevations, and drainage maintenance.',
      targetRoute: `/facility/${facilityId}/mitigation`,
      icon: AlertTriangle,
    },
    {
      id: 'respond',
      title: 'Respond Mode',
      description: 'Live warning alerts, critical shutdown procedures, mutual aid responder dispatch.',
      targetRoute: '/replay',
      icon: Ambulance,
    },
    {
      id: 'recover',
      title: 'Recover Mode',
      description: 'Damage assessments, audit evidence verification, insurance claims, and outcome post-mortems.',
      targetRoute: `/facility/${facilityId}/report`,
      icon: RotateCcw,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {modes.map((m) => {
        const isActive = activeModes.includes(m.id);
        const Icon = m.icon;

        return (
          <Link key={m.id} href={m.targetRoute}>
            <Card
              className={cn(
                'h-full transition-all hover:shadow-md cursor-pointer border',
                isActive
                  ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                  : 'border-line bg-card hover:bg-muted/20 opacity-80'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-brand-700' : 'text-muted-foreground'
                    )}
                  />
                  {isActive && (
                    <span className="text-[10px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500 text-black">
                      Active
                    </span>
                  )}
                </div>
                <CardTitle className="text-sm font-bold text-ink pt-1">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                {m.description}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
