import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css"; // Import CSS file

const QuranAyahViewer = () => {
  // State Management
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState("withTranslation");
  const [selectedTranslation, setSelectedTranslation] = useState("ur.jalandhry");
  const [searchSurah, setSearchSurah] = useState("");

  // Fetch Surah List
  const fetchSurahs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://api.alquran.cloud/v1/surah");
      setSurahs(response.data.data);
    } catch {
      setError("سورہ کی فہرست حاصل کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Ayahs for Selected Surah
  const fetchAyahs = async (surahNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${selectedTranslation}`
      );
      const arabicAyahs = response.data.data[0].ayahs;
      const translationAyahs = response.data.data[1].ayahs;

      const combinedAyahs = arabicAyahs.map((ayah, index) => ({
        arabic: ayah.text,
        translation: translationAyahs[index]?.text || "",
      }));

      setAyahs(combinedAyahs);
      setSelectedSurah(surahNumber);
    } catch {
      setError("آیات حاصل کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurahs();
  }, []);

  const handleSearchSurah = () => {
    const surahNumber = parseInt(searchSurah, 10);
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      setError("براہ کرم 1 سے 114 کے درمیان ایک درست سورہ نمبر درج کریں۔");
      return;
    }
    fetchAyahs(surahNumber);
  };

  const handleBack = () => {
    setSelectedSurah(null);
    setAyahs([]);
    setDisplayMode("withTranslation");
  };

  const handleTranslationChange = (value) => {
    setSelectedTranslation(value);
    if (selectedSurah) fetchAyahs(selectedSurah);
  };

  // Components
  const SurahCard = ({ surah }) => (
    <div className="surah-card" onClick={() => fetchAyahs(surah.number)}>
      <h3>{surah.englishName}</h3>
      <p>{surah.englishNameTranslation}</p>
      <p>{surah.numberOfAyahs} آیات</p>
    </div>
  );

  const TranslationSelector = () => (
    <div className="translation-selector">
      <h3>Select Translation:</h3>
      <div className="translation-buttons">
        {[
          { value: "ur.jalandhry", label: "Urdu - Jalandhry" },
          { value: "en.sahih", label: "English - Sahih International" },
          { value: "ur.ahmedali", label: "Urdu - Ahmed Ali" },
          { value: "en.pickthall", label: "English - Pickthall" },
          { value: "ur.maududi", label: "Urdu - Maududi" },
          { value: "en.yusufali", label: "English - Yusuf Ali" },
        ].map((translation) => (
          <button
            key={translation.value}
            className={selectedTranslation === translation.value ? "active" : ""}
            onClick={() => handleTranslationChange(translation.value)}
          >
            {translation.label}
          </button>
        ))}
      </div>
    </div>
  );

  const AyahList = () => (
    <div className="surah-detail">
      <button className="back-button" onClick={handleBack}>
        واپس جائیں Go Back
      </button>
      <h2>
        Surah: {surahs.find((s) => s.number === selectedSurah)?.englishName || ""}
      </h2>
      <div className="display-buttons">
        <button
          className={`display-button ${
            displayMode === "withTranslation" ? "active" : ""
          }`}
          onClick={() => setDisplayMode("withTranslation")}
        >
          Arabic with Translation
        </button>
        <button
          className={`display-button ${
            displayMode === "arabicOnly" ? "active" : ""
          }`}
          onClick={() => setDisplayMode("arabicOnly")}
        >
          Arabic Only
        </button>
      </div>
      {displayMode === "withTranslation" && <TranslationSelector />}
      <div className="ayah-list">
        {ayahs.map((ayah, index) => (
          <div key={index} className="ayah">
            <div className="arabic">{ayah.arabic}</div>
            {displayMode === "withTranslation" && (
              <div className="translation">{ayah.translation}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1 className="title">The Holy Quran</h1>
      {error && <p className="error-message">{error}</p>}
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : !selectedSurah ? (
        <div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Surah Number (1-114)"
              value={searchSurah}
              onChange={(e) => setSearchSurah(e.target.value)}
            />
            <button onClick={handleSearchSurah}>Search Surah</button>
          </div>
          <div className="surah-grid">
            {surahs.map((surah) => (
              <SurahCard key={surah.number} surah={surah} />
            ))}
          </div>
        </div>
      ) : (
        <AyahList />
      )}
    </div>
  );
};

export default QuranAyahViewer;
