import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Box,
  ChakraProvider,
  extendTheme,
  ThemeConfig,
  Tooltip,
} from '@chakra-ui/react';
import {
  EmotionDisplay,
  HateDisplay,
  Loader,
  MisleadingDisplay,
} from './modules/Components';
import {
  EmotionRes,
  get_emotion,
  getHate,
  getMisleading,
  is_unsafe,
  Misleading,
  HateSpeech,
} from './modules/api';
import { CheckCircle, XCircle } from 'react-feather';

var observeDOM = (function () {
  var MutationObserver: typeof window.MutationObserver =
    window.MutationObserver || (window as any).WebKitMutationObserver;

  return function (obj: Node, callback: any) {
    if (!obj || obj.nodeType !== 1) return;

    if (MutationObserver) {
      var mutationObserver = new MutationObserver(callback);

      mutationObserver.observe(obj, { childList: true, subtree: true });
      return mutationObserver;
    }
  };
})();

const theme = extendTheme({
  config: {
    initialColorModeName: 'dark',
    initialColorMode: 'dark',
    useSystemColorMode: false,
  } as ThemeConfig,
});

const TweetOverlay = ({ content }: { content: string }) => {
  const [loading, setLoading] = useState(true);
  const [emotion, setEmotion] = useState<EmotionRes | null>(null);
  const [misleading, setMisleading] = useState<Misleading | null>(null);
  const [hateful, setHateful] = useState<HateSpeech | null>(null);

  useEffect(() => {
    (async () => {
      getHate(content).then((isHateful) => {
        setHateful(isHateful);
      });
      if (await is_unsafe(content)) {
        const emo = await get_emotion(content);
        getMisleading(content).then((isMisleading) => {
          setMisleading(isMisleading);
        });
        if (emo) {
          setEmotion(emo);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    })();
  }, [content]);

  const notHateful = !hateful || hateful.hateful <= 0.5;

  return (
    <ChakraProvider theme={theme}>
      {!loading && emotion && emotion.emotion !== 'others' && (
        <EmotionDisplay emotion={emotion} />
      )}
      <div
        className={`burstTweetOverlay`}
        onClick={(e) => {
          if (loading) {
            e.stopPropagation();
          }
        }}
      >
        {!loading && !emotion && (
          <Tooltip
            label={notHateful ? 'Non-emotional Tweet' : 'Hateful Tweet'}
            zIndex="10"
            pointerEvents="initial"
          >
            <Box position="absolute" right="0" bottom="0">
              {notHateful ? (
                <CheckCircle color="#3bff6f" />
              ) : (
                <XCircle color="#FC8181" />
              )}
            </Box>
          </Tooltip>
        )}
        {loading && <Loader />}
        {emotion && <MisleadingDisplay misleading={misleading} />}
      </div>
      <HateDisplay hate={hateful} />
    </ChakraProvider>
  );
};

let loaded = new Set();

observeDOM(document.body, (mList: MutationRecord[]) => {
  for (const m of mList) {
    if (m.type == 'childList') {
      m.addedNodes.forEach((n: Node) => {
        if (n.nodeType == 1) {
          const node = n as HTMLElement;
          const children = node.querySelectorAll(
            'div[id^="id__"][lang][dir="auto"]:not([lang=""])'
          );
          children.forEach((element) => {
            const nodeId = element.id as string;
            if (!loaded.has(nodeId)) {
              loaded.add(nodeId);
              const container = document.createElement('div');
              const twitterDiv = element.parentElement?.parentElement;
              if (twitterDiv) {
                twitterDiv.insertBefore(container, twitterDiv.firstChild);
                ReactDOM.render(
                  <TweetOverlay content={element.textContent as string} />,
                  container
                );
              }
            }
          });
        }
      });
    }
  }
});
