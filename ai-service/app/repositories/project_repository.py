from sqlalchemy.orm import Session

from app.models.project import Project

from sqlalchemy.orm import Session

from app.models.project import Project

class ProjectRepository:

    def create(
        self,
        db: Session,
        name: str,
        description: str | None = None,
    ) -> Project:

        project = Project(
            name=name,
            description=description,
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        return project
    
    def get_by_name(
        self,
        db: Session,
        name: str,
    ) -> Project | None:

        return (
            db.query(Project)
            .filter(Project.name == name)
            .first()
        )
        
    def get_all(
      self,
      db: Session,
    ):

       return (
          db.query(Project)
          .order_by(Project.id)
          .all()
        )