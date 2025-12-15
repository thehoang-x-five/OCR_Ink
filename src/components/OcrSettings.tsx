import { motion } from 'framer-motion';
import type { OcrSettings as OcrSettingsType, OcrLanguage, OcrMode } from '@/types';

interface OcrSettingsProps {
  settings: OcrSettingsType;
  onSettingsChange: (settings: OcrSettingsType) => void;
  disabled?: boolean;
}

const languages: { value: OcrLanguage; label: string }[] = [
  { value: 'auto', label: 'Auto Detect' },
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

const modes: { value: OcrMode; label: string; desc: string }[] = [
  { value: 'fast', label: 'Fast', desc: 'Quick scan' },
  { value: 'balanced', label: 'Balanced', desc: 'Best for most' },
  { value: 'accurate', label: 'Accurate', desc: 'High precision' },
];

const OcrSettings = ({ settings, onSettingsChange, disabled }: OcrSettingsProps) => {
  const updateSetting = <K extends keyof OcrSettingsType>(
    key: K,
    value: OcrSettingsType[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updatePreprocess = (key: keyof OcrSettingsType['preprocess'], value: boolean) => {
    onSettingsChange({
      ...settings,
      preprocess: { ...settings.preprocess, [key]: value },
    });
  };

  const updateOutput = (key: keyof OcrSettingsType['output'], value: boolean) => {
    onSettingsChange({
      ...settings,
      output: { ...settings.output, [key]: value },
    });
  };

  const updateRegion = (type: 'full' | 'manual') => {
    onSettingsChange({
      ...settings,
      region: { type, coords: type === 'manual' ? { x: 0, y: 0, w: 100, h: 100 } : undefined },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Language</label>
        <select
          value={settings.language}
          onChange={(e) => updateSetting('language', e.target.value as OcrLanguage)}
          disabled={disabled}
          className="input-modern"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Recognition Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => updateSetting('mode', mode.value)}
              disabled={disabled}
              className={`toggle-chip text-center py-2 ${
                settings.mode === mode.value ? 'active' : ''
              }`}
            >
              <span className="block text-xs font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preprocess */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Preprocessing</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'deskew', label: 'Deskew' },
            { key: 'denoise', label: 'Denoise' },
            { key: 'binarize', label: 'Binarize' },
            { key: 'contrastBoost', label: 'Contrast+' },
          ].map((option) => (
            <label
              key={option.key}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                settings.preprocess[option.key as keyof typeof settings.preprocess]
                  ? 'bg-primary-light border-primary/30'
                  : 'bg-card border-border hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={settings.preprocess[option.key as keyof typeof settings.preprocess]}
                onChange={(e) =>
                  updatePreprocess(option.key as keyof typeof settings.preprocess, e.target.checked)
                }
                disabled={disabled}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  settings.preprocess[option.key as keyof typeof settings.preprocess]
                    ? 'bg-primary border-primary'
                    : 'border-border'
                }`}
              >
                {settings.preprocess[option.key as keyof typeof settings.preprocess] && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Region Selection */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Region</label>
        <div className="flex gap-2">
          <button
            onClick={() => updateRegion('full')}
            disabled={disabled}
            className={`toggle-chip flex-1 ${settings.region.type === 'full' ? 'active' : ''}`}
          >
            Full Page
          </button>
          <button
            onClick={() => updateRegion('manual')}
            disabled={disabled}
            className={`toggle-chip flex-1 ${settings.region.type === 'manual' ? 'active' : ''}`}
          >
            Manual Crop
          </button>
        </div>
        {settings.region.type === 'manual' && settings.region.coords && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 grid grid-cols-4 gap-2"
          >
            {['x', 'y', 'w', 'h'].map((coord) => (
              <div key={coord}>
                <label className="text-xs text-muted-foreground uppercase">{coord}</label>
                <input
                  type="number"
                  value={settings.region.coords![coord as keyof typeof settings.region.coords]}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      region: {
                        ...settings.region,
                        coords: {
                          ...settings.region.coords!,
                          [coord]: parseInt(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  disabled={disabled}
                  className="input-modern text-xs py-1.5"
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Output Options */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Output Options</label>
        <div className="space-y-2">
          {[
            { key: 'keepLineBreaks', label: 'Keep line breaks' },
            { key: 'preserveLayout', label: 'Preserve layout' },
            { key: 'detectTables', label: 'Detect tables' },
          ].map((option) => (
            <label
              key={option.key}
              className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                settings.output[option.key as keyof typeof settings.output]
                  ? 'bg-primary-light border-primary/30'
                  : 'bg-card border-border hover:bg-muted'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="checkbox"
                checked={settings.output[option.key as keyof typeof settings.output]}
                onChange={(e) =>
                  updateOutput(option.key as keyof typeof settings.output, e.target.checked)
                }
                disabled={disabled}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  settings.output[option.key as keyof typeof settings.output]
                    ? 'bg-primary border-primary'
                    : 'border-border'
                }`}
              >
                {settings.output[option.key as keyof typeof settings.output] && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OcrSettings;
