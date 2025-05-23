import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import micIcon from "../../assets/images/mic.png";

const Search = ({ isSearchOpen, setIsSearchOpen }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timeoutRef = useRef(null);

  const RECORDING_DURATION = 2000;
  const MAX_RETRIES = 2;

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: { sampleRate: 48000, channelCount: 1, noiseSuppression: true, echoCancellation: true } })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 128000,
        });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (audioBlob.size < 3000) {
            toast.error("Audio too short or unclear. Please speak again, more clearly.");
            stream.getTracks().forEach((track) => track.stop());
            setIsRecording(false);
            return;
          }
          await sendVoiceSearch(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
          setIsRecording(false);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);

        timeoutRef.current = setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
        }, RECORDING_DURATION);
      })
      .catch((err) => {
        toast.error(`Microphone access error: ${err.message}`);
        setIsRecording(false);
      });
  };

  const handleVoiceSearch = () => {
    if (!isRecording) {
      startRecording();
    }
  };

  const sendVoiceSearch = async (audioBlob, retryCount = 0) => {
    if (audioChunksRef.current.length === 0 || audioBlob.size < 3000) {
      toast.error("Please speak again, more clearly.");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "voice-search.webm");
    formData.append("language", language);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("http://localhost:8080/cago/product/search", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found. Please speak again, more clearly.");
          navigate("/category/all", { state: { searchResults: [], query: "Voice Search" } });
        } else {
          navigate("/category/all", { state: { searchResults: products, query: "Voice Search" } });
        }
      } else {
        if (data.message && data.message.includes("NoHttpResponseException") && retryCount < MAX_RETRIES) {
          toast.warn(`Voice search failed due to network issue. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000 * (retryCount + 1)));
          return sendVoiceSearch(audioBlob, retryCount + 1);
        }
        toast.error(data.message || "Please speak again, more clearly.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Voice search timed out. Please try again.");
      } else if (err.message.includes("NoHttpResponseException") && retryCount < MAX_RETRIES) {
        toast.warn(`Voice search failed due to network issue. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * (retryCount + 1)));
        return sendVoiceSearch(audioBlob, retryCount + 1);
      } else {
        toast.error(`Voice search error: ${err.message}. Please try again.`);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleKeyPressSearch = async (event) => {
    if (event.key === "Enter") {
      const query = event.target.value;
      searchProducts(query, language);
    }
  };

  const searchProducts = async (query, searchLanguage = "en") => {
    try {
      if (!query || query.trim() === "") {
        toast.error("Please provide a search keyword.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/cago/product?name=${encodeURIComponent(query)}&language=${searchLanguage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        const products = data.data.elementList || [];
        if (products.length === 0) {
          toast.info("No matching products found.");
          navigate("/category/all", { state: { searchResults: [], query } });
        } else {
          navigate("/category/all", { state: { searchResults: products, query } });
        }
      } else {
        console.log("Error response:", data);
        toast.error(data.message || "Unable to search for products. Please try again.");
      }
    } catch (err) {
      toast.error(`Search error: ${err.message}`);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="What are you looking for?"
        className={styles.searchInput}
        onKeyPress={handleKeyPressSearch}
      />

      <div className={styles.searchIcons}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles.languageSelect}
        >
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
        </select>

        <button
          className={`${styles.iconButton} ${isRecording ? styles.recording : ""}`}
          onClick={handleVoiceSearch}
          disabled={isRecording}
        >
          <img src={micIcon} alt="Voice Search" width="24" height="24" />
          <span>Voice Search</span>
        </button>

        <button
          className={styles.closeSearch}
          onClick={() => setIsSearchOpen(false)}
        >
          ✖
        </button>
      </div>

      {isRecording && (
        <div className={styles.recordingOverlay}>
          <div className={styles.recordingIndicator}>
            <div className={styles.micContainer}>
              <img src={micIcon} alt="Microphone" className={styles.micIcon} />
              <div className={styles.wave1}></div>
              <div className={styles.wave2}></div>
              <div className={styles.wave3}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;