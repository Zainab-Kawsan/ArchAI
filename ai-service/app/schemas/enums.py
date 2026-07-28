from enum import Enum


class ArtifactType(str, Enum):
    ARCHITECTURE = "architecture"
    DATABASE = "database"
    API = "api"
    FOLDER_STRUCTURE = "folder_structure"
    DEPLOYMENT = "deployment"
    SECURITY = "security"
    COST_ESTIMATION = "cost_estimation"


class ProviderType(str, Enum):
    AUTO = "auto"
    GEMINI = "gemini"
    GROQ = "groq"