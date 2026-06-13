import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholderText?: string;
  className?: string;
}

const CustomDatePicker = forwardRef<any, CustomDatePickerProps>(
  ({ selected, onChange, minDate, placeholderText, className }, ref) => {
    return (
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        placeholderText={placeholderText}
        className={className}
        dateFormat="dd-MM-yyyy"
        isClearable={false}
      />
    );
  }
);

CustomDatePicker.displayName = "CustomDatePicker";

export default CustomDatePicker;
