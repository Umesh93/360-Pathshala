// import { useEffect, useRef, useState } from "react";
// import { Check, ChevronDown, X } from "lucide-react";

// interface MultiSelectProps {
//   options: string[];
//   selected: string[];
//   onChange: (value: string[]) => void;
//   placeholder?: string;
// }

// export default function MultiSelect({
//   options,
//   selected,
//   onChange,
//   placeholder = "Select Features",
// }: MultiSelectProps) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (!ref.current?.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggle = (item: string) => {
//     if (selected.includes(item)) {
//       onChange(selected.filter((x) => x !== item));
//     } else {
//       onChange([...selected, item]);
//     }
//   };

//   return (
//     <div className="relative" ref={ref}>
//       <div
//         onClick={() => setOpen(!open)}
//         className="flex min-h-[56px] cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3"
//       >
//         {selected.length === 0 ? (
//           <span className="text-slate-400">{placeholder}</span>
//         ) : (
//           selected.map((item) => (
//             <span
//               key={item}
//               className="flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-700"
//             >
//               {item}

//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   toggle(item);
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             </span>
//           ))
//         )}

//         <ChevronDown
//           size={18}
//           className={`ml-auto transition ${open ? "rotate-180" : ""}`}
//         />
//       </div>

//       {open && (
//         <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg">
//           {options.map((option) => {
//             const active = selected.includes(option);

//             return (
//               <button
//                 type="button"
//                 key={option}
//                 onClick={() => toggle(option)}
//                 className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-100"
//               >
//                 <span>{option}</span>

//                 {active && <Check size={18} className="text-teal-600" />}
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useMemo, useRef, useState } from "react";
// import { Check, ChevronDown, Search, X } from "lucide-react";

// interface MultiSelectProps {
//   options: string[];
//   selected: string[];
//   onChange: (value: string[]) => void;
//   placeholder?: string;
// }

// export default function MultiSelect({
//   options,
//   selected,
//   onChange,
//   placeholder = "Select Features",
// }: MultiSelectProps) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (!ref.current?.contains(event.target as Node)) {
//         setOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleOption = (option: string) => {
//     if (selected.includes(option)) {
//       onChange(selected.filter((item) => item !== option));
//     } else {
//       onChange([...selected, option]);
//     }
//   };

//   const filteredOptions = useMemo(() => {
//     const filtered = options.filter((option) =>
//       option.toLowerCase().includes(search.toLowerCase()),
//     );

//     return filtered.sort((a, b) => {
//       const aSelected = selected.includes(a);
//       const bSelected = selected.includes(b);

//       if (aSelected === bSelected) return 0;

//       return aSelected ? -1 : 1;
//     });
//   }, [options, search, selected]);

//   return (
//     <div className="relative" ref={ref}>
//       {/* Input */}

//       <div
//         onClick={() => setOpen(!open)}
//         className="flex min-h-[56px] cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3"
//       >
//         {selected.length === 0 ? (
//           <span className="text-slate-400">{placeholder}</span>
//         ) : (
//           selected.map((item) => (
//             <span
//               key={item}
//               className="flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700"
//             >
//               {item}

//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   toggleOption(item);
//                 }}
//               >
//                 <X size={14} />
//               </button>
//             </span>
//           ))
//         )}

//         <ChevronDown
//           size={18}
//           className={`ml-auto transition ${open ? "rotate-180" : ""}`}
//         />
//       </div>

//       {/* Dropdown */}

//       {open && (
//         <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl">
//           {/* Search */}

//           <div className="border-b p-3">
//             <div className="flex items-center rounded-lg border px-3">
//               <Search size={16} className="text-slate-400" />

//               <input
//                 type="text"
//                 placeholder="Search feature..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full px-2 py-2 outline-none"
//               />
//             </div>
//           </div>

//           {/* Options */}

//           <div className="max-h-60 overflow-y-auto">
//             {filteredOptions.length === 0 ? (
//               <div className="py-6 text-center text-sm text-slate-500">
//                 No feature found.
//               </div>
//             ) : (
//               filteredOptions.map((option) => {
//                 const active = selected.includes(option);

//                 return (
//                   <button
//                     key={option}
//                     type="button"
//                     onClick={() => toggleOption(option)}
//                     className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-slate-100"
//                   >
//                     <span>{option}</span>

//                     {active && <Check size={18} className="text-teal-600" />}
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select Features",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearch("");
    }
  }, [open]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter((item) => item !== option));
  };

  const filteredOptions = useMemo(() => {
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(search.toLowerCase()),
    );

    // Selected options first
    return filtered.sort((a, b) => {
      const aSelected = selected.includes(a);
      const bSelected = selected.includes(b);

      if (aSelected === bSelected) return a.localeCompare(b);

      return aSelected ? -1 : 1;
    });
  }, [options, search, selected]);

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div
        onClick={() => setOpen(!open)}
        className={`min-h-[56px] w-full rounded-xl border bg-white px-4 py-3 transition cursor-pointer ${
          open
            ? "border-teal-500 ring-2 ring-teal-100"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selected.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700"
              >
                {item}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                  className="rounded-full hover:bg-teal-200 p-0.5 transition"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}

          <ChevronDown
            size={18}
            className={`ml-auto text-slate-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown */}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search */}

          <div className="border-b border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center rounded-lg border border-slate-300 bg-white px-3">
              <Search size={18} className="text-slate-400" />

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                placeholder="Search feature..."
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none bg-transparent px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          {/* Options */}

          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No feature found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const active = selected.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition ${
                      active ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-medium">{option}</span>

                    {active && <Check size={18} className="text-teal-600" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2">
            <span className="text-xs text-slate-500">
              {selected.length} feature
              {selected.length !== 1 ? "s" : ""} selected
            </span>

            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
