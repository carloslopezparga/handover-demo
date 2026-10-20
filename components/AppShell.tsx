"use client";

// Marco común: barra lateral en tinta oscura (escritorio) o cabecera oscura (móvil) con la
// marca, la navegación, el modo piloto y «Reiniciar demo», más los avisos globales.

import { ChartColumn, Columns3, Ellipsis, Inbox, RotateCcw, TriangleAlert, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Dialogo } from "./Dialogo";
import { olvidarLlegada } from "./movimiento";
import { useNotificar } from "./Notificaciones";
import { Boton } from "./ui";

interface ItemNav {
  href: string;
  etiqueta: string;
  icono: LucideIcon;
  activo: (p: string) => boolean;
}

const NAVEGACION: ItemNav[] = [
  { href: "/", etiqueta: "Embudo", icono: Columns3, activo: (p) => p === "/" || p.startsWith("/vivienda") },
  { href: "/reformas", etiqueta: "Reformas", icono: Inbox, activo: (p) => p.startsWith("/reformas") },
  { href: "/metricas", etiqueta: "Métricas", icono: ChartColumn, activo: (p) => p.startsWith("/metricas") },
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
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 select-none transition-colors hover:bg-white/[0.06]">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-white">Modo piloto</span>
        <span className={`block text-[12px] leading-4 transition-colors ${modoPiloto ? "text-piloto-claro" : "text-white/60"}`}>{modoPiloto ? "Avisa sin bloquear" : "Bloqueo activo"}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={modoPiloto}
        aria-label="Modo piloto"
        disabled={!cargado}
        onClick={alternar}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${modoPiloto ? "bg-piloto" : "bg-pizarra"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(11_18_32/0.4)] transition-transform duration-200 ease-[var(--ease-suave)] ${modoPiloto ? "translate-x-4" : ""}`}
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
              olvidarLlegada();
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
      <p className="text-[15px] text-secundario">El modo piloto también vuelve a quedar desactivado.</p>
    </Dialogo>
  );
}

function BotonReiniciar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
      title="Restaurar los datos de ejemplo"
    >
      <RotateCcw className="size-4 text-white/60 transition-transform duration-300 group-hover:-rotate-45 group-hover:text-white" aria-hidden />
      Reiniciar demo
    </button>
  );
}

/** Marca: símbolo azul (casa con flecha de traspaso) + «Traspaso · Supply». */
function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-lg whitespace-nowrap" aria-label="Traspaso · Supply, ir al embudo">
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-azul" />
        <path d="M8.5 14.5 16 8.5l7.5 6V23.5h-15z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12.5 18.5h7m-2.5-2.5 2.5 2.5-2.5 2.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`items-baseline gap-1.5 ${compacta ? "hidden sm:inline-flex" : "inline-flex"}`}>
        <span className="font-display text-[18px] leading-none font-semibold tracking-[-0.01em] text-white">Traspaso</span>
        <span className="text-[13px] font-medium text-white/60">· Supply</span>
      </span>
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
        className="relative flex size-10 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <Ellipsis className="size-5" aria-hidden />
        {modoPiloto && <span className="absolute top-2 right-2 size-2 rounded-full bg-piloto ring-2 ring-tinta" aria-hidden />}
      </button>
      {abierto && (
        <div className="animar-despliegue absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-tinta-2 bg-tinta p-2 shadow-flotante">
          <InterruptorPiloto />
          <div className="my-1 h-px bg-tinta-2" />
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
      {/* Escritorio: barra lateral oscura */}
      <aside className="sobre-oscuro hidden bg-tinta lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[216px] lg:shrink-0 lg:flex-col lg:px-3 lg:py-5 2xl:w-[240px]">
        <div className="px-2 pt-1">
          <Marca />
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Principal">
          {NAVEGACION.map((n) => (
            <EnlaceLateral key={n.href} item={n} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <p className="mb-1 px-3 text-[12px] font-medium text-white/60">Opciones de la demo</p>
          <InterruptorPiloto />
          <BotonReiniciar onClick={() => setReiniciando(true)} />
          <p className="mt-4 border-t border-tinta-2 px-3 pt-4 text-[12px] leading-4 text-white/60">Prototipo · datos ficticios</p>
        </div>
      </aside>

      {/* Móvil: cabecera oscura */}
      <header className="sobre-oscuro sticky top-0 z-40 bg-tinta lg:hidden">
        <div className="flex h-14 items-center gap-3 pr-2 pl-4 sm:gap-6">
          <Marca compacta />
          <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto sm:gap-6" aria-label="Principal">
            {NAVEGACION.map((n) => (
              <EnlaceSuperior key={n.href} item={n} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0} />
            ))}
          </nav>
          <MenuOpcionesMovil onReiniciar={() => setReiniciando(true)} />
        </div>
      </header>

      <div className="min-w-0 flex-1">
        {modoPiloto && (
          <div className="animar-despliegue flex items-center gap-3 border-b border-piloto/25 bg-piloto-claro px-4 py-2 text-sm text-piloto sm:px-6 2xl:px-12">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <strong className="font-semibold">Modo piloto.</strong>
              <span className="sm:hidden"> Avisa pero no bloquea.</span>
              <span className="hidden sm:inline"> Los campos obligatorios avisan pero no bloquean; cada avance con campos pendientes queda registrado.</span>
            </p>
            <button type="button" onClick={alternarPiloto} className="shrink-0 rounded font-semibold underline decoration-piloto/40 underline-offset-2 transition-colors hover:decoration-piloto">
              Desactivar
            </button>
          </div>
        )}
        {errorGuardado && (
          <p className="border-b border-borde bg-fondo-2 px-4 py-2 text-sm text-pizarra sm:px-6 2xl:px-12">
            Este navegador no permite guardar datos: la demo funciona, pero los cambios se perderán al recargar la página.
          </p>
        )}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:py-10 2xl:px-12">{children}</main>
      </div>

      <DialogoReiniciar abierto={reiniciando} onCerrar={() => setReiniciando(false)} />
    </div>
  );
}

function Contador({ n }: { n: number }) {
  return (
    <span
      key={n}
      className="animar-pop inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-azul px-1.5 text-[12px] leading-none font-semibold text-white tabular-nums"
      aria-label={`${n} pendientes de revisión`}
    >
      {n}
    </span>
  );
}

function EnlaceLateral({ item, activo, contador }: { item: ItemNav; activo: boolean; contador: number }) {
  const Icono = item.icono;
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150 ${
        activo ? "bg-azul/20 text-white" : "text-white/75 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span
        className={`absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r-full bg-azul transition-[opacity,transform] duration-200 ${activo ? "opacity-100" : "scale-y-0 opacity-0"}`}
        aria-hidden
      />
      <Icono className={`size-4 shrink-0 transition-colors ${activo ? "text-azul-claro" : "text-white/60"}`} aria-hidden />
      <span className="flex-1 truncate">{item.etiqueta}</span>
      {contador > 0 && <Contador n={contador} />}
    </Link>
  );
}

function EnlaceSuperior({ item, activo, contador }: { item: ItemNav; activo: boolean; contador: number }) {
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={`relative flex h-14 shrink-0 items-center gap-1.5 text-[14px] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors sm:text-[15px] ${
        activo ? "text-white after:bg-azul" : "text-white/70 after:bg-transparent hover:text-white"
      }`}
    >
      {item.etiqueta}
      {contador > 0 && <Contador n={contador} />}
    </Link>
  );
}
