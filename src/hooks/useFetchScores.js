// src/hooks/useFetchScores.js
import { useState, useEffect, useCallback } from "react";
import { fetchScoresByDate } from "../api/espn";

const useFetchScores = (sport, initialDate) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await fetchScoresByDate(sport, selectedDate);
      setGames(events);
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
