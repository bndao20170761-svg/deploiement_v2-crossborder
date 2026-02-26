import React, { useEffect, useCallback, useMemo, memo } from "react";
import { getTranslation } from "../utils/translations";

// Composants Section mémorisés pour éviter les re-rendus et préserver le focus
const Section1Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("clinicalInfoTitle", language) || "Renseignements cliniques"}
      </h2>
      <p className="text-gray-600">
        {getTranslation("clinicalInfoDesc", language) || "Complétez les informations cliniques de base."}
      </p>

      {/* Poids */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getTranslation("weight", language) || "Poids (kg)"}
        </label>
        <input
          type="number"
          value={rc.poidsKg ?? ""}
          onChange={(e) =>
            safeSetRC({ poidsKg: e.target.value ? parseFloat(e.target.value) : "" })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.1"
          min="0"
          placeholder="Ex: 70.5"
        />
      </Card>

      {/* Stades OMS */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getTranslation("whoStage", language) || "Stade OMS"}
        </label>
        {(rc.stades || []).map((s, index) => (
          <div key={index} className="flex flex-wrap items-center gap-4">
            {["stade1", "stade2", "stade3", "stade4"].map((field) => (
              <label key={field} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!s[field]}
                  onChange={(e) => {
                    const updated = [...(rc.stades || [])];
                    updated[index][field] = e.target.checked;
                    safeSetRC({ stades: updated });
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span>{field.toUpperCase()}</span>
              </label>
            ))}
          </div>
        ))}
      </Card>

      {/* Profils VIH */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getTranslation("hivProfile", language) || "Profil VIH"}
        </label>
        {(rc.profils || []).map((p, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              {["profil1", "profil2", "profil12", "indetermine"].map((field) => (
                <label key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!p[field]}
                    onChange={(e) => {
                      const updated = [...(rc.profils || [])];
                      updated[index][field] = e.target.checked;
                      safeSetRC({ profils: updated });
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <span>{field}</span>
                </label>
              ))}
            </div>
            <div>
              <span className="block text-xs text-gray-600 mb-1">
                {getTranslation("confirmationDate", language) || "Date de confirmation"}
              </span>
              <input
                type="date"
                value={p.dateConfirmation || ""}
                onChange={(e) => {
                  const updated = [...(rc.profils || [])];
                  updated[index].dateConfirmation = e.target.value;
                  safeSetRC({ profils: updated });
                }}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </Card>
    </>
  );
});

const Section2Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("treatmentARV", language) || "Traitement ARV"}
      </h2>
      <Card>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!rc.traitementARV}
            onChange={(e) => safeSetRC({ traitementARV: e.target.checked })}
          />
          <span>{getTranslation("treatmentARV", language) || "Sous ARV"}</span>
        </label>

        {/* Protocoles 1ère ligne */}
        {rc.traitementARV &&
          (rc.protocoles1s || []).map((p, i) => (
            <div key={`p1-${i}`} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getTranslation("firstLineProtocol", language) || "Protocole 1ère ligne"}
              </label>
              <input
                type="text"
                value={p.protocole1ereLigne || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocoles1s || [])];
                  updated[i].protocole1ereLigne = e.target.value;
                  safeSetRC({ protocoles1s: updated });
                }}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={p.dateProtocole1 || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocoles1s || [])];
                  updated[i].dateProtocole1 = e.target.value;
                  safeSetRC({ protocoles1s: updated });
                }}
                className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

        {/* Protocoles 2ème ligne */}
        {rc.traitementARV &&
          (rc.protocoles2s || []).map((p, i) => (
            <div key={`p2-${i}`} className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getTranslation("secondLineProtocol", language) || "Protocole 2ème ligne"}
              </label>
              <input
                type="text"
                value={p.protocole2emeLigne || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocoles2s || [])];
                  updated[i].protocole2emeLigne = e.target.value;
                  safeSetRC({ protocoles2s: updated });
                }}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={p.dateProtocole2 || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocoles2s || [])];
                  updated[i].dateProtocole2 = e.target.value;
                  safeSetRC({ protocoles2s: updated });
                }}
                className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
      </Card>
    </>
  );
});

