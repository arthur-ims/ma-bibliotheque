import React, { useState, useEffect } from 'react';

// URL directe de votre Google Sheets (Ne pas modifier)
const SHEET_URL = "https://google.com";

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');

  useEffect(() => {
    fetch(SHEET_URL)
      .then(res => res.text())
      .then(text => {
        // Extraction sécurisée pour isoler le JSON envoyé par Google
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
        if (!match || !match[1]) {
          throw new Error("Impossible d'extraire les données Google Sheets");
        }
        
        const data = JSON.parse(match[1]);
        
        const rows = data.table.rows
          .map((row, index) => {
            const cells = row.c || [];
            return {
              id: index.toString(),
              titre: cells[0]?.v?.toString().trim() || '',
              auteur: cells[1]?.v?.toString().trim() || 'Auteur inconnu',
              genre: cells[2]?.v?.toString().trim() || '',
              sous_categorie: cells[3]?.v?.toString().trim() || '',
              editeur: cells[4]?.v?.toString().trim() || '',
              format: cells[5]?.v?.toString().trim() || ''
            };
          })
          // On supprime les lignes vides et la ligne d'en-tête (Titre, Auteur, Genre...)
          .filter(book => 
            book.titre !== '' && 
            book.genre !== '' && 
            book.titre.toLowerCase() !== 'titre' && 
            book.genre.toLowerCase() !== 'genre'
          );
        
        setBooks(rows);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur d'importation Sheets:", err);
        setLoading(false);
      });
  }, []);

  // Liste des genres uniques triés de A à Z
  const genres = [...new Set(books.map(b => b.genre))].filter(Boolean).sort((a, b) => a.localeCompare(b));

  // Liste des sous-catégories dynamiques triées de A à Z
  const subCategories = selectedGenre 
    ? [...new Set(books.filter(b => b.genre === selectedGenre).map(b => b.sous_categorie))].filter(Boolean).sort((a, b) => a.localeCompare(b))
    : [];

  // Filtrage des livres affichés selon les sélections
  const filteredBooks = books.filter(b => {
    const matchGenre = selectedGenre ? b.genre === selectedGenre : true;
    const matchSubCat = selectedSubCat ? b.sous_categorie === selectedSubCat : true;
    return matchGenre && matchSubCat;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-medium">
        Chargement de la bibliothèque...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans max-w-md mx-auto shadow-2xl min-w-[320px] flex flex-col">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 z-20 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Ma Bibliothèque</h1>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{books.length} ouvrages répertoriés</p>
          </div>
        </div>

        {/* Zone des filtres */}
        <div className="mt-4 space-y-2.5">
          <select 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            value={selectedGenre} 
            onChange={(e) => { setSelectedGenre(e.target.value); setSelectedSubCat(''); }}
          >
            <option value="">📚 Tous les genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {selectedGenre && subCategories.length > 0 && (
            <div className="animate-fadeIn">
              <select 
                className="w-full bg-indigo-50/50 border border-indigo-100 text-indigo-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                value={selectedSubCat} 
                onChange={(e) => setSelectedSubCat(e.target.value)}
              >
                <option value="">📂 Toutes les sous-catégories</option>
                {subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Affichage de la liste */}
      <main className="p-4 flex-1 space-y-3 overflow-y-auto">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            Aucun ouvrage trouvé dans cette catégorie.
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2 active:scale-[0.99] transition-transform">
              <div className="flex justify-between items-start gap-2">
                <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">
                  {book.sous_categorie || "Général"}
                </span>
                {book.format && (
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {book.format}
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 text-base leading-snug">{book.titre}</h3>
                {book.auteur && book.auteur !== 'Auteur inconnu' && (
                  <p className="text-xs text-gray-500 font-medium mt-0.5">par {book.auteur}</p>
                )}
              </div>

              {book.editeur && (
                <div className="pt-1 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Éditeur : <span className="font-medium text-gray-600">{book.editeur}</span></span>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
