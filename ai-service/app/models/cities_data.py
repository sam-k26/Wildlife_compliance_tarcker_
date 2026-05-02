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
    },
    "rhinoceros": {
        "appendix": "I",
        "scientific": "Rhinocerotidae spp.",
        "restrictions": ["No commercial trade", "Strict anti-poaching measures"],
        "typical_penalty": "$200,000 - $1,000,000"
    },
    "pangolin": {
        "appendix": "I",
        "scientific": "Manis spp.",
        "restrictions": ["No commercial trade", "All trade prohibited"],
        "typical_penalty": "$50,000 - $250,000"
    }
}

PENALTY_DB = {
    "USA": {"min": 5000, "max": 500000, "enforcement": "High"},
    "EU": {"min": 10000, "max": 300000, "enforcement": "High"},
    "CHINA": {"min": 20000, "max": 1000000, "enforcement": "Severe"},
    "INDIA": {"min": 10000, "max": 250000, "enforcement": "Moderate-High"},
    "UK": {"min": 5000, "max": 500000, "enforcement": "High"},
    "CANADA": {"min": 5000, "max": 250000, "enforcement": "Moderate"},
    "AUSTRALIA": {"min": 10000, "max": 300000, "enforcement": "High"},
    "SOUTH AFRICA": {"min": 5000, "max": 100000, "enforcement": "Moderate"}
}