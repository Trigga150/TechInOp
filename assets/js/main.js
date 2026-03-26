document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }

  // Voice features: navigation announcements + page reader
  const supportsSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  if (supportsSpeech) {
    let preferredVoice = null;

    const selectPreferredVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || !voices.length) return;

      // Try to pick a female‑sounding English voice if available
      const femaleNamePattern = /(female|woman|zira|samantha|linda|susan|heather|aria|joanna|emma)/i;
      preferredVoice =
        voices.find((v) => femaleNamePattern.test(v.name)) ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) ||
        voices[0];
    };

    // Initial load (may be empty on some browsers)
    selectPreferredVoice();
    // Load again when voices become available
    if (typeof window.speechSynthesis.onvoiceschanged !== "undefined") {
      window.speechSynthesis.onvoiceschanged = selectPreferredVoice;
    }

    const speak = (message) => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fail silently if speech fails
      }
    };

    // Announce when navigating between tabs (pages/sections)
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        const label = (link.textContent || "").trim();
        if (!label) return;
        const isSamePageAnchor = link.getAttribute("href")?.startsWith("#");
        const message = isSamePageAnchor
          ? `Switching to ${label} section.`
          : `Opening ${label} page.`;
        speak(message);
      });
    });

    // Special welcome message when clicking the TechInOp logo to go Home
    document.querySelectorAll("a.logo").forEach((logoLink) => {
      logoLink.addEventListener("click", () => {
        speak("Welcome to Technology In Operation site. We are engineering the future today.");
      });
    });

    // Listen-to-page button
    const getPageText = () => {
      const main = document.querySelector("main");
      if (!main) return "";
      const text = main.innerText || "";
      return text.replace(/\s+/g, " ").trim();
    };

    const updateListenButtons = (isActive) => {
      document.querySelectorAll(".listen-btn").forEach((btn) => {
        btn.textContent = isActive ? "Stop listening" : "Listen to page";
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    let isReadingPage = false;

    const readPage = () => {
      const content = getPageText();
      if (!content) return;
      // Cancel anything currently speaking and read the page content
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        isReadingPage = false;
        updateListenButtons(false);
      };
      isReadingPage = true;
      updateListenButtons(true);
      window.speechSynthesis.speak(utterance);
    };

    const stopReading = () => {
      window.speechSynthesis.cancel();
      isReadingPage = false;
      updateListenButtons(false);
    };

    document.querySelectorAll(".listen-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        if (isReadingPage) {
          stopReading();
        } else {
          readPage();
        }
      });
    });

    // Contact page validation: voice feedback on missing/invalid fields
    const onContactPage =
      (window.location && window.location.pathname && window.location.pathname.endsWith("contact.html")) ||
      document.title.toLowerCase().includes("contact");
    if (onContactPage) {
      const forms = document.querySelectorAll("form");
      forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            speak(
              "Please fill in all required fields before submitting. Also check that your email address is written in the correct format."
            );
            if (typeof form.reportValidity === "function") {
              form.reportValidity();
            }
          }
        });
      });
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
});

