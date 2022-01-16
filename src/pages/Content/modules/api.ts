export interface EmotionRes {
  strength: number;
  emotion: string;
}

export interface Misleading {
  misleading: number;
  ok: number;
}

export interface HateSpeech {
  targeted: number;
  hateful: number;
  aggressive: number;
}

interface Cache {
  isUnsafe?: boolean;
  emotion?: EmotionRes | null;
  misleading?: Misleading;
  hate?: HateSpeech;
}

const apiUrl = 'https://burst.deta.dev';
const waitTime = 2000;
const longWaitTime = 20000;
const trialsOnFail = 5;

export async function is_unsafe(
  content: string,
  depth: number = 0
): Promise<boolean> {
  const res = (await chrome.storage.local.get(content))[content] as
    | Cache
    | undefined;
  if (typeof res?.isUnsafe !== 'undefined') {
    return res.isUnsafe;
  } else {
    try {
      const res = await fetch(`${apiUrl}/is_unsafe`, {
        body: content,
        method: 'POST',
      });
      const text = await res.json();
      const ok = text !== '0';
      chrome.storage.local.set({ [content]: { isUnsafe: ok } });
      return ok;
    } catch {
      if (depth < trialsOnFail) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            depth === trialsOnFail - 1 ? longWaitTime : waitTime
          )
        );
        return is_unsafe(content, depth + 1);
      } else {
        return false;
      }
    }
  }
}

export async function get_emotion(
  content: string,
  depth: number = 0
): Promise<EmotionRes | null> {
  const res = (await chrome.storage.local.get(content))[content] as
    | Cache
    | undefined;
  if (typeof res?.emotion !== 'undefined') {
    return res.emotion;
  } else {
    try {
      const fetchRes = await fetch(`${apiUrl}/get_emotion`, {
        body: content,
        method: 'POST',
      });

      let text: null | EmotionRes = await fetchRes.json();
      if (text?.emotion === 'others') {
        text = null;
      }
      chrome.storage.local.set({
        [content]: { ...res, emotion: text } as Cache,
      });
      return text;
    } catch {
      if (depth < trialsOnFail) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            depth === trialsOnFail - 1 ? longWaitTime : waitTime
          )
        );
        return get_emotion(content, depth + 1);
      } else {
        return null;
      }
    }
  }
}

export async function getMisleading(
  content: string,
  depth: number = 0
): Promise<Misleading | null> {
  const res = (await chrome.storage.local.get(content))[content] as
    | Cache
    | undefined;
  if (typeof res?.misleading !== 'undefined') {
    return res.misleading;
  } else {
    try {
      const fetchRes = await fetch(`${apiUrl}/is_misleading`, {
        body: content,
        method: 'POST',
      });

      let text: Misleading = await fetchRes.json();
      const res = (await chrome.storage.local.get(content))[content] as
        | Cache
        | undefined;
      chrome.storage.local.set({
        [content]: { ...res, misleading: text } as Cache,
      });
      return text;
    } catch {
      if (depth < trialsOnFail) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            depth === trialsOnFail - 1 ? longWaitTime : waitTime
          )
        );
        return getMisleading(content, depth + 1);
      } else {
        return null;
      }
    }
  }
}

export async function getHate(
  content: string,
  depth: number = 0
): Promise<HateSpeech | null> {
  const res = (await chrome.storage.local.get(content))[content] as
    | Cache
    | undefined;
  if (typeof res?.hate !== 'undefined') {
    return res.hate;
  } else {
    try {
      const fetchRes = await fetch(`${apiUrl}/is_hate`, {
        body: content,
        method: 'POST',
      });

      let text: HateSpeech = await fetchRes.json();
      const res = (await chrome.storage.local.get(content))[content] as
        | Cache
        | undefined;
      chrome.storage.local.set({
        [content]: { ...res, hate: text } as Cache,
      });
      return text;
    } catch {
      if (depth < trialsOnFail) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            depth === trialsOnFail - 1 ? longWaitTime : waitTime
          )
        );
        return getHate(content, depth + 1);
      } else {
        return null;
      }
    }
  }
}
