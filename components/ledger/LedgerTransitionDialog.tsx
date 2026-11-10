'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALLOWED_TRANSITIONS } from '@/lib/engines/ledger';
import { ledgerStateLabel, methodLabel } from '@/lib/format';
import type {
  LedgerTransitionDialogProps,
  LedgerState,
  VerificationMethod,
  TransitionPayload,
} from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export function LedgerTransitionDialog({
  entry,
  open,
  onOpenChange,
  onSubmit,
}: LedgerTransitionDialogProps): JSX.Element {
  const allowed = ALLOWED_TRANSITIONS[entry.state] ?? [];
  const [targetState, setTargetState] = useState<LedgerState | ''>(allowed[0] ?? '');
  const [actor, setActor] = useState('Safety Reviewer');
  const [note, setNote] = useState('');
  const [ownerName, setOwnerName] = useState(entry.owner);
  const [dueDate, setDueDate] = useState(entry.dueDate);
  const [poRef, setPoRef] = useState(entry.poRef ?? '');
  const [method, setMethod] = useState<VerificationMethod>('document');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [verifier, setVerifier] = useState('');
  const [retireReason, setRetireReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetState) return;

    const payload: TransitionPayload = {
      actor,
      note,
      ownerName: targetState === 'accepted' ? ownerName : undefined,
      dueDate: targetState === 'accepted' ? dueDate : undefined,
      poRef: targetState === 'in_procurement' ? poRef : undefined,
      evidence:
        targetState === 'implemented' || targetState === 'verified'
          ? {
              method,
              description: evidenceDesc,
              verifier: verifier || null,
            }
          : undefined,
      retireReason: targetState === 'retired' ? retireReason : undefined,
    };

    const result = onSubmit(targetState, payload);
    if (!result.ok) {
      setErrorMsg(result.reason);
    } else {
      setErrorMsg(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card text-xs">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">
            Transition Ledger State: {entry.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Current State: <span className="font-semibold text-ink capitalize">{entry.state.replace('_', ' ')}</span> &bull; ID: {entry.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-md text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Target State</Label>
            <Select
              value={targetState}
              onValueChange={(val) => {
                setTargetState(val as LedgerState);
                setErrorMsg(null);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select target state" />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {ledgerStateLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Actor / Reviewer</Label>
              <Input
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Transition Note</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Audit log justification"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Conditional Fields based on target state */}
          {targetState === 'accepted' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-canvas rounded border">
              <div className="space-y-1.5">
                <Label className="text-xs">Action Owner</Label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {targetState === 'in_procurement' && (
            <div className="p-3 bg-canvas rounded border space-y-1.5">
              <Label className="text-xs">Purchase Order Reference (PO Ref)</Label>
              <Input
                value={poRef}
                onChange={(e) => setPoRef(e.target.value)}
                placeholder="e.g. PO-ILL-0912"
                className="h-8 text-xs"
              />
            </div>
          )}

          {(targetState === 'implemented' || targetState === 'verified') && (
            <div className="p-3 bg-canvas rounded border space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Verification Method</Label>
                  <Select
                    value={method}
                    onValueChange={(val) => setMethod(val as VerificationMethod)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_attested">{methodLabel('self_attested')}</SelectItem>
                      <SelectItem value="document">{methodLabel('document')}</SelectItem>
                      <SelectItem value="photo_geo">{methodLabel('photo_geo')}</SelectItem>
                      <SelectItem value="remote_expert">{methodLabel('remote_expert')}</SelectItem>
                      <SelectItem value="physical_inspection">{methodLabel('physical_inspection')}</SelectItem>
                      <SelectItem value="outcome">{methodLabel('outcome')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Verifier / Inspector</Label>
                  <Input
                    value={verifier}
                    onChange={(e) => setVerifier(e.target.value)}
                    placeholder="Inspector name or agency"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Evidence Description</Label>
                <Input
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Document certificate, geotagged photo, inspection report ref"
                  className="h-8 text-xs"
                />
              </div>
              {targetState === 'verified' && (
                <div className="text-[11px] text-muted-foreground italic">
                  Required methods: {entry.verificationRequired.map((m) => methodLabel(m)).join(', ')}
                </div>
              )}
            </div>
          )}

          {targetState === 'retired' && (
            <div className="p-3 bg-canvas rounded border space-y-1.5">
              <Label className="text-xs">Retirement Reason</Label>
              <Input
                value={retireReason}
                onChange={(e) => setRetireReason(e.target.value)}
                placeholder="Reason for retiring this resilience action"
                className="h-8 text-xs"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand-500 hover:bg-brand-700 text-white text-xs h-8"
            >
              Submit Transition
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
