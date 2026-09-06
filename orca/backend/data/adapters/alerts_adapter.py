from typing import Dict, Any, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.data.demo_data import DEMO_ALERTS
from backend.logger import logger

class AlertsAdapter(BaseDataAdapter):
    """
    Marine Hazard & Meteorological Alerts Data Adapter.
    Demo Source: IMD Weather Warnings & INCOIS Marine Hazard Bulletins
    Real API Replacement: IMD RSS Alert Feeds / INCOIS SAMUDRA App API / CAP (Common Alerting Protocol)
    """

    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        source = "IMD & INCOIS Warning Bulletins (Demo Mode)"
        logger.info(f"Fetching marine alerts for location {location}")

        metadata = {
            "real_api_mapping": "https://mausam.imd.gov.in/rss/district_warning.xml",
            "incois_bulletins": "https://incois.gov.in/portal/osf/warning.jsp",
            "cap_feed": "https://shetkari.imd.gov.in/cap/rss",
            "total_active_alerts": len(DEMO_ALERTS)
        }

        return self.build_response(source=source, location=location, data={"alerts": DEMO_ALERTS}, metadata=metadata)
