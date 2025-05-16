from marshmallow import Schema, fields, ValidationError
class SpecializationDiseaseSchema(Schema):
    specialization = fields.Str(required=True)
    diseases = fields.List(fields.Str(), required=True)
class SpecializationDiseaseMappingSchema(Schema):
    mapping = fields.Dict(
        keys=fields.Str(), 
        values=fields.List(fields.Str()), 
        required=True
    )
# Example specialization_disease_mapping data for validation
specialization_disease_mapping = {
    "Multispeciality": [
        "heart disease", "multiple sclerosis", "migraine",
        "gastroenterology", "liver disease", "crohn’s disease", 
        "ulcerative colitis", "pancreatitis", "peptic ulcers", 
        "orthopedics", "sports injuries", "tuberculosis", 
        "sleep apnea", "chronic kidney disease", "nephrology", 
        "rheumatology", "gynaecology", "psychiatry", "ENT", "cancer","heart attack","Obstetrics", "Neuro Centre"
    ],
    "General": [
        "cold", "flu", "stomach pain", "cough", "fever", "headache", 
        "nausea", "vomiting", "diarrhoea", "constipation", 
        "skin rash", "eczema", "minor burns", "allergies", 
        "UTI", "fatigue", "muscle strain", "joint pain", 
        "minor cuts", "sprains", "dehydration",
        "dengue", "malaria", "chickenpox"
    ],
    "Neurology": [
         "migraines", "epilepsy", "parkinson’s disease", 
        "alzheimer’s disease", "dementia", "brain tumor", "paralysis"
    ],
    "Emergency": [
        "heart attack", "severe trauma", "stroke", "severe allergic reactions", 
        "acute respiratory distress", "severe bleeding", "accident", "rabies"
    ],
    "Child's Health": [
        "asthma", "overweight", "cold", "allergies", "chickenpox", 
        "ear infections", "stomach bugs", "hard poop", "croup", "diabetes", 
        "dry skin","headache", "heartburn", "pee infections", 
        "birth defects", "seizures","children's hospital","polio"
    ],
    "Cardiology": [
        "arrhythmia", "hypertension", "heart failure", "heart attack"
    ],
    "Pediatrics": [
        "pediatric asthma", "obesity", "ADHD","polio","measles","mumps","hepatitis","diphtheria"
    ],
    "Women's Health": [
        "pregnancy", "PCOS", "menstrual disorders", "fertility issues","Periods","PCOD"
    ],
    "Dental": [
        "tooth decay", "gum disease", "oral cancer"
    ],
    "Chest": [
        "COPD", "asthma", "pneumonia", "lung cancer"
    ],
    "Gastroenterology": [
        "IBS", "Crohn’s disease", "GERD", "24 hours stomach pain", "appendicitis"
    ],
    "Oncology": [
        "breast cancer", "lung cancer", "colon cancer"
    ],
    "Eye": [
        "cataracts", "glaucoma", "diabetic retinopathy","eye infection"
    ],
    "Psychiatry": [
        "depression", "anxiety disorders", "bipolar disorder"
    ],
    "Orthopaedics": [
        "fractures", "arthritis", "sports injuries"
    ],
    "Physiotherapy": [
        "joint pain", "back pain", "chronic pain"
    ],
    "ENT": [
        "hearing loss", "sinusitis", "tonsillitis", "ear infections", "throat", 
        "vertigo", "deviated septum", "nasal polyps", "allergic rhinitis","tonsls","sore throat"
    ],
    "Dermatology": [
        "acne", "psoriasis", "eczema", "skin"
    ],
    "Veterinary": [
        "pet allergies", "pet skin conditions"
    ]
}
# Validate and load the data
schema = SpecializationDiseaseMappingSchema()
try:
    # Validate and deserialize input
    result = schema.load({"mapping": specialization_disease_mapping})
    #print("Validation successful. Specializations:", result['mapping'].keys())
except ValidationError as err:
    print("Validation errors:", err.messages)
# Define the get_specialization function here
def get_specialization(disease):
    # Ensure the mapping is loaded correctly
    mapping = specialization_disease_mapping
    disease = disease.lower()  # Convert input to lowercase
    for specialization, diseases in mapping.items():
        # Convert all diseases to lowercase for case-insensitive comparison
        lower_diseases = [d.lower() for d in diseases]
        if disease in lower_diseases:
            return specialization
        # Check for partial matches
        for d in lower_diseases:
            if disease in d or d in disease:
                return specialization
    return "No specialization found for the given disease."  # Return a message for unknown diseases