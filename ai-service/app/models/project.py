from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

from sqlalchemy.orm import relationship

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
    artifacts = relationship(
      "Artifact",
       back_populates="project",
       cascade="all, delete-orphan"
    )
    
#back_populates is used to define the reverse relationship from Artifact to Project. It allows you to access the associated Project from an Artifact instance using artifact.project. 
# The cascade option ensures that when a Project is deleted, all its associated Artifacts are also deleted automatically.
# project.artifacts will give you a list of all artifacts associated with that project, and artifact.project will give you the project associated with that artifact.