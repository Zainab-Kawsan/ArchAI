from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.repositories.artifact_version_repository import (
    ArtifactVersionRepository,
)

from app.schemas.artifact_version import (
    ArtifactVersionResponse,
)
from fastapi import HTTPException

from app.schemas.artifact_version import (
    ArtifactVersionDetailResponse,
)

from pydantic import BaseModel


router = APIRouter()

repository = ArtifactVersionRepository()


@router.get(
    "/artifacts/{artifact_id}/versions",
    response_model=list[ArtifactVersionResponse],
)
def get_versions(
    artifact_id: int,
    db: Session = Depends(get_db),
):

    return repository.get_all(
        db=db,
        artifact_id=artifact_id,
    )
    
    
@router.get(
    "/artifacts/{artifact_id}/versions/{version}",
    response_model=ArtifactVersionDetailResponse,
)
def get_version(
    artifact_id: int,
    version: int,
    db: Session = Depends(get_db),
):

    artifact_version = repository.get_by_version(
        db=db,
        artifact_id=artifact_id,
        version=version,
    )

    if artifact_version is None:
        raise HTTPException(
            status_code=404,
            detail="Version not found",
        )

    return artifact_version