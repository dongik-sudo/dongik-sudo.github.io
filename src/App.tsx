// App.tsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import Test from "./pages/Test";
import NotFound from "./pages/NotFound";

import { LayoutGroup, motion } from "framer-motion";

import Shuffle from "./components/Shuffle";
import ClickSpark from "./components/ClickSpark";




const THRESHOLD = 10;
const HIDE_AT = 50;



const pages = import.meta.glob("./pages/*.tsx");
const entries = Object.entries(pages) as [string, () => Promise<any>][];


const toRoute = (file: string) => {
  const name = file.match(/\.\/pages\/(.*)\.tsx$/)![1];
  return name === "Home" ? "/" : `/${name.toLowerCase()}`;
};


export const navEntries = [
  { name: "Home", path: "/", element: <Home /> },
  { name: "Test", path: "/test", element: <Test /> },
] as const;



export default function App() {
  const [open, setOpen] = useState(true);
  const [isScrollable, setIsScrollable] = useState(true);


  const lastY = useRef<number>(typeof window !== "undefined" ? window.scrollY : 0);
  const ticking = useRef<boolean>(false);


  const recomputeScrollable = () => {
    if(typeof window === "undefined") return false;

    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;

    return docHeight > winHeight;
  };

  
  useEffect(() => {
    const update = () => {
      const scrollable = recomputeScrollable();
      setIsScrollable(scrollable);

      if(!scrollable) {
        setOpen(true);
      }
    };

    update();


    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(update, 120);
    };


    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, [location]);

  useEffect(() => {
    if (!isScrollable) {
      setOpen(true);

      return;
    }


    lastY.current = window.scrollY ?? 0;
    ticking.current = false;


    const onScroll = () => {
      const currentY = window.scrollY ?? 0;

      if (!ticking.current) {
        ticking.current = true;


        requestAnimationFrame(() => {
          const delta = currentY - lastY.current;


          if (Math.abs(delta) > THRESHOLD) {
            if (delta > 0 && currentY > HIDE_AT) {
              setOpen(false);
            } else if (delta < 0) {
              setOpen(true);
            }

            lastY.current = currentY;
          } else {
            lastY.current = currentY;
          }

          ticking.current = false;
        });
      }
    };


    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      ticking.current = false;
    };
  }, [isScrollable]);


  useEffect(() => {
    const t = window.setTimeout(() => {
      const scrollable = recomputeScrollable();
      setIsScrollable(scrollable);
      if (!scrollable) setOpen(true);
    }, 160);

    return () => clearTimeout(t);
  }, [open, location]);


  return (
    <LayoutGroup>
      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <motion.nav className="relative bg-slate-950 h-screen">
          <motion.div
            layout
            initial={false}
            animate={{ height: open ? "auto" : 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full flex items-center bg-black/25 
             border-b border-white/10 [--gap:clamp(1rem,4cqw,16rem)] shadow-lg"
          >
            <div className="max-w-5xl h-14 px-4 pl-[30%]
                  flex items-center justify-between text-white">
              <div className="text-3xl font-semibold text-white">Site</div>
            </div>
            
            <nav className="flex ml-auto pr-[30%]" aria-label="main navigation">
              <ul className="flex flex-wrap gap-[var(--gap)]">
                {navEntries.map(e => (
                  <li key={e.path}>
                    <NavLink
                      to={e.path}
                      end
                      className={({ isActive }) => [
                          "inline-block",
                          "transition-all duration-300 ease-in-out transform",

                          isActive
                            ? "text-emerald-400 font-semibold -translate-y-0 scale-105"
                            : "text-emerald-50 hover:-translate-y-0.5 hover:scale-105 hover:text-emerald-200 translate-y-0 scale-100"
                        ].join(" ")
                      }
                    >{e.name}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          <motion.main>
            <Suspense fallback={
                <div>
                  <Shuffle 
                    text="Loading..."
                    shuffleDirection="right"
                    duration={0.35}
                    animationMode="evenodd"
                    shuffleTimes={1}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={false}
                    triggerOnHover={true}
                    respectReducedMotion={true}
                  />
                </div>
              }>
              <Routes>
                {entries.map(([file, loader]) => {
                  const Component = React.lazy(loader);
                  const path = toRoute(file);
                  return <Route key={path} path={path} element={<Component />} />;
                })}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>  

          </motion.main>
        </motion.nav>
      </ClickSpark>
    </LayoutGroup>
  );
}
