from typing import Dict, Any, Optional
from backend.data.adapters.base import BaseDataAdapter
from backend.data.demo_data import DEMO_RISK_ASSESSMENT, DEMO_EVIDENCE
from backend.logger import logger

class MarineAdvisoriesAdapter(BaseDataAdapter):
    """
    Marine Advisories & Decision Support Adapter.
    Demo Source: INCOIS / CMFRI Fishery & Safety Advisories
    Real API Replacement: INCOIS Integrated Marine Advisory Services (IMAS) API
    """

    def fetch_data(self, location: Dict[str, float], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        source = "INCOIS IMAS Advisory System (Demo Mode)"
        logger.info(f"Fetching marine advisories for location {location}")

        advisories_payload = {
            "risk_assessment": DEMO_RISK_ASSESSMENT,
            "evidence_base": DEMO_EVIDENCE,
            "advisory_bulletin": "Fishing operations not recommended within 50 km off Visakhapatnam due to rough sea conditions and cyclone advisory."
        }

        metadata = {
            "real_api_mapping": "https://incois.gov.in/portal/imas/imas.jsp",
            "issuing_authority": "Indian National Centre for Ocean Information Services (INCOIS)"
        }

        return self.build_response(source=source, location=location, data=advisories_payload, metadata=metadata)
