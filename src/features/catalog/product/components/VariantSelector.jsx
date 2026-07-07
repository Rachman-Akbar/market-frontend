import { useState } from "react";

const COLORS = [
  { label: "PHOENIX Citroen", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzYLFV-Ikesk5is6sNCoehk50faWrmlcmVPpSRzOBgqXMH0UkAawfcDEVH00oSvtrBr_vM6-Hh7g8yExfXoN-eRDaNAgNiwfF7d_CX32SznWac_MM_1eM-NCPd8HftC9MR7UoII4bcuNzfgD91VsQJQ0StUJivEoEZcWQ3cmOt1FDPZo47H-elv61LWgM3_GGBMLK4lXL9EQx8DKDx4yzRp-WC_9PQdTg3npje2_OQKb8b_q4IEPTqifdE81IuaKKV0rrxNW_wdrDk" },
  { label: "PHOENIX Putih hijau", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL1UN5dDSi_R0poJYHD-7OrINEqeWAaaoT9jnoxpotyo1Rmfpp4RY4cp1jAkrKhxoMZkOgOtDIl7S6da_btzUNaoZLiK8_lpG7MIBEc2g4-Wlc9LCnejIwwJ2W3W2qUy__t5SkCfGRDRZOf2p3KHT1b822SSyyUlK_Ya7vayGtiRflHcD5dIszsLet3-AgUs8ssVHaJ9Bs5xKAvSHmq7bTZa0Qjr2Udh7RMnHdaLGhbjwhIjV4yBNq4pXZDZWEjz4tWub_rRDZDsHo" },
  { label: "PHOENIX Tosca", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyklriGeH4R9WwoB7LNYFHFM1wRSCIVn-omKxOIJ9KyxPDrMEURCxHpneGKR82VTyoVAKpeobVrESCstKpuIgCAGprIyzSEbP8r_TiA3Pj-5pvAKMr_86kv5YkVlihQFC8L1i0oCidCNJnTZIXM6I3UuPbHcmD06rsSftS2TWxKN4znO3PL4K1PMCD7pv8eKpcoGkX8C9-GIdEmBqPOQC7vPe058tnQkke6yCWkqcCVtP3kJNWvGe0q0rs-_cltkpG64gYsVX3Jgv-" },
  { label: "PHOENIX putih Abu", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjmJAGjx9hncOOpjne7usZd1eDgY7oZ8RRKP2WfxG96q59ejwgygdU8-DSZKplZ39mieoomA5R1_pGEsn8mTdW890QD_ePrU_RR12bmrWw6J8DFVVsupBU_ReXlMLtsV6neR7vNEIqqAZEdchomqwNbxXZh9C5Oxlh0szA3fsLJZfQW1WU4lJyGZRQbn7eWmwsngI140r0ozrkSROgEkk6QVY-E68DldVqrXcIUs8HITY8tqBOeh9oQuUmd8nnqT9ZKyXm8ZpMPHnL" },
  { label: "PHOENIX skyblue", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlfeghD3nRKUkHJCHKtEGv2JqGix0SBZVmWBY6CT-ArX7YbAda9Pg6x4vNOFn_VfrWGQodOI9iY6Hy5Qe6cdCpjYHmGNe2oIfdlmO8o8WvzCGI-9FpVUGtS5R7kLHaO0kPKqtUpkCyc7bV7dNrPHCoHM5QPs5N9rMAtY1yEm2vXrEojmSGSrJhO2LK2kXNZLTkzDPVKhBigq3lr5unlexaRPnkEYcoWUxIeocMFXOQYlqMKLwCCT-vXz1jiqmi17CjUA9qRL2SIrYx" },
  { label: "PHOENIX hitam biru", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkiaySbY-qHMA_zta6UP5NmQ8UuwlvvNMgwdcZx1pm8mOm9ImvG4zF2hz6thfLXhlhA6HnPEbrCJNfXrvFTqVPmVEtAtC1_yrbdFD_TFxJ5ZFAFGR-WWzXwLegn9NIUQb7J8XEWvP2UJoumP15yF-K_M6mQqnv7a_vPOfMNIv6-lN0UDI1A5jd_7YZm2XMfngsw6H8f68Yd1VXCbQZiEYAp5xG4rb8iKF97RnlZ0vuZq7DTmCZHsfl43tVAviH8tT6QTIlB_uBX2f4" },
  { label: "PHOENIX hitam polos", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWe3eVFaCWHUNFihjPsHkFj59pg8qtdeL-1_z5gdqWrYrjL8lk1jzVH7m-QORf5C57EHYITQVApTUs6AFVJK3M0jAD_3hl1EI5V5eItV4Kjq7DcQeUztNVVzEUJ1Mu8ZYKDVFd-pa2z0lOD-o_gc7V8nH5tCjdawfMFtQ84UagMcrepk4nEST-xOy8djxCL58CjW1hHbf735yuZkA0KffFvSm6CZaxZao-BRsQEQbuTVPkheYnhSokrexIHQechhAdZLZDElQEK9XJ", disabled: true },
  { label: "PHOENIX hitam gold", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCn2Qy4vpT1Wvay0fb-zSX_USuP0oDfvQuRuGjPJchj1BNBxvljk-teiaNs3bkQ1FgsFNMnthbpRwBaF8sMvLQD9TptwlKtprA_iDbwIsw4iuDaXudYn4uQYAv1VW-XEd3qe3CQiAH0ATEVY3AsBJ3uKO2lFH3Z6llCgkuCQxny9upe1fs5BRFwBifOjNps6P9eqDNlKHM4PdcWCE2UCsb7JJ0Ahm0UcxV80GOOABSl1xCxebmlbtx8kjM_SPA7W5L9Yjq2DxI-01Z-" },
];

const SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

export function VariantSelector() {
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState(1);

  return (
    <>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">
            Pilih warna:{" "}
            <span className="text-gray-500 font-normal ml-1">{COLORS[activeColor].label}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COLORS.map((c, i) => (
            <button
              key={c.label}
              onClick={() => !c.disabled && setActiveColor(i)}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 text-left ${
                i === activeColor
                  ? "border-[#03ac0e] bg-[#e5f9e7]"
                  : "border-gray-200 hover:border-gray-400"
              } ${c.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <img
                src={c.img}
                alt={c.label}
                className={`w-8 h-8 rounded-md ${c.disabled ? "opacity-50" : ""}`}
              />
              <span className={`text-xs font-semibold ${i === activeColor ? "text-[#03ac0e]" : "text-gray-500"}`}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">
            Pilih ukuran:{" "}
            <span className="text-gray-500 font-normal ml-1">{SIZES[activeSize]}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s, i) => (
            <button
              key={s}
              onClick={() => setActiveSize(i)}
              className={`min-w-[44px] h-11 px-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
                i === activeSize
                  ? "border-[#03ac0e] bg-[#e5f9e7] text-[#03ac0e] font-bold"
                  : "border-gray-200 hover:border-[#03ac0e]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
