from sqlalchemy.orm import Session

from app.models.artifact import Artifact


class ArtifactRepository:

    def create(
        self,
        db: Session,
        project_id: int,
        artifact_type: str,
    ) -> Artifact:

        artifact = Artifact(
            project_id=project_id,
            artifact_type=artifact_type,
        )

        db.add(artifact)
        db.commit()
        db.refresh(artifact)

        return artifact
    
    def get_by_project_and_type(
        self,
        db: Session,
        project_id: int,
        artifact_type: str,
    ) -> Artifact | None:

        return (
            db.query(Artifact)
            .filter(
                Artifact.project_id == project_id,
                Artifact.artifact_type == artifact_type,
            )
            .first()
        )
        
    def get_by_project(
      self,
      db: Session,
      project_id: int,
    ):

      return (
         db.query(Artifact)
         .filter(
            Artifact.project_id == project_id
        )
        .order_by(Artifact.id)
        .all()
      )