import { useState } from "react";

const IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbbKM63b15wFd7KUmjUHSfSkWrvRFPHs6SbgIcPkVRQ851G9XSXcemjfhb7ODXqfzCoPAksPwYy-z1sGxFuI7IbfxnaIhBSHmj1WgPp6trQpAI31_fISNvN1lkNOKt-itYU2ZTcJZkI2-TNpJMExWNLe4_5DWfans0iWmdZX97mkbSRpnNS2PV4FLeyi2TH3XTm106o10cSx-cyeCuPPghyPynUrdyRU1xel2ow3vtvbfoyn72PYEmR9qa4iFkHZ4gDe1e-0l8B-tK",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBYZZuLIlB3v4et4MRykhJk0cpMiREjHZzRUxu1-_fbskI9pL--WGRP1l54m0wYmG5UkpRj3vct4ffHSjKvLEhHfH_NXuzOpRsVYtqk3zBsGyovnIj1alSU5e9TWt7lWZ3gujNIbfMVNqR8YjXYEU7LVLTvIGk60knfwFgisIObDJ29N1HMkPSiOQM3wje4xrwMADBXBUd2botJHOS24uzUgl1Y7s0rUfnR1iYilNZ8JAFYfxpJsZ9V62atdUv8lxXnLfEhe4EjisfE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuClEJBp5Ci3V4TUSNMOga2SQYQpV6xA77-Pg1gPr23xbWU-tVBSkRRlqWJC2K0mKw2JkmVXWK0cVUyVpgRU14rtu5IPRyFeP1JlePYHvNHkp9-obXtxvd-h3smMZwq4T-JoY5Rjolb_matnL4dtcW_ib2-bzsE8vbLjt1P2XF6BlQ6mgs857n9fUGQ_hVWcYBilbOqPXKva6Byjtreg72p-MFXpymPKMK5gCqZrafeJ5-R0RXif63TVKmmDCM8sNiHZwYEjg8ztcciW",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBypwYOI4Gd1Je9Ulix3cp8pU6pU1mhqXO8W2WKVVWn5vV0Fwa5Z_va7X0v5BM2p8lm5sHZW6n7VfE8erszjZ2cdbIxhr0aAaoQwVEBJrbLtK3nlzlQmXKGZUrVfsjawA995FqSASHejuThPeE4Hg-E6ZvvF3gUSNMbMV1uFHWQUXboP9t78Ii1GwzLbH4WyIXdGussUxKkUT31j7WvdCKZbqGHs2Eu-Jl9Ac_ghJuqWMPZzYGbVZp2E2i7wmcfs9qfZHfAlRiNaAC7",
];

export function ImageGallery() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a - 1 + IMAGES.length) % IMAGES.length);
  const next = () => setActive((a) => (a + 1) % IMAGES.length);

  return (
    <div className="sticky top-20">
      
      <div className="relative overflow-hidden border border-gray-200 mb-3 aspect-square" style={{ borderRadius: 5 }}>
        <img
          src={IMAGES[active]}
          alt="Product"
          className="w-full h-full object-cover transition-opacity duration-200"
        />
        
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-all"
          style={{ borderRadius: 5 }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-all"
          style={{ borderRadius: 5 }}
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? "bg-[#03ac0e] w-3" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>

      
      <div className="flex gap-2">
        {IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`overflow-hidden border-2 flex-1 transition-all ${i === active ? "border-[#03ac0e]" : "border-gray-200 hover:border-gray-400"}`}
            style={{ borderRadius: 5 }}
          >
            <img src={img} alt={`Thumb ${i + 1}`} className="w-full aspect-square object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
