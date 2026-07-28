from app.prompts.architecture import ARCHITECTURE_PROMPT


class PromptFactory:

    @staticmethod
    def get_template(artifact_type: str) -> str:

        if artifact_type == "architecture":
            return ARCHITECTURE_PROMPT

        raise ValueError(
            f"Unsupported artifact type: {artifact_type}"
        )