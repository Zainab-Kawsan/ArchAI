from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.generate import router as generate_router
from app.api.v1.projects import router as project_router
from app.api.v1.artifacts import router as artifact_router

app = FastAPI(
    title="ArchAI AI Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://archai-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(generate_router, prefix="/api/v1", tags=["Generation"])
app.include_router(project_router, prefix="/api/v1", tags=["Projects"])
app.include_router(artifact_router, prefix="/api/v1", tags=["Artifacts"])