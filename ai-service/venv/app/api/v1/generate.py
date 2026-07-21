from fastapi import APIRouter

from app.schemas.generate import GenerateRequest, GenerateResponse

router = APIRouter()


@router.post(
    "/generate",
    response_model=GenerateResponse
)
async def generate(request: GenerateRequest):

    return GenerateResponse(
        success=True,
        artifact_id="demo-123",
        version=1,
        provider=request.provider,
        generation_time=0.42,
        content="This is a mock response."
    )