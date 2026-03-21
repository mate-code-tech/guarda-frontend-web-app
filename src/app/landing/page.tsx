"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mic,
  Database,
  Brain,
  Heart,
  ArrowRight,
  Pill,
  CircleCheck,
  MessageCircle,
  Users,
  Stethoscope,
  HandHeart,
} from "lucide-react";
import { Orb } from "@/components/Orb";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const STEPS = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Hablá con Guarda",
    description:
      "Decile qué medicamentos tomás usando tu voz. Sin formularios, sin escribir.",
  },
  {
    number: "02",
    icon: Database,
    title: "Analizamos tus medicamentos",
    description:
      "Comparamos cada combinación contra bases de datos oficiales y validamos con inteligencia artificial.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Recibí tu análisis",
    description:
      "Te mostramos las interacciones detectadas con nivel de riesgo y recomendaciones claras.",
  },
];

const FEATURES = [
  {
    icon: Database,
    title: "Datos oficiales + IA",
    description:
      "Cruzamos bases de datos farmacológicas oficiales con inteligencia artificial. Ambas trabajan juntas para darte el análisis más completo.",
  },
  {
    icon: Brain,
    title: "Doble verificación",
    description:
      "La IA enriquece los datos oficiales con contexto y recomendaciones específicas para cada combinación.",
  },
  {
    icon: Mic,
    title: "Interfaz por voz",
    description:
      "Pensado para personas mayores. Solo hablá, Guarda se encarga del resto.",
  },
  {
    icon: ShieldCheck,
    title: "Privado y seguro",
    description:
      "No almacenamos datos personales. Tu consulta es anónima y se procesa en tiempo real.",
  },
];

const AUDIENCE = [
  {
    icon: Users,
    label: "Personas mayores",
    description: "Que toman varios medicamentos a diario",
  },
  {
    icon: HandHeart,
    label: "Cuidadores",
    description: "Que administran medicación de otros",
  },
  {
    icon: Stethoscope,
    label: "Cualquier persona",
    description: "Con dudas sobre combinaciones",
  },
];

const NAV_LINKS = [
  { href: "#diferenciador", label: "Por qué Guarda" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#features", label: "Ventajas" },
  { href: "#para-quien", label: "Para quién" },
];

function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else if (href === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---- Animated phone mockup simulating app flow ---- */

import type { OrbState } from "@/components/Orb";

type MockStep = "greeting" | "listening" | "thinking" | "medications" | "results";

const MOCK_FLOW: { step: MockStep; orbState: OrbState; duration: number }[] = [
  { step: "greeting", orbState: "speaking", duration: 3000 },
  { step: "listening", orbState: "listening", duration: 3500 },
  { step: "thinking", orbState: "thinking", duration: 2000 },
  { step: "medications", orbState: "speaking", duration: 3000 },
  { step: "thinking", orbState: "thinking", duration: 1500 },
  { step: "results", orbState: "idle", duration: 4000 },
];

const screenTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35 },
};

