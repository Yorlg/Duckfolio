'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import { CopilotPlugin } from '@platejs/ai/react';
import {
  Check,
  ChevronsUpDown,
  ExternalLinkIcon,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Wand2Icon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEditorRef } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { adminMessageKeys } from '@/lib/admin/message-keys';

import { aiChatPlugin } from './plugins/ai-kit';

type Model = {
  label: string;
  value: string;
};

const AI_SETTINGS_STORAGE_KEY = 'duckfolio-admin-ai-settings';

type AiSettings = {
  apiKey: string;
  baseURL: string;
  model: string;
};

export const models: Model[] = [
  // OpenAI Models
  { label: 'GPT-3.5 Turbo', value: 'openai/gpt-3.5-turbo' },
  { label: 'GPT-3.5 Turbo Instruct', value: 'openai/gpt-3.5-turbo-instruct' },
  { label: 'GPT-4 Turbo', value: 'openai/gpt-4-turbo' },
  { label: 'GPT-4.1', value: 'openai/gpt-4.1' },
  { label: 'GPT-4.1 Mini', value: 'openai/gpt-4.1-mini' },
  { label: 'GPT-4.1 Nano', value: 'openai/gpt-4.1-nano' },
  { label: 'GPT-4o', value: 'openai/gpt-4o' },
  { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
  { label: 'GPT-5', value: 'openai/gpt-5' },
  { label: 'GPT-5 Codex', value: 'openai/gpt-5-codex' },
  { label: 'GPT-5 Mini', value: 'openai/gpt-5-mini' },
  { label: 'GPT-5 Nano', value: 'openai/gpt-5-nano' },
  { label: 'GPT-OSS 120B', value: 'openai/gpt-oss-120b' },
  { label: 'GPT-OSS 20B', value: 'openai/gpt-oss-20b' },
  { label: 'O1', value: 'openai/o1' },
  { label: 'O3', value: 'openai/o3' },
  { label: 'O3 Mini', value: 'openai/o3-mini' },
  { label: 'O4 Mini', value: 'openai/o4-mini' },

  // Google Models
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash' },
  { label: 'Gemini 2.0 Flash Lite', value: 'google/gemini-2.0-flash-lite' },
  { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
  {
    label: 'Gemini 2.5 Flash Image Preview',
    value: 'google/gemini-2.5-flash-image-preview',
  },
  { label: 'Gemini 2.5 Flash Lite', value: 'google/gemini-2.5-flash-lite' },
  { label: 'Gemini 2.5 Pro', value: 'google/gemini-2.5-pro' },
  { label: 'Gemma 2 9B', value: 'google/gemma-2-9b' },

  // Alibaba Models
  { label: 'Qwen 3 14B', value: 'alibaba/qwen-3-14b' },
  { label: 'Qwen 3 235B', value: 'alibaba/qwen-3-235b' },
  { label: 'Qwen 3 30B', value: 'alibaba/qwen-3-30b' },
  { label: 'Qwen 3 32B', value: 'alibaba/qwen-3-32b' },
  { label: 'Qwen3 Coder', value: 'alibaba/qwen3-coder' },
  { label: 'Qwen3 Coder Plus', value: 'alibaba/qwen3-coder-plus' },
  { label: 'Qwen3 Max', value: 'alibaba/qwen3-max' },
  { label: 'Qwen3 Max Preview', value: 'alibaba/qwen3-max-preview' },
  {
    label: 'Qwen3 Next 80B A3B Instruct',
    value: 'alibaba/qwen3-next-80b-a3b-instruct',
  },
  {
    label: 'Qwen3 Next 80B A3B Thinking',
    value: 'alibaba/qwen3-next-80b-a3b-thinking',
  },
  { label: 'Qwen3 VL Instruct', value: 'alibaba/qwen3-vl-instruct' },
  { label: 'Qwen3 VL Thinking', value: 'alibaba/qwen3-vl-thinking' },

  // Amazon Models
  { label: 'Nova Lite', value: 'amazon/nova-lite' },
  { label: 'Nova Micro', value: 'amazon/nova-micro' },
  { label: 'Nova Pro', value: 'amazon/nova-pro' },

  // Anthropic Models
  { label: 'Claude 3 Haiku', value: 'anthropic/claude-3-haiku' },
  { label: 'Claude 3 Opus', value: 'anthropic/claude-3-opus' },
  { label: 'Claude 3.5 Haiku', value: 'anthropic/claude-3.5-haiku' },
  { label: 'Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
  { label: 'Claude 3.7 Sonnet', value: 'anthropic/claude-3.7-sonnet' },
  { label: 'Claude Opus 4', value: 'anthropic/claude-opus-4' },
  { label: 'Claude Opus 4.1', value: 'anthropic/claude-opus-4.1' },
  { label: 'Claude Sonnet 4', value: 'anthropic/claude-sonnet-4' },

  // Cohere Models
  { label: 'Command A', value: 'cohere/command-a' },
  { label: 'Command R', value: 'cohere/command-r' },
  { label: 'Command R Plus', value: 'cohere/command-r-plus' },

  // DeepSeek Models
  { label: 'DeepSeek R1', value: 'deepseek/deepseek-r1' },
  {
    label: 'DeepSeek R1 Distill Llama 70B',
    value: 'deepseek/deepseek-r1-distill-llama-70b',
  },
  { label: 'DeepSeek V3', value: 'deepseek/deepseek-v3' },
  { label: 'DeepSeek V3.1', value: 'deepseek/deepseek-v3.1' },
  { label: 'DeepSeek V3.1 Base', value: 'deepseek/deepseek-v3.1-base' },
  { label: 'DeepSeek V3.1 Terminus', value: 'deepseek/deepseek-v3.1-terminus' },
  { label: 'DeepSeek V3.2 Exp', value: 'deepseek/deepseek-v3.2-exp' },
  {
    label: 'DeepSeek V3.2 Exp Thinking',
    value: 'deepseek/deepseek-v3.2-exp-thinking',
  },

  // Inception Models
  { label: 'Mercury Coder Small', value: 'inception/mercury-coder-small' },

  // Meituan Models
  { label: 'LongCat Flash Chat', value: 'meituan/longcat-flash-chat' },
  { label: 'LongCat Flash Thinking', value: 'meituan/longcat-flash-thinking' },

  // Meta Models
  { label: 'Llama 3 70B', value: 'meta/llama-3-70b' },
  { label: 'Llama 3 8B', value: 'meta/llama-3-8b' },
  { label: 'Llama 3.1 70B', value: 'meta/llama-3.1-70b' },
  { label: 'Llama 3.1 8B', value: 'meta/llama-3.1-8b' },
  { label: 'Llama 3.2 11B', value: 'meta/llama-3.2-11b' },
  { label: 'Llama 3.2 1B', value: 'meta/llama-3.2-1b' },
  { label: 'Llama 3.2 3B', value: 'meta/llama-3.2-3b' },
  { label: 'Llama 3.2 90B', value: 'meta/llama-3.2-90b' },
  { label: 'Llama 3.3 70B', value: 'meta/llama-3.3-70b' },
  { label: 'Llama 4 Maverick', value: 'meta/llama-4-maverick' },
  { label: 'Llama 4 Scout', value: 'meta/llama-4-scout' },

  // Mistral Models
  { label: 'Codestral', value: 'mistral/codestral' },
  { label: 'Devstral Small', value: 'mistral/devstral-small' },
  { label: 'Magistral Medium', value: 'mistral/magistral-medium' },
  { label: 'Magistral Small', value: 'mistral/magistral-small' },
  { label: 'Ministral 3B', value: 'mistral/ministral-3b' },
  { label: 'Ministral 8B', value: 'mistral/ministral-8b' },
  { label: 'Mistral Large', value: 'mistral/mistral-large' },
  { label: 'Mistral Medium', value: 'mistral/mistral-medium' },
  { label: 'Mistral Small', value: 'mistral/mistral-small' },
  { label: 'Mixtral 8x22B Instruct', value: 'mistral/mixtral-8x22b-instruct' },
  { label: 'Pixtral 12B', value: 'mistral/pixtral-12b' },
  { label: 'Pixtral Large', value: 'mistral/pixtral-large' },

  // MoonshotAI Models
  { label: 'Kimi K2', value: 'moonshotai/kimi-k2' },
  { label: 'Kimi K2 0905', value: 'moonshotai/kimi-k2-0905' },
  { label: 'Kimi K2 Turbo', value: 'moonshotai/kimi-k2-turbo' },

  // Morph Models
  { label: 'Morph V3 Fast', value: 'morph/morph-v3-fast' },
  { label: 'Morph V3 Large', value: 'morph/morph-v3-large' },

  // Perplexity Models
  { label: 'Sonar', value: 'perplexity/sonar' },
  { label: 'Sonar Pro', value: 'perplexity/sonar-pro' },
  { label: 'Sonar Reasoning', value: 'perplexity/sonar-reasoning' },
  { label: 'Sonar Reasoning Pro', value: 'perplexity/sonar-reasoning-pro' },

  // Stealth Models
  { label: 'Sonoma Dusk Alpha', value: 'stealth/sonoma-dusk-alpha' },
  { label: 'Sonoma Sky Alpha', value: 'stealth/sonoma-sky-alpha' },

  // Vercel Models
  { label: 'v0 1.0 MD', value: 'vercel/v0-1.0-md' },
  { label: 'v0 1.5 MD', value: 'vercel/v0-1.5-md' },

  // xAI Models
  { label: 'Grok 2', value: 'xai/grok-2' },
  { label: 'Grok 2 Vision', value: 'xai/grok-2-vision' },
  { label: 'Grok 3', value: 'xai/grok-3' },
  { label: 'Grok 3 Fast', value: 'xai/grok-3-fast' },
  { label: 'Grok 3 Mini', value: 'xai/grok-3-mini' },
  { label: 'Grok 3 Mini Fast', value: 'xai/grok-3-mini-fast' },
  { label: 'Grok 4', value: 'xai/grok-4' },
  { label: 'Grok Code Fast 1', value: 'xai/grok-code-fast-1' },
  {
    label: 'Grok 4 Fast Non-Reasoning',
    value: 'xai/grok-4-fast-non-reasoning',
  },
  { label: 'Grok 4 Fast Reasoning', value: 'xai/grok-4-fast-reasoning' },

  // ZAI Models
  { label: 'GLM 4.5', value: 'zai/glm-4.5' },
  { label: 'GLM 4.5 Air', value: 'zai/glm-4.5-air' },
  { label: 'GLM 4.5V', value: 'zai/glm-4.5v' },
];

export function SettingsDialog() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const { t, i18n } = useTranslation('admin');
  const language: 'en' | 'zh-CN' = i18n.resolvedLanguage === 'en' ? 'en' : 'zh-CN';
  const editor = useEditorRef();
  const [tempModelId, setTempModelId] = React.useState(models[7].value);
  const [tempKeys, setTempKeys] = React.useState<Record<string, string>>({
    aiBaseUrl: '',
    aiGatewayApiKey: '',
  });
  const [showKey, setShowKey] = React.useState<Record<string, boolean>>({});
  const [open, setOpen] = React.useState(false);
  const [openModel, setOpenModel] = React.useState(false);
  const [hasLoadedSession, setHasLoadedSession] = React.useState(false);
  const [availableModels, setAvailableModels] = React.useState<Model[]>(models);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);
  const [modelFetchStatus, setModelFetchStatus] = React.useState('');

  const hasCustomBaseUrl = Boolean(tempKeys.aiBaseUrl.trim());
  const modelOptions = hasCustomBaseUrl ? availableModels : models;
  const tempModel =
    modelOptions.find((model) => model.value === tempModelId) ??
    models.find((model) => model.value === tempModelId) ??
    null;
  const aiOptions = React.useMemo<AiSettings>(
    () => ({
      apiKey: tempKeys.aiGatewayApiKey,
      baseURL: tempKeys.aiBaseUrl,
      model: tempModelId,
    }),
    [tempKeys.aiBaseUrl, tempKeys.aiGatewayApiKey, tempModelId],
  );

  const applyAiOptions = React.useCallback(
    (options: AiSettings) => {
      // Update AI chat options
      const chatOptions = editor.getOptions(aiChatPlugin).chatOptions ?? {};

      editor.setOption(aiChatPlugin, 'chatOptions', {
        ...chatOptions,
        body: {
          ...chatOptions.body,
          ...options,
        },
      });

      // Update AI complete options
      const completeOptions =
        editor.getOptions(CopilotPlugin).completeOptions ?? {};
      editor.setOption(CopilotPlugin, 'completeOptions', {
        ...completeOptions,
        body: {
          ...completeOptions.body,
          ...options,
        },
      });
    },
    [editor],
  );

  React.useEffect(() => {
    if (!isAdmin) {
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(AI_SETTINGS_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AiSettings>;
        const nextOptions = {
          apiKey: parsed.apiKey ?? '',
          baseURL: parsed.baseURL ?? '',
          model: parsed.model || models[7].value,
        };

        setTempKeys((current) => ({
          ...current,
          aiBaseUrl: nextOptions.baseURL,
          aiGatewayApiKey: nextOptions.apiKey,
        }));
        setTempModelId(nextOptions.model);
        applyAiOptions(nextOptions);
      }
    } catch {
      window.sessionStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    } finally {
      setHasLoadedSession(true);
    }
  }, [applyAiOptions, isAdmin]);

  React.useEffect(() => {
    if (!isAdmin || !hasLoadedSession) {
      return;
    }

    window.sessionStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      JSON.stringify(aiOptions),
    );
    applyAiOptions(aiOptions);
  }, [aiOptions, applyAiOptions, hasLoadedSession, isAdmin]);

  React.useEffect(() => {
    if (!isAdmin || !hasLoadedSession) {
      return;
    }

    const apiKey = tempKeys.aiGatewayApiKey.trim();
    const baseURL = tempKeys.aiBaseUrl.trim();

    if (!baseURL) {
      setAvailableModels(models);
      setModelFetchStatus('');
      setIsLoadingModels(false);
      return;
    }

    if (!apiKey) {
      setAvailableModels([]);
      setModelFetchStatus(t("modelKeyHint"));
      setIsLoadingModels(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoadingModels(true);
      setModelFetchStatus(t("loadingModelList"));

      void fetch('/api/ai/models', {
        body: JSON.stringify({ apiKey, baseURL }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = (await response.json()) as {
            message?: string;
            models?: Model[];
          };

          if (!response.ok) {
            throw new Error(data.message ? t(adminMessageKeys[data.message] ?? data.message) : t('failedToLoadModelList'));
          }

          const nextModels = (data.models || []).filter((model) => model.value);

          setAvailableModels(nextModels);
          setModelFetchStatus(
            nextModels.length
              ? t("loadedCountModels", { count: nextModels.length })
              : t("noModelsFoundYouCanEnterAModelID"),
          );
          setTempModelId((current) =>
            nextModels.length &&
            !nextModels.some((model) => model.value === current)
              ? nextModels[0].value
              : current,
          );
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return;
          }

          setAvailableModels([]);
          setModelFetchStatus(
            error instanceof Error ? t(adminMessageKeys[error.message] ?? error.message) : t("failedToLoadModelList"),
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoadingModels(false);
          }
        });
    }, 600);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [hasLoadedSession, isAdmin, language, t, tempKeys.aiBaseUrl, tempKeys.aiGatewayApiKey]);

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyAiOptions(aiOptions);
    setOpen(false);
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTextInput = (
    service: string,
    label: string,
    placeholder?: string,
  ) => (
    <div className="grid gap-2">
      <label className="text-muted-foreground text-sm" htmlFor={service}>
        {label}
      </label>
      <Input
        id={service}
        value={tempKeys[service]}
        onChange={(e) =>
          setTempKeys((prev) => ({ ...prev, [service]: e.target.value }))
        }
        placeholder={placeholder ?? ''}
      />
    </div>
  );

  const renderApiKeyInput = (service: string, label: string) => (
    <div className="grid gap-2">
      <label className="text-muted-foreground text-sm" htmlFor={service}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={service}
          className="pr-20"
          value={tempKeys[service]}
          onChange={(e) =>
            setTempKeys((prev) => ({ ...prev, [service]: e.target.value }))
          }
          placeholder=""
          data-1p-ignore
          type={showKey[service] ? 'text' : 'password'}
        />
        <div className="-translate-y-1/2 absolute top-1/2 right-1 flex items-center gap-1">
          <Button asChild size="icon-sm" variant="ghost">
            <a
              className="flex items-center"
              href="https://vercel.com/docs/ai-gateway"
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLinkIcon className="size-4" />
              <span className="sr-only">{t("getLabel", { label })}</span>
            </a>
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => toggleKeyVisibility(service)}
            type="button"
          >
            {showKey[service] ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            <span className="sr-only">
              {showKey[service] ? t("hide") : t("show")} {label}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.div
        className="fixed bottom-40 right-4 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <DialogTrigger asChild>
          <Button
            aria-label={t("settings")}
            className="rounded-full backdrop-blur-sm shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 ease-in-out"
            size="icon"
            variant="outline"
          >
            <Settings className="size-[1.2rem]  text-primary" />
          </Button>
        </DialogTrigger>
      </motion.div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">{t("settings")}</DialogTitle>
          <DialogDescription>{t("configureAIAPIKeysAndPreferences")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* AI Settings Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <Wand2Icon className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">AI</h4>
            </div>

            <div className="space-y-4">
              {renderApiKeyInput('aiGatewayApiKey', t("aIAPIKey"))}

              {renderTextInput(
                'aiBaseUrl',
                t("baseURLAPIEndpoint"),
                'https://api.openai.com/v1',
              )}

              <div className="grid gap-2">
                <label
                  className="text-muted-foreground text-sm"
                  htmlFor="select-model"
                >
                  {t("model")}
                </label>
                <Popover open={openModel} onOpenChange={setOpenModel}>
                  <PopoverTrigger id="select-model" asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-between"
                      aria-expanded={openModel}
                      role="combobox"
                    >
                      <code>{tempModel?.label ?? tempModelId}</code>
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <Command>
                      <CommandInput placeholder={t("searchModels")} />
                      <CommandEmpty>
                        {isLoadingModels ? t("loadingModels") : t("noModelsFound")}
                      </CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {modelOptions.map((m) => (
                            <CommandItem
                              key={m.value}
                              value={m.value}
                              onSelect={() => {
                                setTempModelId(m.value);
                                setOpenModel(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  tempModelId === m.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <code>{m.label}</code>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {modelFetchStatus && (
                  <p className="text-muted-foreground flex items-center gap-2 text-xs">
                    {isLoadingModels && (
                      <Loader2 className="size-3 animate-spin" />
                    )}
                    {modelFetchStatus}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label
                  className="text-muted-foreground text-sm"
                  htmlFor="model-id"
                >
                  {t("modelID")}
                </label>
                <Input
                  id="model-id"
                  value={tempModelId}
                  onChange={(e) => setTempModelId(e.target.value)}
                  placeholder="gpt-4o-mini / deepseek-chat / qwen-plus"
                />
              </div>
            </div>
          </div>
          <Button size="lg" className="w-full" type="submit">
            {t("saveSettings")}
          </Button>
        </form>

        <p className="text-muted-foreground text-sm">
          {t("settingsSessionHint")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
