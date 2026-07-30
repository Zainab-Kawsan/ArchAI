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
       
       
    def delete(
      self,
      db: Session,
      project_id: int,
    ):
        project = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if project:
            db.delete(project)
            db.commit()
        return {"message": "Project deleted"}
      
    def rename(
      self,
      db: Session,
      project_id: int,
      name: str,
    ):
        project = (db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not project:
            return None
        project.name = name
        db.commit()
        db.refresh(project)
         
        return project