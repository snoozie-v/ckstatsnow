// New WeekSelector.jsx (similar to DateSelector, but snaps to Thursday for NFL weeks)
// Place this in ./components/WeekSelector.jsx
import { useState } from 'react';

const WeekSelector = ({ selectedWeekStart, onWeekStartChange }) => {
  const changeWeek = (delta) => {
    const current = new Date(`${selectedWeekStart}T00:00`);
    current.setDate(current.getDate() + (delta * 7));
    const pad = (n) => String(n).padStart(2, '0');
    onWeekStartChange(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`);
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value + 'T00:00');
    const daysToThu = (date.getDay() - 4 + 7) % 7;
    const thurs = new Date(date);
    thurs.setDate(date.getDate() - daysToThu);
    const pad = (n) => String(n).padStart(2, '0');
    const newStart = `${thurs.getFullYear()}-${pad(thurs.getMonth() + 1)}-${pad(thurs.getDate())}`;
    onWeekStartChange(newStart);
  };

  return (
    <div className="flex justify-center mb-4">
      <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-sky-500 text-white rounded-md mr-2">Prev</button>
      <input
        type="date"
        value={selectedWeekStart}
        onChange={handleDateChange}
        className="px-4 py-2 border rounded-md"
      />
      <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-sky-500 text-white rounded-md ml-2">Next</button>
    </div>
  );
};

export default WeekSelector;
