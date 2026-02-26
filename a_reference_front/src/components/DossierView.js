// src/components/DossierView.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getTranslation } from '../utils/translations';

// Composant Section avec style amélioré
const Section = ({ title, icon, children, collapsible = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mt-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <div 
        className={`bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200 ${collapsible ? 'cursor-pointer hover:bg-blue-200' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-blue-900 flex items-center justify-between">
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
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {Object.values(row).map((cell, j) => (
                <td key={j} className="px-4 py-2 text-sm text-gray-900">
                  {cell || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DossierView = ({ patient, dossier: dossierProp, onBack, language }) => {
  const [dossier, setDossier] = useState(dossierProp || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PHASE 3: Calcul d'âge et détection mineur/adulte
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() - birth.getMonth() === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const patientAge = patient?.dateNaissance ? calculateAge(patient.dateNaissance) : null;
  const isMinor = patientAge !== null ? patientAge <= 15 : false;

  useEffect(() => {
    if (dossierProp) {
      setDossier(dossierProp);
      return;
    }
    
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!patient || !patient.codePatient) return;

        const response = await axios.get(
          `${process.env.REACT_APP_GATEWAY_URL || 'http://localhost:8081'}/api/dossiers/${patient.codePatient}`,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">⏳ Chargement du dossier médical...</p>
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
      {/* En-tête du dossier */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            📁 {getTranslation("dossierPatient", language)}
          </h1>
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
              className="w-48 h-48 rounded-full border-4 border-blue-200 shadow-lg"
            />
          </div>
        </Section>
      )}

      {page && (
        <>
              {/* Informations Parentales - réservé aux mineurs */}
              {isMinor && (
                <Section title={getTranslation("infosParentales", language)} icon="👨‍👩‍👧" collapsible>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Père */}
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h4 className="font-bold text-lg mb-3 text-blue-900">👨 {getTranslation("pere", language)}</h4>
                      <InfoRow label="Nom et prénoms" value={page.pereNomPrenoms} fullWidth />
                      <InfoRow label="Statut" value={page.pereStatut} fullWidth />
                      <InfoRow label="Niveau d'instruction" value={page.pereNiveauInstruction} fullWidth />
                      <InfoRow label="Profession" value={page.pereProfession} fullWidth />
                      <InfoRow label="Statut VIH" value={page.pereStatutVih} fullWidth />
                      <InfoRow label="Téléphone" value={page.pereTelephone} fullWidth />
                    </div>
                
                    {/* Mère */}
                    <div className="border-l-4 border-pink-400 pl-4">
                      <h4 className="font-bold text-lg mb-3 text-pink-900">👩 {getTranslation("mere", language)}</h4>
                      <InfoRow label="Nom et prénoms" value={page.mereNomPrenoms} fullWidth />
                      <InfoRow label="Statut" value={page.mereStatut} fullWidth />
                      <InfoRow label="Niveau d'instruction" value={page.mereNiveauInstruction} fullWidth />
                      <InfoRow label="Profession" value={page.mereProfession} fullWidth />
                      <InfoRow label="Statut VIH" value={page.mereStatutVih} fullWidth />
                      <InfoRow label="Téléphone" value={page.mereTelephone} fullWidth />
                    </div>
                  </div>
                </Section>
              )}

          {/* Naissance - pertinent surtout pour mineurs */}
          {isMinor && (
            <Section title={getTranslation("naissance", language)} icon="👶" collapsible>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label={getTranslation("structure", language)} value={page.naissanceStructure} />
                <InfoRow label={getTranslation("poids", language)} value={page.poidsNaissance ? `${page.poidsNaissance} kg` : null} />
                <InfoRow label={getTranslation("taille", language)} value={page.tailleNaissance ? `${page.tailleNaissance} cm` : null} />
                <InfoRow label="Périmètre crânien" value={page.perimetreCranien ? `${page.perimetreCranien} cm` : null} />
                <InfoRow label={getTranslation("apgar", language)} value={page.apgar} fullWidth />
              </div>
            </Section>
          )}

          {/* Entrée et Référence - affichée pour tous */}
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

          {/* Statut Vaccinal */}
            {/* Statut Vaccinal - surtout pertinent pour mineurs */}
            {isMinor && (
              <Section title={getTranslation("statutVaccinal", language)} icon="💉" collapsible>
                <div className="mb-4">
                  <InfoRow label="Vaccins reçus" value={page.vaccins?.join(', ')} fullWidth />
                  <InfoRow label="Autres vaccins" value={page.autresVaccins} fullWidth />
                </div>
              </Section>
            )}

                {/* Enfant Exposé / PTME - uniquement pour mineurs */}
                {isMinor && (
                  <Section title="🤰 PTME et Enfant Exposé" icon="🤰" collapsible>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <InfoRow label="Prophylaxie ARV à la naissance" value={page.enfantProphylaxieArvNaissance} />
                      <InfoRow label="Prophylaxie Cotrimoxazole" value={page.enfantProphylaxieCotrimoxazole} />
                      <InfoRow label="Alimentation" value={page.enfantAlimentation?.join(', ')} fullWidth />
                      <InfoRow label="Âge au sevrage (mois)" value={page.enfantSevrageAgeMois} />
                      <InfoRow label="Numéro séropositif" value={page.enfantNumeroSeropositif} />
                      <InfoRow label="Mère sous trithérapie pendant grossesse" value={page.mereTritherapieGrossesse} fullWidth />
                    </div>
              
                    {/* Liste des grossesses PTME */}
                    {page.ptmes && page.ptmes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Historique des grossesses:</h4>
                        <DataTable
                          headers={['Date diagnostic', 'Issue', 'Observations']}
                          data={page.ptmes.map(p => ({
                            dateDiagnostic: p.dateDiagnostic || '-',
                            issue: p.issue || '-',
                            observations: p.observations || '-'
                          }))}
                          emptyMessage="Aucune grossesse enregistrée"
                        />
                      </div>
                    )}
                  </Section>
                )}

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
                  headers={['Date visite', 'Protocole', 'Observance', 'Notes']}
                  data={page.suiviARVs.map(s => ({
                    date: s.dateVisite ? s.dateVisite : '-',
                    protocole: s.protocole || '-',
                    observance: s.observanceCorrecte != null ? (s.observanceCorrecte ? 'Oui' : 'Non') : '-',
                    notes: s.changementLignePreciser || '-'
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
                  headers={['Date', 'Début', 'Fin', 'Issu']}
                  data={page.priseEnChargeTbs.map(tb => ({
                    date: tb.date || '-',
                    debut: tb.debut || '-',
                    fin: tb.fin || '-',
                    issu: tb.issu || '-'
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

          {/* Répondants Légaux */}
          <Section title="👥 Répondants Légaux" icon="👥" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Répondant 1 */}
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-bold text-lg mb-3 text-green-900">Répondant 1</h4>
                <InfoRow label="Nom" value={page.repondant1Nom} fullWidth />
                <InfoRow label="Lien" value={page.repondant1Lien} fullWidth />
                <InfoRow label="Niveau" value={page.repondant1Niveau} fullWidth />
                <InfoRow label="Profession" value={page.repondant1Profession} fullWidth />
                <InfoRow label="Téléphone" value={page.repondant1Tel} fullWidth />
              </div>
              
              {/* Répondant 2 */}
              <div className="border-l-4 border-purple-400 pl-4">
                <h4 className="font-bold text-lg mb-3 text-purple-900">Répondant 2</h4>
                <InfoRow label="Nom" value={page.repondant2Nom} fullWidth />
                <InfoRow label="Lien" value={page.repondant2Lien} fullWidth />
                <InfoRow label="Niveau" value={page.repondant2Niveau} fullWidth />
                <InfoRow label="Profession" value={page.repondant2Profession} fullWidth />
                <InfoRow label="Téléphone" value={page.repondant2Tel} fullWidth />
              </div>
            </div>
          </Section>

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

          {/* Informations Sociales - affichées pour adultes uniquement */}
          {!isMinor && (
            <Section title="🏠 Informations Sociales" icon="🏠" collapsible>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Profession" value={page.profession} />
                <InfoRow label="Statut familial" value={page.statutFamilial} />
                <InfoRow label="Nombre de grossesses PTME" value={page.nbGrossessesPtme} />
                <InfoRow label="Contraception" value={page.contraception} />
                <InfoRow label="PrEP" value={page.prep} />
              </div>
            </Section>
          )}

          {/* PHASE 2: Suivi Immunovirologique */}
          {page.suiviImmunovirologiques && page.suiviImmunovirologiques.length > 0 && (
            <Section title="🔬 Suivi Immunovirologique" icon="🔬" collapsible>
              <DataTable
                headers={['Date Prélèvement', 'Date Résultat', 'CV', 'Date CD4', 'CD4', 'Catégorie']}
                data={page.suiviImmunovirologiques.map(s => ({
                  datePrelevement: s.datePrelevement || '-',
                  dateResultat: s.dateResultat || '-',
                  cv: s.resultatCV || '-',
                  dateCD4: s.dateCD4 || '-',
                  cd4: s.resultatCD4 || '-',
                  categorie: s.cd4Categorie || '-'
                }))}
                emptyMessage="Aucun suivi immunovirologique enregistré"
              />
            </Section>
          )}

          {/* PHASE 2: Suivi Pathologique */}
          {page.suiviPathologiques && page.suiviPathologiques.length > 0 && (
            <Section title="🩺 Suivi Pathologique" icon="🩺" collapsible>
              <DataTable
                headers={['Date', 'Taille', 'Poids', 'IMC', 'T°', 'TA', 'Pouls', 'TB']}
                data={page.suiviPathologiques.map(f => ({
                  date: f.date || '-',
                  taille: f.taille || '-',
                  poids: f.poids || '-',
                  imc: f.imc || '-',
                  temperature: f.temperature || '-',
                  ta: f.ta || '-',
                  pouls: f.pouls || '-',
                  recherchetb: f.rechercheTB || '-'
                }))}
                emptyMessage="Aucun suivi pathologique enregistré"
              />
            </Section>
          )}

          {/* Dépistage Familial */}
          {page.depistageFamiliales && page.depistageFamiliales.length > 0 && (
            <Section title="👨‍👩‍👧‍👦 Dépistage Familial" icon="👨‍👩‍👧‍👦" collapsible>
              <DataTable
                headers={['Nom', 'Type', 'Âge', 'Sexe', 'Statut VIH', 'Résultat', 'Soins']}
                data={page.depistageFamiliales.map(d => ({
                  nom: d.nom || '-',
                  type: d.type || '-',
                  age: d.age || '-',
                  sexe: d.sexe || '-',
                  statut: d.statut || '-',
                  resultat: d.resultat || '-',
                  soins: d.soins || '-'
                }))}
                emptyMessage="Aucun dépistage familial enregistré"
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
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex items-center text-lg"
        >
          🔙 {getTranslation("retour", language)}
        </button>
      </div>
    </div>
  );
};

export default DossierView;
