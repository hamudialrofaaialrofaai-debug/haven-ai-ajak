import React from 'react';
import { ExternalLink, Globe, ShieldCheck } from 'lucide-react';

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  publishedDate?: string;
}

interface SourceCardProps {
  source: SearchSource;
  index?: number;
  className?: string;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  index,
  className = '',
}) => {
  // Extract hostname cleanly
  let hostname = source.source || '';
  try {
    if (source.url) {
      hostname = new URL(source.url).hostname.replace('www.', '');
    }
  } catch {
    hostname = source.source || 'web-source';
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl border border-[#222836] bg-[#12151e] p-3 text-left transition-all duration-200 hover:border-amber-500/40 hover:bg-[#161a26] hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1c2230] text-amber-400 group-hover:text-amber-300">
            <Globe className="h-3 w-3" />
          </div>
          <span className="truncate font-mono text-[11px] text-neutral-400 group-hover:text-neutral-200">
            {hostname}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-neutral-500 group-hover:text-amber-300">
          {index !== undefined && <span>[{index + 1}]</span>}
          <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <h4 className="mt-1.5 line-clamp-1 text-xs font-semibold text-neutral-100 group-hover:text-amber-200 transition-colors">
        {source.title}
      </h4>

      {source.snippet && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-neutral-400 group-hover:text-neutral-300">
          {source.snippet}
        </p>
      )}

      {source.publishedDate && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
          <ShieldCheck className="h-3 w-3 text-emerald-500/80" />
          <span>Verified Grounding</span>
          <span aria-hidden="true">·</span>
          <span>{source.publishedDate}</span>
        </div>
      )}
    </a>
  );
};

export default SourceCard;
