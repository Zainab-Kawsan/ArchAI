from app.providers.gemini import GeminiProvider
from app.providers.groq import GroqProvider

#Singleton

class ProviderFactory:

    _gemini = GeminiProvider()
    _groq = GroqProvider()

    @classmethod
    def create(cls, name: str):

        if name == "gemini":
            return cls._gemini

        if name == "groq":
            return cls._groq

        raise ValueError(f"Unknown provider: {name}")