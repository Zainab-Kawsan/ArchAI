from app.core.settings import settings
from app.providers.factory import ProviderFactory
from app.schemas.enums import ProviderType


class ProviderManager:

    async def get_provider(
        self,
        requested_provider: ProviderType,
    ):

        if requested_provider == ProviderType.GEMINI:
            provider = ProviderFactory.create("gemini")

        elif requested_provider == ProviderType.GROQ:
            provider = ProviderFactory.create("groq")

        else:
            provider = ProviderFactory.create(
                settings.DEFAULT_PROVIDER
            )

        if await provider.health_check():
            return provider

        return ProviderFactory.create(
            settings.FALLBACK_PROVIDER
        )