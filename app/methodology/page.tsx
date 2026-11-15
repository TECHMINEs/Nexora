import Link from 'next/link';
import { assumptions, sources } from '@/data';

const plainText = (value: string) => value
  .replace(/\s*\([^)]*§[^)]*\)/g, '')
  .replace(/(?:KD\s*)?§\d+(?:\.\d+)?/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim();

const methods = [
  {
    title: 'Risk score',
    body: 'The model combines hazard intensity, exposed assets, vulnerability, and operational importance. Verified controls reduce the result. The score helps compare the illustrative hazards; it is not a probability or a forecast.',
  },
  {
    title: 'Likely financial loss',
    body: 'Each scenario estimates physical damage, lost stock, business interruption, extra expenses, recovery, and supply disruption. Gross loss has no control benefit; residual loss reflects verified controls; the planned case assumes committed actions are verified.',
  },
  {
    title: 'Actions and evidence',
    body: 'Actions are ranked using impact, likelihood, urgency, and feasibility. A proposed or purchased action does not automatically reduce modelled loss. Its benefit appears only when its state and evidence meet the model rules.',
  },
  {
    title: 'Insurance gap',
    body: 'The model compares an exposure estimate with policy limits and terms. This is a discussion aid, not a coverage determination. A licensed adviser should review exclusions, deductibles, and policy wording.',
  },
];

export default function MethodologyPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-400">Optional reference</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">How the model works</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Nexora uses two illustrative factories to show how risk, loss, and action decisions connect. The calculation engines use the supplied sample records and explicit assumptions. This page explains their meaning and limits in one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {methods.map((item) => (
          <section key={item.title} className="border border-line bg-card p-5">
            <h2 className="font-display text-lg font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </section>
        ))}
      </div>
      <section className="border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-ink">What the demo cannot tell you</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>The factories, scenario values, telemetry, and replay outcomes are illustrative, not live operational records.</li>
          <li>Hazard scores are comparative planning scores, not event likelihoods or return periods.</li>
          <li>Loss values depend on assumed damage, downtime, inventory, and policy terms; they are not valuations or claims estimates.</li>
          <li>Official emergency warnings and instructions always take precedence over this prototype.</li>
          <li>Some sample source records have limited validation or uncertain reuse rights. Unlicensed inputs are gated out of outputs.</li>
        </ul>
      </section>
      <details className="border border-line bg-card p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Technical calculation notes</summary>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p><strong className="text-ink">Risk:</strong> hazard × exposure × vulnerability × criticality × (1 − verified mitigation), normalised to a score out of 100.</p>
          <p><strong className="text-ink">Business interruption:</strong> downtime × daily contribution, with separate extra expense and supply-chain terms.</p>
          <p><strong className="text-ink">Action priority:</strong> impact × likelihood × urgency × feasibility, scaled to 0–100.</p>
          <p><strong className="text-ink">Confidence:</strong> model metadata tracks source quality and verification method. Small samples and self-declared values lower confidence; they do not become precise because the UI displays a number.</p>
          <p>The complete assumption and source records remain in the repository data files for audit and development.</p>
        </div>
      </details>
      <details className="border border-line bg-card p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Detailed modelling inputs</summary>
        <p className="mt-3 text-sm text-muted-foreground">These values are planning assumptions in the sample model, not observed values for a real facility.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {assumptions.map((assumption) => (
            <div key={assumption.id} className="border border-line bg-black/40 p-4">
              <h3 className="font-display text-sm font-bold text-ink">{plainText(assumption.label)}</h3>
              <p className="mt-2 text-sm text-body">{plainText(assumption.value)}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plainText(assumption.rationale)}</p>
            </div>
          ))}
        </div>
      </details>
      <details className="border border-line bg-card p-5">
        <summary className="cursor-pointer font-display text-base font-bold text-ink">Sample data sources and limitations</summary>
        <p className="mt-3 text-sm text-muted-foreground">Several records imitate the format of official or partner data but are illustrative. A source with uncertain reuse rights is excluded from model outputs.</p>
        <ul className="mt-4 space-y-3">
          {sources.map((source) => (
            <li key={source.id} className="border border-line bg-black/40 p-4">
              <p className="font-display text-sm font-bold text-ink">{plainText(source.name)}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{source.authority} style · {source.licence === 'uncertain' ? 'reuse rights uncertain; excluded' : 'reuse rights recorded'}</p>
              {source.knownLimitations && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plainText(source.knownLimitations)}</p>}
            </li>
          ))}
        </ul>
      </details>
      <Link href="/" className="inline-flex border border-brand-500 bg-brand-500 px-5 py-3 font-display text-sm font-bold uppercase text-black hover:bg-white">Start the walkthrough →</Link>
    </div>
  );
}
