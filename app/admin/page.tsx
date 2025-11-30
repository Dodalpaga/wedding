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

type SortField = 'code' | 'nom' | 'statut' | 'arrivee' | 'date' | 'brunch';
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
        // Attendre que le token soit bien chargé
        await user.getIdToken(true);
        setIsAuthenticated(true);
        await loadData();
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Charger les données en temps réel
  const loadData = async () => {
    try {
      // Vérifier l'authentification avant de charger
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ Utilisateur non authentifié');
        return;
      }

      console.log('🔍 Chargement des codes...');

      // 1. Charger tous les codes d'invitation avec gestion d'erreur
      let codesSnapshot;
      try {
        codesSnapshot = await getDocs(collection(db, 'codes_invitation'));
        console.log('✅ Codes trouvés:', codesSnapshot.size);
      } catch (error) {
        console.error('❌ Erreur lecture codes:', error);
        return;
      }

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

      console.log('📊 Total codes chargés:', codesMap.size);
      setCodesInvitation(codesMap);

      // 2. Écouter les statuts en temps réel
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
          console.log('📊 Statuts chargés:', data.length);
          setStatuts(data);
          setFilteredStatuts(data);
        },
        (error) => {
          console.error('❌ Erreur écoute statuts:', error);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('❌ Erreur générale chargement:', err);
    }
  };

  // Obtenir tous les membres de tous les codes
  const getAllMembres = () => {
    const allMembres: any[] = [];

    codesInvitation.forEach((codeData, code) => {
      // code = "ABC123"
      (codeData.membres || []).forEach((nom: string) => {
        const statut = statuts.find((s) => s.nom_membre === nom);

        allMembres.push({
          nom,
          codeInvitation: code, // ← maintenant c’est bien le code 6 lettres
          statut: statut?.statut || 'en_attente',
          arrivee: statut?.arrivee || '',
          brunch: statut?.brunch || '',
          commentaires: statut?.commentaires || '',
          dateModification: statut?.date_modification,
        });
      });
    });

    return allMembres;
  };

  // Fonction de tri
  const sortMembres = (membres: any[]) => {
    return [...membres].sort((a, b) => {
      let aValue, bValue;

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
        case 'arrivee':
          aValue = a.arrivee || '';
          bValue = b.arrivee || '';
          break;
        case 'brunch':
          aValue = a.brunch || '';
          bValue = b.brunch || '';
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

  // Gérer le clic sur un en-tête de colonne
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Icône de tri
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
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
    }
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

  // Connexion
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

  // Déconnexion
  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
  };

  const totalInvites = Array.from(codesInvitation.values()).reduce(
    (acc, code) => {
      return acc + (code.membres?.length || 0);
    },
    0
  );

  const totalReponses = statuts.reduce((acc, s) => {
    return acc + (s.nombre || 1);
  }, 0);

  const totalAcceptes = statuts
    .filter((s) => s.statut === 'accepte')
    .reduce((acc, s) => acc + (s.nombre || 1), 0);

  const totalRefuses = statuts
    .filter((s) => s.statut === 'refuse')
    .reduce((acc, s) => acc + (s.nombre || 1), 0);

  const totalBrunch = statuts
    .filter((s) => s.brunch === 'oui')
    .reduce((acc, s) => acc + (s.nombre || 1), 0);

  // Statistiques
  const stats = {
    total: totalInvites,
    acceptes: totalAcceptes,
    refuses: totalRefuses,
    enAttente: totalInvites - totalReponses,
    brunch: totalBrunch,
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'Code',
      'Nom Membre',
      'Statut',
      'Arrivée',
      'Brunch',
      'Commentaires',
      'Date Modification',
    ];

    const rows = filteredMembres.map((s) => [
      s.codeInvitation,
      s.nom,
      s.statut,
      s.arrivee || '',
      s.brunch || '',
      (s.commentaires || '').replace(/,/g, ';'),
      s.dateModification?.toDate
        ? new Date(s.dateModification.toDate()).toLocaleDateString('fr-FR')
        : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `confirmations_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
  };

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003b4e] to-[#137e41] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-[#003b4e] to-[#137e41] p-4 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Connexion administrateur</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#137e41] focus:outline-none"
                placeholder="admin@mariage-sd.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#137e41] focus:outline-none"
              />
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#003b4e] to-[#137e41] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard principal
  const allMembres = getAllMembres();

  // Filtrer les membres
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

  // Statistiques pour les visualisations
  const confirmedMembers = allMembres.filter((m) => m.statut === 'accepte');

  const arrivalStats = {
    Vendredi: confirmedMembers.filter((m) => m.arrivee === 'Vendredi').length,
    Samedi: confirmedMembers.filter((m) => m.arrivee === 'Samedi').length,
    'Non précisé': confirmedMembers.filter(
      (m) => !m.arrivee || m.arrivee === ''
    ).length,
  };

  const maxArrival = Math.max(...Object.values(arrivalStats), 1);

  // Statistiques par code d'invitation - Tous les codes triés par pourcentage
  const topCodes = Array.from(codesInvitation.entries())
    .map(([code, data]) => {
      const membres = data.membres || [];
      const description = data.description || '';
      const confirmed = membres.filter((nom: string) =>
        statuts.find((s) => s.nom_membre === nom && s.statut === 'accepte')
      ).length;
      const percentage =
        membres.length > 0 ? (confirmed / membres.length) * 100 : 0;

      return {
        code,
        description,
        total: membres.length,
        confirmed,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#003b4e] to-[#137e41] shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
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
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total invités</p>
            <p className="text-3xl font-bold text-gray-800">
              {allMembres.length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-600">✅ Confirmés</p>
            <p className="text-3xl font-bold text-green-700">
              {stats.acceptes}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-red-600">❌ Refusés</p>
            <p className="text-3xl font-bold text-red-700">{stats.refuses}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-yellow-600">⏳ En attente</p>
            <p className="text-3xl font-bold text-yellow-700">
              {stats.enAttente}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <p className="text-sm text-purple-600">🥞 Brunch</p>
            <p className="text-3xl font-bold text-purple-700">{stats.brunch}</p>
          </div>
        </div>

        {/* Visualisations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Timeline des arrivées */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#137e41]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Timeline des arrivées
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmedMembers.length} personnes confirmées
            </p>

            <div className="space-y-6">
              {/* Vendredi */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    🌙 Vendredi
                  </span>
                  <span className="text-lg font-bold text-[#003b4e]">
                    {arrivalStats['Vendredi']}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#003b4e] to-[#005a70] h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (arrivalStats['Vendredi'] / maxArrival) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Samedi */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    ☀️ Samedi
                  </span>
                  <span className="text-lg font-bold text-[#137e41]">
                    {arrivalStats['Samedi']}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#137e41] to-[#1a9e52] h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(arrivalStats['Samedi'] / maxArrival) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Non précisé */}
              {arrivalStats['Non précisé'] > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      ❓ Non précisé
                    </span>
                    <span className="text-lg font-bold text-gray-500">
                      {arrivalStats['Non précisé']}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (arrivalStats['Non précisé'] / maxArrival) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Taux de conversion par code */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#137e41]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Status des codes d'invitation ({topCodes.length} code(s)
              d'invitation)
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Triés par taux de confirmation
            </p>

            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
              {topCodes.map((code, index) => (
                <div key={code.code}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-gradient-to-r from-[#003b4e] to-[#137e41] w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-mono font-semibold text-gray-700">
                        {code.code}
                      </span>
                      <span className="text-sm font-mono font-semibold text-gray-700">
                        ({code.description})
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      <span className="font-bold text-[#137e41]">
                        {code.confirmed}
                      </span>
                      /{code.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#003b4e] to-[#137e41] h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(code.confirmed / code.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche code
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Code invitation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#137e41]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche nom
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nom de l'invité..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#137e41]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#137e41]"
              >
                <option value="tous">Tous</option>
                <option value="accepte">Confirmés</option>
                <option value="refuse">Refusés</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportCSV}
                className="w-full bg-[#137e41] text-white px-4 py-2 rounded-lg hover:bg-[#0f6333] transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterName('');
                  setFilterStatus('tous');
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th
                    onClick={() => handleSort('code')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Code
                      <SortIcon field="code" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('nom')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Nom
                      <SortIcon field="nom" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('statut')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Statut
                      <SortIcon field="statut" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('arrivee')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Arrivée
                      <SortIcon field="arrivee" />
                    </div>
                  </th>
                  {/* Nouvelle colonne Brunch */}
                  <th
                    onClick={() => handleSort('brunch')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Brunch
                      <SortIcon field="brunch" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Commentaires
                  </th>
                  <th
                    onClick={() => handleSort('date')}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembres.map((membre, index) => (
                  <tr
                    key={`${membre.codeInvitation}-${membre.nom}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {membre.codeInvitation}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {membre.nom}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          membre.statut === 'accepte'
                            ? 'bg-green-100 text-green-700'
                            : membre.statut === 'refuse'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {membre.statut === 'accepte'
                          ? '✅ Confirmé'
                          : membre.statut === 'refuse'
                          ? '❌ Refusé'
                          : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {membre.arrivee || '-'}
                    </td>
                    {/* Affichage Brunch */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {membre.brunch === 'oui' ? (
                        <span className="text-green-600 font-medium">
                          ✅ Oui
                        </span>
                      ) : membre.brunch === 'non' ? (
                        <span className="text-red-500">❌ Non</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {membre.commentaires || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {membre.dateModification?.toDate
                        ? new Date(
                            membre.dateModification.toDate()
                          ).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredMembres.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun invité trouvé
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 text-center">
          {filteredMembres.length} invité(s) affiché(s) sur {allMembres.length}
        </div>
      </div>
    </div>
  );
}
