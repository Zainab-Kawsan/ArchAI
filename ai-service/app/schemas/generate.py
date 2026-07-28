#contract ben l web app w ai service
from pydantic import BaseModel, Field

from app.schemas.enums import ArtifactType, ProviderType


class GenerateRequest(BaseModel):
    project_id: str

    artifact_type: ArtifactType

    user_prompt: str = Field(
        min_length=5,
        max_length=5000
    )

    regenerate: bool = False

    provider: ProviderType = ProviderType.AUTO

class GenerateResponse(BaseModel):
    success: bool

    artifact_id: str

    version: int

    provider: ProviderType

    generation_time: float

    content: str