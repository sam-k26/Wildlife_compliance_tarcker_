from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import pandas as pd
import joblib
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Wildlife Compliance Validator", version="1.0.0")

# ========== DATA MODELS ==========
class ShipmentData(BaseModel):
    species_name: str = Field(..., example="African Elephant")
    scientific_name: Optional[str] = Field(None, example="Loxodonta africana")
    quantity: int = Field(..., gt=0, example=5)
    unit: str = Field(..., example="kg", pattern="^(kg|pieces|live|skins)$")
    origin_country: str = Field(..., example="Zimbabwe", min_length=2)
    destination_country: str = Field(..., example="USA", min_length=2)
    permit_number: Optional[str] = Field(None, example="CITES-2024-12345")
    shipment_date: str = Field(..., example="2024-03-15")
    declaration_type: str = Field(..., example="export", pattern="^(export|import|re-export)$")

class ComplianceResponse(BaseModel):
    compliant: bool
    risk_score: float  # 0-100
    risk_factors: List[str]
    penalty_estimate: str
    legal_citations: List[str]
    suggested_actions: List[str]
    requires_human_review: bool
    timestamp: str

# ========== CITES DATABASE SIMULATION ==========
CITES_DB = {
    "african elephant": {
        "appendix": "I",
        "scientific": "Loxodonta africana",
        "restrictions": ["No commercial trade", "Import permit required", "Export permit required"],
        "typical_penalty": "$50,000 - $200,000"
    },
    "tiger": {
        "appendix": "I",
        "scientific": "Panthera tigris",
        "restrictions": ["No commercial trade", "Strictly prohibited for hunting trophies"],
        "typical_penalty": "$100,000 - $500,000"
    },
    "peregrine falcon": {
        "appendix": "I",
        "scientific": "Falco peregrinus",
        "restrictions": ["Captive-bred only", "Microchipping required"],
        "typical_penalty": "$25,000 - $100,000"
    },
    "american alligator": {
        "appendix": "II",
        "scientific": "Alligator mississippiensis",
        "restrictions": ["Quota limits apply", "Sustainable harvest only"],
        "typical_penalty": "$5,000 - $25,000"
    },
    "python": {
        "appendix": "II",
        "scientific": "Python regius",
        "restrictions": ["Export quota: 5000 annually", "Captive-bred certification needed"],
        "typical_penalty": "$10,000 - $50,000"
    }
}

# Penalty database by country
PENALTY_DB = {
    "USA": {"min": 5000, "max": 500000, "enforcement": "High"},
    "EU": {"min": 10000, "max": 300000, "enforcement": "High"},
    "CHINA": {"min": 20000, "max": 1000000, "enforcement": "Severe"},
    "INDIA": {"min": 10000, "max": 250000, "enforcement": "Moderate-High"}
}

# ========== VALIDATION LOGIC ==========
def check_permit_validity(permit: str, species: str) -> tuple[bool, List[str]]:
    """Validate permit format and existence"""
    issues = []
    if not permit:
        issues.append("❌ No permit number provided")
        return False, issues
    
    if not permit.startswith("CITES-"):
        issues.append("⚠️ Invalid permit format - should start with 'CITES-'")
    
    # In real system, call CITES API here
    if len(permit) < 10:
        issues.append("⚠️ Permit number too short")
    
    return len(issues) == 0, issues

def check_species_restrictions(species: str, declaration_type: str, 
                                origin: str, destination: str) -> tuple[bool, List[str], float]:
    """Check CITES appendix restrictions"""
    issues = []
    risk_score = 0
    
    species_lower = species.lower()
    
    if species_lower not in CITES_DB:
        issues.append("⚠️ Unknown species - requires validation from CITES database")
        risk_score += 30
        return False, issues, risk_score
    
    species_data = CITES_DB[species_lower]
    
    # Appendix I check
    if species_data["appendix"] == "I":
        risk_score += 50
        if declaration_type in ["export", "import"]:
            issues.append(f"🚨 CRITICAL: {species} is CITES Appendix I - commercial trade prohibited")
            issues.append(f"   Required: {', '.join(species_data['restrictions'])}")
        else:
            issues.append(f"⚠️ {species} is CITES Appendix I - extremely restricted")
    
    # Appendix II check
    elif species_data["appendix"] == "II":
        risk_score += 20
        issues.append(f"⚠️ {species} is CITES Appendix II - permits and quotas required")
    
    # Country-specific checks
    if origin == "CHINA" and species_lower in ["tiger", "african elephant"]:
        issues.append("🚨 China has strict domestic bans on tiger and elephant products")
        risk_score += 40
    
    if destination == "USA" and species_lower == "python":
        issues.append("⚠️ USA Lacey Act prohibits certain python species")
        risk_score += 25
    
    return True, issues, min(risk_score, 100)

