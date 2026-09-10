// app/[slug]/utils/launchConfetti.ts

export function launchConfetti(colors?: string[]) {
  const defaultColors = ['#c9a96e', '#f9f5f0', '#ffffff', '#d4af7a'];
  const palette = colors ?? defaultColors;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';

  script.onload = () => {
    const confetti = (window as any).confetti;
    if (!confetti) return;

    // Kiri bawah
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.1, y: 0.9 },
      colors: palette,
    });

    // Kanan bawah
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.9, y: 0.9 },
        colors: palette,
      });
    }, 200);

    // Tengah
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.6 },
        colors: palette,
        gravity: 0.8,
      });
    }, 400);
  };

  // Kalau script sudah ada, langsung jalankan
  if ((window as any).confetti) {
    script.onload(new Event('load'));
    return;
  }

  document.head.appendChild(script);
}
