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
  const [codesInvitation, setCodesInvitation] = useState<Map<string, any>>(
    new Map()
  );

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Charger les données en temps réel
  const loadData = async () => {
    try {
      // Charger les codes d'invitation
      const codesSnapshot = await getDocs(collection(db, 'codes_invitation'));
      const codesMap = new Map();
      codesSnapshot.docs.forEach((doc) => {
        codesMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      setCodesInvitation(codesMap);

      // Écouter les changements de statuts en temps réel
      const q = query(
        collection(db, 'statuts'),
        orderBy('date_modification', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStatuts(data);
        setFilteredStatuts(data);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  };

  // Filtrer les statuts
  useEffect(() => {
    let filtered = [...statuts];

    if (filterStatus !== 'tous') {
      filtered = filtered.filter((s) => s.statut === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.nom_membre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code_invitation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStatuts(filtered);
  }, [filterStatus, searchTerm, statuts]);

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

  // Statistiques
  const stats = {
    total: statuts.length,
    acceptes: statuts.filter((s) => s.statut === 'accepte').length,
    refuses: statuts.filter((s) => s.statut === 'refuse').length,
    enAttente: Array.from(codesInvitation.values()).reduce((acc, code) => {
      const membres = code.membres || [];
      const membresConfirmes = statuts.filter(
        (s) => s.code_invitation === code.id
      ).length;
      return acc + (membres.length - membresConfirmes);
    }, 0),
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'Code',
      'Nom Membre',
      'Statut',
      'Arrivée',
      'Commentaires',
      'Date Modification',
    ];

    const rows = filteredStatuts.map((s) => [
      s.code_invitation,
      s.nom_membre,
      s.statut,
      s.arrivee || '',
      (s.commentaires || '').replace(/,/g, ';'),
      s.date_modification?.toDate
        ? new Date(s.date_modification.toDate()).toLocaleDateString('fr-FR')
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

  // Obtenir tous les membres de tous les codes
  const getAllMembres = () => {
    const allMembres: any[] = [];
    codesInvitation.forEach((code) => {
      (code.membres || []).forEach((nom: string) => {
        const statut = statuts.find((s) => s.nom_membre === nom);
        allMembres.push({
          nom,
          codeInvitation: code.id,
          statut: statut?.statut || 'en_attente',
          arrivee: statut?.arrivee || '',
          commentaires: statut?.commentaires || '',
          dateModification: statut?.date_modification,
        });
      });
    });
    return allMembres;
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
  const filteredMembres = allMembres.filter((m) => {
    const matchStatus = filterStatus === 'tous' || m.statut === filterStatus;
    const matchSearch =
      !searchTerm ||
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.codeInvitation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#003b4e]">
              📊 Dashboard Admin
            </h1>
            <p className="text-sm text-gray-600">Mise à jour en temps réel</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 flex items-center gap-2"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou code..."
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
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Arrivée
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Commentaires
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
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
      </div>
    </div>
  );
}
