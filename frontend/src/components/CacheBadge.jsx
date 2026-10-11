import React from 'react';
import { Zap, Database, RefreshCw } from 'lucide-react';

export default function CacheBadge({ cacheStatus, servedBy, onRefresh, loading }) {
  const isHit = cacheStatus === 'HIT';

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border shadow-xs transition-all ${
          isHit
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
            : 'bg-blue-50 text-blue-800 border-blue-200 shadow-blue-500/10'
        }`}
        title={`Telemetry: X-Cache ${cacheStatus || 'MISS'} from Restaurant Service`}
      >
        {isHit ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            <span className="font-semibold">Redis Cache: HIT</span>
            <span className="text-[11px] text-emerald-600/90 hidden sm:inline">(Sub-10ms response)</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
            <span className="font-semibold">Redis Cache: MISS</span>
            <span className="text-[11px] text-blue-600/90 hidden sm:inline">(Loaded from MongoDB)</span>
          </>
        )}

        {servedBy && (
          <span className="pl-1.5 border-l border-slate-300/80 text-[10px] text-slate-500 font-mono">
            Node: {servedBy.slice(0, 8)}
          </span>
        )}
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="btn-tactile p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all disabled:opacity-50"
          title="Refresh catalog to test Cache HIT / MISS"
          aria-label="Refresh catalog"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
