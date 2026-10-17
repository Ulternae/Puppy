import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import * as Clipboard from 'expo-clipboard';
import { commentCopy, createCommentSender, emptyComment, validateComment, type CommentDraft, type CommentErrors, type CommentField, type CommentStatus } from '../lib/support';

type SupportContext = {
  draft: CommentDraft; errors: CommentErrors; status: CommentStatus;
  changeField: (field: CommentField, value: string) => void;
  submit: () => Promise<CommentField | undefined>;
  copyMessage: () => Promise<void>;
};
const Context = createContext<SupportContext | null>(null);

export function SupportProvider({ children }: PropsWithChildren) {
  const [draft, setDraft] = useState(emptyComment);
  const [errors, setErrors] = useState<CommentErrors>({});
  const [status, setStatus] = useState<CommentStatus>('idle');
  const [send] = useState(() => createCommentSender({
    platform: Platform.OS,
    isAvailable: MailComposer.isAvailableAsync,
    compose: MailComposer.composeAsync,
  }));
  async function submit(): Promise<CommentField | undefined> {
    if (status === 'opening') return;
    const validation = validateComment(draft);
    setErrors(validation);
    const invalid = Object.keys(validation)[0] as CommentField | undefined;
    if (invalid) return invalid;
    setStatus('opening');
    const result = await send(draft);
    if (result.kind === 'busy') return;
    if (result.kind === 'invalid') { setErrors(result.errors); setStatus('idle'); return; }
    setStatus(result.kind);
  }
  async function copyMessage() {
    try { setStatus(await Clipboard.setStringAsync(commentCopy(draft)) ? 'copied' : 'copyFailed'); }
    catch { setStatus('copyFailed'); }
  }
  return <Context.Provider value={{ draft, errors, status, submit, copyMessage,
    changeField(field, value) {
      setDraft(previous => ({ ...previous, [field]: value }));
      setErrors(previous => ({ ...previous, [field]: undefined }));
      setStatus('idle');
    },
  }}>{children}</Context.Provider>;
}

export function useSupport() {
  const value = useContext(Context);
  if (!value) throw new Error('SupportProvider is required');
  return value;
}
