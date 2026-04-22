import React, { useState } from "react";
import SenegalFlag from "./im/sn.svg";
import GwFlag from "./im/gw.svg";
import GmFlag from "./im/gm.svg";

const LanguageSelector = ({ selectedLang, onChange }) => {
  const langs = [
    { code: "fr", label: "Français", icon: <img src={SenegalFlag} alt="SN" className="w-5 h-5" /> },
    { code: "en", label: "English", icon: <img src={GmFlag} alt="GM" className="w-5 h-5" /> },
    { code: "pt", label: "Português",icon: <img src={GwFlag} alt="GB" className="w-5 h-5" /> },
  ];

  const [open, setOpen] = useState(false);
  const selected = langs.find((l) => l.code === selectedLang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border px-3 py-1 rounded bg-white"
      >
        {selected.icon}
        {selected.label}
      </button>
      {open && (
        <div className="absolute bg-green-700 text-white border rounded shadow mt-1 w-40">
          {langs.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left"
            >
              {lang.icon}
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
