from fastapi import FastAPI, Request
from support import is_hate, is_misleading, is_unsafe, get_emotion
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/is_unsafe")
async def is_unsafe_api(request: Request):
    text = (await request.body()).decode("utf-8")
    return is_unsafe(text)


@app.post("/get_emotion")
async def get_emotion_api(request: Request):
    text = (await request.body()).decode("utf-8")
    return await get_emotion(text)


@app.post("/is_hate")
async def get_is_hate(request: Request):
    text = (await request.body()).decode("utf-8")
    return await is_hate(text)


@app.post("/is_misleading")
async def get_is_misleading(request: Request):
    text = (await request.body()).decode("utf-8")
    return await is_misleading(text)
