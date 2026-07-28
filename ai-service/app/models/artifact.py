from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),  #kel artifact lezem ykon tebe3 la project
        nullable=False
    )

    artifact_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    project = relationship(
        "Project",
        back_populates="artifacts"
    )
    versions = relationship(
      "ArtifactVersion",
       back_populates="artifact",
       cascade="all, delete-orphan"
    )