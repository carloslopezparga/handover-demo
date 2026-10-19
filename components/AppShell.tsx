"use client";

// Cabecera común (marca, navegación, modo piloto, reiniciar demo) y avisos globales.

import { RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Dialogo } from "./Dialogo";
import { useNotificar } from "./Notificaciones";
import { Boton } from "./ui";

const NAVEGACION = [
  { href: "/", etiqueta: "Embudo", activo: (p: string) => p === "/" || p.startsWith("/vivienda") },
  { href: "/reformas", etiqueta: "Reformas · Reno", activo: (p: string) => p.startsWith("/reformas") },
  { href: "/metricas", etiqueta: "Métricas", activo: (p: string) => p.startsWith("/metricas") },
];

function InterruptorPiloto() {
  const { modoPiloto, setModoPiloto, cargado } = useStore();
  const notificar = useNotificar();
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-[14px] font-medium text-crema/90">
      <span className="hidden sm:inline">Modo piloto</span>
      <span className="sm:hidden">Piloto</span>
      <button
        type="button"
        role="switch"
        aria-checked={modoPiloto}
        aria-label="Modo piloto"
        disabled={!cargado}
        onClick={() => {
          setModoPiloto(!modoPiloto);
          notificar(
            modoPiloto
              ? { titulo: "Modo piloto desactivado", descripcion: "Los campos obligatorios vuelven a bloquear el avance.", tipo: "info" }
              : { titulo: "Modo piloto activado", descripcion: "Se avisa de los campos que faltan, pero se deja avanzar.", tipo: "aviso" },
          );
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crema ${
          modoPiloto ? "bg-ambar-borde" : "bg-white/25"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${modoPiloto ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

function BotonReiniciar() {
  const { reiniciarDemo } = useStore();
  const notificar = useNotificar();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-crema/60 transition-colors hover:bg-white/10 hover:text-crema"
        title="Restaurar los datos de ejemplo"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        <span className="hidden lg:inline">Reiniciar demo</span>
        <span className="sr-only lg:hidden">Reiniciar demo</span>
      </button>
      <Dialogo
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="¿Reiniciar la demo?"
        descripcion="Se restauran las 8 viviendas y los 2 traspasos de ejemplo. Los cambios que hayas hecho se perderán."
        pie={
          <>
            <Boton variante="secundario" onClick={() => setAbierto(false)}>
              Cancelar
            </Boton>
            <Boton
              onClick={() => {
                reiniciarDemo();
                setAbierto(false);
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
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { traspasos, modoPiloto, errorGuardado } = useStore();
  const pendientes = traspasos.filter((t) => t.estado === "Pendiente de revisión").length;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-tinta text-crema shadow-[0_1px_0_rgb(255_255_255/0.06)]">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-crema text-[15px] font-bold text-tinta" aria-hidden>
              V
            </span>
            <span className="text-[15px] font-semibold tracking-tight sm:text-[17px]">
              Vistral · Supply <span className="text-[13px] font-normal text-crema/60 sm:text-[17px]">(prototipo)</span>
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
            {NAVEGACION.map((n) => (
              <EnlaceNav key={n.href} href={n.href} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0}>
                {n.etiqueta}
              </EnlaceNav>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden lg:block">
              <BotonReiniciar />
            </div>
            <InterruptorPiloto />
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2 lg:hidden">
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="Principal móvil">
            {NAVEGACION.map((n) => (
              <EnlaceNav key={n.href} href={n.href} activo={n.activo(pathname)} contador={n.href === "/reformas" ? pendientes : 0}>
                {n.etiqueta}
              </EnlaceNav>
            ))}
          </nav>
          <BotonReiniciar />
        </div>
      </header>

      {modoPiloto && (
        <div className="border-b border-ambar-borde bg-ambar-claro text-ambar">
          <div className="mx-auto flex max-w-[1600px] items-center gap-2.5 px-4 py-2.5 text-[15px] sm:px-6">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            <p>
              <strong className="font-semibold">Modo piloto activado:</strong> los campos obligatorios avisan pero no bloquean. Cada avance con campos pendientes queda
              registrado.
            </p>
          </div>
        </div>
      )}
      {errorGuardado && (
        <div className="border-b border-ladrillo/30 bg-ladrillo-claro text-ladrillo-oscuro">
          <p className="mx-auto max-w-[1600px] px-4 py-2.5 text-[15px] sm:px-6">
            Este navegador no permite guardar datos: la demo funciona, pero los cambios se perderán al recargar la página.
          </p>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

function EnlaceNav({ href, activo, contador, children }: { href: string; activo: boolean; contador: number; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[15px] font-medium transition-colors ${
        activo ? "bg-white/12 text-crema" : "text-crema/70 hover:bg-white/6 hover:text-crema"
      }`}
    >
      {children}
      {contador > 0 && (
        <span className="min-w-5 rounded-full bg-ladrillo px-1.5 text-center text-[12px] font-bold leading-5 text-white" aria-label={`${contador} pendientes`}>
          {contador}
        </span>
      )}
    </Link>
  );
}
