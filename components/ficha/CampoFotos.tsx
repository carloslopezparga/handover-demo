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
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {valor.map((foto, i) => (
            <li key={foto} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-borde bg-crema-oscuro">
              <Miniatura url={foto} alt={`Foto ${i + 1}`} />
              {!soloLectura && (
                <button
                  type="button"
                  onClick={() => onCambio(valor.filter((f) => f !== foto))}
                  className="absolute top-1.5 right-1.5 rounded-full bg-tinta/80 p-1.5 text-white opacity-90 transition hover:bg-tinta sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                  aria-label={`Quitar foto ${i + 1}`}
                >
                  <X className="size-4" />
                </button>
              )}
            </li>
          ))}
          {!soloLectura &&
            Array.from({ length: Math.max(0, minimo - valor.length) }, (_, i) => (
              <li key={`hueco-${i}`} className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-ladrillo/35 text-sm font-medium text-ladrillo/80">
                Falta foto
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-borde-fuerte px-4 py-5 text-[15px] text-tinta-tenue">
          <ImagePlus className="size-5 shrink-0" aria-hidden />
          {soloLectura ? "Sin fotos" : `Todavía no hay fotos. Añade al menos ${minimo}.`}
        </div>
      )}

      {!soloLectura && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
            className={CLASE_INPUT}
            aria-invalid={Boolean(error)}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => anadir(url)}
              disabled={!url.trim()}
              className="shrink-0 rounded-lg border border-borde-fuerte bg-white px-4 py-2.5 text-[15px] font-semibold text-tinta hover:bg-crema disabled:cursor-not-allowed disabled:text-tinta-tenue"
            >
              Añadir
            </button>
            {siguienteEjemplo && (
              <button
                type="button"
                onClick={() => anadir(siguienteEjemplo)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-[15px] font-medium text-salvia hover:bg-salvia-claro"
              >
                <ImagePlus className="size-4" aria-hidden />
                Foto de ejemplo
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-sm font-medium text-ladrillo">{error}</p>}
    </div>
  );
}

function Miniatura({ url, alt }: { url: string; alt: string }) {
  const [fallo, setFallo] = useState(false);
  if (fallo)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-center text-[13px] text-tinta-tenue">
        <ImageOff className="size-5" aria-hidden />
        No se pudo cargar la imagen
      </div>
    );
  return <img src={url} alt={alt} loading="lazy" onError={() => setFallo(true)} className="h-full w-full object-cover" />;
}
