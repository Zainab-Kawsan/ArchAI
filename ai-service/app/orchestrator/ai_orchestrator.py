from sqlalchemy.orm import Session

from app.schemas.generate import GenerateRequest
from app.providers.manager import ProviderManager

from app.repositories.project_repository import ProjectRepository
from app.repositories.artifact_repository import ArtifactRepository
from app.repositories.artifact_version_repository import (
    ArtifactVersionRepository,
)
from app.builders.prompt_builder import PromptBuilder
import json

class AIOrchestrator:

    def __init__(self):

        self.provider_manager = ProviderManager()

        self.project_repository = ProjectRepository()

        self.artifact_repository = ArtifactRepository()

        self.artifact_version_repository = (
            ArtifactVersionRepository()
        )

    async def generate(
        self,
        db: Session,
        request: GenerateRequest,
    ):


        project = self.project_repository.get_by_name(
            db=db,
            name=request.project_id,
        )

        if project is None:

            project = self.project_repository.create(
                db=db,
                name=request.project_id,
            )


        artifact = self.artifact_repository.get_by_project_and_type(
            db=db,
            project_id=project.id,
            artifact_type=request.artifact_type.value,
        )

        if artifact is None:

            artifact = self.artifact_repository.create(
                db=db,
                project_id=project.id,
                artifact_type=request.artifact_type.value,
            )


        latest = self.artifact_version_repository.get_latest(
            db=db,
            artifact_id=artifact.id,
        )

        # If regenerate=False, return latest version
        if latest is not None and not request.regenerate:

            return {
                "artifact_id": str(artifact.id),
                "version": latest.version,
                "provider": request.provider,
                "generation_time": 0,
                "content": latest.content,
            }
            
        print("1- Before provider")

        provider = await self.provider_manager.get_provider(
            request.provider
        )
        
        print("2- Before prompt")  
        
        prompt = PromptBuilder.build(
            artifact_type=request.artifact_type,
            user_prompt=request.user_prompt,
        )
        
        print("3- Before Gemini")
        
        content = await provider.generate(
            prompt
        )
        
        print("4- Content generated")


        latest_version = (
            self.artifact_version_repository.get_latest_version(
                db=db,
                artifact_id=artifact.id,
            )
        )
        
        print("5- Latest version:", latest_version)

        new_version = latest_version + 1

        artifact_version = (
            self.artifact_version_repository.create(
                db=db,
                artifact_id=artifact.id,
                version=new_version,
                content=content,
            )
        )
        
        print("6- Version created")


        return {
            "artifact_id": str(artifact.id),
            "version": artifact_version.version,
            "provider": request.provider,
            "generation_time": 0.42,
            "content": artifact_version.content,
        }