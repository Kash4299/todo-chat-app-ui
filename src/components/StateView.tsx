import { AlertCircle, Inbox, Loader2 } from "lucide-react";

interface StateViewProps {
  title: string;
  description?: string;
}

export function LoadingState({ title, description }: StateViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <p className="font-medium text-text-muted">{title}</p>
      {description && <p className="mt-1 text-sm text-text-dim">{description}</p>}
    </div>
  );
}

export function ErrorState({ title, description }: StateViewProps) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div>
          <p className="font-semibold text-danger">{title}</p>
          {description && <p className="mt-1 text-text-muted">{description}</p>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: StateViewProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-lighter">
        <Inbox className="h-8 w-8 text-text-dim" />
      </div>
      <p className="font-medium text-text-muted">{title}</p>
      {description && <p className="mt-1 text-sm text-text-dim">{description}</p>}
    </div>
  );
}
