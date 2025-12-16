import { useState } from 'react';
import Card from '@/components/common/Card';
import type { OcrLanguage, OcrMode } from '@/types';

const Settings = () => {
  const [language, setLanguage] = useState<OcrLanguage>('auto');
  const [mode, setMode] = useState<OcrMode>('balanced');
  const [autosave, setAutosave] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Defaults, limits, and preferences (mock)</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Default OCR settings">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              Language
              <select value={language} onChange={(e) => setLanguage(e.target.value as OcrLanguage)} className="input-modern text-sm">
                <option value="auto">Auto</option>
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value as OcrMode)} className="input-modern text-sm">
                <option value="fast">Fast</option>
                <option value="balanced">Balanced</option>
                <option value="accurate">Accurate</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
              Autosave results (mock)
            </label>
          </div>
        </Card>

        <Card title="Limits & compliance" description="Display only">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Max file size: 15MB</li>
            <li>Allowed types: png/jpg/webp/pdf/docx/txt/md</li>
            <li>Retention policy: 30 days (changeable)</li>
            <li>Mask sensitive data & PII detection available</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
