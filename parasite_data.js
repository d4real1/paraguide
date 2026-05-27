// ParaGuide database – all parasites, effects, cures
window.parasiteData = [
    {
        name: "Entamoeba histolytica",
        type: "Protozoa",
        effects: "Bloody diarrhea, dysentery, liver abscess, abdominal pain.",
        pharma_cure: "Metronidazole or tinidazole + paromomycin (prescription required)",
        adjunct_natural: "Garlic (weak in vitro evidence; not a cure)"
    },
    {
        name: "Giardia lamblia",
        type: "Protozoa",
        effects: "Watery diarrhea, bloating, malabsorption, fatigue.",
        pharma_cure: "Tinidazole (single dose) or metronidazole (5-7 days) or nitazoxanide",
        adjunct_natural: "Probiotics may reduce shedding (not curative)"
    },
    {
        name: "Plasmodium falciparum",
        type: "Protozoa",
        effects: "Cyclic fever, chills, anemia, cerebral malaria (severe).",
        pharma_cure: "Artemisinin-based combination therapy (ACT) – prescription only",
        adjunct_natural: "None; medical emergency"
    },
    {
        name: "Toxoplasma gondii",
        type: "Protozoa",
        effects: "Often asymptomatic; in immunocompromised: encephalitis, seizures.",
        pharma_cure: "Pyrimethamine + sulfadiazine + leucovorin",
        adjunct_natural: "None"
    },
    {
        name: "Taenia solium (pork tapeworm)",
        type: "Helminth (tapeworm)",
        effects: "Intestinal infection; larvae can cause neurocysticercosis (seizures, headaches).",
        pharma_cure: "Praziquantel (intestinal) OR albendazole + steroids (neurocysticercosis)",
        adjunct_natural: "Pumpkin seeds (traditional, unproven)"
    },
    {
        name: "Ascaris lumbricoides",
        type: "Helminth (roundworm)",
        effects: "Malnutrition, intestinal blockage, cough (larval migration).",
        pharma_cure: "Albendazole or mebendazole (single dose)",
        adjunct_natural: "Papaya seeds (small RCT, weak evidence)"
    },
    {
        name: "Enterobius vermicularis (pinworm)",
        type: "Helminth",
        effects: "Perianal itching (especially at night), sleep disturbance.",
        pharma_cure: "Albendazole or mebendazole (single dose, repeat in 2 weeks)",
        adjunct_natural: "Strict hygiene; no proven natural cure"
    },
    {
        name: "Trichuris trichiura (whipworm)",
        type: "Helminth",
        effects: "Bloody diarrhea, rectal prolapse, growth stunting in children.",
        pharma_cure: "Albendazole or mebendazole (3 days)",
        adjunct_natural: "None"
    },
    {
        name: "Schistosoma haematobium",
        type: "Fluke",
        effects: "Hematuria, bladder fibrosis, increased risk of bladder cancer.",
        pharma_cure: "Praziquantel",
        adjunct_natural: "None"
    },
    {
        name: "Trypanosoma cruzi (Chagas)",
        type: "Protozoa",
        effects: "Cardiomyopathy, megacolon, heart failure.",
        pharma_cure: "Benznidazole or nifurtimox (acute/early chronic)",
        adjunct_natural: "None"
    },
    {
        name: "Leishmania donovani (visceral)",
        type: "Protozoa",
        effects: "Fever, weight loss, enlarged liver/spleen (kala-azar).",
        pharma_cure: "Liposomal amphotericin B",
        adjunct_natural: "None"
    },
    {
        name: "Echinococcus granulosus (hydatid)",
        type: "Helminth (tapeworm larva)",
        effects: "Cysts in liver, lungs; risk of anaphylaxis if ruptured.",
        pharma_cure: "Albendazole + surgical removal",
        adjunct_natural: "None"
    }
];
