"use client";

// Marco común: barra lateral fina (escritorio) o cabecera ligera (móvil) con la marca,
// la navegación, el modo piloto y «Reiniciar demo», más los avisos globales.

import { ChartColumn, Columns3, Ellipsis, Inbox, RotateCcw, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Dialogo } from "./Dialogo";
import { useNotificar } from "./Notificaciones";
import { Boton } from "./ui";

interface ItemNav {
  href: string;
  etiqueta: string;
  corta: string;
  icono: LucideIcon;
  activo: (p: string) => boolean;
}

const NAVEGACION: ItemNav[] = [
  { href: "/", etiqueta: "Embudo", corta: "Embudo", icono: Columns3, activo: (p) => p === "/" || p.startsWith("/vivienda") },
  { href: "/reformas", etiqueta: "Reformas · Reno", corta: "Reno", icono: Inbox, activo: (p) => p.startsWith("/reformas") },
  { href: "/metricas", etiqueta: "Métricas", corta: "Métricas", icono: ChartColumn, activo: (p) => p.startsWith("/metricas") },
];

/** Activa o desactiva el modo piloto y avisa del cambio. */
function useAlternarPiloto() {
  const { modoPiloto, setModoPiloto } = useStore();
  const notificar = useNotificar();
  return () => {
    setModoPiloto(!modoPiloto);
    notificar(
      modoPiloto
        ? { titulo: "Modo piloto desactivado", descripcion: "Los campos obligatorios vuelven a bloquear el avance.", tipo: "info" }
        : { titulo: "Modo piloto activado", descripcion: "Se avisa de los campos que faltan, pero se deja avanzar.", tipo: "aviso" },
    );
  };
}

