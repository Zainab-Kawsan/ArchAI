from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.orchestrator.ai_orchestrator import AIOrchestrator

router = APIRouter()


@router.post(
    "/generate",
    response_model=GenerateResponse,
)
async def generate(
    request: GenerateRequest,
    db: Session = Depends(get_db),
):

    orchestrator = AIOrchestrator()

    result = await orchestrator.generate(
        db=db,
        request=request,
    )
    print(result)
    print(type(result["content"]))

    return GenerateResponse(
        success=True,
        artifact_id=result["artifact_id"],
        version=result["version"],
        provider=result["provider"],
        generation_time=result["generation_time"],
        content=result["content"],
    )