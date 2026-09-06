from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class BaseDataAdapter(ABC):
    """Abstract Base Data Adapter ensuring clean interfaces for Live vs Demo Mode."""

    def __init__(self, demo_mode: bool = True):
        self.demo_mode = demo_mode

    @abstractmethod
    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass

    def build_response(
        self,
        source: str,
        location: Dict[str, float],
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Ensures standardized output structure across all data adapters."""
        timestamp = datetime.now(timezone.utc).isoformat()
        
        default_meta = {
            "is_demo": self.demo_mode,
            "provider": source,
            "status": "success",
            "quality": "high" if not self.demo_mode else "simulated_demo"
        }
        if metadata:
            default_meta.update(metadata)

        return {
            "source": source,
            "timestamp": timestamp,
            "location": location,
            "data": data,
            "metadata": default_meta
        }
