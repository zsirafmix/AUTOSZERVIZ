export interface DiagnosisSuggestion {
  structuredIssue: string;
  probableCauses: string[];
  recommendedOperations: { name: string; estimatedHours: number; suggestedParts: string[] }[];
  customerExplanation: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
}

export function generateAIDiagnosis(rawNotes: string, vehicleInfo?: string): DiagnosisSuggestion {
  const noteLower = rawNotes.toLowerCase();

  if (noteLower.includes("fék") || noteLower.includes("csikorog") || noteLower.includes("ráz") || noteLower.includes("pedál")) {
    return {
      structuredIssue: "Fékrendszer hatásfok csökkenés és rezgés / rendellenes zaj fékezéskor",
      probableCauses: [
        "Első féktárcsák és betétek kopása határérték alá, esetleges felületi vetemedés",
        "Féknyereg csúszkák szorulása vagy elégtelen kenése",
        "Fékfolyadék nedvességtartalom emelkedése (forráspont csökkenés)"
      ],
      recommendedOperations: [
        { name: "Első féktárcsák és fékbetétek komplett cseréje + tisztítás", estimatedHours: 1.5, suggestedParts: ["Első féktárcsa pár (hűtött)", "Első fékbetét készlet", "Féktisztító spray", "Kerámia fékpaszta"] },
        { name: "Fékfolyadék műszeres ellenőrzése és cseréje nyomásos géppel", estimatedHours: 0.6, suggestedParts: ["DOT 4 SL6 fékfolyadék (1L)"] }
      ],
      customerExplanation: "A fékrendszer átvizsgálása során megállapítottuk, hogy a féktárcsák és betétek elérték a megengedett minimális vastagságot. A biztonságos megállás és a vibráció megszűnése érdekében a kopóelemek szakszerű cseréje javasolt.",
      urgency: "HIGH"
    };
  }

  if (noteLower.includes("kopog") || noteLower.includes("lengőkar") || noteLower.includes("gömbfej") || noteLower.includes("fekvőrendőr")) {
    return {
      structuredIssue: "Futómű zajok és instabilitás útegyenetlenségeken",
      probableCauses: [
        "Alsó lengőkar szilentek kirepedezése vagy szakadása",
        "Kanyarstabilizátor pálcák (kutyacsontok) kotyogása",
        "Lengéscsillapító toronycsapágy holtjáték"
      ],
      recommendedOperations: [
        { name: "Első lengőkar szilentek cseréje hidraulikus préssel", estimatedHours: 1.8, suggestedParts: ["Első alsó lengőkar szilent készlet", "Új rögzítőcsavarok"] },
        { name: "3D lézeres futómű geometria beállítás", estimatedHours: 0.8, suggestedParts: [] }
      ],
      customerExplanation: "A futómű tesztje során a jobb/bal első alsó lengőkar szilenten repedést és holtjátékot találtunk. A csere után lézeres futómű-beállítást végzünk a tökéletes egyenesfutásért és az egyenletes gumikopásért.",
      urgency: "HIGH"
    };
  }

  if (noteLower.includes("olaj") || noteLower.includes("szerviz") || noteLower.includes("szűrő") || noteLower.includes("15000") || noteLower.includes("éves")) {
    return {
      structuredIssue: "Időszakos előírt karbantartás (Periodikus szerviz)",
      probableCauses: [
        "Elért futásteljesítmény vagy 1 éves periódus lejárt",
        "Motorolaj kenőképességének csökkenése, szűrők telítődése"
      ],
      recommendedOperations: [
        { name: "Motorolaj és olajszűrő csere (gyári jóváhagyással rendelkező szintetikus olaj)", estimatedHours: 0.8, suggestedParts: ["5W-30 / 0W-30 LL prémium motorolaj (5L)", "Olajszűrő betét", "Új leeresztőcsavar / tömítés"] },
        { name: "Levegőszűrő és antibakteriális pollenszűrő csere + klímatisztítás", estimatedHours: 0.6, suggestedParts: ["Levegőszűrő", "Aktívszenes / antiallergén pollenszűrő"] },
        { name: "30 pontos tavaszi/őszi biztonsági átvizsgálás", estimatedHours: 0.5, suggestedParts: [] }
      ],
      customerExplanation: "Az autó megkapta a gyártó által előírt prémium olaj- és szűrőcserét, valamint a teljes átvizsgálást. A jármű megbízható és készen áll a további biztonságos használatra.",
      urgency: "NORMAL"
    };
  }

  // General fallback AI engine
  return {
    structuredIssue: `Részletes műszaki vizsgálat szükséges: ${rawNotes}`,
    probableCauses: [
      "Elektromos vagy mechanikus kopásból eredő rendellenesség",
      "Szenzoros vagy vezérlőegység hibajelzés",
      "Időszakos kontakt- vagy rögzítési hiba"
    ],
    recommendedOperations: [
      { name: "Komplett OBD-II diagnosztikai kiolvasás és élőadat elemzés", estimatedHours: 1.0, suggestedParts: [] },
      { name: "Szemrevételezéses és mechanikai terheléses bevizsgálás", estimatedHours: 0.8, suggestedParts: [] }
    ],
    customerExplanation: "A hibajelenség pontos behatárolásához műszeres diagnosztikát és részletes szervizbevizsgálást végeztünk el.",
    urgency: "NORMAL"
  };
}
