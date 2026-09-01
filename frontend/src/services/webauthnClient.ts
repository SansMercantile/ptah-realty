/**
 * PTAH Realty -- WebAuthn (passkey) browser-side helper.
 *
 * The server (api/user_security.py) sends registration options as plain
 * JSON with base64url-encoded byte fields (challenge, user.id, excluded
 * credential ids) -- navigator.credentials.create() needs those as real
 * ArrayBuffers instead. Same conversion in reverse for the credential
 * the browser hands back, before it can be JSON-posted to
 * /passkeys/register/verify.
 */

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    base64url.length + ((4 - (base64url.length % 4)) % 4),
    '='
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials;
}

/** Runs the browser-side half of passkey registration: converts the
 * server's options to a real PublicKeyCredentialCreationOptions,
 * prompts the platform authenticator (Face ID / Windows Hello /
 * security key / etc. -- whatever the OS offers), and converts the
 * resulting credential back into the plain-JSON shape the server's
 * verify_registration_response expects. */
export async function createPasskeyCredential(serverOptions: any): Promise<any> {
  const publicKey: PublicKeyCredentialCreationOptions = {
    ...serverOptions,
    challenge: base64urlToBuffer(serverOptions.challenge),
    user: {
      ...serverOptions.user,
      id: base64urlToBuffer(serverOptions.user.id),
    },
    excludeCredentials: (serverOptions.excludeCredentials || []).map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    })),
  };

  const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error('No credential was returned by the browser.');
  }

  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      attestationObject: bufferToBase64url(response.attestationObject),
      transports: response.getTransports ? response.getTransports() : undefined,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

/** Human-readable reason for the most common navigator.credentials
 * rejection cases, since the raw DOMException messages are cryptic. */
export function describeWebAuthnError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'NotAllowedError') {
      return 'Cancelled, or no matching passkey/authenticator was available.';
    }
    if (err.name === 'InvalidStateError') {
      return 'This device is already registered as a passkey for your account.';
    }
    return err.message;
  }
  return 'Passkey registration failed.';
}
