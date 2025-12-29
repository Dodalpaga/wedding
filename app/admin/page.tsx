'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import NightlightRound from '@mui/icons-material/NightlightRound';
import LunchDining from '@mui/icons-material/LunchDining';
import Favorite from '@mui/icons-material/Favorite';
import BrunchDining from '@mui/icons-material/BrunchDining';
import LockOutlined from '@mui/icons-material/LockOutlined';
import BarChart from '@mui/icons-material/BarChart';
import Logout from '@mui/icons-material/Logout';

type SortField =
  | 'code'
  | 'nom'
  | 'statut'
  | 'vendredi_soir'
  | 'samedi_midi'
  | 'samedi_soir'
  | 'dimanche_brunch'
  | 'date';
type SortDirection = 'asc' | 'desc';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statuts, setStatuts] = useState<any[]>([]);
  const [filteredStatuts, setFilteredStatuts] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterName, setFilterName] = useState('');
  const [codesInvitation, setCodesInvitation] = useState<Map<string, any>>(
    new Map()
  );

  // États pour le tri
  const [sortField, setSortField] = useState<SortField>('nom');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await user.getIdToken(true);
        setIsAuthenticated(true);
        await loadData();
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Charger les codes d'invitation
      const codesSnapshot = await getDocs(collection(db, 'codes_invitation'));
      const codesMap = new Map<string, any>();

      codesSnapshot.docs.forEach((codeDoc) => {
        const code = codeDoc.id;
        const data = codeDoc.data();
        if (code.length === 6 && data.membres && Array.isArray(data.membres)) {
          codesMap.set(code, {
            id: code,
            membres: data.membres,
            description: data.description || code,
          });
        }
      });
      setCodesInvitation(codesMap);

      // Écouter les statuts en temps réel
      const q = query(
        collection(db, 'statuts'),
        orderBy('date_modification', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setStatuts(data);
          setFilteredStatuts(data);
        },
        (error) => {
          console.error('Erreur écoute statuts:', error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  };

  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  const toggleComment = (key: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Construire la liste complète des membres avec leurs réponses
  const getAllMembres = () => {
    const allMembres: any[] = [];

    codesInvitation.forEach((codeData, code) => {
      (codeData.membres || []).forEach((nom: string) => {
        const statut = statuts.find((s) => s.nom_membre === nom) || {};

        allMembres.push({
          nom,
          email: statut.email || '',
          codeInvitation: code,
          statut: statut.statut || 'en_attente',
          vendredi_soir: statut.vendredi_soir || false,
          samedi_midi: statut.samedi_midi || false,
          samedi_soir: statut.samedi_soir || false,
          dimanche_brunch: statut.dimanche_brunch || false,
          commentaires: statut.commentaires || '',
          dateModification: statut.date_modification,
        });
      });
    });

    return allMembres;
  };

  // Tri
  const sortMembres = (membres: any[]) => {
    return [...membres].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'code':
          aValue = a.codeInvitation.toLowerCase();
          bValue = b.codeInvitation.toLowerCase();
          break;
        case 'nom':
          aValue = a.nom.toLowerCase();
          bValue = b.nom.toLowerCase();
          break;
        case 'statut':
          aValue = a.statut;
          bValue = b.statut;
          break;
        case 'vendredi_soir':
        case 'samedi_midi':
        case 'samedi_soir':
        case 'dimanche_brunch':
          aValue = a[sortField] ? 1 : 0;
          bValue = b[sortField] ? 1 : 0;
          break;
        case 'date':
          aValue = a.dateModification?.toDate?.() || new Date(0);
          bValue = b.dateModification?.toDate?.() || new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    return sortDirection === 'asc' ? (
      <svg
        className="w-4 h-4 text-[#137e41]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-[#137e41]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  // Connexion / Déconnexion
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      loadData();
    } catch (err: any) {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
  };

  const allMembres = getAllMembres();

  // Statistiques globales
  const totalInvites = allMembres.length;
  const totalAcceptes = allMembres.filter((m) => m.statut === 'accepte').length;
  const totalRefuses = allMembres.filter((m) => m.statut === 'refuse').length;
  const totalEnAttente = allMembres.filter(
    (m) => m.statut === 'en_attente'
  ).length;

  const presenceParEvenement = {
    vendredi_soir: allMembres.filter((m) => m.vendredi_soir).length,
    samedi_midi: allMembres.filter((m) => m.samedi_midi).length,
    samedi_soir: allMembres.filter((m) => m.samedi_soir).length,
    dimanche_brunch: allMembres.filter((m) => m.dimanche_brunch).length,
  };

  const maxPresence = Math.max(...Object.values(presenceParEvenement), 1);

  // Filtrage
  const filteredMembres = sortMembres(
    allMembres.filter((m) => {
      const matchStatus = filterStatus === 'tous' || m.statut === filterStatus;
      const matchSearch =
        !searchTerm ||
        m.codeInvitation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchName =
        !filterName || m.nom.toLowerCase().includes(filterName.toLowerCase());
      return matchStatus && matchSearch && matchName;
    })
  );

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'Code',
      'Nom',
      'Statut',
      'Vendredi soir',
      'Samedi midi',
      'Samedi soir',
      'Dimanche brunch',
      'Commentaires',
      'Date modification',
    ];

    const rows = filteredMembres.map((m) => [
      m.codeInvitation,
      m.nom,
      m.statut,
      m.vendredi_soir ? 'Oui' : 'Non',
      m.samedi_midi ? 'Oui' : 'Non',
      m.samedi_soir ? 'Oui' : 'Non',
      m.dimanche_brunch ? 'Oui' : 'Non',
      (m.commentaires || '').replace(/,/g, ';'),
      m.dateModification?.toDate?.()
        ? new Date(m.dateModification.toDate()).toLocaleString('fr-FR')
        : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `rsvp_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003b4e] to-[#137e41] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-[#003b4e] to-[#137e41] p-4 rounded-full mb-4">
              <LockOutlined sx={{ fontSize: 48, color: 'white' }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Connexion administrateur</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#137e41]"
              placeholder="admin@mariage-sd.com"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#137e41]"
            />
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#003b4e] to-[#137e41] text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-[#003b4e] to-[#137e41] shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <BarChart sx={{ fontSize: 32, color: 'white' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-sm text-white/80 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Mise à jour en temps réel
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Logout sx={{ fontSize: 20 }} />
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total invités</p>
            <p className="text-3xl font-bold">{totalInvites}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-600">Confirmés</p>
            <p className="text-3xl font-bold text-green-700">{totalAcceptes}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-red-600">Refusés</p>
            <p className="text-3xl font-bold text-red-700">{totalRefuses}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-yellow-600">En attente</p>
            <p className="text-3xl font-bold text-yellow-700">
              {totalEnAttente}
            </p>
          </div>
        </div>

        {/* Timeline des événements */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Présence par événement
          </h3>

          <div className="space-y-5">
            {[
              {
                key: 'vendredi_soir',
                label: 'Vendredi soir',
                Icon: NightlightRound,
                color: 'from-indigo-500 to-purple-600',
              },
              {
                key: 'samedi_midi',
                label: 'Samedi midi',
                Icon: LunchDining,
                color: 'from-orange-400 to-red-500',
              },
              {
                key: 'samedi_soir',
                label: 'Samedi après-midi / soir (Mariage)',
                Icon: Favorite,
                color: 'from-pink-500 to-rose-600',
              },
              {
                key: 'dimanche_brunch',
                label: 'Dimanche brunch',
                Icon: BrunchDining,
                color: 'from-amber-400 to-orange-500',
              },
            ].map((evt) => (
              <div key={evt.key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 flex items-center gap-3">
                    <evt.Icon sx={{ fontSize: 28, color: '#137e41' }} />
                    {evt.label}
                  </span>
                  <span className="text-2xl font-bold text-[#137e41]">
                    {
                      presenceParEvenement[
                        evt.key as keyof typeof presenceParEvenement
                      ]
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full bg-gradient-to-r ${evt.color} transition-all duration-700`}
                    style={{
                      width: `${
                        (presenceParEvenement[
                          evt.key as keyof typeof presenceParEvenement
                        ] /
                          maxPresence) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Code..."
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nom..."
              className="px-3 py-2 border rounded-lg"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="tous">Tous</option>
              <option value="accepte">Confirmés</option>
              <option value="refuse">Refusés</option>
              <option value="en_attente">En attente</option>
            </select>
            <button
              onClick={exportCSV}
              className="bg-[#137e41] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterName('');
                setFilterStatus('tous');
              }}
              className="bg-gray-200 px-4 py-2 rounded-lg"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    onClick={() => handleSort('code')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Code <SortIcon field="code" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nom')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Nom <SortIcon field="nom" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('statut')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Statut <SortIcon field="statut" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200">
                    <div className="flex items-center gap-2">Email</div>
                  </th>

                  <th
                    onClick={() => handleSort('vendredi_soir')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Ven. soir <SortIcon field="vendredi_soir" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('samedi_midi')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Sam. midi <SortIcon field="samedi_midi" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('samedi_soir')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Sam. soir <SortIcon field="samedi_soir" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('dimanche_brunch')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Dim. brunch <SortIcon field="dimanche_brunch" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Commentaires
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      Date <SortIcon field="date" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembres.map((m, i) => (
                  <tr
                    key={`${m.codeInvitation}-${m.nom}-${i}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {m.codeInvitation}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {m.nom}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          m.statut === 'accepte'
                            ? 'bg-green-100 text-green-700'
                            : m.statut === 'refuse'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {m.statut === 'accepte'
                          ? 'Confirmé'
                          : m.statut === 'refuse'
                          ? 'Refusé'
                          : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 break-all">
                      {m.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.vendredi_soir ? 'Oui' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.samedi_midi ? 'Oui' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.samedi_soir ? 'Oui' : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.dimanche_brunch ? 'Oui' : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      {m.commentaires ? (
                        <>
                          <div
                            className={
                              expandedComments.has(
                                `${m.codeInvitation}-${m.nom}`
                              )
                                ? 'whitespace-pre-wrap'
                                : 'line-clamp-2'
                            }
                          >
                            {m.commentaires}
                          </div>
                          {m.commentaires.length > 80 && (
                            <button
                              onClick={() =>
                                toggleComment(`${m.codeInvitation}-${m.nom}`)
                              }
                              className="text-[#137e41] text-xs mt-1 hover:underline"
                            >
                              {expandedComments.has(
                                `${m.codeInvitation}-${m.nom}`
                              )
                                ? 'Voir moins'
                                : 'Voir plus'}
                            </button>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {m.dateModification?.toDate?.()
                        ? new Date(m.dateModification.toDate()).toLocaleString(
                            'fr-FR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600">
          {filteredMembres.length} invité(s) affiché(s) sur {allMembres.length}
        </div>
      </div>
    </div>
  );
}
