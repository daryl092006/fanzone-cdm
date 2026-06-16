'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, QrCode, ShieldCheck, Map as MapIcon, Clock, Sparkles, Zap, CheckCircle2, ClipboardList, Ticket, Activity, Trophy, AlertTriangle, Menu, X } from 'lucide-react';
import { getMatchesAndPredictions } from '@/app/actions/predictions';
import LiveScoresBanner from '@/app/components/LiveScoresBanner';
import FixturesSection from '@/app/components/FixturesSection';
import StandingsSection from '@/app/components/StandingsSection';
import TopScorers from '@/app/components/TopScorers';

const partnerLogos = [
  { src: '/logo-mairie.png', alt: 'Mairie Golfe 1', width: 220, height: 100 },
  { src: '/logo-escen.png', alt: 'ESCEN', width: 220, height: 100 },
  { src: '/logo-adn.png', alt: 'ADN', width: 150, height: 75 },
  { src: '/gozem-logo-hq.png', alt: 'Gozem', width: 190, height: 85 },
  { src: '/Yas_logo_2024.svg.png', alt: 'Yas', width: 190, height: 85 },
  { src: '/ATFA-Logo-_Green.png', alt: 'ATFA', width: 150, height: 85 },
  { src: '/45f34856-37ba-488d-b374-1bac3607b2c6.png', alt: 'Partenaire', width: 190, height: 85 },
  { src: '/72beae0e-feed-42b6-ba30-0601d8ec8d35.png', alt: 'Partenaire 2', width: 190, height: 85 },
  { src: '/97c9938b-3800-4570-8abe-0206cb2b9d46.png', alt: 'Partenaire 3', width: 190, height: 85 },
];

