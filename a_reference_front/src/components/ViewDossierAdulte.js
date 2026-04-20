// src/components/ViewDossierAdulte.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getTranslation } from '../utils/translations';

// Composant Section avec style amélioré
const Section = ({ title, icon, children, collapsible = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mt-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <div 
        className={`bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-gray-200 ${collapsible ? 'cursor-pointer hover:bg-green-200' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-green-900 flex items-center justify-between">
          <span>
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </span>
          {collapsible && (
            <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
          )}
        </h3>
      </div>
      {isOpen && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une information
const InfoRow = ({ label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''} mb-2`}>
    <span className="font-semibold text-gray-700">{label}:</span>{" "}
    <span className="text-gray-900">{value || <span className="text-gray-400 italic">Non renseigné</span>}</span>
  </div>
);

// Composant pour afficher un tableau
const DataTable = ({ headers, data, emptyMessage }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 italic">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 border-b text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Fonction pour calculer l'âge
const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const ViewDossierAdulte = ({ patient, onBack, language = "fr", dossierProp = null }) => {
  const [dossier, setDossier] = useState(dossierProp);
  const [loading, setLoading] = useState(!dossierProp);
  const [error, setError] = useState(null);

  // Charger le dossier si non fourni en props
  useEffect(() => {
    if (dossierProp) return;
    
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!patient || !patient.codePatient) return;

        const response = await axios.get(
          `${process.env.REACT_APP_GATEWAY_URL || 'http://34.28.161.231:8080'}/api/dossiers/${patient.codePatient}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setDossier(response.data);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur chargement dossier :", err);
        setError("Impossible de charger le dossier médical");
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [patient, dossierProp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">⏳ Chargement du dossier adulte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ {error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔙 Retour
        </button>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">⚠️ Aucun dossier médical trouvé</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          🔙 Retour
        </button>
      </div>
    );
  }

  const page = dossier.pages?.[0]; // Première page du dossier

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* En-tête du dossier adulte */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👤 {getTranslation("dossierPatient", language)} - Adulte
            </h1>
            {patient?.dateNaissance && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  📅 {calculateAge(patient.dateNaissance)} ans
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            🔙 {getTranslation("retour", language)}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InfoRow label={getTranslation("codeDossier", language)} value={dossier.codeDossier} />
          <InfoRow label={getTranslation("codePatient", language)} value={dossier.codePatient} />
          <InfoRow label={getTranslation("nomComplet", language)} value={dossier.nomComplet} />
          <InfoRow label={getTranslation("medecinCreateur", language)} value={dossier.doctorCreateNom} />
        </div>
      </div>

      {/* Identification Biométrique */}
      {dossier.identificationBiom && (
        <Section title={getTranslation("iris", language)} icon="👁️">
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${dossier.identificationBiom}`}
              alt="Iris du patient"
              className="w-48 h-48 rounded-full border-4 border-green-200 shadow-lg"
            />
          </div>
        </Section>
      )}

      {page && (
        <>
          {/* Sections spécifiques aux adultes */}
          
          {/* Informations Sociales et Professionnelles */}
          <Section title="🏠 Informations Sociales et Professionnelles" icon="🏠" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Profession" value={page.profession} />
              <InfoRow label="Statut familial" value={page.statutFamilial} />
              <InfoRow label="Nombre de grossesses PTME" value={page.nbGrossessesPtme} />
              <InfoRow label="Contraception" value={page.contraception} />
              <InfoRow label="PrEP" value={page.prep} />
            </div>
          </Section>

          {/* Entrée et Référence */}
          <Section title="🚪 Entrée et Référence" icon="🚪" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Portes d'entrée" value={page.portesEntree?.join(', ')} fullWidth />
              <InfoRow label="Référence" value={page.reference} />
              <InfoRow label="Date de référence" value={page.dateReference} />
              <InfoRow label="Site d'origine" value={page.siteOrigine} fullWidth />
            </div>
          </Section>

          {/* Dépistage VIH */}
          <Section title={getTranslation("depistage", language)} icon="🧪" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label={getTranslation("dateTest", language)} value={page.dateTest} />
              <InfoRow label="Date de confirmation" value={page.dateConfirmation} />
              <InfoRow label="Lieu du test" value={page.lieuTest} />
              <InfoRow label={getTranslation("resultat", language)} value={page.resultat} />
            </div>
          </Section>

          {/* Éducation Thérapeutique */}
          <Section title="📚 Éducation Thérapeutique (ETP)" icon="📚" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Date début ETP" value={page.dateDebutETP} />
              <InfoRow label="Âge à l'ETP" value={page.ageETP} />
              <InfoRow label="Annonce complète" value={page.annonceComplete} />
              <InfoRow label="Âge à l'annonce" value={page.ageAnnonce} />
            </div>
          </Section>

          {/* Traitement ARV */}
          <Section title="💊 Traitement Antirétroviral (ARV)" icon="💊" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InfoRow label="Protocole initial ARV" value={page.protocoleInitialArv} />
              <InfoRow label="Protocole actuel ARV" value={page.protocoleActuelArv} />
              <InfoRow label="Stade OMS initial" value={page.arvStadeOmsInitial} />
              <InfoRow label="Stades OMS" value={page.stadeOmsInitial?.join(', ')} fullWidth />
            </div>

            {/* Suivis ARV */}
            {page.suiviARVs && page.suiviARVs.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Historique des suivis ARV:</h4>
                <DataTable
                  headers={['Date', 'Protocole', 'Observance', 'Effets secondaires']}
                  data={page.suiviARVs.map(s => ({
                    date: s.dateDebut || '-',
                    protocole: s.protocole || '-',
                    observance: s.observance || '-',
                    effets: s.effetsSecondaires || '-'
                  }))}
                  emptyMessage={getTranslation("aucunSuiviArv", language)}
                />
              </div>
            )}
          </Section>

          {/* Traitement Antituberculeux (TAR) */}
          <Section title="🏥 Traitement Antituberculeux (TAR)" icon="🏥" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Stade OMS" value={page.stadeOms} />
              <InfoRow label="Date début TAR" value={page.dateDebutTar} />
              <InfoRow label="Protocole initial TAR" value={page.protocoleInitialTar} fullWidth />
              <InfoRow label="Tuberculose" value={page.tuberculose} fullWidth />
            </div>

            {/* Prise en charge TB */}
            {page.priseEnChargeTbs && page.priseEnChargeTbs.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Prise en charge TB:</h4>
                <DataTable
                  headers={['Date', 'Type TB', 'Traitement', 'Résultat']}
                  data={page.priseEnChargeTbs.map(tb => ({
                    date: tb.dateDebut || '-',
                    type: tb.typeTb || '-',
                    traitement: tb.traitement || '-',
                    resultat: tb.resultat || '-'
                  }))}
                  emptyMessage="Aucune prise en charge TB"
                />
              </div>
            )}
          </Section>

          {/* Bilans Biologiques */}
          <Section title="📊 Bilans Biologiques" icon="📊" collapsible>
            {page.bilans && page.bilans.length > 0 ? (
              <DataTable
                headers={['Date', 'Hb', 'GB', 'Plaquettes', 'CD4', 'CV', 'Créatinine', 'ALAT']}
                data={page.bilans.map(b => ({
                  date: b.dateBilan || '-',
                  hb: b.hb || '-',
                  gb: b.gb || '-',
                  plaquettes: b.plaquettes || '-',
                  cd4: b.cd4 || '-',
                  cv: b.chargeVirale || '-',
                  creat: b.creatinine || '-',
                  alat: b.alat || '-'
                }))}
                emptyMessage={getTranslation("aucunBilan", language)}
              />
            ) : (
              <p className="text-gray-500 italic">{getTranslation("aucunBilan", language)}</p>
            )}
          </Section>

          {/* Suivi Immunovirologique */}
          {page.suiviImmunovirologiques && page.suiviImmunovirologiques.length > 0 && (
            <Section title="🔬 Suivi Immunovirologique" icon="🔬" collapsible>
              <DataTable
                headers={['Date', 'CD4', 'Charge Virale', 'Statut']}
                data={page.suiviImmunovirologiques.map(s => ({
                  date: s.date || '-',
                  cd4: s.cd4 || '-',
                  cv: s.chargeVirale || '-',
                  statut: s.statut || '-'
                }))}
                emptyMessage="Aucun suivi immunovirologique"
              />
            </Section>
          )}

          {/* Suivi Pathologique */}
          {page.suiviPathologiques && page.suiviPathologiques.length > 0 && (
            <Section title="🩺 Suivi Pathologique" icon="🩺" collapsible>
              <DataTable
                headers={['Date', 'Pathologie', 'Traitement', 'Évolution']}
                data={page.suiviPathologiques.map(s => ({
                  date: s.date || '-',
                  pathologie: s.pathologie || '-',
                  traitement: s.traitement || '-',
                  evolution: s.evolution || '-'
                }))}
                emptyMessage="Aucun suivi pathologique"
              />
            </Section>
          )}

          {/* Personne de Contact et Soutien */}
          <Section title="📞 Contact et Soutien" icon="📞" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Personne de contact" value={page.personneContact} />
              <InfoRow label="Téléphone contact" value={page.telephoneContact} />
              <InfoRow label="Nom du soutien" value={page.soutienNom} />
              <InfoRow label="Prénoms du soutien" value={page.soutienPrenoms} />
              <InfoRow label="Lien avec le soutien" value={page.soutienLien} />
              <InfoRow label="Téléphone du soutien" value={page.soutienTelephone} />
              <InfoRow label="Adresse du soutien" value={page.soutienAdresse} fullWidth />
            </div>
          </Section>

          {/* Antécédents et Maladies Chroniques */}
          <Section title="📋 Antécédents et Maladies Chroniques" icon="📋" collapsible>
            <div className="grid grid-cols-1 gap-4">
              <InfoRow label="Autres antécédents" value={page.autresAnt} fullWidth />
              <InfoRow label="Maladies chroniques" value={page.maladiesChroniques} fullWidth />
              <InfoRow label="Autres maladies chroniques" value={page.autresMaladiesChroniques} fullWidth />
            </div>
          </Section>

          {/* Dépistage Familial */}
          {page.depistageFamiliales && page.depistageFamiliales.length > 0 && (
            <Section title="👨‍👩‍👧‍👦 Dépistage Familial" icon="👨‍👩‍👧‍👦" collapsible>
              <DataTable
                headers={['Date', 'Membre famille', 'Lien', 'Résultat', 'Prise en charge']}
                data={page.depistageFamiliales.map(d => ({
                  date: d.date || '-',
                  membre: d.membreFamille || '-',
                  lien: d.lien || '-',
                  resultat: d.resultat || '-',
                  priseEnCharge: d.priseEnCharge || '-'
                }))}
                emptyMessage="Aucun dépistage familial"
              />
            </Section>
          )}

          {/* Index Tests */}
          {page.indexTests && page.indexTests.length > 0 && (
            <Section title="🔍 Index Tests" icon="🔍" collapsible>
              <DataTable
                headers={['Date', 'Type', 'Résultat', 'Observations']}
                data={page.indexTests.map(t => ({
                  date: t.date || '-',
                  type: t.type || '-',
                  resultat: t.resultat || '-',
                  observations: t.observations || '-'
                }))}
                emptyMessage="Aucun index test"
              />
            </Section>
          )}
        </>
      )}

      {/* Bouton retour en bas */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center text-lg"
        >
          🔙 {getTranslation("retour", language)}
        </button>
      </div>
    </div>
  );
};

export default ViewDossierAdulte;
