from typing import List, Tuple
from app.schemas.shipment import ShipmentData, ComplianceResponse
from app.models.cites_data import CITES_DB, PENALTY_DB

class ComplianceValidator:
    def __init__(self):
        self.cites_db = CITES_DB
        self.penalty_db = PENALTY_DB
    
    def validate(self, shipment: ShipmentData) -> ComplianceResponse:
        all_issues = []
        risk_score = 0
        legal_citations = []
        suggested_actions = []
        
        # 1. Check permit
        permit_valid, permit_issues = self._check_permit(shipment.permit_number, shipment.species_name)
        all_issues.extend(permit_issues)
        if not permit_valid:
            risk_score += 25
        
        # 2. Check species restrictions
        species_valid, species_issues, species_risk = self._check_species(
            shipment.species_name, 
            shipment.declaration_type,
            shipment.origin_country,
            shipment.destination_country
        )
        all_issues.extend(species_issues)
        risk_score += species_risk
        
        # 3. Check quota
        quota_valid, quota_issues = self._check_quota(shipment.species_name, shipment.quantity)
        all_issues.extend(quota_issues)
        if not quota_valid:
            risk_score += 30
        
        # 4. Legal citations and actions
        if any("Appendix I" in issue for issue in all_issues):
            legal_citations.extend([
                "CITES Article III (International Trade in Appendix I Species)",
                "CITES Resolution Conf. 9.24 (Criteria for Appendix I)"
            ])
            suggested_actions.extend([
                "Cancel shipment immediately - illegal trade detected",
                "Contact CITES Management Authority for guidance"
            ])
        elif any("Appendix II" in issue for issue in all_issues):
            legal_citations.extend([
                "CITES Article IV (International Trade in Appendix II Species)",
                "CITES Resolution Conf. 12.3 (Permits and Certificates)"
            ])
            suggested_actions.extend([
                "Obtain valid export permit before shipping",
                "Verify quota availability with exporting country"
            ])
        
        # 5. Penalty estimation
        penalty_estimate = self._calculate_penalty(risk_score, shipment.origin_country, shipment.species_name)
        
        # 6. Determine compliance
        compliant = risk_score < 40 and all(
            not issue.startswith("❌") and not issue.startswith("🚨") 
            for issue in all_issues
        )
        requires_review = risk_score >= 30 or any("⚠️" in issue for issue in all_issues)
        
        return ComplianceResponse(
            compliant=compliant,
            risk_score=risk_score,
            risk_factors=all_issues[:5],
            penalty_estimate=penalty_estimate,
            legal_citations=legal_citations,
            suggested_actions=suggested_actions if suggested_actions else ["Shipment appears compliant - maintain documentation"],
            requires_human_review=requires_review,
            timestamp=""  # Will be set by main.py
        )
    
    def _check_permit(self, permit: str, species: str) -> Tuple[bool, List[str]]:
        issues = []
        if not permit:
            issues.append("❌ No permit number provided")
            return False, issues
        
        if not permit.startswith("CITES-"):
            issues.append("⚠️ Invalid permit format - should start with 'CITES-'")
        
        if len(permit) < 10:
            issues.append("⚠️ Permit number too short")
        
        return len(issues) == 0, issues
    
    def _check_species(self, species: str, declaration_type: str, 
                       origin: str, destination: str) -> Tuple[bool, List[str], float]:
        issues = []
        risk_score = 0
        
        species_lower = species.lower()
        
        if species_lower not in self.cites_db:
            issues.append("⚠️ Unknown species - requires validation from CITES database")
            risk_score += 30
            return False, issues, risk_score
        
        species_data = self.cites_db[species_lower]
        
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
        if origin.upper() == "CHINA" and species_lower in ["tiger", "african elephant"]:
            issues.append("🚨 China has strict domestic bans on tiger and elephant products")
            risk_score += 40
        
        if destination.upper() == "USA" and species_lower == "python":
            issues.append("⚠️ USA Lacey Act prohibits certain python species")
            risk_score += 25
        
        return True, issues, min(risk_score, 100)
    
    def _check_quota(self, species: str, quantity: int) -> Tuple[bool, List[str]]:
        issues = []
        
        quotas = {
            "american alligator": 5000,
            "python": 5000
        }
        
        species_lower = species.lower()
        if species_lower in quotas and quantity > quotas[species_lower]:
            issues.append(f"❌ Quantity ({quantity}) exceeds annual quota ({quotas[species_lower]}) for {species}")
        
        return len(issues) == 0, issues
    
    def _calculate_penalty(self, risk_score: float, country: str, species: str) -> str:
        country_upper = country.upper()
        
        if country_upper in self.penalty_db:
            base_min, base_max = self.penalty_db[country_upper]["min"], self.penalty_db[country_upper]["max"]
        else:
            base_min, base_max = 5000, 100000
        
        # Risk multiplier
        multiplier = 1 + (risk_score / 100)
        
        estimated_min = int(base_min * multiplier)
        estimated_max = int(base_max * multiplier)
        
        # Species-specific adjustments
        species_lower = species.lower()
        if species_lower in self.cites_db and self.cites_db[species_lower]["appendix"] == "I":
            estimated_min *= 3
            estimated_max *= 3
        
        return f"${estimated_min:,} - ${estimated_max:,}"