from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectResponse

from app.repositories.artifact_repository import ArtifactRepository
from app.schemas.artifact import ArtifactResponse


from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate
from app.schemas.project import ProjectRename

router = APIRouter()

repository = ProjectRepository()

artifact_repository = ArtifactRepository()

project_repository = ProjectRepository()


@router.get(
    "/projects",
    response_model=list[ProjectResponse],
)
def get_projects(
    db: Session = Depends(get_db),
):

    return repository.get_all(db)



@router.get(
    "/projects/{project_id}/artifacts",
    response_model=list[ArtifactResponse],
)
def get_project_artifacts(
    project_id: int,
    db: Session = Depends(get_db),
):

    return artifact_repository.get_by_project(
        db=db,
        project_id=project_id,
    )
    
@router.post("/projects")
def create_project(
    request: ProjectCreate,
    db: Session = Depends(get_db),
):
    return project_repository.create(
        db=db,
        name=request.name,
    )
    
    
@router.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    return project_repository.delete(
        db=db,
        project_id=project_id,
    )
    
@router.put("/projects/{project_id}")
def rename_project(
    project_id: int,
    request: ProjectRename,
    db: Session = Depends(get_db),
):
    return project_repository.rename(
        db=db,
        project_id=project_id,
        name=request.name,
    )