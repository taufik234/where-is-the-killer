import { motion, AnimatePresence } from 'framer-motion';
import { Database, AlertTriangle } from 'lucide-react';

interface ResultTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  isLoading?: boolean;
}

export default function ResultTable({ columns, rows, isLoading }: ResultTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-white/20 animate-pulse" />
          <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Menjalankan query...</span>
        </div>
        <div className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="h-3 w-full rounded bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              {i === 0 && <div className="h-3 w-5/6 rounded bg-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 0.15 + 0.1}s` }} />}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center"
      >
        <Database className="w-8 h-8 text-white/10 mx-auto mb-3" />
        <p className="text-sm text-white/40 font-mono">
          Jalankan query untuk melihat hasil.
        </p>
        <p className="text-xs text-white/20 mt-1">
          Tulis SELECT di editor lalu tekan Run Query.
        </p>
      </motion.div>
    );
  }

  if (rows.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400/90">Query berhasil, tidak ada baris yang cocok.</p>
          <p className="mt-1 text-xs text-amber-400/50 leading-relaxed">
            Coba longgarkan WHERE atau cek nama kolom dan nilai. Gunakan SELECT * untuk melihat semua data dulu.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/5 overflow-hidden bg-white/[0.02]"
    >
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Hasil Query</span>
        <span className="text-[10px] font-mono text-white/30">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {columns.map((col) => (
                <th 
                  key={col} 
                  className="text-left px-4 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400/80 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group"
                >
                  {columns.map((col) => {
                    const cellValue = String(row[col] ?? '');
                    const isStatus = ['status', 'action', 'type', 'role'].some(s => col.toLowerCase().includes(s));
                    const isNegative = ['unauthorized', 'failed', 'false', 'inactive', 'banned', 'deleted'].some(s => 
                      cellValue.toLowerCase().includes(s)
                    );
                    const isPositive = ['authorized', 'success', 'true', 'active', 'approved'].some(s => 
                      cellValue.toLowerCase().includes(s)
                    );
                    
                    return (
                      <td key={col} className="px-4 py-2.5 font-mono text-xs text-white/60 whitespace-nowrap">
                        {isStatus ? (
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono ${
                            isNegative 
                              ? 'bg-red-500/10 text-red-400' 
                              : isPositive 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : 'bg-white/5 text-white/50'
                          }`}>
                            {cellValue}
                          </span>
                        ) : (
                          <span className="group-hover:text-white/80 transition-colors">{cellValue}</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
