import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
}

export function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="appearance-none bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  );
}

export function DateTimePicker() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id="time-picker"
          step="1"
          defaultValue="10:30:00"
          className="appearance-none bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
