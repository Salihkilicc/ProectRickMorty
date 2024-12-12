import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import './App.css';
import ReactPaginate from 'react-paginate';

// Karakter verilerini tanımlamak için bir arayüz (interface)
interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { // Karakterin kökeni
    name: string;
    url: string;
  };
  location: { // Karakterin bulunduğu yer
    name: string;
    url: string;
  };
  image: string; // Karakter resim URL'si
  episode: string[]; // Karakterin yer aldığı bölümlerin URL'leri
  url: string;
  created: string;
}

const App: React.FC = () => {
  // State'ler (uygulamanın verilerini tutan değişkenler)
  const [characters, setCharacters] = useState<Character[]>([]); // Tüm karakterler
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]); // Filtrelenmiş karakterler
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null); // Seçilen karakterin detayları
  const [pageCount, setPageCount] = useState(0); // Sayfa sayısı
  const [itemOffset, setItemOffset] = useState(0); // Sayfalandırma için başlangıç indeksi
  const [itemsPerPage, setItemsPerPage] = useState(10); // Her sayfada gösterilecek karakter sayısı
  const [nameFilter, setNameFilter] = useState(''); // İsim filtresi
  const [statusFilter, setStatusFilter] = useState(''); // Durum filtresi
  const [speciesFilter, setSpeciesFilter] = useState(''); // Tür filtresi


  // useEffect, component yüklendiğinde verileri çekmek için kullanılır.
  useEffect(() => {
    // Asenkron fonksiyon, API'den veri çeker.
    const fetchCharacters = async () => {
      try {
        let allCharacters: Character[] = [];
        let nextPage: string | null = 'https://rickandmortyapi.com/api/character'; // API endpoint'i

        // Tüm sayfaları döngü ile getiriyoruz
        while (nextPage) {
          const response: AxiosResponse<any> = await axios.get(nextPage); // API isteği
          allCharacters = allCharacters.concat(response.data.results);  // Karakterleri ekliyoruz
          nextPage = response.data.info.next; // Sonraki sayfanın URL'i
        }

        setCharacters(allCharacters); // Tüm karakterleri state'e kaydediyoruz
        setFilteredCharacters(allCharacters); // Filtrelenmiş karakterleri başlangıçta tüm karakterler olarak ayarlıyoruz
      } catch (error) {
        console.error("Karakterler getirilirken hata oluştu:", error);
        // Hata yönetimi buraya eklenebilir (örneğin, kullanıcıya bir hata mesajı gösterme)
      }
    };

    fetchCharacters(); // Fonksiyonu çağırıyoruz
  }, []); // Bağımlılık dizisi boş, yani component mount olduğunda bir kere çalışır.


  // Sayfalandırma için useEffect
  useEffect(() => {
      const endOffset = itemOffset + itemsPerPage; // Bitiş indeksi
      setFilteredCharacters(characters.slice(itemOffset, endOffset)); // Sayfaya göre karakterleri filtreliyoruz
      setPageCount(Math.ceil(characters.length / itemsPerPage)); // Toplam sayfa sayısını hesaplıyoruz
  }, [itemOffset, itemsPerPage, characters]); // Bu useEffect, itemOffset, itemsPerPage veya characters değiştiğinde çalışır.



  // Sayfa tıklamalarını işlemek için fonksiyon
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % characters.length; // Yeni başlangıç indeksini hesapla
    setItemOffset(newOffset); // State'i güncelle
  };


  // Karakter tıklamalarını işlemek için fonksiyon
  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character); // Seçilen karakteri state'e kaydet
  };


  // Karakterleri filtrelemek için fonksiyon
  const filterCharacters = () => {
    let filtered = characters; // Tüm karakterlerle başlıyoruz
    // İsim filtresini uygula
    if (nameFilter) {
      filtered = filtered.filter(char => char.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    // Durum filtresini uygula
    if (statusFilter) {
      filtered = filtered.filter(char => char.status.toLowerCase().includes(statusFilter.toLowerCase()));
    }
    // Tür filtresini uygula
    if (speciesFilter) {
      filtered = filtered.filter(char => char.species.toLowerCase().includes(speciesFilter.toLowerCase()));
    }


    setFilteredCharacters(filtered); // Filtrelenmiş karakterleri state'e kaydet
    setPageCount(Math.ceil(filtered.length / itemsPerPage)); // Toplam sayfa sayısını güncelle
    setItemOffset(0); // Filtrelemeden sonra ilk sayfaya dön

  };


// JSX (HTML benzeri yapı)
  return (
    // Ana container
    <div className="app">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* Filtreleme alanı */}
        <div className="filter-container">
            {/* İsim filtresi */}
            <input 
                type="text" 
                placeholder="İsme göre filtrele"
                value={nameFilter} 
                onChange={e => setNameFilter(e.target.value)} 
                className="filter-input"
            />
            <input 
                type="text" 
                placeholder="Duruma göre filtrele" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="filter-input" 
            />
            <input 
                type="text" 
                placeholder="Türe göre filtrele" 
                value={speciesFilter} 
                onChange={e => setSpeciesFilter(e.target.value)} 
                className="filter-input"
            />
            <button onClick={filterCharacters} className="filter-button">Filtrele</button>
        </div>

        {/* Filtre sonucu yoksa mesaj verir */}
        {filteredCharacters.length === 0 && <p className="no-results-message">Kriterlerinize uygun karakter bulunamadı.</p>}

        {/* Karakter tablosu */}
        <table className="character-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>İsim</th>
                    <th>Durum</th>
                    <th>Tür</th>
                </tr>
            </thead>
            <tbody>
            {/* Filtrelenmiş karakterleri map ile döndürüp tablo satırları oluşturuyoruz */}
                {filteredCharacters.map(character => (
                    <tr key={character.id} onClick={() => handleCharacterClick(character)} className="table-row">
                        <td>{character.id}</td>
                        <td>{character.name}</td>
                        <td>{character.status}</td>
                        <td>{character.species}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Sayfalandırma componentı */}
        <ReactPaginate
            breakLabel="..."
            nextLabel="Sonraki >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="< Önceki"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName='page-link'
            previousClassName='page-item'
            previousLinkClassName='page-link'
            nextClassName='page-item'
            nextLinkClassName='page-link'
            activeClassName='active'
            disabledClassName="disabled" 
        />


        {/* Seçilen karakterin detayları */}
        {selectedCharacter && (
            <div className="character-details">
                <img src={selectedCharacter.image} alt={selectedCharacter.name} className="character-image"/>
                <div className="character-info">
                    <h2 className="character-name">{selectedCharacter.name}</h2>
                    <p><span className="detail-label">Durum:</span> {selectedCharacter.status}</p>
                    <p><span className="detail-label">Tür:</span> {selectedCharacter.species}</p>
                    <p><span className="detail-label">Cinsiyet:</span> {selectedCharacter.gender}</p>
                    <p><span className="detail-label">Köken:</span> {selectedCharacter.origin.name}</p>
                    <p><span className="detail-label">Bulunduğu Yer:</span> {selectedCharacter.location.name}</p>
                </div>

            </div>
        )}

    </div>
  );
};

export default App;