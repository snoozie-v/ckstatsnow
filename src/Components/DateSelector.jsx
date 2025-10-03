const DateSelector = ({ selectedDate, onDateChange }) => {
  const changeDate = (delta) => {
    const current = new Date(`${selectedDate}T00:00`);
    current.setDate(current.getDate() + delta);
    const pad = (n) => String(n).padStart(2, '0');
    onDateChange(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`);
  };

  return (
    <div className="flex justify-center mb-4">
      <button onClick={() => changeDate(-1)} className="px-4 py-2 bg-sky-500 text-white rounded-md mr-2">Prev</button>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-4 py-2 border rounded-md"
      />
      <button onClick={() => changeDate(1)} className="px-4 py-2 bg-sky-500 text-white rounded-md ml-2">Next</button>
    </div>
  );
};

export default DateSelector;
