from pydantic import BaseModel

class ProjectCreate(BaseModel):
    name: str

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = {
        "from_attributes": True
    }