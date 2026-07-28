from app.prompts.architecture import ARCHITECTURE_PROMPT
from app.prompts.database import DATABASE_PROMPT
from app.prompts.api import API_PROMPT
from app.prompts.deployment import DEPLOYMENT_PROMPT
from app.prompts.folder_structure import FOLDER_STRUCTURE_PROMPT
from app.prompts.default import DEFAULT_PROMPT

from app.schemas.enums import ArtifactType


class PromptBuilder:

    @staticmethod
    def build(
        artifact_type: ArtifactType,
        user_prompt: str,
    ) -> str:

        prompts = {
            ArtifactType.ARCHITECTURE: ARCHITECTURE_PROMPT,
            ArtifactType.DATABASE: DATABASE_PROMPT,
            ArtifactType.API: API_PROMPT,
            ArtifactType.DEPLOYMENT: DEPLOYMENT_PROMPT,
            ArtifactType.FOLDER_STRUCTURE: FOLDER_STRUCTURE_PROMPT,
        }

        template = prompts.get(
            artifact_type,
            DEFAULT_PROMPT,
        )

        return template.format(
            project=user_prompt,
        )