export const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'ulternae@gmail.com';
export type CommentDraft = { name: string; email: string; message: string };
export type CommentField = keyof CommentDraft;
export type CommentErrors = Partial<Record<CommentField, string>>;
export type PreparedComment = { recipients: string[]; subject: string; body: string; isHtml: false };
export type MailStatus = 'cancelled' | 'saved' | 'sent' | 'undetermined';
export type CommentStatus = 'idle' | 'opening' | 'unavailable' | 'opened' | 'cancelled' | 'saved' | 'submitted' | 'error' | 'copied' | 'copyFailed';
export type MailAdapter = {
  platform: string;
  isAvailable: () => Promise<boolean>;
  compose: (message: PreparedComment) => Promise<{ status: MailStatus }>;
};
export type CommentResult = { kind: 'invalid'; errors: CommentErrors } | { kind: 'busy' | 'unavailable' | 'opened' | 'cancelled' | 'saved' | 'submitted' | 'error' };

export function emptyComment(): CommentDraft { return { name: '', email: '', message: '' }; }

export function validateComment(draft: CommentDraft): CommentErrors {
  const errors: CommentErrors = {};
  if (!draft.name.trim() || draft.name.length > 100) errors.name = 'Escribe tu nombre (hasta 100 caracteres).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) || draft.email.length > 254) errors.email = 'Escribe un correo válido, como nombre@correo.com.';
  if (!draft.message.trim() || draft.message.length > 2000) errors.message = 'Escribe un mensaje de hasta 2000 caracteres.';
  return errors;
}

export function prepareComment(draft: CommentDraft, recipient = supportEmail): PreparedComment {
  return {
    recipients: [recipient], subject: 'Comentario sobre Puppy', isHtml: false,
    body: `Nombre: ${draft.name.trim()}\nCorreo: ${draft.email.trim()}\n\n${draft.message.trim()}`,
  };
}

export function commentCopy(draft: CommentDraft): string {
  const mail = prepareComment(draft);
  return `Para: ${mail.recipients[0]}\nAsunto: ${mail.subject}\n\n${mail.body}`;
}

export function createCommentSender(adapter: MailAdapter) {
  let busy = false;
  return async (draft: CommentDraft): Promise<CommentResult> => {
    if (busy) return { kind: 'busy' };
    const errors = validateComment(draft);
    if (Object.keys(errors).length) return { kind: 'invalid', errors };
    const mail = prepareComment(draft);
    busy = true;
    try {
      if (!await adapter.isAvailable()) return { kind: 'unavailable' };
      const { status } = await adapter.compose(mail);
      // Android reports "sent" when opening the client, without reporting the user's final action.
      if (adapter.platform !== 'ios') return { kind: 'opened' };
      if (status === 'cancelled') return { kind: 'cancelled' };
      if (status === 'saved') return { kind: 'saved' };
      return { kind: status === 'sent' ? 'submitted' : 'opened' };
    } catch { return { kind: 'error' }; }
    finally { busy = false; }
  };
}

export function commentFeedback(status: CommentStatus): string {
  switch (status) {
    case 'opening': return 'Abriendo tu aplicación de correo…';
    case 'unavailable': return 'No encontramos una aplicación de correo disponible. Puedes copiar el mensaje y enviarlo desde tu correo.';
    case 'error': return 'No pudimos abrir tu correo. Tu mensaje sigue aquí; puedes reintentar o copiarlo.';
    case 'opened': return 'Continúa el envío en tu aplicación de correo. Tu mensaje permanece aquí.';
    case 'cancelled': return 'Cancelaste el envío. Puedes seguir editando tu mensaje.';
    case 'saved': return 'Tu aplicación de correo guardó un borrador.';
    case 'submitted': return 'Tu aplicación de correo indicó que el mensaje fue enviado.';
    case 'copied': return 'Mensaje copiado. Puedes pegarlo en tu correo.';
    case 'copyFailed': return 'No pudimos copiar el mensaje. Puedes seleccionar el texto que aparece abajo.';
    default: return '';
  }
}
