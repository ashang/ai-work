import "./style.css";

class FlipClock {
  constructor() {
    this.hours = document.getElementById('hours');
    this.minutes = document.getElementById('minutes');
    this.seconds = document.getElementById('seconds');
    this.currentTime = { h: 0, m: 0, s: 0 };
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    if (h !== this.currentTime.h) this.flip(this.hours, h);
    if (m !== this.currentTime.m) this.flip(this.minutes, m);
    if (s !== this.currentTime.s) this.flip(this.seconds, s);

    this.currentTime = { h, m, s };
  }

  flip(element, newValue) {
    const formatted = newValue.toString().padStart(2, '0');
    const back = element.querySelector('.flip-card-back');
    
    back.textContent = formatted;
    element.classList.add('flip');
    
    setTimeout(() => {
      const front = element.querySelector('.flip-card-front');
      front.textContent = formatted;
      element.classList.remove('flip');
    }, 300);
  }
}

new FlipClock();