const Section3Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">CD4</h2>
      {[
        ["cd4DebutTraitement", "dateCd4DebutTraitement"],
        ["cd4Dernier", "dateCd4Dernier"],
        ["cd4Inclusion", "dateCd4Inclusion"],
      ].map(([field, dateField]) => (
        <Card key={field}>
          <label className="block font-medium mb-2">
            {getTranslation(field, language) || field}
          </label>
          <input
            type="number"
            value={rc[field] ?? ""}
            onChange={(e) =>
              safeSetRC({ [field]: e.target.value ? parseFloat(e.target.value) : "" })
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={rc[dateField] || ""}
            onChange={(e) => safeSetRC({ [dateField]: e.target.value })}
            className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Card>
      ))}
    </>
  );
});

const Section4Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("bioSection", language) || "Charge virale, Lymphocytes totaux, Hémoglobine"}
      </h2>

      {/* Charge virale */}
      <Card>
        <label className="block font-medium mb-2">
          {getTranslation("viralLoad", language) || "Charge virale"}
        </label>
        <input
          type="number"
          value={rc.chargeViraleNiveau ?? ""}
          onChange={(e) =>
            safeSetRC({ chargeViraleNiveau: e.target.value ? parseFloat(e.target.value) : "" })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateChargeViraleNiveau || ""}
          onChange={(e) => safeSetRC({ dateChargeViraleNiveau: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Lymphocytes totaux */}
      <Card>
        <label className="block font-medium mb-2">
          {getTranslation("lymphocytesTotaux", language) || "Lymphocytes totaux"}
        </label>
        <input
          type="number"
          value={rc.lymphocytesTotaux ?? ""}
          onChange={(e) =>
            safeSetRC({ lymphocytesTotaux: e.target.value ? parseFloat(e.target.value) : "" })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateLymphocytesTotaux || ""}
          onChange={(e) => safeSetRC({ dateLymphocytesTotaux: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Hémoglobine */}
      <Card>
        <label className="block font-medium mb-2">
          {getTranslation("hbNiveau", language) || "Hémoglobine (Hb)"}
        </label>
        <input
          type="number"
          value={rc.hbNiveau ?? ""}
          onChange={(e) =>
            safeSetRC({ hbNiveau: e.target.value ? parseFloat(e.target.value) : "" })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateHbNiveau || ""}
          onChange={(e) => safeSetRC({ dateHbNiveau: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>
    </>
  );
});

const Section5Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("microbioSection", language) || "Crachat BAAR, AgHBs, Transaminases, Autre analyse"}
      </h2>

      {/* Crachat BAAR */}
      <Card>
        <label className="block font-medium mb-2">
          {getTranslation("cracheBaar", language) || "Crachat BAAR"}
        </label>
        <input
          type="text"
          value={rc.cracheBaar || ""}
          onChange={(e) => safeSetRC({ cracheBaar: e.target.value })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateCracheBaar || ""}
          onChange={(e) => safeSetRC({ dateCracheBaar: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* AgHBs */}
      <Card>
        <label className="block font-medium mb-2">AgHBs</label>
        <input
          type="text"
          value={rc.aghbs || ""}
          onChange={(e) => safeSetRC({ aghbs: e.target.value })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateAghbs || ""}
          onChange={(e) => safeSetRC({ dateAghbs: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Transaminases */}
      <Card>
        <label className="block font-medium mb-2">
          {getTranslation("transaminase", language) || "Transaminases"}
        </label>
        <input
          type="text"
          value={rc.transaminase || ""}
          onChange={(e) => safeSetRC({ transaminase: e.target.value })}
          className="border p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="block text-sm text-gray-700">ASAT</label>
        <input
          type="text"
          value={rc.transaminaseAsat || ""}
          onChange={(e) => safeSetRC({ transaminaseAsat: e.target.value })}
          className="border p-2 rounded w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="block text-sm text-gray-700">ALAT</label>
        <input
          type="text"
          value={rc.transaminaseAlat || ""}
          onChange={(e) => safeSetRC({ transaminaseAlat: e.target.value })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={rc.dateTransaminase || ""}
          onChange={(e) => safeSetRC({ dateTransaminase: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>

      {/* Autre analyse */}
      <Card>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!rc.autreAnalyse}
            onChange={(e) => safeSetRC({ autreAnalyse: e.target.checked })}
          />
          <span>{getTranslation("otherAnalysis", language) || "Autre analyse"}</span>
        </label>
        <input
          type="date"
          value={rc.dateAutreAnalyse || ""}
          onChange={(e) => safeSetRC({ dateAutreAnalyse: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>
    </>
  );
});

const Section6Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("tbTreatment", language) || "Traitement TB & Protocole thérapeutique"}
      </h2>
      <Card>
        {/* Traitement TB */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!rc.traitementTB}
            onChange={(e) => safeSetRC({ traitementTB: e.target.checked })}
          />
          <span>{getTranslation("tbTreatment", language) || "Traitement TB"}</span>
        </label>

        {/* Protocole thérapeutique */}
        {rc.traitementTB &&
          (rc.protocolesTheraps || []).map((t, i) => (
            <div key={`t-${i}`} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getTranslation("therapyProtocol", language) || "Protocole thérapeutique"}
              </label>
              <input
                type="text"
                value={t.therapie || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocolesTheraps || [])];
                  updated[i].therapie = e.target.value;
                  safeSetRC({ protocolesTheraps: updated });
                }}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={t.dateTherapie || ""}
                onChange={(e) => {
                  const updated = [...(rc.protocolesTheraps || [])];
                  updated[i].dateTherapie = e.target.value;
                  safeSetRC({ protocolesTheraps: updated });
                }}
                className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
      </Card>
    </>
  );
});

const Section7Component = memo(({ rc, safeSetRC, language }) => {
  const Card = ({ children }) => (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">{children}</div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900">
        {getTranslation("otherTreatment", language) || "Autre traitement"}
      </h2>
      <Card>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!rc.autreTraitement}
            onChange={(e) => safeSetRC({ autreTraitement: e.target.checked })}
          />
          <span>{getTranslation("otherTreatment", language) || "Autre traitement"}</span>
        </label>
        <input
          type="date"
          value={rc.dateAutreTraitement || ""}
          onChange={(e) => safeSetRC({ dateAutreTraitement: e.target.value })}
          className="border p-2 rounded w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Card>
    </>
  );
});

const ClinicalInfoStep = ({ wizardData, setWizardData, language = "fr", subStep = 1, totalSubSteps = 7 }) => {
  // --- Helpers ---
  const rc = wizardData?.renseignementClinique || {};
  
  // Mémorisation de safeSetRC pour éviter les re-rendus
  const safeSetRC = useCallback((patch) =>
    setWizardData((prev) => ({
      ...prev,
      renseignementClinique: { ...(prev.renseignementClinique || {}), ...patch },
    })), [setWizardData]);

  // Initialisation des tableaux et champs par défaut
  useEffect(() => {
    setWizardData((prev) => {
      const current = prev?.renseignementClinique || {};
      return {
        ...prev,
        renseignementClinique: {
          ...current,
          profils: current.profils?.length
            ? current.profils
            : [{ profil1: false, profil2: false, profil12: false, indetermine: false, dateConfirmation: "" }],
          stades: current.stades?.length
            ? current.stades
            : [{ stade1: false, stade2: false, stade3: false, stade4: false }],
          protocoles1s: current.protocoles1s?.length
            ? current.protocoles1s
            : [{ protocole1ereLigne: "", dateProtocole1: "" }],
          protocoles2s: current.protocoles2s?.length
            ? current.protocoles2s
            : [{ protocole2emeLigne: "", dateProtocole2: "" }],
          protocolesTheraps: current.protocolesTheraps?.length
            ? current.protocolesTheraps
            : [{ therapie: "", dateTherapie: "" }],
          traitementARV: current.traitementARV ?? false,
          traitementTB: current.traitementTB ?? false,
          autreAnalyse: current.autreAnalyse ?? false,
          autreTraitement: current.autreTraitement ?? false,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mémorisation des sections avec les composants optimisés
  const sections = useMemo(() => [
    <Section1Component key="section1" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section2Component key="section2" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section3Component key="section3" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section4Component key="section4" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section5Component key="section5" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section6Component key="section6" rc={rc} safeSetRC={safeSetRC} language={language} />,
    <Section7Component key="section7" rc={rc} safeSetRC={safeSetRC} language={language} />
  ], [rc, safeSetRC, language]);

  return (
    <div className="space-y-6">
      {/* En-tête avec progression */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-blue-800">
            {language === 'fr' ? 'Informations Cliniques' : 'Clinical Information'}
          </h2>
          <span className="text-sm text-blue-600">
            {language === 'fr' ? `Étape ${subStep}/${totalSubSteps}` : `Step ${subStep}/${totalSubSteps}`}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(subStep / totalSubSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contenu de la section actuelle - CORRECTION: subStep - 1 pour commencer à 0 */}
      <div className="min-h-[400px]">
        {sections[subStep - 1] || sections[0]}
      </div>

      {/* Navigation supprimée - gérée par ReferenceWizard */}
    </div>
  );
};

export default ClinicalInfoStep;