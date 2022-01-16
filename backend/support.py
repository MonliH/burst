from typing import Any
import openai
import httpx
import json
import os
from preprocess import preprocess_tweet, normalizeTweet
import random


def is_unsafe(content):
    response = openai.Completion.create(
        engine="content-filter-alpha",
        prompt="<|endoftext|>" + content + "\n--\nLabel:",
        temperature=0,
        max_tokens=1,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        logprobs=10,
    )

    output_label = response["choices"][0]["text"]

    # This is the probability at which we evaluate that a "2" is likely real
    # vs. should be discarded as a false positive
    toxic_threshold = -0.355

    if output_label == "2":
        # If the model returns "2", return its confidence in 2 or other output-labels
        logprobs = response["choices"][0]["logprobs"]["top_logprobs"][0]

        # If the model is not sufficiently confident in "2",
        # choose the most probable of "0" or "1"
        # Guaranteed to have a confidence for 2 since this was the selected token.
        if logprobs["2"] < toxic_threshold:
            logprob_0 = logprobs.get("0", None)
            logprob_1 = logprobs.get("1", None)

            # If both "0" and "1" have probabilities, set the output label
            # to whichever is most probable
            if logprob_0 is not None and logprob_1 is not None:
                if logprob_0 >= logprob_1:
                    output_label = "0"
                else:
                    output_label = "1"
            # If only one of them is found, set output label to that one
            elif logprob_0 is not None:
                output_label = "0"
            elif logprob_1 is not None:
                output_label = "1"

            # If neither "0" or "1" are available, stick with "2"
            # by leaving output_label unchanged.

    # if the most probable token is none of "0", "1", or "2"
    # this should be set as unsafe
    if output_label not in ["0", "1", "2"]:
        output_label = "2"

    return output_label


SENT_URL = "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-sentiment-analysis"
EMO_URL = "https://api-inference.huggingface.co/models/finiteautomata/bertweet-base-emotion-analysis"
HF_API_KEY = os.getenv("HF_API_KEY").split(",")


def preprocess(text: str) -> str:
    new_text = []

    for t in text.split(" "):
        t = "@user" if t.startswith("@") and len(t) > 1 else t
        t = "http" if t.startswith("http") else t
        new_text.append(t)

    return " ".join(new_text)


async def query(payload: str, url: str) -> Any:
    data = json.dumps(payload)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={"Authorization": f"Bearer {random.choice(HF_API_KEY)}"},
            data=data,
        )
    return json.loads(response.content.decode("utf-8"))


async def get_emotion(content: str):
    sent_res = await query(preprocess(content), SENT_URL)
    sent_res = sent_res[0]

    scores = {"NEG": 0, "NEU": 0, "POS": 0}
    for res in sent_res:
        scores[res["label"]] = res["score"]

    if scores["NEU"] > 0.5:
        return None

    emotion = await query(preprocess_tweet(content, lang="en"), EMO_URL)
    return {
        "emotion": max(emotion[0], key=lambda x: x["score"])["label"],
        "strength": scores["POS"] + scores["NEG"],
    }


HATE_URL = (
    "https://api-inference.huggingface.co/models/pysentimiento/bertweet-hate-speech"
)


async def is_hate(content: str):
    hate = await query(preprocess_tweet(content, lang="en"), HATE_URL)
    scores = {"hateful": 0, "targeted": 0, "aggressive": 0}
    for res in hate[0]:
        scores[res["label"]] = res["score"]

    return scores


MISLEADING_URL = (
    "https://api-inference.huggingface.co/models/pediberto/autonlp-testing-504313966"
)


async def is_misleading(content: str):
    misleading = await query(normalizeTweet(content).lower(), MISLEADING_URL)
    scores = {"misleading": 0, "ok": 0}
    for res in misleading[0]:
        scores[res["label"]] = res["score"]

    return scores
