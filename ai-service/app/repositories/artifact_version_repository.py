from sqlalchemy.orm import Session

from app.models.artifact_version import ArtifactVersion

from sqlalchemy import func

class ArtifactVersionRepository:

    def create(
        self,
        db: Session,
        artifact_id: int,
        version: int,
        content: str,
    ) -> ArtifactVersion:

        artifact_version = ArtifactVersion(
            artifact_id=artifact_id,
            version=version,
            content=content,
        )

        db.add(artifact_version)
        db.commit()
        db.refresh(artifact_version)

        return artifact_version
    
    def get_latest_version(
       self,
       db: Session,
       artifact_id: int,
    ) -> int:

        latest = db.query(
          func.max(ArtifactVersion.version)
        ).filter(
           ArtifactVersion.artifact_id == artifact_id
        ).scalar()

        return latest or 0
    
    def get_latest(
      self,
      db: Session,
      artifact_id: int,
    ) -> ArtifactVersion | None:
        return (
        db.query(ArtifactVersion)
        .filter(
            ArtifactVersion.artifact_id == artifact_id
        )
        .order_by(
            ArtifactVersion.version.desc()
        )
        .first()
      )
        
    def get_all(
      self,
      db: Session,
      artifact_id: int,
    ):

      return (
         db.query(ArtifactVersion)
        .filter(
            ArtifactVersion.artifact_id == artifact_id
        )
        .order_by(
            ArtifactVersion.version
        )
        .all()
      )
    
    def get_by_version(
       self,
       db: Session,
       artifact_id: int,
       version: int,
    ):

      return (
          db.query(ArtifactVersion)
          .filter(
             ArtifactVersion.artifact_id == artifact_id,
             ArtifactVersion.version == version,
           )
           .first()
        )