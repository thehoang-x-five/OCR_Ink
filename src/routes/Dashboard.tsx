import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Card from '@/components/common/Card';
import type { BatchJob } from '@/types';
import { getJobs } from '@/lib/api';
import type { AppOutletContext } from '@/App';
import { useI18n } from '@/lib/i18n';

const Dashboard = () => {
  const { pushToast } = useOutletContext<AppOutletContext>();
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  const stats = useMemo(() => {
    const total = jobs.length;
    const done = jobs.filter((j) => j.status === 'done').length;
    const successRate = total ? Math.round((done / total) * 100) : 0;
    const avgConfidence = 93.4;
    const spark = Array.from({ length: 12 }, (_, i) => ({
      hour: i,
      value: Math.max(1, Math.round(Math.random() * (total || 10))),
    }));
    return { total, done, successRate, avgConfidence, spark };
  }, [jobs]);

  const recent = jobs.slice(0, 5);

  const fileUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job) => {
      const ext = job.fileName?.split('.').pop()?.toLowerCase() || 'unknown';
      counts[ext] = (counts[ext] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([ext, count]) => ({ ext, count }))
      .slice(0, 6);
  }, [jobs]);

  const statusCounts = useMemo(() => {
    const base = { queued: 0, running: 0, error: 0 };
    jobs.forEach((j) => {
      if (j.status === 'queued') base.queued += 1;
      if (j.status === 'running' || j.status === 'preprocessing' || j.status === 'postprocessing') base.running += 1;
      if (j.status === 'error') base.error += 1;
    });
    return base;
  }, [jobs]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 items-stretch">
        {[
          { title: t.dashboard.totalJobs, value: stats.total, color: '#38bdf8' },
          { title: t.dashboard.successRate, value: `${stats.successRate}%`, color: '#10b981' },
          { title: t.dashboard.avgConfidence, value: `${stats.avgConfidence}%`, color: '#6366f1' },
          { title: t.dashboard.recentFiles, value: recent.length, color: '#f97316' },
        ].map((item) => (
          <Card key={item.title} title={item.title} description="">
            <div className="flex items-start justify-between">
              <p className="text-3xl font-bold">{item.value}</p>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            </div>
            <div className="mt-3 h-14 rounded-md bg-muted/40 px-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.spark} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.15)' }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={item.color} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Card title={t.dashboard.queued} description="" className="p-3">
          <p className="text-xl font-bold text-amber-500">{statusCounts.queued}</p>
          <p className="text-xs text-muted-foreground">{t.dashboard.waiting}</p>
        </Card>
        <Card title={t.dashboard.running} description="" className="p-3">
          <p className="text-xl font-bold text-sky-500">{statusCounts.running}</p>
          <p className="text-xs text-muted-foreground">{t.dashboard.inProgress}</p>
        </Card>
        <Card title={t.dashboard.errors} description="" className="p-3">
          <p className="text-xl font-bold text-rose-500">{statusCounts.error}</p>
          <p className="text-xs text-muted-foreground">{t.dashboard.needsRetry}</p>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-2 items-stretch">
        <Card title={t.dashboard.recentActivity} description={t.dashboard.latestJobsTimeline} className="h-full">
          <div className="space-y-3">
            {recent.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{job.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.type.toUpperCase()} • {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{job.status}</span>
              </motion.div>
            ))}
            {!recent.length && <p className="text-sm text-muted-foreground">{t.dashboard.noActivityYet}</p>}
          </div>
        </Card>

        <Card title={t.dashboard.fileTypesUsage} description={t.dashboard.topFileExtensions} className="h-full">
          <div className="h-full space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.dashboard.total}: {stats.total}</span>
              <span>{t.dashboard.done}: {stats.done}</span>
            </div>
            <div className="h-40 rounded-lg border border-border/60 bg-muted/40 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fileUsage.length ? fileUsage : [{ ext: 'none', count: 0 }]}>
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {fileUsage.map((f) => (
                <div key={f.ext} className="flex items-center justify-between rounded-lg border border-border/50 bg-card/70 px-3 py-2">
                  <span className="font-semibold text-foreground uppercase">{f.ext}</span>
                  <span className="text-muted-foreground">{f.count} {t.dashboard.jobs}</span>
                </div>
              ))}
              {!fileUsage.length && <p className="text-xs text-muted-foreground">{t.dashboard.noJobsYet}</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
