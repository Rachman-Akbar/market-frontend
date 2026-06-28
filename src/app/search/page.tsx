import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <SearchClient />
    </Suspense>
  );
}
