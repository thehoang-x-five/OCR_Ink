import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '@/components/common/Card';
import { apiClient } from '@/lib/api';
import type { AppOutletContext } from '@/App';
import type { OcrLanguage, OcrMode } from '@/types';

const Settings = () => {
  const { pushToast } = useOutletContext<AppOutletContext>();
  const [language, setLanguage] = useState<OcrLanguage>('auto');
  const [mode, setMode] = useState<OcrMode>('balanced');
  const [autosave, setAutosave] = useState(true);
  
  // Backend settings
  const [parser, setParser] = useState<'docling' | 'mineru'>('docling');
  const [parseMethod, setParseMethod] = useState<'auto' | 'ocr' | 'txt'>('auto');
  const [useLocalOllama, setUseLocalOllama] = useState(false);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://localhost:11434/api');
  const [ollamaLlmModel, setOllamaLlmModel] = useState('qwen2.5:7b');
  const [ollamaEmbedModel, setOllamaEmbedModel] = useState('nomic-embed-text');
  const [ollamaVisionModel, setOllamaVisionModel] = useState('llava:7b');
  
  // Backend status
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    version?: string;
    parserDefault?: string;
    enableRag?: boolean;
    ollamaReachable?: boolean;
  }>({ connected: false });

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await apiClient.checkHealth();
      setBackendStatus({
        connected: true,
        version: health.version,
        parserDefault: health.parserDefault,
        enableRag: health.enableRag,
        ollamaReachable: health.ollamaReachable
      });
      
      // Update settings from backend defaults
      if (health.parserDefault) {
        setParser(health.parserDefault as 'docling' | 'mineru');
      }
      setUseLocalOllama(health.enableRag);
    } catch (error) {
      setBackendStatus({ connected: false });
      console.warn('Backend health check failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Defaults, limits, and preferences (mock)</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Backend Status" description="Connection and service status">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {backendStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
              {backendStatus.version && (
                <span className="text-xs text-muted-foreground">v{backendStatus.version}</span>
              )}
            </div>
            
            {backendStatus.connected && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Parser:</span>{' '}
                  <span className="font-medium">{backendStatus.parserDefault}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">RAG:</span>{' '}
                  <span className="font-medium">{backendStatus.enableRag ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ollama:</span>{' '}
                  <span className="font-medium">{backendStatus.ollamaReachable ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={checkBackendHealth}
              className="btn-secondary text-xs"
            >
              Refresh Status
            </button>
          </div>
        </Card>

        <Card title="Default OCR settings">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              Parser
              <select 
                value={parser} 
                onChange={(e) => setParser(e.target.value as 'docling' | 'mineru')} 
                className="input-modern text-sm"
                disabled={!backendStatus.connected}
              >
                <option value="docling">Docling (Default)</option>
                <option value="mineru">MinerU</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Parse Method
              <select 
                value={parseMethod} 
                onChange={(e) => setParseMethod(e.target.value as 'auto' | 'ocr' | 'txt')} 
                className="input-modern text-sm"
                disabled={!backendStatus.connected}
              >
                <option value="auto">Auto</option>
                <option value="ocr">OCR</option>
                <option value="txt">Text</option>
              </select>
            </label>
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
            <label className="flex items-center gap-2 col-span-2">
              <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
              Autosave results
            </label>
          </div>
        </Card>

        <Card title="Local Ollama Settings" description="Configure local LLM integration">
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={useLocalOllama} 
                onChange={(e) => setUseLocalOllama(e.target.checked)} 
              />
              Use Local Ollama
            </label>
            
            {useLocalOllama && (
              <div className="space-y-3 pl-6 border-l-2 border-border/50">
                <label className="flex flex-col gap-1">
                  Base URL
                  <input 
                    type="text" 
                    value={ollamaBaseUrl} 
                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                    className="input-modern text-sm"
                    placeholder="http://localhost:11434/api"
                  />
                </label>
                
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex flex-col gap-1">
                    LLM Model
                    <input 
                      type="text" 
                      value={ollamaLlmModel} 
                      onChange={(e) => setOllamaLlmModel(e.target.value)}
                      className="input-modern text-sm"
                      placeholder="qwen2.5:7b"
                    />
                  </label>
                  
                  <label className="flex flex-col gap-1">
                    Embedding Model
                    <input 
                      type="text" 
                      value={ollamaEmbedModel} 
                      onChange={(e) => setOllamaEmbedModel(e.target.value)}
                      className="input-modern text-sm"
                      placeholder="nomic-embed-text"
                    />
                  </label>
                  
                  <label className="flex flex-col gap-1">
                    Vision Model
                    <input 
                      type="text" 
                      value={ollamaVisionModel} 
                      onChange={(e) => setOllamaVisionModel(e.target.value)}
                      className="input-modern text-sm"
                      placeholder="llava:7b"
                    />
                  </label>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Make sure Ollama is running and models are pulled:</p>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs">
                    ollama pull {ollamaLlmModel}<br/>
                    ollama pull {ollamaEmbedModel}<br/>
                    ollama pull {ollamaVisionModel}
                  </code>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Limits & compliance" description="System constraints">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Max file size: 15MB</li>
            <li>Allowed types: PDF, PNG, JPG, JPEG, WebP, TIF, TIFF, BMP, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD</li>
            <li>Retention policy: 30 days (configurable)</li>
            <li>PII detection and masking available</li>
            <li>Local processing with Ollama (no external API calls)</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
