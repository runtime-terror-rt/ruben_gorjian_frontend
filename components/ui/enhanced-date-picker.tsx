"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { formatForDateTimeLocal } from "@/lib/timezone";
import clsx from "clsx";

dayjs.extend(utc);
dayjs.extend(timezone);

interface EnhancedDatePickerProps {
  value: string; // YYYY-MM-DDTHH:mm format
  onChange: (value: string) => void;
  timezone: string;
  timezoneAbbr: string;
  min?: string; // Minimum date in same format
  className?: string;
  disabled?: boolean;
}

const TIME_PRESETS = [
  { label: "9:00 AM", hour: 9, minute: 0 },
  { label: "12:00 PM", hour: 12, minute: 0 },
  { label: "3:00 PM", hour: 15, minute: 0 },
  { label: "5:00 PM", hour: 17, minute: 0 },
  { label: "6:00 PM", hour: 18, minute: 0 },
];

export function EnhancedDatePicker({
  value,
  onChange,
  timezone,
  timezoneAbbr,
  min,
  className,
  disabled = false,
}: EnhancedDatePickerProps) {
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [showTimePresets, setShowTimePresets] = useState(false);

  const currentDate = useMemo(() => {
    return value ? dayjs.tz(value, timezone) : dayjs().tz(timezone);
  }, [value, timezone]);

  const quickSelectOptions = useMemo(() => {
    const now = dayjs();
    const today = now.startOf("day");
    const tomorrow = today.add(1, "day");
    // Calculate next Monday
    const daysUntilMonday = (8 - now.day()) % 7 || 7;
    const nextMonday = today.add(daysUntilMonday, "day");
    const nextWeek = today.add(1, "week");

    return [
      {
        label: "Today",
        date: today,
        disabled: min ? today.isBefore(dayjs(min)) : false,
      },
      {
        label: "Tomorrow",
        date: tomorrow,
        disabled: min ? tomorrow.isBefore(dayjs(min)) : false,
      },
      {
        label: "Next Monday",
        date: nextMonday,
        disabled: min ? nextMonday.isBefore(dayjs(min)) : false,
      },
      {
        label: "Next Week",
        date: nextWeek,
        disabled: min ? nextWeek.isBefore(dayjs(min)) : false,
      },
    ];
  }, [min]);

  const handleQuickSelect = (date: dayjs.Dayjs) => {
    const newValue = formatForDateTimeLocal(date.hour(9).minute(0), timezone);
    onChange(newValue);
    setShowQuickSelect(false);
  };

  const handleTimePreset = (hour: number, minute: number) => {
    const date = currentDate.hour(hour).minute(minute).second(0).millisecond(0);
    const newValue = formatForDateTimeLocal(date, timezone);
    onChange(newValue);
    setShowTimePresets(false);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const isPastDate = useMemo(() => {
    if (!value) return false;
    const selectedDate = dayjs.tz(value, timezone);
    const now = dayjs().tz(timezone);
    return selectedDate.isBefore(now, "minute");
  }, [value, timezone]);

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#14110c]">Date & Time</label>
        <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
          <Clock className="h-3 w-3" color="currentColor" />
          <span>{timezoneAbbr}</span>
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowQuickSelect(!showQuickSelect)}
          disabled={disabled}
          className="text-xs border-[#d9d4c9] hover:bg-[#faf8f3]"
        >
          <CalendarIcon className="h-3 w-3 mr-1" />
          Quick Select
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowTimePresets(!showTimePresets)}
          disabled={disabled}
          className="text-xs border-[#d9d4c9] hover:bg-[#faf8f3]"
        >
          <Clock className="h-3 w-3 mr-1" />
          Time Presets
        </Button>
      </div>

      {/* Quick Select Dropdown */}
      {showQuickSelect && (
        <div className="rounded-lg border border-[#d9d4c9] bg-[#faf8f3] p-2 space-y-1">
          {quickSelectOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => handleQuickSelect(option.date)}
              disabled={option.disabled}
              className={clsx(
                "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                option.disabled
                  ? "text-[#6b6b6b] cursor-not-allowed"
                  : "text-[#14110c] hover:bg-white"
              )}
            >
              {option.label} ({option.date.format("MMM D, YYYY")})
            </button>
          ))}
        </div>
      )}

      {/* Time Presets Dropdown */}
      {showTimePresets && (
        <div className="rounded-lg border border-[#d9d4c9] bg-[#faf8f3] p-2">
          <div className="text-xs text-[#6b6b6b] mb-2 px-2">Select time:</div>
          <div className="grid grid-cols-3 gap-1">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleTimePreset(preset.hour, preset.minute)}
                className="px-2 py-1.5 rounded text-xs text-[#14110c] hover:bg-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date/Time Input */}
      <div className="relative">
        <input
          type="datetime-local"
          className={clsx(
            "w-full rounded-lg border border-[#d9d4c9] p-2 text-sm text-[#14110c] bg-white focus:border-[#b08d3e] focus:outline-none focus:ring-2 focus:ring-[#b08d3e] [&_::-webkit-calendar-picker-indicator]:opacity-80 [&_::-webkit-calendar-picker-indicator]:cursor-pointer",
            isPastDate && "border-amber-500/50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          value={value}
          onChange={handleDateTimeChange}
          min={min || formatForDateTimeLocal(dayjs(), timezone)}
          step="60" // 1 minute steps
          disabled={disabled}
        />

        {isPastDate && (
          <div className="mt-1 text-xs text-amber-400">
            ⚠️ Past dates are not allowed. Date has been adjusted.
          </div>
        )}
      </div>

      {/* Selected Date Display */}
      {value && (
        <div className="text-xs text-[#6b6b6b]">
          {dayjs.tz(value, timezone).format("dddd, MMMM D, YYYY [at] h:mm A")} (
          {timezoneAbbr})
        </div>
      )}
    </div>
  );
}
