
document.addEventListener('DOMContentLoaded', function() {
  // ============== DOM Elements ==============
  const popup = document.getElementById('team-popup');
  const allowNotifications = document.getElementById('allow-notifications');
  const teamOptions = document.querySelectorAll('.team-option');
  const logo = document.getElementById('logo');
  
  // Create cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = 'Cancel';
  document.querySelector('.popup-content').appendChild(cancelBtn);

  // ============== Install Prompt ==============
  let deferredPrompt;
  const installButton = document.createElement('button');
  installButton.className = 'install-btn';
  installButton.textContent = 'Install';
  document.querySelector('.popup-content').prepend(installButton);
  installButton.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installButton.style.display = 'none';
        deferredPrompt = null;
      }
    }
  });

  // ============== Storage Handling ==============
  const storageAvailable = (() => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  })();

  // ============== Team Selection ==============
  teamOptions.forEach(btn => {
    btn.style.pointerEvents = 'none';
    btn.dataset.originalText = btn.textContent;
  });

  allowNotifications.addEventListener('change', (e) => {
    teamOptions.forEach(btn => {
      btn.style.pointerEvents = e.target.checked ? 'auto' : 'none';
    });
  });

  // ============== Popup Logic ==============
  setTimeout(() => {
    popup.style.display = 'block';
    void popup.offsetWidth;
    popup.classList.add('show');
  }, 20000);

  // ============== Event Handlers ==============
  cancelBtn.addEventListener('click', () => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
      if (storageAvailable) localStorage.setItem('popupDismissed', 'true');
    }, 500);
  });

  teamOptions.forEach(option => {
    option.addEventListener('click', async function() {
      if (allowNotifications.checked) {
        const team = this.dataset.team;
        this.textContent = 'Applying...';
        
        // Visual change immediately
        logo.href = `${team}.png`;
        
        // Save if possible
        if (storageAvailable) localStorage.setItem('selectedTeam', team);
        
        // Hide popup
        popup.classList.remove('show');
        setTimeout(() => {
          popup.style.display = 'none';
          this.textContent = this.dataset.originalText;
        }, 500);
        
        // Setup notifications
        try {
          await setupNotifications(team);
        } catch(e) {
          console.log('Notification setup failed:', e);
        }
      }
    });
  });

  // ============== Notification System ==============
  async function setupNotifications(team) {
    if (!('Notification' in window)) return;
    
    let registration;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register('sw.js');
      } catch(e) {
        console.log('ServiceWorker failed, using fallback');
      }
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (registration) {
        scheduleNotifications(team, registration);
      } else {
        showFallbackNotification(team);
      }
    }
  }

  function scheduleNotifications(team, registration) {
    // Immediate notification
    sendNotification(team, registration);
    
    // Daily at 7AM (Sun-Thu)
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 7 && now.getMinutes() === 0 && now.getDay() !== 5 && now.getDay() !== 6) {
        sendNotification(team, registration);
      }
    }, 60000);
  }

  function sendNotification(team, registration) {
    const quote = getRandomQuote(team);
    if (registration) {
      registration.showNotification('CornerRoom', {
        body: quote,
        icon: `${team}.png`, // FIXED: Properly closed backtick
        data: { url: 'https://lobby.cornerroom.co.za' }
      });
    } else {
      new Notification('CornerRoom', {
        body: quote,
        icon: `${team}.png` // FIXED: Properly closed backtick
      });
    }
  }

  function showFallbackNotification(team) {
    const quote = getRandomQuote(team);
    new Notification('CornerRoom', {
      body: quote,
      icon: `${team}.png` // FIXED: Properly closed backtick
    });
  }
  function getRandomQuote(team) {
    const quotes = {
    'black': [
      "Solitude forges stronger men than crowds ever could.",
      "A man at peace alone is a storm in waiting.",
      "The weights don't negotiate. Neither should you.",
      "Loneliness is the gym where champions train unnoticed.",
      "They'll notice when you're done, not while you work.",
      "One disciplined year beats a lifetime of wishes.",
      "The mirror reflects effort before it shows results.",
      "Silence isn't empty—it's where focus lives.",
      "No crowds at 5AM where legends train.",
      "They call it isolation. You call it preparation.",
      "The black path is walked alone for a reason.",
      "Excuses expire faster than discipline does.",
      "A man comfortable alone is never truly weak.",
      "Your doubters sleep while you're already winning.",
      "The iron never lies about your commitment.",
      "Solitude is the price of exceptionalism.",
      "No team? No problem. You're the franchise.",
      "Black isn't the absence of color—it's depth.",
      "They'll ask for your secret after it's too late.",
      "The weights judge you fairly every time.",
      "A quiet man's success speaks loudest.",
      "No audience needed for personal greatness.",
      "The black jersey fits all who earn it.",
      "Your future self thanks today's discipline.",
      "No shortcuts where legends are made.",
      "The solo path leads where crowds can't.",
      "Strength grows in silent dedication.",
      "They'll remember your results, not your excuses.",
      "Black absorbs all light to reflect none back.",
      "Your discipline outlasts their opinions.",
      "The grind doesn't take weekends off.",
      "No applause in the pre-dawn gym.",
      "Black isn't a color—it's a statement.",
      "Your sweat writes checks your body cashes.",
      "The weights only ask one question: 'How bad?'",
      "No teammates to blame, no one to hold back.",
      "Solitude is the anvil where men are forged.",
      "They'll copy you when it's convenient.",
      "Black doesn't fade under pressure.",
      "Your commitment is measured in reps, not words.",
      "The iron temple asks for daily attendance.",
      "No crowds on the road less traveled.",
      "Your discipline is your signature.",
      "Black absorbs pain to radiate strength.",
      "The weights keep honest records.",
      "No shortcuts where character is built.",
      "Your silence intimidates more than words could.",
      "Black isn't lonely—it's selective.",
      "The early hours belong to the dedicated.",
      "No witnesses to your hardest reps.",
      "Your consistency is your superpower.",
      "Black doesn't apologize for standing apart.",
      "The weights reward action, not intention.",
      "No committee votes on your worth.",
      "Your discipline is the compass others follow.",
      "Black isn't absence—it's potential.",
      "The iron never flatters, only reveals.",
      "No crowd noise in your personal arena.",
      "Your sweat is the ink of your legacy."
    ],
    'gold': [
      "Phoenixes don't apologize for rising.",
      "Your worth isn't his to measure.",
      "Rebirth begins when you stop asking permission.",
      "Gold doesn't tarnish waiting for approval.",
      "Stronger alone than in bad company.",
      "Your glow isn't for his eyes.",
      "Independence looks better than any ring.",
      "Self-worth isn't a group project.",
      "You weren't discarded—you were upgraded.",
      "A queen owns her throne first.",
      "Gold shines without polishing from others.",
      "Your comeback outshines their rejection.",
      "No apologies for outgrowing small minds.",
      "Your fire isn't for warming others.",
      "Rebirth isn't pretty. Neither was birth.",
      "Gold women set their own price.",
      "Your value isn't his to appraise.",
      "Stronger in your own light.",
      "Phoenixes don't look back at ashes.",
      "Your crown was never his to give.",
      "Independent women write better endings.",
      "Gold doesn't wait for moonlight to shine.",
      "Your standards filter out the unworthy.",
      "Rebirth begins at rock bottom.",
      "No apologies for becoming yourself.",
      "Your glow comes from within.",
      "Stronger alone than with anchors.",
      "Gold women don't bargain for love.",
      "Your worth isn't a debate.",
      "Phoenixes rise because they choose to.",
      "No permission needed for greatness.",
      "Your independence is your attraction.",
      "Gold doesn't reflect—it radiates.",
      "Your strength intimidates the weak.",
      "Rebirth requires burning the old.",
      "No compromises on self-respect.",
      "Your light isn't for his path.",
      "Stronger after every reinvention.",
      "Gold women don't chase—they attract.",
      "Your standards protect your peace.",
      "Phoenixes don't explain their fire.",
      "No returns to what diminished you.",
      "Your growth makes exes nostalgic.",
      "Gold doesn't blend in.",
      "Your comeback is their regret.",
      "Rebirth is a solo journey.",
      "No shrinking for small minds.",
      "Your independence is non-negotiable.",
      "Gold women outlast trends.",
      "Your fire lights better paths.",
      "Stronger when you walk away.",
      "Phoenixes don't fear flames.",
      "Your worth isn't tied to him.",
      "No downgrades after knowing your value.",
      "Your glow needs no witness.",
      "Gold doesn't tarnish in storms.",
      "Your rebirth terrifies those who left.",
      "No apologies for self-love.",
      "Your strength is your signature.",
      "Phoenixes rise on their own schedule."
    ],
    'green-gold': [
      "Our colors don't run from challenges.",
      "Gold medals fade. National pride doesn't.",
      "Legacy isn't given—it's taken daily.",
      "Green represents growth under pressure.",
      "Gold isn't worn—it's earned.",
      "Our anthem sounds sweeter after struggle.",
      "Champions bleed green and gold first.",
      "National pride outlasts all trends.",
      "Our colors unite where others divide.",
      "Gold shines brighter on home soil.",
      "Green represents roots no storm shakes.",
      "Legacy is built between the whistles.",
      "Our pride isn't seasonal—it's permanent.",
      "Gold isn't given to the timid.",
      "Green fields grow future legends.",
      "National colors don't apologize for winning.",
      "Our heritage isn't for spectators.",
      "Gold moments are born in green grind.",
      "Champions return home heavier with medals.",
      "Our pride weighs more than gold.",
      "Green isn't just a color—it's resilience.",
      "Gold standards start with green effort.",
      "Legacy isn't a solo project.",
      "Our colors reflect in every trophy.",
      "National pride fuels extra reps.",
      "Green represents depth of character.",
      "Gold isn't found—it's forged.",
      "Our anthem plays louder in adversity.",
      "Champions wear green under the gold.",
      "Legacy outlives the scoreboard.",
      "Green isn't passive—it's growing.",
      "Gold doesn't shine without pressure.",
      "Our colors don't blend in.",
      "National pride is non-negotiable.",
      "Green represents untamed potential.",
      "Gold moments start green choices.",
      "Our heritage demands excellence.",
      "Champions don't choose—they're chosen.",
      "Legacy is written in sweat.",
      "Green fields don't grow doubts.",
      "Gold isn't kept—it's defended.",
      "Our colors withstand all weather.",
      "National pride isn't part-time.",
      "Green represents unstoppable growth.",
      "Gold standards reject mediocrity.",
      "Our anthem echoes in empty gyms.",
      "Champions are grown, not born.",
      "Legacy isn't left—it's built.",
      "Green isn't envious—it's dominant.",
      "Gold doesn't tarnish with age.",
      "Our colors outshine all others.",
      "National pride is our compass.",
      "Green represents relentless progress.",
      "Gold isn't given—it's taken.",
      "Our heritage isn't for sale.",
      "Champions don't explain—they prove.",
      "Legacy is measured in impact.",
      "Green fields hide no shortcuts.",
      "Gold moments reward green habits.",
      "Our colors don't follow—they lead."
    ],
    'original': [
      "The first rep changes everything.",
      "Tomorrow's results buy today's effort.",
      "The mirror doesn't negotiate.",
      "Your only competition is yesterday.",
      "Motivation fades. Discipline stays.",
      "Small steps outpace big talk.",
      "The grind loves consistency.",
      "Excuses don't burn calories.",
      "Start before you're ready.",
      "Progress hides in discomfort.",
      "The weights don't lie.",
      "Your future self is watching.",
      "No magic—just work.",
      "Discipline is freedom.",
      "The body achieves what the mind believes.",
      "One percent better daily.",
      "Sweat is magic in liquid form.",
      "The pain is temporary. Pride lasts.",
      "No shortcuts to worth having.",
      "Your only limit is you.",
      "The first step is the hardest.",
      "Dreams don't work unless you do.",
      "The gym doesn't care about your day.",
      "Stronger than your excuses.",
      "The process is the prize.",
      "Be the reason you win.",
      "The only bad workout is none.",
      "Your sweat is your signature.",
      "The effort shows when results don't.",
      "No elevator—just stairs.",
      "The body hears what the mind says.",
      "Small gains create big results.",
      "The discomfort zone is where magic happens.",
      "You vs. yesterday—no one else.",
      "The weights judge effort, not words.",
      "Your habits write your future.",
      "The comeback is stronger than the setback.",
      "No crowds on the extra mile.",
      "The early morning belongs to champions.",
      "Your persistence is your power.",
      "The grind reveals character.",
      "No magic pill—just work.",
      "The sweat will dry. The pride won't.",
      "Your discipline is your advantage.",
      "The best project is yourself.",
      "No growth in comfort zones.",
      "The struggle is part of the story.",
      "Your effort is an investment.",
      "The only easy day was yesterday.",
      "No finish line—just progress.",
      "The weights respond to action.",
      "Your consistency beats talent.",
      "The pain of discipline or regret.",
      "No shortcuts to new you.",
      "The work works if you do.",
      "Your progress is your motivation.",
      "The body achieves what the mind believes.",
      "No limits—just plateaus.",
      "The extra rep changes everything."
    ]
  };

  const randomIndex = Math.floor(Math.random() * quotes[team].length);
      return quotes[team][randomIndex];
    }
  
    function showNotification(team, quote) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('CornerRoom', {
            body: quote,
            icon: `${team}.png`,
            data: { url: 'https://lobby.cornerroom.co.za' }
          });
        });
      }
    }
  });