export default function LandingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadMatches() {
      const res = await getMatchesAndPredictions('00000000-0000-0000-0000-000000000000');
      if (res.success && res.matches) {
        setMatches(res.matches);
      }
    }
    loadMatches();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] font-space overflow-x-hidden">

      {/* ====== HEADER ====== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/95 border-b border-slate-100 shadow-sm backdrop-blur-sm px-6 py-3 lg:px-16">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Image src="/logo-mairie.png" alt="Mairie" width={90} height={50} className="object-contain" />
            <div className="w-px h-8 bg-slate-200"></div>
            <Image src="/logo-escen.png" alt="ESCEN" width={110} height={50} className="object-contain" />
            <div className="w-px h-8 bg-slate-200"></div>
            <Image src="/logo-adn.png" alt="ADN" width={64} height={64} className="object-contain" />
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            <div className="hidden md:flex flex-col">
              <span className="font-archivo text-lg text-slate-800 tracking-tight leading-none uppercase">Fan Zone</span>
              <span className="text-[9px] font-bold text-yellow-600 tracking-[0.1em] mt-0.5 uppercase">Ici le Mondial Golfe 1 Digital Fan Zone</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#lepass" className="hover:text-slate-900 transition-colors">Le Pass</a>
            <a href="#comment" className="hover:text-slate-900 transition-colors">Comment ça marche</a>
            <Link href="/classements" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <Activity size={12} /> Classements
            </Link>
            <Link href="/pronostics" className="text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1.5">
              <Trophy size={12} /> Pronostics
            </Link>
            <a href="#infos" className="hover:text-slate-900 transition-colors">Infos</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/admin" className="hidden sm:block text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Admin</Link>
            <Link href="/inscription" className="hidden lg:block bg-yellow-400 text-black font-bold text-[10px] px-6 py-3 rounded-full hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">
              S'inscrire
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed top-[68px] left-0 w-full bg-white border-b border-slate-200 z-40 shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col p-6 space-y-4 text-xs font-bold uppercase tracking-widest text-slate-600">
              <a
                href="#lepass"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-slate-900 transition-colors"
              >
                Le Pass
              </a>
              <a
                href="#comment"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-slate-900 transition-colors"
              >
                Comment ça marche
              </a>
              <Link
                href="/classements"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <Activity size={14} /> Classements
              </Link>
              <Link
                href="/pronostics"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-1.5"
              >
                <Trophy size={14} /> Pronostics
              </Link>
              <a
                href="#infos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-slate-900 transition-colors"
              >
                Infos
              </a>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-50 hover:text-slate-900 transition-colors sm:hidden"
              >
                Admin
              </Link>
              <Link
                href="/inscription"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-yellow-400 text-black text-center font-bold py-3.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest mt-2"
              >
                S'inscrire
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== BANDEAU LIVE SCORES ====== */}
      <div className="pt-[68px]">
        <LiveScoresBanner />
      </div>

      <main>

        {/* ====== HERO ====== */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-16 pt-28 pb-20 bg-slate-50">
          <Image
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600"
            alt="Stade de football"
            fill
            className="object-cover opacity-[0.08] mix-blend-luminosity"
            priority
          />
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-50 to-transparent z-10"></div>

          <div className="relative z-20 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              {/* Badge label officiel */}
              <div className="inline-flex items-center gap-3 bg-primary-green/10 border border-primary-green/20 text-primary-green px-5 py-2.5 rounded-full">
                <span className="w-2 h-2 bg-light-green rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">Événement Officiel · Mairie Golfe 1 · ADN × ESCEN</span>
              </div>

              {/* Titre principal */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-primary-blue mb-3">Ici le Mondial Golfe 1 Digital Fan Zone</p>
                <h1 className="font-archivo text-5xl md:text-7xl leading-[0.9] tracking-tighter italic uppercase text-slate-900">
                  Vivez le<br />
                  <span className="text-primary-green">Mondial</span><br />
                  à Lomé.
                </h1>
              </div>

              {/* Dates et lieu — CORRECTION AUDIT #3 et #4 */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3">
                  <Clock size={14} className="text-primary-blue shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Durée</p>
                    <p className="text-xs font-bold text-slate-800">11 Juin – 19 Juillet 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3">
                  <MapIcon size={14} className="text-primary-green shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lieu</p>
                    <p className="text-xs font-bold text-slate-800">Terrain GER (Akodesséwa-Kpota)</p>
                  </div>
                </div>
              </div>

              <p className="text-base font-medium text-slate-600 max-w-md leading-relaxed">
                La plus grande Fan Zone d'Afrique de l'Ouest. Écrans géants, concerts, ambiance unique au cœur de Golfe 1 à Lomé. Accès 100% gratuit et ouvert à tous.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link href="/inscription" className="group inline-flex items-center gap-3 bg-primary-yellow text-black font-bold text-sm px-8 py-4 rounded-xl hover:bg-primary-green hover:text-white transition-all shadow-xl shadow-primary-yellow/20">
                  M'inscrire gratuitement
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#comment" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors py-4">
                  Comment ça marche ? ↓
                  </a>
              </div>

              <div className="flex items-center gap-10 pt-4 border-t border-slate-200">
                {[
                  { v: '100%', l: 'Gratuit' },
                  { v: '60s', l: 'Pour s\'inscrire' },
                  { v: '40j', l: 'D\'événements' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-archivo text-2xl text-slate-800 tracking-tight">{s.v}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Badge Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-80 bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-100">
                <div className="bg-[#0F1020] p-8 text-white space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-white rounded-lg px-1.5 py-0.5"><Image src="/logo-mairie.png" alt="Mairie" width={48} height={20} className="object-contain animate-pulse" /></div>
                      <div className="bg-white rounded-lg px-1.5 py-0.5"><Image src="/logo-escen.png" alt="ESCEN" width={48} height={20} className="object-contain" /></div>
                      <div className="bg-white rounded-lg px-1.5 py-0.5"><Image src="/logo-adn.png" alt="ADN" width={32} height={32} className="object-contain" /></div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Ici c&apos;est le Mondial</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Accès Virtuel</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Supporter Officiel</p>
                    <p className="font-archivo text-2xl italic uppercase leading-tight">Nom & Prénom</p>
                  </div>
                </div>
                <div className="p-8 space-y-5 bg-white">
                  <div className="bg-slate-50 aspect-square rounded-2xl flex flex-col items-center justify-center relative p-5 text-center">
                    <CheckCircle2 size={56} className="text-emerald-500" />
                    <p className="font-bold text-sm text-slate-800 mt-2">Enregistrement Téléphone</p>
                    <p className="text-[10px] text-slate-400 mt-1">Numéro validé à l'entrée</p>
                    <span className="absolute bottom-4 font-bold text-[10px] uppercase tracking-widest bg-white border border-primary-green/20 px-3 py-1.5 rounded-full text-primary-green shadow-sm">Présence Validée</span>
                  </div>
                  <div className="bg-primary-yellow rounded-xl py-3 text-center">
                    <p className="font-archivo text-[11px] font-black uppercase tracking-wider text-black">#FZ2026 · TOGO</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
 
        {/* ====== SECTION NOS PARTENAIRES ====== */}
        <section id="partenaires" className="py-20 bg-white border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 space-y-12">
            
            {/* Header de Section */}
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-green">Ils nous soutiennent</p>
              <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase text-slate-900">Nos Partenaires</h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Un événement exceptionnel rendu possible grâce à la collaboration d'institutions fortes et d'acteurs de premier plan.
              </p>
            </div>

            {/* Texte Organisateurs */}
            <div className="text-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Organisé par <span className="text-primary-green font-black">ADN — Académie Digitale Numérique</span> en partenariat avec <span className="text-primary-green font-black">ESCEN</span> et la <span className="text-primary-green font-black">Mairie Golfe 1</span>
              </p>
            </div>

            {/* Bande défilante */}
            <div className="relative w-full flex overflow-x-hidden pt-4">
              <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
                {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, idx) => (
                  <div key={idx} className="flex items-center gap-16">
                    <div className="bg-slate-50 rounded-3xl px-8 py-4 flex items-center justify-center h-32 min-w-[240px] shadow-sm border border-slate-100 hover:scale-105 hover:bg-white hover:shadow-md transition-all duration-200">
                      <Image
                        src={partner.src}
                        alt={partner.alt}
                        width={partner.width}
                        height={partner.height}
                        className="object-contain max-h-20"
                      />
                    </div>
                    <span className="text-slate-300 text-xl select-none">•</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ====== LE PASS ====== */}
        <section id="lepass" className="py-28 px-6 lg:px-16 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-green mb-4">L'Accès Officiel</p>
                <h2 className="font-archivo text-4xl md:text-5xl leading-tight tracking-tighter italic uppercase">Accès & Participation</h2>
              </div>
              <p className="text-base text-slate-500 leading-relaxed max-w-md">
                L'enregistrement de votre numéro de téléphone est <strong>obligatoire pour participer aux tirages au sort</strong>. Il est 100% gratuit et instantané.
              </p>

              {/* CORRECTION AUDIT #7 : mention badge à présenter chaque jour en évidence */}
              <div className="bg-primary-green/5 border-l-4 border-primary-green p-5 rounded-r-2xl flex gap-3 items-start">
                <AlertTriangle size={18} className="text-primary-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-primary-green uppercase tracking-wide">Important</p>
                  <p className="text-sm text-primary-green/80 mt-1 leading-relaxed">
                    Donnez votre numéro de téléphone <strong>chaque jour à l'entrée</strong> pour valider votre présence. <strong>Règle essentielle</strong> : pour participer et gagner aux deux tirages au sort (Présence et Pronostics), votre présence physique sur place doit être validée à l'entrée le jour du match, sous peine d'annulation du gain.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <ShieldCheck size={20} className="text-primary-green" />, t: "Enregistrement à l'arrivée", d: "Présentez simplement votre numéro de téléphone à nos agents à l'entrée à chaque visite.", bg: 'bg-primary-green/5 border-primary-green/10' },
                  { icon: <Zap size={20} className="text-primary-blue" />, t: 'Inscrit en 30 secondes', d: 'Aucun email requis. Saisissez vos infos et commencez à pronostiquer.', bg: 'bg-primary-blue/5 border-primary-blue/10' },
                  { icon: <Ticket size={20} className="text-[#8cbe43]" />, t: 'Zéro ticket physique', d: 'Tout est relié à votre numéro de téléphone. Plus de badge à perdre ou à imprimer !', bg: 'bg-light-green/5 border-light-green/10' },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl border ${f.bg}`}>
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">{f.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0A0A0A]">{f.t}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/inscription" className="group inline-flex items-center gap-3 bg-[#0A0A14] text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-primary-yellow hover:text-black transition-all shadow-lg shadow-violet-900/20">
                S'inscrire maintenant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
              <Image
                src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800"
                alt="Supporters Fan Zone"
                width={600}
                height={500}
                className="relative z-10 rounded-3xl object-cover w-full shadow-xl shadow-slate-200"
              />
            </div>
          </div>
        </section>

        {/* ====== COMMENT ÇA MARCHE — CORRECTION AUDIT #8 ====== */}
        <section id="comment" className="py-28 px-6 lg:px-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600">Guide Rapide</p>
              <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase text-slate-900">Comment ça marche ?</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">Trois étapes simples pour participer aux animations et aux tirages au sort.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: '01',
                  t: 'Je m\'inscris en ligne',
                  d: 'Je remplis le formulaire d\'inscription gratuit en ligne avec mon nom, prénom et mon numéro de téléphone en 1 minute.',
                  icon: <ClipboardList className="text-yellow-600 shrink-0" size={24} />,
                },
                {
                  num: '02',
                  t: 'Je pronostique',
                  d: 'Je me connecte sur mon téléphone pour pronostiquer sur les matchs à venir et tenter de gagner le tirage pronostics.',
                  icon: <Trophy className="text-yellow-500 shrink-0" size={24} />,
                },
                {
                  num: '03',
                  t: 'Validation sur place',
                  d: 'Je me présente obligatoirement à l\'entrée chez les agents sur le terrain pour faire enregistrer ma présence et participer au tirage.',
                  icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />,
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5 hover:bg-slate-100/50 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-archivo text-5xl text-slate-200">{step.num}</span>
                    <span className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100">{step.icon}</span>
                  </div>
                  <h3 className="font-archivo text-xl italic uppercase text-slate-900 tracking-tighter">{step.t}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.d}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-slate-300 text-2xl">→</div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="text-center pt-4">
              <Link href="/inscription" className="group inline-flex items-center gap-3 bg-yellow-400 text-black font-bold text-sm px-10 py-5 rounded-xl hover:bg-white transition-all shadow-xl shadow-yellow-400/20">
                S'inscrire en ligne <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ====== AGENDA — CORRECTION AUDIT #5 ====== */}
        <section id="agenda" className="py-28 px-6 lg:px-16 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600">Programme 2026</p>
              <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase">L'Agenda</h2>
              <p className="text-slate-500 text-sm">Du 11 juin au 19 juillet 2026 · Complexe Sportif d&apos;Akodesséwa-Kpota (Terrain GER) · Ouvert dès 10h00</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  d: '11 Juin 2026',
                  h: '10h00 – 22h00',
                  t: 'Opening Day',
                  p: 'Cérémonie officielle d\'ouverture. Discours officiels, animations et premier match diffusé.',
                  bg: 'bg-white',
                  accent: 'text-blue-600 bg-blue-50',
                },
                {
                  d: 'Chaque Jour',
                  h: '10h00 – 23h00',
                  t: 'Match Day',
                  p: 'Diffusion en direct de tous les matchs sur écrans géants 4K LED. Accès gratuit (enregistrement requis à l\'entrée pour le tirage).',
                  bg: 'bg-[#0A0A14] text-white',
                  accent: 'text-yellow-400 bg-white/10',
                },
                {
                  d: 'Chaque Soir',
                  h: '20h00 – 23h00',
                  t: 'Fan Party',
                  p: 'Concerts live, animations culturelles et saveurs locales après les matchs.',
                  bg: 'bg-yellow-400',
                  accent: 'text-black bg-black/10',
                },
                {
                  d: '19 Juillet 2026',
                  h: '15h00 – Minuit',
                  t: 'The Finals',
                  p: 'Diffusion de la grande finale de la Coupe du Monde et méga concert de clôture.',
                  bg: 'bg-white',
                  accent: 'text-purple-600 bg-purple-50',
                },
              ].map((a, i) => (
                <div key={i} className={`p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all space-y-4 ${a.bg}`}>
                  <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${a.accent}`}>{a.d}</span>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{a.h}</p>
                  <h4 className="font-archivo text-xl italic uppercase tracking-tight">{a.t}</h4>
                  <p className="text-sm opacity-50 leading-relaxed">{a.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ====== CTA PRONOSTICS + CLASSEMENTS ====== */}
        <section className="py-12 px-6 lg:px-16 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">

            {/* Pronostics */}
            <div className="bg-[#0F1020] border border-white/5 rounded-3xl p-8 flex flex-col justify-between gap-6 shadow-xl text-white">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Trophy size={10} /> Tirage au Sort
                </span>
                <h3 className="font-archivo text-2xl italic uppercase tracking-tight">Faites vos pronostics et gagnez !</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Devinez les scores exacts. Un tirage au sort sera effectué parmi tous les pronostics corrects !
                </p>
              </div>
              <Link href="/pronostics" className="group inline-flex items-center gap-2 bg-yellow-400 text-black font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-white transition-all shadow-lg w-fit">
                Lancer mes Pronostics
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Classements */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Activity size={10} /> Temps Réel
                </span>
                <h3 className="font-archivo text-2xl italic uppercase tracking-tight text-slate-900">Classements &amp; Tableau KO</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  12 groupes, phases éliminatoires, huitièmes, quarts, demies et finale. Suivez chaque résultat en direct.
                </p>
              </div>
              <Link href="/classements" className="group inline-flex items-center gap-2 bg-slate-900 text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-yellow-400 hover:text-black transition-all w-fit">
                Voir les classements
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </section>



        {/* ====== INFOS ====== */}
        <section id="infos" className="py-28 px-6 lg:px-16 bg-white text-slate-900 border-t border-slate-100">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 mb-4">Informations Pratiques</p>
                <h2 className="font-archivo text-4xl md:text-5xl tracking-tighter italic uppercase leading-tight text-slate-900">Venez Vivre<br />L'Expérience.</h2>
              </div>
              <div className="space-y-6">
                {[
                  { icon: <MapIcon size={20} className="text-yellow-600" />, t: 'Emplacement', d: 'Complexe Sportif d\'Akodesséwa-Kpota (Terrain GER)\nLomé, Togo' },
                  { icon: <Clock size={20} className="text-yellow-600" />, t: 'Horaires d\'ouverture', d: 'Accueil dès 10h00 · Chaque jour\nFermeture 1h après le dernier match' },
                  { icon: <ShieldCheck size={20} className="text-yellow-600" />, t: 'Assistance sur place', d: 'Des agents ADN & ESCEN sont présents\npour vous aider à vous enregistrer.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <h5 className="font-bold mb-1 text-slate-800">{item.t}</h5>
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-10 space-y-8 border border-slate-200 shadow-sm">
              <h3 className="font-archivo text-3xl italic uppercase text-slate-900">Prêt à nous rejoindre ?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">L'inscription est rapide, gratuite et se fait depuis votre téléphone. Pas besoin de badge physique.</p>
              <Link href="/inscription" className="group w-full flex items-center justify-center gap-3 bg-yellow-400 text-black font-bold text-sm px-8 py-5 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-md">
                M'inscrire gratuitement <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="space-y-3 pt-2">
                {[
                  'Inscription gratuite et sans email',
                  'Faire mes pronostics immédiatement',
                  'Assistance disponible sur place',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-yellow-500 shrink-0" />
                    <p className="text-xs text-slate-500">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ====== FOOTER CORRIGÉ — CORRECTION AUDIT #8 ====== */}
      <footer className="py-12 px-6 lg:px-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">Ici le Mondial Golfe 1 Digital Fan Zone</p>
            <p className="text-[10px] text-slate-500">Complexe Sportif d&apos;Akodesséwa-Kpota (Terrain GER) · Lomé, Togo</p>
          </div>
          <div className="text-center flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <Image src="/logo-mairie.png" alt="Mairie" width={96} height={42} className="object-contain" />
              <span className="text-slate-300 text-xs">×</span>
              <Image src="/logo-escen.png" alt="ESCEN" width={96} height={42} className="object-contain" />
              <span className="text-slate-300 text-xs">×</span>
              <Image src="/logo-adn.png" alt="ADN" width={80} height={40} className="object-contain" />
            </div>
            <p className="text-[10px] text-slate-400">Organisateurs officiels</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assistance</p>
            <p className="text-[10px] text-slate-400">Disponible sur place · Agents terrain</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
