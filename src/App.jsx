import React, { useEffect, useRef, useState } from 'react'

export default function App() {
  // Desktop-only intro overlay state
  const [overlayActive, setOverlayActive] = useState(false)
  const [overlayStyle, setOverlayStyle] = useState({})
  const [hasAnimated, setHasAnimated] = useState(false)
  const [overlayOpacity, setOverlayOpacity] = useState(1)
  const [heroRevealing, setHeroRevealing] = useState(false)
  const [contactFabOpen, setContactFabOpen] = useState(false)
  const overlayTextRef = useRef(null)
  const desktopHeroRef = useRef(null)

  // Mobile intro overlay state
  const [mobileOverlayActive, setMobileOverlayActive] = useState(false)
  const [mobileOverlayStyle, setMobileOverlayStyle] = useState({})
  const [mobileHasAnimated, setMobileHasAnimated] = useState(false)
  const [mobileOverlayOpacity, setMobileOverlayOpacity] = useState(1)
  const [mobileHeroRevealing, setMobileHeroRevealing] = useState(false)
  const mobileOverlayTextRef = useRef(null)
  const mobileHeroRef = useRef(null)

  // Mobile enhancement: reveal + parallax
  const mobileRevealObserverRef = useRef(null)
  const mobileParallaxItemsRef = useRef([])

  // Register element for parallax (hook-like helper)
  const registerParallax = (el) => {
    if (!el) return
    mobileParallaxItemsRef.current.push(el)
  }

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return

    // Intersection Reveal (no heavy animation loops)
    if (!mobileRevealObserverRef.current) {
      mobileRevealObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target
            if (entry.isIntersecting) {
              el.classList.add('is-visible')
            } else {
              el.classList.remove('is-visible')
            }
        })
      }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' })
    }

    const revealEls = document.querySelectorAll('.m-reveal')
    revealEls.forEach(el => mobileRevealObserverRef.current.observe(el))

    // Lightweight parallax on scroll (throttled via rAF)
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        mobileParallaxItemsRef.current.forEach((el, idx) => {
          if (!el) return
          const speed = parseFloat(el.dataset.parallaxSpeed || (0.15 + idx * 0.05))
          const translate = Math.round(scrollY * speed * 100) / 100
          el.style.transform = `translateY(${translate * -1}px)`
        })
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      revealEls.forEach(el => mobileRevealObserverRef.current?.unobserve(el))
    }
  }, [])

  // Handle intro animation based on scroll position
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return
    
    const checkScrollPosition = () => {
      const scrollY = window.scrollY
      
      // Show overlay when at the very top
      if (scrollY === 0) {
        if (!hasAnimated) {
          setOverlayActive(true)
          setOverlayStyle({}) // Reset style
          setOverlayOpacity(1)
          setHeroRevealing(false)
        } else {
          // After first run, don't show overlay again at top; keep hero fully visible
          setOverlayActive(false)
          setOverlayOpacity(0)
          setHeroRevealing(true)
        }
      }
      // Animate when scrolling down from top
      else if (scrollY > 0 && overlayActive && !hasAnimated) {
        const brand = document.querySelector('#brand-anchor')
        const txt = overlayTextRef.current
        
        if (brand && txt) {
          const brandRect = brand.getBoundingClientRect()
          const txtRect = txt.getBoundingClientRect()
          
          const brandCenterX = brandRect.left + brandRect.width / 2
          const brandCenterY = brandRect.top + brandRect.height / 2
          const txtCenterX = txtRect.left + txtRect.width / 2
          const txtCenterY = txtRect.top + txtRect.height / 2
          
          const deltaX = brandCenterX - txtCenterX
          const deltaY = brandCenterY - txtCenterY
          const scale = Math.max(0.1, Math.min(2, brandRect.width / txtRect.width))
          
          const handleTransitionEnd = () => {
            setOverlayActive(false)
            setHasAnimated(true)
            txt.removeEventListener('transitionend', handleTransitionEnd)
          }
          
          txt.addEventListener('transitionend', handleTransitionEnd)
          
          // begin video reveal and fade overlay bg
          setHeroRevealing(true)
          setOverlayOpacity(0)
          const video = desktopHeroRef.current
          if (video) {
            try { video.play() } catch (e) { /* no-op */ }
          }

          requestAnimationFrame(() => {
            setOverlayStyle({
              transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})`,
              transition: 'transform 800ms ease-out, opacity 800ms ease-out',
              opacity: 0
            })
          })
        } else {
          setOverlayActive(false)
          setHasAnimated(true)
          setHeroRevealing(true)
          setOverlayOpacity(0)
          const video = desktopHeroRef.current
          if (video) {
            try { video.play() } catch (e) { console.log('Video play failed:', e) }
          }
        }
      }
    }
    
    // Check initial position
    checkScrollPosition()
    
    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    return () => window.removeEventListener('scroll', checkScrollPosition)
  }, [overlayActive, hasAnimated])

  // Desktop-only: fade sections in/out on scroll
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return
    const els = Array.from(document.querySelectorAll('.fade-section'))
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
          } else {
            el.classList.remove('is-visible')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Mobile intro animation based on scroll position
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return
    
    const checkMobileScrollPosition = () => {
      const scrollY = window.scrollY
      
      // Show overlay when at the very top
      if (scrollY === 0) {
        if (!mobileHasAnimated) {
          setMobileOverlayActive(true)
          setMobileOverlayStyle({}) // Reset style
          setMobileOverlayOpacity(1)
          setMobileHeroRevealing(false)
        } else {
          // After first run, don't show overlay again at top; keep hero fully visible
          setMobileOverlayActive(false)
          setMobileOverlayOpacity(0)
          setMobileHeroRevealing(true)
        }
      }
      // Animate when scrolling down from top
      else if (scrollY > 0 && mobileOverlayActive && !mobileHasAnimated) {
        const mobileHeader = document.querySelector('.mobile-brand-anchor')
        const txt = mobileOverlayTextRef.current
        
        if (mobileHeader && txt) {
          const headerRect = mobileHeader.getBoundingClientRect()
          const txtRect = txt.getBoundingClientRect()
          
          const headerCenterX = headerRect.left + headerRect.width / 2
          const headerCenterY = headerRect.top + headerRect.height / 2
          const txtCenterX = txtRect.left + txtRect.width / 2
          const txtCenterY = txtRect.top + txtRect.height / 2
          
          const deltaX = headerCenterX - txtCenterX
          const deltaY = headerCenterY - txtCenterY
          const scale = Math.max(0.15, Math.min(2, headerRect.width / txtRect.width))
          
          const handleTransitionEnd = () => {
            setMobileOverlayActive(false)
            setMobileHasAnimated(true)
            txt.removeEventListener('transitionend', handleTransitionEnd)
          }
          
          txt.addEventListener('transitionend', handleTransitionEnd)
          
          // begin video reveal and fade overlay bg
          setMobileHeroRevealing(true)
          setMobileOverlayOpacity(0)
          const video = mobileHeroRef.current
          if (video) {
            try { video.play() } catch (e) { /* no-op */ }
          }

          requestAnimationFrame(() => {
            setMobileOverlayStyle({
              transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})`,
              transition: 'transform 800ms ease-out, opacity 800ms ease-out',
              opacity: 0
            })
          })
        } else {
          setMobileOverlayActive(false)
          setMobileHasAnimated(true)
          setMobileHeroRevealing(true)
          setMobileOverlayOpacity(0)
          const video = mobileHeroRef.current
          if (video) {
            try { video.play() } catch (e) { console.log('Mobile video play failed:', e) }
          }
        }
      }
    }
    
    // Check initial position
    checkMobileScrollPosition()
    
    window.addEventListener('scroll', checkMobileScrollPosition, { passive: true })
    return () => window.removeEventListener('scroll', checkMobileScrollPosition)
  }, [mobileOverlayActive, mobileHasAnimated])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop intro overlay - Thankyou sized text */}
      {overlayActive && (
        <div
          className="hidden lg:flex fixed inset-0 z-50 items-center justify-center pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})`, transition: 'background-color 800ms ease-out' }}
        >
          <div
            ref={overlayTextRef}
            style={overlayStyle}
            className="text-[#ff0303] text-[240px] font-normal uppercase font-fiorello leading-none select-none"
          >
            Harshallax
          </div>
        </div>
      )}

      {/* Mobile intro overlay - scaled down version */}
      {mobileOverlayActive && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: `rgba(0,0,0,${mobileOverlayOpacity})`, transition: 'background-color 800ms ease-out' }}
        >
          <div
            ref={mobileOverlayTextRef}
            style={mobileOverlayStyle}
            className="text-[#ff0303] text-[80px] font-normal uppercase font-fiorello leading-none select-none"
          >
            Harshallax
          </div>
        </div>
      )}

      {/* Header: responsive (mobile + desktop) */}
      <header className="bg-black">
        {/* Mobile header */}
        <div className="lg:hidden">
          <div className="w-full px-4 py-6 flex justify-center items-center">
            <div className="mobile-brand-anchor text-[#ff0303] text-5xl font-normal uppercase font-fiorello">Harshallax</div>
          </div>
        </div>

        {/* Desktop header (1440px) */}
        <div className="hidden lg:block">
          <div className="w-[1440px] h-20 relative overflow-hidden mx-auto">
            <div id="brand-anchor" className="left-[64px] top-[15px] absolute justify-start text-[#ff0303] text-[40px] font-normal uppercase font-fiorello">
              Harshallax
            </div>
            <nav className="left-[995px] top-[25px] absolute inline-flex justify-center items-center gap-[66px]">
              <a href="#home" className="justify-start text-white text-2xl font-medium font-['Montserrat'] transition-colors duration-300 hover:text-[#ff0303]">
                Home
              </a>
              <a href="#works" className="justify-start text-white text-2xl font-medium font-['Montserrat'] transition-colors duration-300 hover:text-[#ff0303]">
                Projects
              </a>
              <a href="#contact" className="justify-start text-white text-2xl font-medium font-['Montserrat'] transition-colors duration-300 hover:text-[#ff0303]">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

    
      <div id="home">
        {/* Mobile  */}
        <div className="lg:hidden">
          <div className="w-full px-4 ">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black m-reveal m-parallax" ref={registerParallax} data-parallax-speed="0.12">
              <video
                ref={mobileHeroRef}
                className="w-full h-full object-cover"
                src="https://ik.imagekit.io/harshallax/Landing%20video/Mobile.mp4?updatedAt=1754476199615"
                autoPlay
                loop
                muted
                playsInline
                style={{ filter: mobileHeroRevealing ? 'blur(0px)' : 'blur(16px)', opacity: mobileHeroRevealing ? 1 : 0.3, transition: 'filter 800ms ease-out, opacity 800ms ease-out' }}
              />
            </div>
          </div>
        </div>
        {/* Desktop */}
        <div className="hidden lg:block">
      <div className="w-[1440px] h-[810px] mx-auto mt-4 rounded-xl overflow-hidden border border-white/10 bg-black fade-section">
            <video
              ref={desktopHeroRef}
        className="w-full h-full object-cover"
              src="https://ik.imagekit.io/harshallax/Landing%20video/Desktop.mp4?updatedAt=1754476201327"
              loop
              muted
              playsInline
        style={{ filter: heroRevealing ? 'blur(0px)' : 'blur(16px)', opacity: heroRevealing ? 1 : 0.3, transition: 'filter 800ms ease-out, opacity 800ms ease-out' }}
            />
          </div>
        </div>
      </div>
      <div>

        {/* Mobile layout */}
        <div className="lg:hidden">
          <div className="w-full px-5 pt-10 pb-8 space-y-8">
            <div className="m-reveal text-[#3d3d3d] text-sm tracking-wide font-semibold font-['Montserrat']">//Resume</div>
            <div className="flex items-start gap-5 m-reveal" data-delay="1">
              <img
                className="w-32 h-32 rounded-2xl object-cover m-parallax" ref={registerParallax} data-parallax-speed="0.08"
                src="https://ik.imagekit.io/harshallax/Ellipse%201.png?updatedAt=1754724420140"
                alt="Avatar"
              />
              <div className="flex-1 mt-2">
                <div className="m-reveal text-[#ff0303] text-6xl leading-[0.9] font-normal uppercase font-fiorello" data-delay="2">
                  Harshal lad.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 m-reveal text-center text-[12px] font-semibold font-['Montserrat'] uppercase tracking-wide" data-delay="3">
              <div className="bg-white/5 rounded-lg py-2">Editing</div>
              <div className="bg-white/5 rounded-lg py-2">Design</div>
              <div className="bg-white/5 rounded-lg py-2">Web Dev</div>
            </div>
            <div className="m-reveal text-white text-[17px] font-medium font-['Montserrat'] capitalize text-justify" data-delay="4">
              Hey there, I'm Harshal. For the past 3 years, I've immersed myself in the creative world editing videos,
              designing engaging visuals, and building websites. I love blending tech with storytelling. Every day, I
              push myself to learn something new because in our fast-changing digital world, growth is key.
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block">
          <div className="w-[1440px] h-[870px] relative overflow-hidden mx-auto mt-6 fade-section">
            <div className="left-[64px] top-[64px] absolute justify-start text-[#3d3d3d] text-2xl font-semibold font-['Montserrat']">
              //Resume
            </div>
            <div className="left-[64px] top-[320px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              Harshal lad.
            </div>
            <div className="left-[65px] top-[523px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              contact
            </div>
            <div className="left-[64px] top-[638px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              social media
            </div>
            <div className="left-[64px] top-[358px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Video Editor · Graphics Designer · Web Developer
            </div>
            <div className="left-[65px] top-[561px] absolute justify-start text-white text-base font-semibold font-['Montserrat']">
              Harshallax@gmail.com
            </div>
            <div className="left-[65px] top-[589px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              +91 8806753875{" "}
            </div>
            <div className="left-[97px] top-[680px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Harshallax
            </div>
            <div className="left-[97px] top-[715px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Harshal Lad
            </div>
            <div className="w-[418px] left-[64px] top-[389px] absolute justify-start text-white text-sm font-medium font-['Montserrat']">
              Hey there, I'm Harshal.
              <br />
              For the past 3 years, I've immersed myself in the creative world editing videos, designing engaging
              visuals, and building websites. I love blending tech with storytelling. Every day, I push myself to learn
              something new because in our fast-changing digital world, growth is key.
            </div>
            <img
              className="size-[190px] left-[64px] top-[113px] absolute rounded-full object-cover"
              src="https://ik.imagekit.io/harshallax/Ellipse%201.png?updatedAt=1754724420140"
            />
            <img
              className="w-[25px] h-[45px] left-[64px] top-[666px] absolute"
              src="https://ik.imagekit.io/harshallax/Instagram.png?updatedAt=1754724536458"
            />
            <img
              className="size-[25px] left-[65px] top-[711px] absolute"
              src="https://ik.imagekit.io/harshallax/LinkedIn.png?updatedAt=1754724536503"
            />

            <div className="left-[649px] top-[116px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              education
            </div>
            <div className="left-[649px] top-[154px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              May 2024
            </div>
            <div className="left-[668px] top-[187px] absolute justify-start text-white text-xl font-semibold font-['Montserrat']">
              Konkan gyanpeeth
              <br />
              college of engineering
            </div>
            <div className="left-[668px] top-[322px] absolute justify-start text-white text-xl font-semibold font-['Montserrat']">
              Pillai HOC College of
              <br />
              Engineering & Technology
            </div>
            <div className="left-[668px] top-[251px] absolute justify-start text-white text-sm font-medium font-['Montserrat']">
              B.Tech in Information Technology
            </div>
            <div className="left-[668px] top-[381px] absolute justify-start text-white text-sm font-medium font-['Montserrat']">
              Diploma in Computer Engineering
            </div>
            <div className="left-[649px] top-[284px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              May 2021
            </div>
            <div className="w-[92px] h-0 left-[659px] top-[267px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>
            <div className="w-[92px] h-0 left-[659px] top-[398px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>

            <div className="left-[1000px] top-[116px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              skills
            </div>
            <div className="left-[1000px] top-[154px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Tools
            </div>
            <div className="left-[1019px] top-[179px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Adobe Premiere Pro
            </div>
            <div className="left-[1019px] top-[218px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              After Effects
            </div>
            <div className="left-[1019px] top-[257px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Photoshop
            </div>
            <div className="left-[1019px] top-[296px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              DaVinci Resolve
            </div>
            <div className="left-[1019px] top-[335px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              CapCut
            </div>
            <div className="left-[1019px] top-[374px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Figma
            </div>
            <div className="w-[223px] h-0 left-[1010.50px] top-[398px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>

            <div className="left-[1226px] top-[113px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              Interest
            </div>
            <div className="left-[1245px] top-[159px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Photography
            </div>
            <div className="left-[1245px] top-[198px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Visual Identity
            </div>
            <div className="left-[1245px] top-[237px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Gaming
            </div>
            <div className="w-24 h-0 left-[1237px] top-[256px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>
            <div className="left-[1226px] top-[305px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              Languages
            </div>
            <div className="left-[1245px] top-[351px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Marathi
            </div>
            <div className="left-[1245px] top-[390px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Hindi
            </div>
            <div className="left-[1245px] top-[429px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              English(Beginner)
            </div>
            <div className="w-24 h-0 left-[1237px] top-[448px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>

            <div className="left-[649px] top-[435px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              Work Experience
            </div>
            <div className="left-[669px] top-[480px] absolute justify-start text-white text-[10px] font-normal font-['Montserrat']">
              2022 – Present
            </div>
            <div className="left-[669px] top-[557px] absolute justify-start text-white text-[10px] font-normal font-['Montserrat']">
              2025 – Present
            </div>
            <div className="left-[669px] top-[633px] absolute justify-start text-white text-[10px] font-normal font-['Montserrat']">
              2024 – 2025
            </div>
            <div className="left-[669px] top-[709px] absolute justify-start text-white text-[10px] font-normal font-['Montserrat']">
              2023 – 2024
            </div>
            <div className="left-[669px] top-[498px] absolute justify-start text-white text-xs font-semibold font-['Montserrat']">
              Freelancer
            </div>
            <div className="left-[669px] top-[515px] absolute justify-start text-white text-xs font-normal font-['Montserrat']">
              Video Editor, Graphic Design
            </div>
            <div className="left-[668px] top-[575px] absolute justify-start text-white text-xs font-semibold font-['Montserrat']">
              Director – Video Editing | Trigona Digital Pvt. Ltd.
            </div>
            <div className="left-[668px] top-[596px] absolute justify-start text-white text-xs font-normal font-['Montserrat']">
              Client coordination, storytelling, and delivery
            </div>
            <div className="left-[669px] top-[655px] absolute justify-start text-white text-xs font-semibold font-['Montserrat']">
              Video Editor | Men of Culture (YouTube)
            </div>
            <div className="left-[668px] top-[724px] absolute justify-start text-white text-xs font-semibold font-['Montserrat']">
              Web Developer | Vijay Group Industries
            </div>
            <div className="left-[669px] top-[676px] absolute justify-start text-white text-xs font-normal font-['Montserrat']">
              Podcast editing to short-form YouTube cuts
            </div>
            <div className="left-[668px] top-[745px] absolute justify-start text-white text-xs font-normal font-['Montserrat']">
              Developed internal websites using HTML, CSS, .NET
              <br />
              Worked on both front-end and back-end systems
            </div>
            <div className="w-[294px] h-0 left-[659px] top-[776px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>
            <div className="size-2.5 left-[654px] top-[480px] absolute bg-white rounded-full"></div>
            <div className="size-2.5 left-[654px] top-[557px] absolute bg-white rounded-full"></div>
            <div className="size-2.5 left-[654px] top-[633px] absolute bg-white rounded-full"></div>
            <div className="size-2.5 left-[654px] top-[709px] absolute bg-white rounded-full"></div>

            <div className="left-[1000px] top-[434px] absolute justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello">
              Expertise
            </div>
            <div className="left-[1019px] top-[481px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Video Editing
            </div>
            <div className="left-[1019px] top-[520px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Motion Graphics
            </div>
            <div className="left-[1019px] top-[559px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Color Grading
            </div>
            <div className="left-[1019px] top-[598px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              UI/UX Design
            </div>
            <div className="left-[1019px] top-[637px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Web Development
            </div>
            <div className="left-[1019px] top-[676px] absolute justify-start text-white text-sm font-semibold font-['Montserrat']">
              Cinematic Editing
            </div>
            <div className="w-[223px] h-0 left-[1010.50px] top-[700px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white"></div>
            <div className="w-[1440px] h-[246px] left-0 top-[870px] absolute" />
          </div>
        </div>
      </div>

      {/* Brands I worked with */}
      <div>
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full py-6 bg-[#000000]">
            <div className="m-reveal text-[#ff0303] text-3xl sm:text-4xl font-normal uppercase font-fiorello text-center mb-8">
              Brands I worked With
            </div>
            <div className="overflow-hidden m-reveal" data-delay="1">
              <div className="marquee">
                <div className="marquee-track gap-6 items-center" style={{ ["--duration"]: "35s" }}>
                  {[
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Trigona-LOGOArtboard-1.png?updatedAt=1754547178627",
                      label: "Trigona Digital",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/screenshot.png?updatedAt=1754547178861",
                      label: "Men of culture",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/IMG-20250623-WA0035(2).jpg?updatedAt=1754547178625",
                      label: "Sociops",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/487434734_988246563277643_619941.png?updatedAt=1754547178573",
                      label: "Navakal",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/SPWAN%20SCHOOL%20logo%20icon.png?updatedAt=1754547178587",
                      label: "Spawn skool",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Screenshot%202025-07-30%20120335.png?updatedAt=1754547179063",
                      label: "Guerilla warfare",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Villakosh.jpg?updatedAt=1754725379903",
                      label: "Villakosh",
                    },
                  ].map((l, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 m-shift-glow m-reveal" data-delay={(i%4)+1}>
                      <img
                        className="w-20 h-20 rounded-full object-cover"
                        src={l.src || "/placeholder.svg"}
                        alt={l.label}
                      />
                      <div className="text-white text-sm font-medium uppercase text-center font-['Montserrat']">
                        {l.label}
                      </div>
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {[
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Trigona-LOGOArtboard-1.png?updatedAt=1754547178627",
                      label: "Trigona Digital",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/screenshot.png?updatedAt=1754547178861",
                      label: "Men of culture",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/IMG-20250623-WA0035(2).jpg?updatedAt=1754547178625",
                      label: "Sociops",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/487434734_988246563277643_619941.png?updatedAt=1754547178573",
                      label: "Navakal",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/SPWAN%20SCHOOL%20logo%20icon.png?updatedAt=1754547178587",
                      label: "Spawn skool",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Screenshot%202025-07-30%20120335.png?updatedAt=1754547179063",
                      label: "Guerilla warfare",
                    },
                    {
                      src: "https://ik.imagekit.io/harshallax/Brands%20logos/Villakosh.jpg?updatedAt=1754725379903",
                      label: "Villakosh",
                    },
                  ].map((l, i) => (
                    <div key={`dup-${i}`} className="flex flex-col items-center gap-3 flex-shrink-0 m-shift-glow">
                      <img
                        className="w-20 h-20 rounded-full object-cover"
                        src={l.src || "/placeholder.svg"}
                        alt={l.label}
                      />
                      <div className="text-white text-sm font-medium uppercase text-center font-['Montserrat']">
                        {l.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop variant */}
        <div className="hidden lg:block">
          <div className="w-[1440px] h-80 relative bg-[#000000] overflow-hidden mx-auto mt-6 rounded-xl fade-section">
            <div className="left-[560px] top-[16px] absolute justify-start text-[#ff0303] text-5xl font-normal uppercase font-fiorello">
              Brands I worked With
            </div>
            <div className="absolute left-0 right-0 top-[97px]">
              <div className="marquee pl-12">
                <div className="marquee-track items-center" style={{ ["--duration"]: "35s" }}>
                  <div className="flex items-center gap-12 pr-12">
                    {[
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Trigona-LOGOArtboard-1.png?updatedAt=1754547178627",
                        label: "Trigona Digital",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/screenshot.png?updatedAt=1754547178861",
                        label: "Men of culture",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/IMG-20250623-WA0035(2).jpg?updatedAt=1754547178625",
                        label: "Sociops",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/487434734_988246563277643_619941.png?updatedAt=1754547178573",
                        label: "Navakal",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/SPWAN%20SCHOOL%20logo%20icon.png?updatedAt=1754547178587",
                        label: "Spawn skool",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Screenshot%202025-07-30%20120335.png?updatedAt=1754547179063",
                        label: "Guerilla warfare",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Villakosh.jpg?updatedAt=1754725379903",
                        label: "Villakosh",
                      },
                    ].map((l, i) => (
                      <div key={i} className="inline-flex flex-col justify-center items-center">
                        {l.label === "Villakosh" ? (
                          <div className="size-[120px] bg-black rounded-full" />
                        ) : (
                          <img
                            className="size-[120px] rounded-full object-cover"
                            src={l.src || "/placeholder.svg"}
                            alt={l.label}
                          />
                        )}
                        <div
                          className="mt-3 text-white text-xl font-medium uppercase"
                          style={{ fontFamily: "Montserrat, Inter, system-ui" }}
                        >
                          {l.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-12 pr-12">
                    {[
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Trigona-LOGOArtboard-1.png?updatedAt=1754547178627",
                        label: "Trigona Digital",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/screenshot.png?updatedAt=1754547178861",
                        label: "Men of culture",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/IMG-20250623-WA0035(2).jpg?updatedAt=1754547178625",
                        label: "Sociops",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/487434734_988246563277643_619941.png?updatedAt=1754547178573",
                        label: "Navakal",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/SPWAN%20SCHOOL%20logo%20icon.png?updatedAt=1754547178587",
                        label: "Spawn skool",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Screenshot%202025-07-30%20120335.png?updatedAt=1754547179063",
                        label: "Guerilla warfare",
                      },
                      {
                        src: "https://ik.imagekit.io/harshallax/Brands%20logos/Villakosh.jpg?updatedAt=1754725379903",
                        label: "Villakosh",
                      },
                    ].map((l, i) => (
                      <div key={`b-${i}`} className="inline-flex flex-col justify-center items-center">
                        {l.label === "Villakosh" ? (
                          <div className="size-[120px] bg-black rounded-full" />
                        ) : (
                          <img
                            className="size-[120px] rounded-full object-cover"
                            src={l.src || "/placeholder.svg"}
                            alt={l.label}
                          />
                        )}
                        <div
                          className="mt-3 text-white text-xl font-medium uppercase"
                          style={{ fontFamily: "Montserrat, Inter, system-ui" }}
                        >
                          {l.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Short videos hero section */}
      <div id="works">
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full px-4 py-8">
            <div className="m-reveal text-[#3d3d3d] text-sm font-semibold font-['Montserrat'] text-right mb-4">
              //Reels & Shorts
            </div>
            <div className="m-reveal text-white text-4xl sm:text-5xl font-normal font-['Montserrat'] uppercase mb-6" data-delay="1">
              Short Videos
            </div>
            <div className="m-reveal text-white text-[18px] font-medium font-['Montserrat'] capitalize text-justify mb-8" data-delay="2" style={{ fontWeight: 500, fontStyle: 'normal', lineHeight: 'normal' }}>
              My edits for Reels and TikTok turn fleeting moments into must-watch magic. From slicing clips to sync with
              viral beats to crafting intros that hook viewers in under 3 seconds, I make every frame count and every
              scroll stop.
            </div>

            {/* 2x2 video grid */}
            <div className="grid grid-cols-2 gap-4 m-reveal" data-delay="3">
              <video
                className="w-full aspect-[9/16] rounded-2xl object-cover"
                src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/moc%20video?updatedAt=1754476623664"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
              <video
                className="w-full aspect-[9/16] rounded-2xl object-cover"
                src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/First%20video?updatedAt=1754476451134"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
              <video
                className="w-full aspect-[9/16] rounded-2xl object-cover"
                src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/beauty%20video.mp4?updatedAt=1754476664130"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
              <video
                className="w-full aspect-[9/16] rounded-2xl object-cover"
                src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/gaming%20video.mp4?updatedAt=1754476772967"
                autoPlay
                loop
                muted
                playsInline
                controls
              />
            </div>
          </div>
        </div>

        {/* Desktop variant */}
  <div className="hidden lg:block w-[1440px] h-[870px] relative overflow-hidden mx-auto mt-6 fade-section">
          <video
            className="w-96 h-[708px] left-[96px] top-[68px] absolute rounded-[40px] object-cover"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/gaming%20video.mp4?updatedAt=1754476772967"
            autoPlay
            loop
            muted
            playsInline
            controls
          />

          <video
            className="w-[818px] h-[306px] left-[528px] top-[470px] absolute rounded-[40px] object-cover"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/sequnce%20timeline.mp4?updatedAt=1754549010027"
            autoPlay
            loop
            muted
            playsInline
          />

          <div
            className="left-[528px] top-[121px] absolute text-white text-8xl font-normal uppercase"
            style={{ fontFamily: "Montserrat, Inter, system-ui" }}
          >
            SHORT VIDEOS
          </div>
          <div
            className="w-[848px] left-[528px] top-[262px] absolute text-white text-2xl font-medium"
            style={{ fontFamily: "Montserrat, Inter, system-ui" }}
          >
            My edits for Reels and TikTok turn fleeting moments into must-watch magic. From slicing clips to sync with
            viral beats to crafting intros that hook viewers in under 3 seconds, I make every frame count and every
            scroll stop.
          </div>
          <div
            className="left-[1183px] top-[39px] absolute text-[#3d3d3d] text-2xl font-semibold"
            style={{ fontFamily: "Montserrat, Inter, system-ui" }}
          >
            //Reels & Shorts
          </div>
        </div>
      </div>

      {/* Three tall reels/cards container */}
  <div className="hidden lg:block w-[1440px] h-[870px] relative overflow-hidden mx-auto mt-6 fade-section">
        <div className="left-[96px] top-[81px] absolute inline-flex items-center gap-12">
          <video
            className="w-96 h-[708px] rounded-[40px] object-cover"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/moc%20video?updatedAt=1754476623664"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
          <video
            className="w-96 h-[708px] rounded-[40px] object-cover"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/First%20video?updatedAt=1754476451134"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
          <video
            className="w-96 h-[708px] rounded-[40px] object-cover"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/beauty%20video.mp4?updatedAt=1754476664130"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
      </div>

      {/* Graphics Design section */}
      <div>
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full px-5 py-14 space-y-10 bg-black/40">
            <div className="m-reveal text-[#3d3d3d] text-sm tracking-wide font-semibold font-['Montserrat']">//Graphics Design</div>
            <div className="m-reveal text-white text-4xl font-normal font-['Montserrat'] uppercase" data-delay="1">Graphics Design</div>
            <div className="m-reveal text-white text-[17px] font-medium font-['Montserrat'] capitalize text-justify" data-delay="2">
              From Bold Branding to Scroll-Stopping Visuals, I design graphics that speak louder than words. Social posts, UI mockups, marketing creatives—each pixel with purpose.
            </div>
            <div className="overflow-hidden rounded-2xl m-reveal" data-delay="3">
              <div className="marquee" style={{ ['--duration']: '36s' }}>
                <div className="marquee-track gap-3 p-3">
                  {[
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Explore%20local%20gems%20with%20Tiny%20Treks.%20Book%20your%20mini%20adventure%20today!.png?updatedAt=1754475433131",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/2.png?updatedAt=1754475432224",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/roadtrip%203.jpg?updatedAt=1754475431495",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/flyer%20himalaya.png?updatedAt=1754475430939",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/png-glass-post_01.png?updatedAt=1754475428878",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Matlab%20batch2%20sunday%20-%20saturday.jpg?updatedAt=1754475428896",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/1.png?updatedAt=1754475428696",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Frame%201.png?updatedAt=1754475428582"
                  ].map((src,i)=> (
                    <img key={i} className="w-[220px] aspect-[4/5] object-cover rounded-xl flex-shrink-0" src={src} />
                  ))}
                  {[
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Explore%20local%20gems%20with%20Tiny%20Treks.%20Book%20your%20mini%20adventure%20today!.png?updatedAt=1754475433131",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/2.png?updatedAt=1754475432224",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/roadtrip%203.jpg?updatedAt=1754475431495",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/flyer%20himalaya.png?updatedAt=1754475430939",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/png-glass-post_01.png?updatedAt=1754475428878",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Matlab%20batch2%20sunday%20-%20saturday.jpg?updatedAt=1754475428896",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/1.png?updatedAt=1754475428696",
                    "https://ik.imagekit.io/harshallax/Graphics%20pack/Frame%201.png?updatedAt=1754475428582"
                  ].map((src,i)=> (
                    <img key={`dup-gfx-${i}`} className="w-[220px] aspect-[4/5] object-cover rounded-xl flex-shrink-0" src={src} />
                  ))}
                </div>
              </div>
            </div>
            <div className="m-reveal text-white text-3xl font-normal font-['Montserrat'] uppercase" data-delay="4">YouTube Thumbnails</div>
            <div className="overflow-hidden rounded-2xl -mx-5 m-reveal" data-delay="5">
              <div className="marquee" style={{ ['--duration']: '40s' }}>
                <div className="marquee-track gap-4 p-4">
                  {[
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/GwFFJWALXzw-HD.jpg?updatedAt=1754476376887',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20hanman%20movie%20%20explain.jpg?updatedAt=1754476376321',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/uENumK2D59Y-HD.jpg?updatedAt=1754476379710',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20rdr%20p%203.png?updatedAt=1754476374718',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/bltsxB7vt7E-HD.jpg?updatedAt=1754476372812',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20before%20trailer%20kalkii.png?updatedAt=1754476372736'
                  ].map((src,i)=> (
                    <img key={i} className="w-[320px] aspect-video rounded-xl object-cover flex-shrink-0" src={src} />
                  ))}
                  {[
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/GwFFJWALXzw-HD.jpg?updatedAt=1754476376887',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20hanman%20movie%20%20explain.jpg?updatedAt=1754476376321',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/uENumK2D59Y-HD.jpg?updatedAt=1754476379710',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20rdr%20p%203.png?updatedAt=1754476374718',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/bltsxB7vt7E-HD.jpg?updatedAt=1754476372812',
                    'https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20before%20trailer%20kalkii.png?updatedAt=1754476372736'
                  ].map((src,i)=> (
                    <img key={`dup-thumb-${i}`} className="w-[320px] aspect-video rounded-xl object-cover flex-shrink-0" src={src} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop variant */}
  <div className="hidden lg:block w-[1440px] h-[2518px] relative overflow-hidden mx-auto mt-6 fade-section">
          <div className="left-[64px] top-0 absolute justify-start text-[#3d3d3d] text-2xl font-semibold font-['Montserrat']">
            //Graphics Design
          </div>
          <div className="left-[66px] top-[53px] absolute justify-start text-white text-8xl font-normal font-['Montserrat'] uppercase">
            Graphics Design
          </div>
          <div className="left-[421px] top-[1246px] absolute justify-start text-white text-5xl font-normal font-['Montserrat'] uppercase">
            Youtube Thumbnails
          </div>
          <div className="w-[1280px] left-[66px] top-[194px] absolute text-justify justify-start text-white text-2xl font-medium font-['Montserrat'] capitalize">
            From Bold Branding to Scroll-Stopping Visuals, I Design Graphics That Speak Louder Than Words. Whether It's
            Social Posts, UI Mockups, or Marketing Creatives, I Craft Each Pixel With Purpose. My Work Doesn't Just Look
            Good It Converts, Engages, and Elevates.
          </div>
          <div className="left-[69px] top-[392px] absolute inline-flex justify-start items-start gap-6">
            <img
              className="w-[308px] h-[385px] object-cover"
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/Explore%20local%20gems%20with%20Tiny%20Treks.%20Book%20your%20mini%20adventure%20today!.png?updatedAt=1754475433131"
            />
            <img
              className="w-[307px] h-96 object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/2.png?updatedAt=1754475432224"
            />
            <img
              className="w-[306px] h-[383px] object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/roadtrip%203.jpg?updatedAt=1754475431495"
            />
            <img
              className="w-[308px] h-[385px] object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/flyer%20himalaya.png?updatedAt=1754475430939"
            />
          </div>
          <div className="w-[1308px] h-[385px] left-[68px] top-[801px] absolute inline-flex justify-start items-start gap-6 overflow-hidden">
            <img
              className="w-[308px] h-[385px] object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/png-glass-post_01.png?updatedAt=1754475428878"
            />
            <img
              className="w-[307px] h-96 object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/Matlab%20batch2%20sunday%20-%20saturday.jpg?updatedAt=1754475428896"
            />
            <img
              className="w-[308px] h-[385px] object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/1.png?updatedAt=1754475428696"
            />
            <img
              className="w-[308px] h-[385px] object-cover "
              src="https://ik.imagekit.io/harshallax/Graphics%20pack/Frame%201.png?updatedAt=1754475428582"
            />
          </div>
          <div className="left-[100px] top-[1343px] absolute inline-flex justify-center items-center gap-[34px]">
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/GwFFJWALXzw-HD.jpg?updatedAt=1754476376887"
            />
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20hanman%20movie%20%20explain.jpg?updatedAt=1754476376321"
            />
          </div>
          <div className="w-[1243px] left-[99px] top-[1721px] absolute inline-flex justify-start items-center gap-[34px]">
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/uENumK2D59Y-HD.jpg?updatedAt=1754476379710"
            />
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20rdr%20p%203.png?updatedAt=1754476374718"
            />
          </div>
          <div className="w-[1242px] left-[99px] top-[2099px] absolute inline-flex justify-start items-start gap-[34px]">
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/bltsxB7vt7E-HD.jpg?updatedAt=1754476372812"
            />
            <img
              className="w-[604px] h-[340px] object-cover "
              src="https://ik.imagekit.io/harshallax/youtube%20thumbnails/Copy%20of%20before%20trailer%20kalkii.png?updatedAt=1754476372736"
            />
          </div>
        </div>
      </div>

      {/* Drive image section (Scan for Drive Folder banner) */}
      <div>
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full px-4 py-8 text-center">
            <div className="m-reveal text-white text-2xl sm:text-3xl font-normal font-['Montserrat'] uppercase mb-2">
              Scan For
            </div>
            <div className="m-reveal text-[#ff0303] text-4xl sm:text-5xl font-normal uppercase font-fiorello mb-6" data-delay="1">
              Drive Folder
            </div>
            <img
              className="m-reveal w-full max-w-sm mx-auto rounded-2xl object-cover m-parallax" ref={registerParallax} data-parallax-speed="0.05"
              src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/drive%20scan%201.png?updatedAt=1754722494884"
              alt="Scan for Drive folder"
            />
          </div>
        </div>

        {/* Desktop variant */}
  <div className="hidden lg:block w-[1440px] h-[870px] relative overflow-hidden mx-auto mt-6 fade-section">
          <img
            className="w-[1440px] h-[870px] object-cover rounded-2xl"
            src="https://ik.imagekit.io/harshallax/Main%20Video%20Projects/drive%20scan%201.png?updatedAt=1754722494884"
          />
        </div>
      </div>

      {/* UI/UX Designs section */}
      <div>
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full px-5 py-16 space-y-10">
            <div className="m-reveal text-[#3d3d3d] text-sm tracking-wide font-semibold font-['Montserrat']">//UI/UX DESIGNS</div>
            <div className="m-reveal text-white text-4xl font-normal font-['Montserrat'] uppercase" data-delay="1">ui/ux designs</div>
            <div className="m-reveal text-white text-[17px] font-medium font-['Montserrat'] capitalize text-justify" data-delay="2">
              Seamless interfaces & intuitive journeys. Mobile apps, responsive sites, web apps—each screen balances
              clean aesthetics with user intent to engage and convert.
            </div>
            <div className="overflow-hidden rounded-2xl -mx-5 m-reveal" data-delay="3">
              <div className="marquee" style={{ ['--duration']: '44s' }}>
                <div className="marquee-track gap-4 p-4">
                  {[
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/index.png?updatedAt=1754476832541',
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/Web%201920%20_%201.png?updatedAt=1754476832261',
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/xjammer%20site.png?updatedAt=1754476831650'
                  ].map((src,i)=> (
                    <img key={i} className="w-[300px] aspect-video rounded-2xl object-cover flex-shrink-0" src={src} />
                  ))}
                  {[
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/index.png?updatedAt=1754476832541',
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/Web%201920%20_%201.png?updatedAt=1754476832261',
                    'https://ik.imagekit.io/harshallax/UI%20UX%20pics/xjammer%20site.png?updatedAt=1754476831650'
                  ].map((src,i)=> (
                    <img key={`dup-ui-${i}`} className="w-[300px] aspect-video rounded-2xl object-cover flex-shrink-0" src={src} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop variant */}
  <div className="hidden lg:block w-[1444px] h-[870px] relative overflow-hidden mx-auto mt-6 fade-section">
          <div className="left-[632px] top-[72px] absolute justify-start text-white text-8xl font-normal font-['Montserrat'] uppercase">
            ui/ux designs
          </div>
          <div className="left-[64px] top-[49px] absolute justify-start text-[#3d3d3d] text-2xl font-semibold font-['Montserrat']">
            //UI/UX DESIGNS
          </div>
          <div className="w-[1312px] left-[64px] top-[237px] absolute text-justify justify-start text-white text-2xl font-medium font-['Montserrat'] capitalize">
            From Seamless Interfaces to Intuitive Journeys, I Design Experiences That Users Remember. Whether it's
            mobile apps, responsive websites, or web apps, every screen I create is built with purpose—balancing
            aesthetic precision with user behavior. My designs don't just look clean — they guide, engage, and convert.
          </div>
          <div className="left-[64px] top-[401px] absolute w-[1316px]">
            <div className="marquee" style={{ ["--duration"]: "40s" }}>
              <div className="marquee-track gap-[17px] items-center">
                <img
                  className="w-[636px] h-[358px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/index.png?updatedAt=1754476832541"
                />
                <img
                  className="w-[636px] h-[358px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/Web%201920%20_%201.png?updatedAt=1754476832261"
                />
                <img
                  className="w-[645px] h-[363px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/xjammer%20site.png?updatedAt=1754476831650"
                />
                <img
                  className="w-[636px] h-[358px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/index.png?updatedAt=1754476832541"
                />
                <img
                  className="w-[636px] h-[358px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/Web%201920%20_%201.png?updatedAt=1754476832261"
                />
                <img
                  className="w-[645px] h-[363px] rounded-[42px] object-cover"
                  src="https://ik.imagekit.io/harshallax/UI%20UX%20pics/xjammer%20site.png?updatedAt=1754476831650"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank you section */}
      <div id="contact">
        {/* Mobile variant */}
        <div className="lg:hidden">
          <div className="w-full px-4 py-12 text-center">
            <div className="m-reveal text-[#ff0303] text-6xl sm:text-7xl font-normal uppercase font-fiorello leading-none">
              Thankyou
            </div>
          </div>
        </div>

        {/* Desktop variant*/}
  <div className="hidden lg:block w-[1440px] h-[870px] relative overflow-hidden mx-auto mt-auto fade-section">
          <div className="w-[684px] h-[194px] left-[380px] top-[293px] absolute justify-start text-[#ff0303] text-[240px] font-normal uppercase font-fiorello">
            Thankyou
          </div>
          <div className="w-[978px] h-[29px] left-[233px] top-[578px] absolute inline-flex justify-start items-start gap-[126px] flex-wrap content-start">
            <a
              href="#"
              className="w-[116px] h-[37px] justify-start text-[#ff0303] text-4xl font-normal uppercase font-fiorello transition-colors duration-300 hover:text-[#ffffff]"
            >
              Instagram
            </a>
            <a href="#" className="justify-start text-[#ff0404] text-4xl font-normal uppercase font-fiorello transition-colors duration-300 hover:text-[#ffffff]">
              upwork
            </a>
            <a href="#" className="justify-start text-[#ff0404] text-4xl font-normal uppercase font-fiorello transition-colors duration-300 hover:text-[#ffffff]">
              linked in
            </a>
            <a href="#" className="justify-start text-[#ff0404] text-4xl font-normal uppercase font-fiorello transition-colors duration-300 hover:text-[#ffffff]">
              e-mail
            </a>
            <a href="#" className="justify-start text-[#ff0404] text-4xl font-normal uppercase font-fiorello transition-colors duration-300 hover:text-[#ffffff]">
              whatsapp
            </a>
          </div>
        </div>
      </div>
      {/* Mobile floating Contact Me button */}
      <div className="lg:hidden fixed bottom-6 right-4 z-40">
        {/* Expanded panel */}
        <div className={`flex flex-col items-end mb-3 space-y-3 transition-all duration-300 origin-bottom ${contactFabOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 pointer-events-none translate-y-4'}`} aria-hidden={!contactFabOpen}>
          {[
            { label: 'Instagram', href: '#', color: '#E4405F' },
            { label: 'Upwork', href: '#', color: '#14a800' },
            { label: 'LinkedIn', href: '#', color: '#0A66C2' },
            { label: 'E-mail', href: 'mailto:Harshallax@gmail.com', color: '#ff7300' },
            { label: 'WhatsApp', href: '#', color: '#25D366' }
          ].map((s, i) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#111]/90 backdrop-blur border border-white/10 shadow-md hover:shadow-lg transition text-sm font-medium whitespace-nowrap"
              style={{ color: s.color }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
              <span className="text-white capitalize" style={{ color: '#fff' }}>{s.label}</span>
            </a>
          ))}
        </div>
        {/* FAB */}
        <button
          type="button"
          aria-expanded={contactFabOpen}
          aria-label={contactFabOpen ? 'Close contact options' : 'Open contact options'}
          onClick={() => setContactFabOpen(o => !o)}
          className={`group relative flex items-center justify-center rounded-full font-semibold uppercase tracking-wide shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#ff0303]/60 active:scale-95 ${contactFabOpen ? 'bg-white text-black' : 'bg-[#ff0303] text-white'} w-16 h-16`}
        >
          <span className={`absolute inset-0 rounded-full border-2 transition-opacity ${contactFabOpen ? 'border-black/20 opacity-100' : 'border-white/30 opacity-50 group-hover:opacity-80'}`}></span>
          <span className="text-[10px] leading-tight text-center px-1 select-none">
            {contactFabOpen ? 'Close' : 'Contact'}
          </span>
        </button>
      </div>
    </div>
  )
}
