from app.core.settings import settings
from app.providers.factory import ProviderFactory


class ProviderManager:

    async def get_provider(self):

        provider = ProviderFactory.create(
            settings.DEFAULT_PROVIDER
        )

        if await provider.health_check():
            return provider

        return ProviderFactory.create(
            settings.FALLBACK_PROVIDER
        )