function InterruptorPiloto() {
  const { modoPiloto, cargado } = useStore();
  const alternar = useAlternarPiloto();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 select-none hover:bg-crema-oscuro/60">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-tinta">Modo piloto</span>
        <span className="block text-[12px] leading-4 text-tinta-tenue">{modoPiloto ? "Avisa sin bloquear" : "Bloqueo activo"}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={modoPiloto}
        aria-label="Modo piloto"
        disabled={!cargado}
        onClick={alternar}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${modoPiloto ? "bg-ambar-borde" : "bg-borde-fuerte"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(16_41_42/0.25)] transition-transform duration-200 ease-[var(--ease-suave)] ${modoPiloto ? "translate-x-4" : ""}`}
        />
      </button>
    </label>
  );
}

function DialogoReiniciar({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { reiniciarDemo } = useStore();
  const notificar = useNotificar();
  const router = useRouter();
  return (
    <Dialogo
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="¿Reiniciar la demo?"
      descripcion="Se restauran las 8 viviendas y los 2 traspasos de ejemplo. Los cambios que hayas hecho se perderán."
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton
            onClick={() => {
              reiniciarDemo();
              onCerrar();
              router.push("/");
              notificar({ titulo: "Demo reiniciada", descripcion: "Datos de ejemplo restaurados.", tipo: "info" });
            }}
          >
            Reiniciar demo
          </Boton>
        </>
      }
    >
      <p className="text-[15px] text-tinta-suave">El modo piloto también vuelve a quedar desactivado.</p>
    </Dialogo>
  );
}

function BotonReiniciar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-tinta-suave transition-colors hover:bg-crema-oscuro/60 hover:text-tinta"
      title="Restaurar los datos de ejemplo"
    >
      <RotateCcw className="size-4 text-tinta-tenue" strokeWidth={1.75} aria-hidden />
      Reiniciar demo
    </button>
  );
}

function Marca() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-2 rounded-md">
      <span className="font-display text-[21px] leading-none font-semibold tracking-[-0.03em] text-tinta">Vistral</span>
      <span className="hidden text-[13px] font-medium text-tinta-tenue sm:inline">Supply</span>
    </Link>
  );
}

/** Menú de opciones de la demo en móvil (modo piloto y reiniciar). */
function MenuOpcionesMovil({ onReiniciar }: { onReiniciar: () => void }) {
  const { modoPiloto } = useStore();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-label="Opciones de la demo"
        className="relative flex size-10 items-center justify-center rounded-lg text-tinta-suave transition-colors hover:bg-crema-oscuro/70 hover:text-tinta"
      >
        <Ellipsis className="size-5" aria-hidden />
        {modoPiloto && <span className="absolute top-2 right-2 size-2 rounded-full bg-ambar-borde ring-2 ring-crema" aria-hidden />}
      </button>
      {abierto && (
        <div className="animar-despliegue absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-borde bg-papel p-2 shadow-elevada">
          <InterruptorPiloto />
          <div className="my-1 h-px bg-borde" />
          <BotonReiniciar
            onClick={() => {
              setAbierto(false);
              onReiniciar();
            }}
          />
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { traspasos, modoPiloto, errorGuardado } = useStore();
  const alternarPiloto = useAlternarPiloto();
  const [reiniciando, setReiniciando] = useState(false);
  const pendientes = traspasos.filter((t) => t.estado === "Pendiente de revisión").length;

  return (
    <div className="min-h-screen lg:flex">
      {/* Escritorio: barra lateral fina */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[200px] lg:shrink-0 lg:flex-col lg:px-3 lg:py-6">
        <div className="px-3">
          <Marca />
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Principal">
          {NAVEGACION.map((n) => (
            <EnlaceLateral key={n.href} item={n} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <InterruptorPiloto />
          <BotonReiniciar onClick={() => setReiniciando(true)} />
          <p className="mt-4 px-3 text-[12px] leading-4 text-tinta-tenue">Prototipo · datos ficticios</p>
        </div>
      </aside>

      {/* Móvil: cabecera ligera */}
      <header className="sticky top-0 z-40 border-b border-borde bg-crema/90 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center gap-4 pr-2 pl-4">
          <Marca />
          <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto" aria-label="Principal">
            {NAVEGACION.map((n) => (
              <EnlaceSuperior key={n.href} item={n} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0} />
            ))}
          </nav>
          <MenuOpcionesMovil onReiniciar={() => setReiniciando(true)} />
        </div>
      </header>

      <div className="min-w-0 flex-1 lg:py-2 lg:pr-2">
        <div className="min-h-[calc(100vh-56px)] bg-papel lg:min-h-[calc(100vh-16px)] lg:rounded-xl lg:border lg:border-borde">
          {modoPiloto && (
            <div className="flex items-center gap-3 border-b border-ambar-borde/70 bg-ambar-claro px-4 py-2 text-sm text-ambar sm:px-6 lg:rounded-t-xl lg:px-8">
              <span className="size-2 shrink-0 rounded-full bg-ambar-borde" aria-hidden />
              <p className="min-w-0 flex-1">
                <strong className="font-semibold">Modo piloto.</strong>
                <span className="sm:hidden"> Avisa pero no bloquea.</span>
                <span className="hidden sm:inline"> Los campos obligatorios avisan pero no bloquean; cada avance con campos pendientes queda registrado.</span>
              </p>
              <button type="button" onClick={alternarPiloto} className="shrink-0 rounded font-semibold underline decoration-ambar/40 underline-offset-2 hover:decoration-ambar">
                Desactivar
              </button>
            </div>
          )}
          {errorGuardado && (
            <p className="border-b border-ladrillo/20 bg-ladrillo-claro px-4 py-2 text-sm text-ladrillo-oscuro sm:px-6 lg:px-8">
              Este navegador no permite guardar datos: la demo funciona, pero los cambios se perderán al recargar la página.
            </p>
          )}
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
        </div>
      </div>

      <DialogoReiniciar abierto={reiniciando} onCerrar={() => setReiniciando(false)} />
    </div>
  );
}

function EnlaceLateral({ item, activo, contador }: { item: ItemNav; activo: boolean; contador: number }) {
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={`flex h-9 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150 ${
        activo ? "bg-papel text-tinta shadow-[0_0_0_1px_var(--color-borde)]" : "text-tinta-suave hover:bg-crema-oscuro/60 hover:text-tinta"
      }`}
    >
      <Icono className={`size-4 shrink-0 ${activo ? "text-tinta" : "text-tinta-tenue"}`} strokeWidth={1.75} aria-hidden />
      <span className="flex-1 truncate">{item.etiqueta}</span>
      {contador > 0 && (
        <span className="text-[13px] font-semibold text-ladrillo tabular-nums" aria-label={`${contador} pendientes de revisión`}>
          {contador}
        </span>
      )}
    </Link>
  );
}

function EnlaceSuperior({ item, activo, contador }: { item: ItemNav; activo: boolean; contador: number }) {
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={`relative flex h-14 shrink-0 items-center gap-1 text-[15px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full ${
        activo ? "text-tinta after:bg-tinta" : "text-tinta-tenue after:bg-transparent hover:text-tinta"
      }`}
    >
      {item.corta}
      {contador > 0 && (
        <span className="text-[12px] font-semibold text-ladrillo tabular-nums" aria-label={`${contador} pendientes de revisión`}>
          {contador}
        </span>
      )}
    </Link>
  );
}
