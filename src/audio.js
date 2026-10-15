export class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.context = null;
    this.timer = null;
    this.noteIndex = 0;
    this.active = false;
  }

  async unlock() {
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = 0.13;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') await this.context.resume();
    this.active = true;
    this.sync();
  }

  tone(freq, duration = 0.12, wave = 'sine', volume = 0.3, delay = 0) {
    if (!this.active || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime + delay, o = this.context.createOscillator(), g = this.context.createGain();
    o.type = wave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(volume, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(now);
    o.stop(now + duration + 0.02);
  }

  sfx(name) {
    if (!this.settings.sfx) return;
    if (name === 'sale') {
      this.tone(660, 0.11, 'square', 0.15);
      this.tone(880, 0.18, 'triangle', 0.3, 0.08);
    } else if (name === 'level') {
      [523, 659, 784, 1046].forEach((n, i) => this.tone(n, 0.25, 'triangle', 0.35, i * 0.1));
    } else if (name === 'open') {
      this.tone(784, 0.2, 'sine', 0.5);
      this.tone(1047, 0.35, 'sine', 0.4, 0.12);
    } else if (name === 'upgrade') {
      [440, 554, 659, 880].forEach((n, i) => this.tone(n, 0.16, 'triangle', 0.28, i * 0.07));
    } else if (name === 'restock') {
      this.tone(440, 0.09, 'triangle', 0.22);
      this.tone(587, 0.12, 'triangle', 0.25, 0.06);
    } else {
      this.tone(380, 0.045, 'triangle', 0.15);
    }
  }

  sync() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.settings.music && this.active && this.context?.state === 'running') {
      const melody = [64, 0, 67, 71, 69, 67, 64, 62, 60, 0, 64, 67, 65, 64, 62, 0, 64, 67, 72, 71, 69, 0, 67, 64, 62, 65, 69, 67, 64, 62, 60, 0];
      const bass = [48, 48, 45, 45, 53, 53, 55, 55];
      this.timer = setInterval(() => {
        let i = this.noteIndex++ % 32;
        const pitch = melody[i];
        if (pitch) this.tone(440 * Math.pow(2, (pitch - 69) / 12), 0.21, 'triangle', 0.22);
        if (i % 4 === 0) this.tone(440 * Math.pow(2, (bass[Math.floor(i / 4)] - 69) / 12), 0.7, 'triangle', 0.3);
        if (i % 2 === 1) this.tone(95, 0.03, 'square', 0.035);
      }, 240);
    }
  }

  suspend() {
    this.active = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.context?.suspend();
  }

  resume() {
    if (this.context) {
      this.active = true;
      this.context.resume().then(() => this.sync()).catch(() => {});
    }
  }
}
