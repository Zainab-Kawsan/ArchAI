from groq import Groq

from app.core.settings import settings
from app.providers.base import BaseProvider


class GroqProvider(BaseProvider):

    def __init__(self):
        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        self.model = settings.GROQ_MODEL

    async def generate(self, prompt: str) -> str:

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content

    async def health_check(self) -> bool:

        try:

            self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": "Hello"
                    }
                ]
            )

            return True

        except Exception:
            return False