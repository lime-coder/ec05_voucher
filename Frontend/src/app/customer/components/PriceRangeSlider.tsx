import React, { useState, useEffect, useRef } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeSlider({ min, max, onChange }: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className="relative w-full py-4 px-2 flex items-center justify-center">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          const value = Math.min(Number(event.target.value), maxVal - 1);
          setMinVal(value);
          minValRef.current = value;
          onChange(value, maxVal);
        }}
        className="thumb thumb--left absolute w-full h-0 z-30 outline-none pointer-events-none appearance-none"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          maxValRef.current = value;
          onChange(minVal, value);
        }}
        className="thumb thumb--right absolute w-full h-0 z-40 outline-none pointer-events-none appearance-none"
      />

      <div className="relative w-full h-2 flex items-center">
        <div className="absolute w-full h-full bg-primary/20 rounded-full z-10" />
        <div
          ref={range}
          className="absolute h-full bg-primary rounded-full z-20"
        />
      </div>

      <style>{`
        .thumb::-webkit-slider-thumb {
          pointer-events: all;
          width: 16px;
          height: 16px;
          -webkit-appearance: none;
          border-radius: 50%;
          background-color: #d97706;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
