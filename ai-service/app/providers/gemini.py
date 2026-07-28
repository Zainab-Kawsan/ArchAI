from google import genai

from app.core.settings import settings
from app.providers.base import BaseProvider


class GeminiProvider(BaseProvider):

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

    async def generate(self, prompt: str) -> str:

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return response.text

    async def health_check(self) -> bool:

        try:
            self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents="hello",
            )
            return True

        except Exception:
            return False