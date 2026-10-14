import React, { useState, useEffect } from 'react';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSubCat, setSelectedSubCat] = useState('');

  useEffect(() => {
    // Lien direct vers ton API de données Google Sheets
    const url = "https://google.com";
    
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
        if (!match) return;
        
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
          .filter(b => b.titre !== '' && b.genre !== '' && b.titre.toLowerCase() !== 'titre');
        
        setBooks(rows);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const genres = [...new Set(books.map(b => b.genre))].filter(Boolean).sort();
  const subCategories = selectedGenre 
    ? [...new Set(books.filter(b => b.genre === selectedGenre).map(b => b.sous_categorie))].filter(Boolean).sort()
    : [];

  const filteredBooks = books.filter(b => {
    const mGenre = selectedGenre ? b.genre === selectedGenre : true;
    const mSubCat = selectedSubCat ? b.sous_categorie === selectedSubCat : true;
    return mGenre && mSubCat;
  });

  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600 font-medium">Connexion à Google Sheets...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans max-w-md mx-auto shadow-2xl flex flex-col">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 z-20 shadow-sm">
        <h1 className="text-xl font-bold">Ma Bibliothèque</h1>
        <p className="text-xs text-indigo-600 font-medium mt-0.5">{books.length} ouvrages répertoriés</p>
        <div className="mt-4 space-y-2.5">
          <select class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedGenre} onChange={(e) => { setSelectedGenre(e.target.value); setSelectedSubCat(''); }}>
            <option value="">📚 Tous les genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {selectedGenre && subCategories.length > 0 && (
            <select class="w-full bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSubCat} onChange={(e) => setSelectedSubCat(e.target.value)}>
              <option value="">📂 Toutes les sous-catégories</option>
              {subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          )}
        </div>
      </header>
      <main className="p-4 flex-1 space-y-3 overflow-y-auto">
        {filteredBooks.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex justify-between items-start gap-2">
              <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">{b.sous_categorie || "Général"}</span>
              {b.format && <span className="text-[10px] text-gray-400 font-medium uppercase">{b.format}</span>}
            </div>
            <h3 className="font-bold text-gray-800 text-base leading-snug">{b.titre}</h3>
            {b.auteur !== 'Auteur inconnu' && <p className="text-xs text-gray-500 font-medium">par {b.auteur}</p>}
            {b.editeur && <div className="pt-1 border-t border-gray-50 text-[11px] text-gray-400">Éditeur : <span className="font-medium text-gray-600">{b.editeur}</span></div>}
          </div>
        ))}
      </main>
    </div>
  );
}
