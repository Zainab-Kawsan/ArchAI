from fastapi import FastAPI

from app.api.v1.generate import router as generate_router

app = FastAPI(
    title="ArchAI AI Service",
    version="1.0.0"
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(
    generate_router,
    prefix="/api/v1",
    tags=["Generation"]
)