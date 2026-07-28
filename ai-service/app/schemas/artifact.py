from pydantic import BaseModel


class ArtifactResponse(BaseModel):
    id: int
    artifact_type: str

    model_config = {
        "from_attributes": True
    }