def check_quota_compliance(species: str, quantity: int) -> tuple[bool, List[str]]:
    """Check against annual quotas"""
    issues = []
    
    # Simulated quotas
    quotas = {
        "american alligator": 5000,
        "python": 5000
    }
    
    species_lower = species.lower()
    if species_lower in quotas and quantity > quotas[species_lower]:
        issues.append(f"❌ Quantity ({quantity}) exceeds annual quota ({quotas[species_lower]}) for {species}")
    
    return len(issues) == 0, issues

# ========== MAIN ENDPOINT ==========
@app.post("/api/validate", response_model=ComplianceResponse)
async def validate_shipment(shipment: ShipmentData):
    """Validate a wildlife shipment against CITES and local regulations"""
    
    logger.info(f"Validating shipment: {shipment.species_name} from {shipment.origin_country} to {shipment.destination_country}")
    
    all_issues = []
    risk_score = 0
    legal_citations = []
    suggested_actions = []
    
    # 1. Check permit
    permit_valid, permit_issues = check_permit_validity(shipment.permit_number, shipment.species_name)
    all_issues.extend(permit_issues)
    if not permit_valid:
        risk_score += 25
    
    # 2. Check species restrictions
    species_valid, species_issues, species_risk = check_species_restrictions(
        shipment.species_name, shipment.declaration_type, 
        shipment.origin_country, shipment.destination_country
    )
    all_issues.extend(species_issues)
    risk_score += species_risk
    
    # 3. Check quota
    quota_valid, quota_issues = check_quota_compliance(shipment.species_name, shipment.quantity)
    all_issues.extend(quota_issues)
    if not quota_valid:
        risk_score += 30
    
    # 4. Legal citations
    if any("Appendix I" in issue for issue in all_issues):
        legal_citations.append("CITES Article III (International Trade in Appendix I Species)")
        legal_citations.append("CITES Resolution Conf. 9.24 (Criteria for Appendix I)")
        suggested_actions.append("Cancel shipment immediately - illegal trade detected")
        suggested_actions.append("Contact CITES Management Authority for guidance")
    elif any("Appendix II" in issue for issue in all_issues):
        legal_citations.append("CITES Article IV (International Trade in Appendix II Species)")
        legal_citations.append("CITES Resolution Conf. 12.3 (Permits and Certificates)")
        suggested_actions.append("Obtain valid export permit before shipping")
        suggested_actions.append("Verify quota availability with exporting country")
    
    # 5. Penalty estimation
    penalty_estimate = calculate_penalty(risk_score, shipment.origin_country, shipment.species_name)
    
    # 6. Determine compliance
    compliant = risk_score < 40 and all(not issue.startswith("❌") and not issue.startswith("🚨") 
                                        for issue in all_issues)
    requires_review = risk_score >= 30 or any("⚠️" in issue for issue in all_issues)
    
    return ComplianceResponse(
        compliant=compliant,
        risk_score=risk_score,
        risk_factors=all_issues[:5],  # Top 5 issues
        penalty_estimate=penalty_estimate,
        legal_citations=legal_citations,
        suggested_actions=suggested_actions if suggested_actions else ["Shipment appears compliant - maintain documentation"],
        requires_human_review=requires_review,
        timestamp=datetime.now().isoformat()
    )

def calculate_penalty(risk_score: float, country: str, species: str) -> str:
    """Estimate potential penalty amount"""
    country_upper = country.upper()
    
    if country_upper in PENALTY_DB:
        base_min, base_max = PENALTY_DB[country_upper]["min"], PENALTY_DB[country_upper]["max"]
    else:
        base_min, base_max = 5000, 100000
    
    # Risk multiplier
    multiplier = 1 + (risk_score / 100)
    
    estimated_min = int(base_min * multiplier)
    estimated_max = int(base_max * multiplier)
    
    # Species-specific adjustments
    species_lower = species.lower()
    if species_lower in CITES_DB and CITES_DB[species_lower]["appendix"] == "I":
        estimated_min *= 3
        estimated_max *= 3
    
    return f"${estimated_min:,} - ${estimated_max:,}"

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "cites-validator"}

# ========== RUN ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

