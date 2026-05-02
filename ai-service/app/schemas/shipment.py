from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

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
    
    @validator('shipment_date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD')

class ComplianceResponse(BaseModel):
    compliant: bool
    risk_score: float
    risk_factors: List[str]
    penalty_estimate: str
    legal_citations: List[str]
    suggested_actions: List[str]
    requires_human_review: bool
    timestamp: str