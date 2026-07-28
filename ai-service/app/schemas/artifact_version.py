from pydantic import BaseModel


class ArtifactVersionResponse(BaseModel):
    id: int
    version: int

    model_config = {
        "from_attributes": True
    }


class ArtifactVersionDetailResponse(BaseModel):
    id: int
    version: int
    content: str

    model_config = {
        "from_attributes": True
    }