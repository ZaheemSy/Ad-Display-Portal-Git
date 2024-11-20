import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DateTimePicker({ label, onChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(date); // Pass the date to the parent
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <label>{label}: </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        showTimeSelect
        dateFormat="Pp"
        style={{ marginLeft: '10px' }}
      />
    </div>
  );
}

export default DateTimePicker;
