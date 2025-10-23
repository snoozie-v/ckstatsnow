// src/hooks/useFetchScores.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useFetchScores = (sport, initialDate) => {
  const pad = (n) => String(n).padStart(2, "0");

  const formatDateForESPN = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${year}${pad(month)}${pad(day)}`;
  };

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url;
      if (sport === "football/nfl") {
        // NFL needs a week-long date range (e.g., Thursday to next Tuesday)
        const startDate = new Date(selectedDate);
        const thursStr = formatDateForESPN(selectedDate);
        const tue = new Date(startDate);
        tue.setDate(startDate.getDate() + 5); // Tuesday to capture Monday night UTC
        const tueStr = `${tue.getFullYear()}${pad(tue.getMonth() + 1)}${pad(
          tue.getDate()
        )}`;
        url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard?dates=${thursStr}-${tueStr}`;
      } else {
        // Other sports use a single date
        const espnDate = formatDateForESPN(selectedDate);
        url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/scoreboard?dates=${espnDate}-${espnDate}`;
      }
      const response = await axios.get(url);
      setGames(response.data.events || []);
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          "Invalid date format or no data available. Try a past date like 2024-09-24."
        );
      } else {
        setError("Failed to fetch scores");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, sport]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchScores]);

  return { games, loading, error, selectedDate, setSelectedDate };
};

export default useFetchScores;
