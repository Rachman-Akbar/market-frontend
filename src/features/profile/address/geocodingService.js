function cleanRegency(value = "") {
  return String(value).replace(/\b(Kabupaten|Regency)\b/gi, "").trim();
}

export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    addressdetails: "1",
    "accept-language": "id",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Data wilayah tidak dapat diambil.");
  const data = await response.json();
  const address = data.address || {};
  const rawCity = address.city || address.town || address.municipality || "";
  const rawDistrict = address.district || address.suburb || address.city_district || "";
  const rawCounty = address.county || "";
  const cityOrRegency = rawCity && !rawDistrict && rawCounty ? cleanRegency(rawCounty) : cleanRegency(rawCity || rawCounty);
  const district = rawCity && !rawDistrict && rawCounty ? rawCity : rawDistrict || rawCity;

  return {
    country: address.country || "Indonesia",
    province: address.state || address.region || "",
    cityOrRegency,
    district,
    subdistrict: address.village || address.neighbourhood || address.hamlet || address.suburb || "",
    postalCode: address.postcode || "",
    fullAddress: data.display_name || "",
  };
}
