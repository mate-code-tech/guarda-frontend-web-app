"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Mic, Database, Brain, Heart, ArrowRight } from "lucide-react";
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
    title: "Hablá con Guarda",
    description:
      "Decile qué medicamentos tomás usando tu voz. Sin formularios, sin escribir.",
  },
  {
    number: "02",
    title: "Analizamos tus medicamentos",
    description:
      "Comparamos cada combinación contra bases de datos oficiales y validamos con inteligencia artificial.",
  },
  {
    number: "03",
    title: "Recibí tu análisis",
    description:
      "Te mostramos las interacciones detectadas con nivel de riesgo y recomendaciones claras.",
  },
];

const FEATURES = [
  {
    icon: Database,
    title: "Datos oficiales",
    description:
      "Cruzamos información con bases de datos farmacológicas reconocidas. No es solo IA generativa.",
  },
  {
    icon: Brain,
    title: "IA como respaldo",
    description:
      "Cuando no hay datos oficiales, la inteligencia artificial complementa el análisis. Siempre sabés la fuente.",
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
      <section id="hero" className="flex w-full max-w-5xl flex-col items-center gap-8 px-6 pb-16 pt-20 text-center md:pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Orb size="large" state="idle" />
        </motion.div>

        <motion.h1
          className="max-w-2xl text-4xl font-bold leading-tight text-gray-900 md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Verificá las interacciones entre tus medicamentos
        </motion.h1>

        <motion.p
          className="max-w-xl text-lg text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Guarda cruza tus medicamentos con{" "}
          <span className="font-semibold text-purple-600">
            bases de datos oficiales
          </span>{" "}
          y los valida con inteligencia artificial. Más confiable que preguntarle
          a un chatbot genérico.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 hover:shadow-purple-300"
          >
            Probar Guarda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* ========== DIFERENCIADOR ========== */}
      <section id="diferenciador" className="w-full scroll-mt-16 bg-purple-50 py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <span className="rounded-full bg-purple-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-600">
            No es un chatbot cualquiera
          </span>
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Datos reales, no respuestas inventadas
          </h2>
          <p className="max-w-xl text-base text-gray-500">
            A diferencia de herramientas genéricas como ChatGPT, Guarda compara
            tus medicamentos contra entidades farmacológicas oficiales. La IA
            solo interviene cuando no existen datos registrados, y siempre te
            indicamos la fuente de cada resultado.
          </p>
        </div>
      </section>

      {/* ========== CÓMO FUNCIONA ========== */}
      <section id="como-funciona" className="w-full scroll-mt-16 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Cómo funciona
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <span className="text-3xl font-bold text-purple-200">
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
      <section id="features" className="w-full scroll-mt-16 bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            Por qué elegir Guarda
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                custom={i}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARA QUIÉN ========== */}
      <section id="para-quien" className="w-full scroll-mt-16 py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
          <Heart className="h-10 w-10 text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Pensado para quienes más lo necesitan
          </h2>
          <p className="max-w-xl text-base text-gray-500">
            Guarda nació para ayudar a personas mayores que toman varios
            medicamentos y necesitan saber si son compatibles. Pero cualquier
            persona puede usarlo: cuidadores, familiares, o vos mismo cuando
            tenés dudas sobre una combinación.
          </p>
          <p className="text-sm font-medium text-purple-500">
            Una herramienta para toda la sociedad.
          </p>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="w-full bg-purple-600 py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
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
