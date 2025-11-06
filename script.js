
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const gravity = 0.8;
  const keys = {left:false,right:false,up:false};
  let scoreEl = document.getElementById('score');
  let vitEl = document.getElementById('vit');
  let restartBtn = document.getElementById('restart');

  const player = {
    x: W/2,
    y: H-80,
    r: 22,
    vx: 0,
    vy: 0,
    color: '#ff9b2e',
    onGround: false
  };

  let platforms = [];
  let vitamins = [];
  let maxYReached = H;
  let score = 0;
  let vitaminsCollected = 0;
  let gameOver = false;
  let scrollY = 0;

  function initLevel() {
    platforms = [];
    vitamins = [];
    platforms.push({x:0,y:H-40,w:W,h:40,type:'static'});
    // random platforms 
    for (let i=0;i<12;i++){
      const pw = 100 + Math.random()*120;
      const px = Math.random()*(W-pw);
      const py = H - 100 - i*90 + Math.random()*40;
      platforms.push({x:px,y:py,w:pw,h:14,type: Math.random()>0.8 ? 'moving' : 'static', dir:1, range:60});
      if (Math.random() < 0.4) {
        vitamins.push({x:px + 20 + Math.random()*(pw-40), y:py-24, r:10, collected:false});
      }
    }
    player.x = W/2; player.y = H-80; player.vx=0; player.vy=0;
    maxYReached = H;
    score = 0; vitaminsCollected = 0; gameOver = false; scrollY = 0;
    updateHUD();
  }

  function updateHUD(){
    scoreEl.textContent = 'Score: ' + Math.max(0, Math.floor(score));
    vitEl.textContent = 'Vitamins: ' + vitaminsCollected;
  }

  function drawMandarin(x,y,r) {
    ctx.beginPath();
    ctx.fillStyle = '#ff9b2e';
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.ellipse(x - r*0.28, y - r*0.3, r*0.6, r*0.35, Math.PI/6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#2b2b2b';
    ctx.beginPath(); ctx.arc(x - r*0.25, y - r*0.05, r*0.13,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + r*0.18, y - r*0.05, r*0.13,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.strokeStyle='#481a00'; ctx.lineWidth=2;
    ctx.arc(x, y + r*0.08, r*0.5, 0.15*Math.PI, 0.85*Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.fillStyle='#2f8f3a';
    ctx.ellipse(x - r*0.6, y - r*0.9, r*0.35, r*0.18, -0.5, 0, Math.PI*2); ctx.fill();
  }

  function collidePlatform(p){
    const cx = player.x, cy = player.y + player.r;
    if (cx + player.r > p.x && cx - player.r < p.x + p.w){
      if (player.vy > 0 && cy <= p.y + player.vy + 1 && cy + player.vy >= p.y) {
        player.y = p.y - player.r;
        player.vy = 0;
        player.onGround = true;
        return true;
      }
    }
    return false;
  }

  function update(dt) {
    if (gameOver) return;
    const acc = 0.8;
    if (keys.left) player.vx -= acc;
    if (keys.right) player.vx += acc;
    player.vx *= 0.92;
    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;
    if (player.x < -player.r) player.x = W + player.r;
    if (player.x > W + player.r) player.x = -player.r;

    player.onGround = false;
    platforms.forEach(p=>{
      if (p.type === 'moving') {
        p.x += 1.2 * p.dir;
        if (p.x < 0 || p.x + p.w > W) p.dir *= -1;
      }
    });
    for (let i=0;i<platforms.length;i++){
      if (collidePlatform(platforms[i])) break;
    }
    vitamins.forEach(v=>{
      if (!v.collected){
        const dx = player.x - v.x, dy = player.y - v.y;
        const dist = Math.hypot(dx,dy);
        if (dist < player.r + v.r - 4){
          v.collected = true;
          vitaminsCollected++;
        }
      }
    });

    if (player.y < maxYReached) {
      score += (maxYReached - player.y) * 0.02;
      maxYReached = player.y;
    }

 
    const threshold = H * 0.42;
    if (player.y < threshold) {
      const dy = threshold - player.y;
      player.y += dy;
      platforms.forEach(p => p.y += dy);
      vitamins.forEach(v => v.y += dy);
      score += dy * 0.03;
    }


    platforms = platforms.filter(p => p.y < H + 100);
    while (platforms.length < 14) {
      const pw = 100 + Math.random()*120;
      const px = Math.random()*(W-pw);
      const py = -40 - Math.random()*120;
      platforms.push({x:px,y:py,w:pw,h:14,type: Math.random()>0.85 ? 'moving' : 'static', dir: Math.random()>0.5?1:-1, range:60});
      if (Math.random() < 0.45) {
        vitamins.push({x:px + 20 + Math.random()*(pw-40), y:py-24, r:10, collected:false});
      }
    }

    if (player.y - player.r > H + 80) {
      gameOver = true;
      setTimeout(()=>alert('Game Over! Score: ' + Math.floor(score) + '\nVitamins: ' + vitaminsCollected), 10);
    }

    updateHUD();
  }

  function render() {

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i=0;i<6;i++){
      ctx.beginPath();
      ctx.ellipse(120 + i*140, 80 + Math.sin(i+Date.now()/2000)*8, 90, 30, 0,0,Math.PI*2);
      ctx.fill();
    }


    platforms.forEach(p=>{
      ctx.fillStyle = '#7bbf83';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

   
    vitamins.forEach(v=>{
      if (v.collected) return;
      ctx.beginPath();
      ctx.fillStyle = '#ffd84a';
      ctx.arc(v.x, v.y, v.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(v.x-3, v.y-4, v.r*0.6,0,Math.PI*2); ctx.fill();
  
      ctx.strokeStyle='rgba(255,200,50,0.9)'; ctx.lineWidth=2;
      for (let a=0;a<6;a++){
        const ang = a*(Math.PI*2/6) + Date.now()/700;
        ctx.beginPath(); ctx.moveTo(v.x + Math.cos(ang)*v.r*1.2, v.y + Math.sin(ang)*v.r*1.2);
        ctx.lineTo(v.x + Math.cos(ang)*(v.r+8), v.y + Math.sin(ang)*(v.r+8)); ctx.stroke();
      }
    });

    drawMandarin(player.x, player.y, player.r);

   
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(12,12,160,36);
    ctx.fillStyle='#333'; ctx.font='16px sans-serif'; ctx.fillText('Score: '+Math.floor(score),20,36);
    ctx.fillStyle='#333'; ctx.font='14px sans-serif'; ctx.fillText('Vitamins: '+vitaminsCollected,110,36);
  }

  let last = performance.now();
  function loop(t){
    const dt = t - last;
    last = t;
    update(dt/16.6);
    render();
    requestAnimationFrame(loop);
  }

  
  window.addEventListener('keydown', e=>{
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      if (player.onGround || player.vy === 0) {
        player.vy = -14;
        player.onGround = false;
      }
    }
  });
  window.addEventListener('keyup', e=>{
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  restartBtn.addEventListener('click', ()=>{
    initLevel();
  });

  
  initLevel();
  requestAnimationFrame(loop);
})();