'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { deserializeMd, serializeMd } from '@platejs/markdown';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/components/ui/editor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PlateMarkdownEditorProps {
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
}

const emptyValue: Value = [{ children: [{ text: '' }], type: 'p' }];
const transientNodeTypes = new Set(['aiChat']);
const transientPropertyNames = new Set([
  'ai',
  'aiChat',
  'comment',
  'suggestion',
]);

export function PlateMarkdownEditor({
  markdown,
  onMarkdownChange,
}: PlateMarkdownEditorProps) {
  const { t } = useTranslation('admin');
  const didLoadInitialMarkdown = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: useMemo(() => emptyValue, []),
  });

  useEffect(() => {
    if (didLoadInitialMarkdown.current) {
      return;
    }

    didLoadInitialMarkdown.current = true;

    if (!markdown.trim()) {
      return;
    }

    try {
      const value = deserializeMd(editor, markdown) as Value;

      (editor.tf.setValue as (value: Value) => void)(
        value.length ? value : emptyValue,
      );
    } catch (error) {
      console.error('Plate markdown deserialize failed', error);
    }
  }, [editor, markdown]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  return (
    <TooltipProvider>
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-[#121212]/10 bg-white text-[#121212] dark:border-white/10 dark:bg-[#101010] dark:text-white',
          isFullscreen && 'fixed inset-0 z-40 rounded-none border-0',
        )}
      >
        <Plate
          editor={editor}
          onValueChange={({ editor }) => {
            onMarkdownChange(safeSerializeEditor(editor, markdown));
          }}
        >
          <EditorContainer
            className={isFullscreen ? 'h-screen' : 'h-[72vh]'}
            variant="default"
          >
            <Editor
              className="min-h-full"
              placeholder={t("startWriting")}
              variant="demo"
            />
          </EditorContainer>

          <SettingsDialog />
        </Plate>
      </div>

      <motion.div
        className="fixed bottom-28 right-4 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={isFullscreen ? t("exitFullscreenWriting") : t("fullscreenWriting")}
              className="rounded-full backdrop-blur-sm shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 ease-in-out"
              size="icon"
              variant="outline"
              onClick={() => setIsFullscreen((current) => !current)}
            >
              {isFullscreen ? (
                <Minimize2 className="size-[1.2rem]  text-primary" />
              ) : (
                <Maximize2 className="size-[1.2rem]  text-primary" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isFullscreen ? t("exitFullscreenWriting") : t("fullscreenWriting")}
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}

function safeSerializeEditor(editor: unknown, fallback: string) {
  try {
    const slateEditor = editor as Parameters<typeof serializeMd>[0] & {
      children?: Value;
    };
    const value = Array.isArray(slateEditor.children)
      ? sanitizeValue(slateEditor.children)
      : undefined;

    return serializeMd(slateEditor, {
      preserveEmptyParagraphs: true,
      value,
    }).trimEnd();
  } catch (error) {
    console.error('Plate markdown serialize failed', error);

    return fallback;
  }
}

function sanitizeValue(value: Value): Value {
  const sanitized = value
    .flatMap((node) => sanitizeNode(node))
    .flatMap((node) =>
      isTextNode(node) ? [{ children: [node], type: 'p' }] : [node],
    );

  return sanitized.length ? (sanitized as Value) : emptyValue;
}

function sanitizeNode(node: unknown): unknown[] {
  if (!node || typeof node !== 'object') {
    return [];
  }

  const source = node as Record<string, unknown>;

  const next: Record<string, unknown> = {};

  Object.entries(source).forEach(([key, value]) => {
    if (
      transientPropertyNames.has(key) ||
      key.startsWith('comment_') ||
      key.startsWith('suggestion_')
    ) {
      return;
    }

    next[key] = value;
  });

  if (Array.isArray(source.children)) {
    const children = source.children.flatMap((child) => sanitizeNode(child));
    next.children = children.length ? children : [{ text: '' }];
  }

  if (typeof source.type === 'string' && transientNodeTypes.has(source.type)) {
    const children = Array.isArray(next.children) ? next.children : [];

    if (!children.length) {
      return [];
    }

    return children.flatMap((child) =>
      isTextNode(child) ? [{ children: [child], type: 'p' }] : [child],
    );
  }

  return [next];
}

function isTextNode(node: unknown): node is { text: string } {
  return (
    !!node &&
    typeof node === 'object' &&
    'text' in node &&
    typeof (node as { text?: unknown }).text === 'string'
  );
}
