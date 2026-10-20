"use client";

// Campo de fotos: lista de URLs con miniaturas, alta por URL o con una imagen de ejemplo.

import { ImageOff, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { FOTOS_EJEMPLO } from "@/lib/seed";
import { esUrlImagenValida } from "@/lib/validation";
import { CLASE_INPUT } from "../ui";

interface Props {
  id: string;
  valor: string[];
  onCambio: (v: string[]) => void;
  minimo?: number;
  soloLectura?: boolean;
}

export function CampoFotos({ id, valor, onCambio, minimo = 1, soloLectura = false }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function anadir(nueva: string) {
    const limpia = nueva.trim();
    if (!esUrlImagenValida(limpia)) {
      setError("Pega una URL que empiece por http:// o https://");
      return;
    }
    if (valor.includes(limpia)) {
      setError("Esa foto ya está añadida");
      return;
    }
    onCambio([...valor, limpia]);
    setUrl("");
    setError(null);
  }

  const siguienteEjemplo = FOTOS_EJEMPLO.find((f) => !valor.includes(f));

  return (
    <div>
      {valor.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {valor.map((foto, i) => (
            <li key={foto} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-crema-oscuro ring-1 ring-tinta/5 ring-inset">
              <Miniatura url={foto} alt={`Foto ${i + 1}`} />
              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => onCambio(valor.filter((f) => f !== foto))}
                  className="absolute top-2 right-2 rounded-md bg-tinta/75 p-1 text-white opacity-90 backdrop-blur-sm transition hover:bg-tinta sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  aria-label={`Quitar foto ${i + 1}`}
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
          {!soloLectura &&
            Array.from({ length: Math.max(0, minimo - valor.length) }, (_, i) => (
              <li key={`hueco-${i}`} className="flex aspect-[4/3] items-center justify-center gap-2 rounded-lg border border-dashed border-borde-fuerte text-[13px] font-medium text-ladrillo">
                <span className="size-1.5 rounded-full bg-ladrillo" aria-hidden />
                Falta foto
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-borde-fuerte px-4 py-6 text-sm text-tinta-tenue">
          <ImagePlus className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
          {soloLectura ? "Sin fotos" : `Todavía no hay fotos. Añade al menos ${minimo}.`}
        </div>
      )}

      {!soloLectura && (
        <div className="mt-3 flex gap-2">
          <input
            id={id}
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                anadir(url);
              }
            }}
            placeholder="https://… (URL de la imagen)"
            className={`${CLASE_INPUT} min-w-0 flex-1`}
            aria-invalid={Boolean(error)}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => anadir(url)}
            disabled={!url.trim()}
            className="h-10 shrink-0 rounded-lg border border-borde-fuerte bg-white px-4 text-sm font-semibold text-tinta transition-colors hover:border-[#c2b79f] hover:bg-crema/60 disabled:cursor-not-allowed disabled:text-tinta-tenue disabled:hover:border-borde-fuerte disabled:hover:bg-white"
          >
            Añadir
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-[13px] font-medium text-ladrillo">{error}</p>}
      {!soloLectura && siguienteEjemplo && (
        <button
          type="button"
          onClick={() => anadir(siguienteEjemplo)}
          className="mt-2 -ml-2 inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm font-medium text-tinta-suave transition-colors hover:bg-crema-oscuro/70 hover:text-tinta"
        >
          <ImagePlus className="size-4" strokeWidth={1.75} aria-hidden />
          Añadir una foto de ejemplo
        </button>
      )}
    </div>
  );
}

function Miniatura({ url, alt }: { url: string; alt: string }) {
  const [fallo, setFallo] = useState(false);
  if (fallo)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-[12px] text-tinta-tenue">
        <ImageOff className="size-5" strokeWidth={1.75} aria-hidden />
        No se pudo cargar la imagen
      </div>
    );
  return <img src={url} alt={alt} loading="lazy" onError={() => setFallo(true)} className="h-full w-full object-cover" />;
}