function PhoneMockup() {
  const [flowIndex, setFlowIndex] = useState(0);
  const current = MOCK_FLOW[flowIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlowIndex((prev) => (prev + 1) % MOCK_FLOW.length);
    }, current.duration);
    return () => clearTimeout(timer);
  }, [flowIndex, current.duration]);

  return (
    <div className="relative mx-auto w-[260px] md:w-[280px]">
      <div className="rounded-[36px] border-[6px] border-gray-900 bg-white p-3 shadow-2xl shadow-purple-200/40">
        <div className="mx-auto mb-3 h-[6px] w-20 rounded-full bg-gray-900" />
        {/* Screen — fixed height so phone doesn't resize */}
        <div className="flex h-[340px] flex-col items-center rounded-[24px] bg-white px-4 pt-5">
          <AnimatePresence mode="wait">
            {/* ---- GREETING ---- */}
            {current.step === "greeting" && (
              <motion.div
                key="greeting"
                className="flex flex-1 flex-col items-center justify-center gap-4"
                {...screenTransition}
              >
                <Orb size="small" state={current.orbState} />
                <p className="text-center text-[11px] text-gray-500">
                  Hola, contame qué medicamentos tomás.
                </p>
              </motion.div>
            )}

            {/* ---- LISTENING ---- */}
            {current.step === "listening" && (
              <motion.div
                key="listening"
                className="flex flex-1 flex-col items-center justify-center gap-4"
                {...screenTransition}
              >
                <Orb size="small" state={current.orbState} />
                <p className="text-center text-[10px] font-medium text-purple-400">
                  Escuchando...
                </p>
                <motion.p
                  className="text-center text-[11px] text-purple-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  &quot;Tomo ibuprofeno, enalapril y metformina&quot;
                </motion.p>
              </motion.div>
            )}

            {/* ---- THINKING ---- */}
            {current.step === "thinking" && (
              <motion.div
                key={`thinking-${flowIndex}`}
                className="flex flex-1 flex-col items-center justify-center gap-4"
                {...screenTransition}
              >
                <Orb size="small" state={current.orbState} />
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Procesando...</p>
              </motion.div>
            )}

            {/* ---- MEDICATIONS ---- */}
            {current.step === "medications" && (
              <motion.div
                key="medications"
                className="flex w-full flex-1 flex-col items-center gap-3 pt-2"
                {...screenTransition}
              >
                <Orb size="small" state={current.orbState} />
                <p className="text-center text-[10px] text-gray-500">
                  Encontré tus medicamentos
                </p>
                <div className="flex w-full flex-col gap-1.5">
                  {["Ibuprofeno", "Enalapril", "Metformina"].map((med, i) => (
                    <motion.div
                      key={med}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500">
                        <Pill className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="flex-1 text-[10px] font-semibold text-gray-800">
                        {med}
                      </span>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.2 + 0.3 }}
                      >
                        <CircleCheck className="h-3 w-3 text-green-500" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---- RESULTS ---- */}
            {current.step === "results" && (
              <motion.div
                key="results"
                className="flex w-full flex-1 flex-col items-center gap-3 pt-2"
                {...screenTransition}
              >
                <Orb size="small" state={current.orbState} />
                <motion.p
                  className="text-[10px] font-semibold text-green-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Análisis completo
                </motion.p>
                {/* Severe */}
                <motion.div
                  className="w-full rounded-lg border border-red-200 bg-red-50 p-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-[9px] font-bold text-red-600">Peligroso</span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-gray-600">Ibuprofeno + Enalapril</p>
                </motion.div>
                {/* Moderate */}
                <motion.div
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 p-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-[9px] font-bold text-amber-600">Precaución</span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-gray-600">Ibuprofeno + Metformina</p>
                </motion.div>
                {/* Safe */}
                <motion.div
                  className="w-full rounded-lg border border-green-200 bg-green-50 p-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-[9px] font-bold text-green-600">Sin riesgo</span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-gray-600">Enalapril + Metformina</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---- Comparison card (Guarda vs ChatGPT) ---- */
function ComparisonVisual() {
  return (
    <div className="mt-8 grid w-full max-w-2xl gap-4 md:grid-cols-2">
      {/* ChatGPT side */}
      <motion.div
        className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={0}
      >
        <span className="text-xs font-bold text-gray-400">Chatbot genérico</span>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-gray-100 px-3 py-2">
            <p className="text-[11px] text-gray-500">
              &quot;Podría haber una interacción entre estos medicamentos. Te
              recomiendo consultar a tu médico.&quot;
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-[10px] text-gray-400">Sin fuente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-[10px] text-gray-400">Puede inventar datos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-[10px] text-gray-400">Respuesta genérica</span>
          </div>
        </div>
      </motion.div>

      {/* Guarda side */}
      <motion.div
        className="flex flex-col gap-3 rounded-2xl border-2 border-purple-200 bg-purple-50 p-5"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        custom={1}
      >
        <span className="text-xs font-bold text-purple-600">Guarda</span>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-white px-3 py-2">
            <p className="text-[11px] text-gray-700">
              &quot;Ibuprofeno + Enalapril: riesgo alto. Puede reducir el efecto
              antihipertensivo y dañar los riñones.&quot;
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-3 w-3 text-green-500" />
            <span className="text-[10px] text-gray-600">Datos oficiales + IA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-3 w-3 text-green-500" />
            <span className="text-[10px] text-gray-600">Nivel de riesgo claro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-3 w-3 text-green-500" />
            <span className="text-[10px] text-gray-600">Recomendación específica</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden bg-white">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <a
            href="#"
            onClick={(e) => scrollTo(e, "#")}
            className="text-lg font-bold text-purple-600"
          >
            Guarda
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-purple-600"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Link
            href="/"
            className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Probar
          </Link>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section
        id="hero"
        className="relative flex w-full max-w-5xl flex-col items-center gap-10 px-6 pb-20 pt-20 md:flex-row md:gap-16 md:pt-28"
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-purple-200 opacity-20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-violet-300 opacity-15 blur-[80px]" />

        {/* Text */}
        <div className="relative z-10 flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
          <motion.h1
            className="max-w-lg text-4xl font-bold leading-tight text-gray-900 md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Verificá las interacciones entre tus medicamentos
          </motion.h1>

          <motion.p
            className="max-w-md text-lg text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Guarda combina{" "}
            <span className="font-semibold text-purple-600">
              bases de datos oficiales
            </span>{" "}
            con inteligencia artificial para analizar tus medicamentos. Más
            confiable que preguntarle a un chatbot genérico.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-purple-300"
            >
              Probar Guarda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Phone mockup */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* ========== DIFERENCIADOR ========== */}
      <section
        id="diferenciador"
        className="w-full scroll-mt-16 bg-purple-50 py-16"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
          <span className="rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-600">
            No es un chatbot cualquiera
          </span>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Datos reales, no respuestas inventadas
          </h2>
          <p className="max-w-xl text-base text-gray-500">
            A diferencia de herramientas genéricas, Guarda combina bases de
            datos farmacológicas oficiales con inteligencia artificial. Ambas
            trabajan juntas para darte resultados confiables y recomendaciones
            claras.
          </p>
          <ComparisonVisual />
        </div>
      </section>

      {/* ========== CÓMO FUNCIONA ========== */}
      <section id="como-funciona" className="relative w-full scroll-mt-16 py-20">
        <div className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-100 opacity-30 blur-[80px]" />
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Cómo funciona
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100">
                  <step.icon className="h-7 w-7 text-purple-600" />
                </div>
                <span className="absolute right-4 top-4 text-2xl font-bold text-purple-100">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section
        id="features"
        className="w-full scroll-mt-16 bg-gray-50 py-20"
      >
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Por qué elegir Guarda
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-md"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 transition-colors group-hover:bg-purple-200">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARA QUIÉN ========== */}
      <section id="para-quien" className="relative w-full scroll-mt-16 py-20">
        <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-pink-100 opacity-25 blur-[80px]" />
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Heart className="h-10 w-10 text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Pensado para quienes más lo necesitan
            </h2>
            <p className="max-w-xl text-base text-gray-500">
              Guarda nació para ayudar a personas mayores que toman varios
              medicamentos. Pero cualquier persona puede usarlo.
            </p>
          </div>

          <div className="grid w-full max-w-2xl gap-4 md:grid-cols-3">
            {AUDIENCE.map((item, i) => (
              <motion.div
                key={item.label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <item.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {item.label}
                </h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm font-medium text-purple-500">
            Una herramienta para toda la sociedad.
          </p>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="relative w-full overflow-hidden bg-purple-600 py-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-500 opacity-40 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-400 opacity-30 blur-[60px]" />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Probá Guarda ahora
          </h2>
          <p className="max-w-md text-base text-purple-200">
            Solo necesitás hablar. Sin registro, sin formularios, sin costo.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-purple-600 transition-all hover:bg-purple-50"
          >
            Comenzar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="w-full border-t border-gray-100 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 text-center">
          <p className="text-sm font-semibold text-gray-900">Guarda</p>
          <p className="text-xs text-gray-400">
            Esta herramienta es orientativa y no reemplaza el consejo médico
            profesional. Consultá siempre a tu médico de confianza.
          </p>
        </div>
      </footer>
    </div>
  );
}
