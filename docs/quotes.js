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
    void popup.offsetWidth; // Trigger reflow
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
    option.addEventListener('click', function() {
      if (allowNotifications.checked) {
        const team = this.dataset.team;
        const originalText = this.dataset.originalText;
        this.textContent = 'Applying...';
        
        // Visual change immediately
        logo.href = `/${team}.png`;
        
        // Save if possible
        if (storageAvailable) localStorage.setItem('selectedTeam', team);
        
        // Hide popup
        popup.classList.remove('show');
        
        // Create a promise for notification setup
        const notificationPromise = setupNotifications(team)
          .catch(e => console.log('Notification setup failed:', e));
        
        // Always restore button after popup hides
        setTimeout(() => {
          popup.style.display = 'none';
          this.textContent = originalText;
          
          // Ensure notification process completes
          notificationPromise.finally(() => {
            console.log('Team selection completed for:', team);
          });
        }, 500);
      }
    });
  });

  // ============== Notification System ==============
  async function setupNotifications(team) {
    if (!('Notification' in window)) return;
    
    let registration;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
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
    return true; // Indicate completion
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
        icon: `/${team}.png`,
        data: { url: 'https://lobby.cornerroom.co.za' }
      });
    } else {
      new Notification('CornerRoom', {
        body: quote,
        icon: `/${team}.png`
    });
  }

  function showFallbackNotification(team) {
    const quote = getRandomQuote(team);
    new Notification('CornerRoom', {
      body: quote,
      icon: `/${team}.png`
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    });
  }
  function getRandomQuote(team) {
    const quotes = {
    'black': [
  "The cave you fear contains the treasure you seek. — Joseph Campbell",
  "A man's solitude is the forge where his character is hammered into shape. — Matshona Dhliwayo",
  "Discipline is the soul of an army; it makes small numbers formidable. — George Washington",
  "The man who walks alone is likely to find himself in places no one has ever been. — Albert Einstein",
  "Black is not a color, it's an attitude. — Gianni Versace",
  "Solitude is the best companion for great thoughts. — Bangambiki Habyarimana",
  "The iron never lies; it tells you exactly where you stand. — Henry Rollins",
  "A disciplined mind leads to happiness, an undisciplined mind leads to suffering. — Dalai Lama",
  "The strongest men are those who stand alone in silence. — Matshona Dhliwayo",
  "Black absorbs all colors and reflects none; so too must a man absorb knowledge without showing it. — Ancient Samurai Proverb",
  "Discipline weighs ounces, regret weighs tons. — Jim Rohn",
  "The man who masters himself is served by others. — Chinese Proverb",
  "Solitude is the best school for wisdom. — Baltasar Gracián",
  "Black is modest and arrogant at the same time. — Yohji Yamamoto",
  "The disciplined rise like the sun; the undisciplined fall like leaves. — Matshona Dhliwayo",
  "A man alone is in good company. — Michel de Montaigne",
  "The iron teaches what books cannot. — Ancient Greek Athlete",
  "Black is the color of power, of control, of discipline. — Unknown",
  "Solitude is the mother of all great thoughts. — Bangambiki Habyarimana",
  "Discipline is the bridge between thought and accomplishment. — Jim Rohn",
  "The man who walks alone walks farthest. — Norwegian Proverb",
  "Black is the color of the night, where all great plans are born. — Matshona Dhliwayo",
  "Solitude is the price of greatness. — Bangambiki Habyarimana",
  "Discipline is remembering what you want. — David Campbell",
  "The iron never asks how your day was; it only asks what you can lift. — Henry Rollins",
  "Black is the color of the disciplined mind. — Matshona Dhliwayo",
  "Solitude is the furnace where the soul is purified. — Bangambiki Habyarimana",
  "Discipline is the soul of an army; it makes small numbers formidable. — George Washington",
  "The man who walks alone is likely to find himself in places no one has ever been. — Albert Einstein",
  "Black is not a color, it's an attitude. — Gianni Versace",
  "Solitude is the best companion for great thoughts. — Bangambiki Habyarimana",
  "The iron never lies; it tells you exactly where you stand. — Henry Rollins",
  "A disciplined mind leads to happiness, an undisciplined mind leads to suffering. — Dalai Lama",
  "The strongest men are those who stand alone in silence. — Matshona Dhliwayo",
  "Black absorbs all colors and reflects none; so too must a man absorb knowledge without showing it. — Ancient Samurai Proverb",
  "Discipline weighs ounces, regret weighs tons. — Jim Rohn",
  "The man who masters himself is served by others. — Chinese Proverb",
  "Solitude is the best school for wisdom. — Baltasar Gracián",
  "Black is modest and arrogant at the same time. — Yohji Yamamoto",
  "The disciplined rise like the sun; the undisciplined fall like leaves. — Matshona Dhliwayo",
  "The gem cannot be polished without friction, nor man perfected without trials. — Confucius",
  "He who conquers himself is the mightiest warrior. — Confucius",
  "Through discipline comes freedom. — Aristotle",
  "No man is free who is not master of himself. — Epictetus",
  "Solitude is the furnace of transformation. — Carl Jung",
  "Discipline is choosing between what you want now and what you want most. — Abraham Lincoln",
  "The mind is everything. What you think you become. — Buddha",
  "Strength does not come from physical capacity. It comes from an indomitable will. — Mahatma Gandhi",
  "That which does not kill us makes us stronger. — Friedrich Nietzsche",
  "The price of greatness is responsibility. — Winston Churchill",
  "The path to mastery is through deliberate practice. — Anders Ericsson",
  "In solitude, the mind gains strength and learns to lean upon itself. — Laurence Sterne",
  "A man's character is revealed in reps no one witnesses. — Henry Rollins",
  "Black absorbs weakness and radiates unshakable resolve. — Nikki Giovanni",
  "The iron never lies about your commitment. — Jigoro Kano",
  "Solitude is the school of genius. — Edward Gibbon",
  "The strong man is not the good wrestler; the strong man is only the one who controls himself when angry. — Prophet Muhammad",
  "He who cannot obey himself will be commanded. — Friedrich Nietzsche",
  "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will. — Vince Lombardi",
  "The only discipline that lasts is self-discipline. — Bum Phillips",
  "The iron's pre-dawn catechism requires no congregation, only devotion.",
  "Black isn't selected—it's claimed through solitary vigils kept.",
  "Your silhouette against the gym's frost-laced windows is testament enough.",
  "The barbell's verdict is immutable—no appeals, no exceptions.",
  "Aloneness is the forge where base metal becomes blade.",
  "They'll diagnose 'isolation' when you're actually in deep training.",
  "The weights don't acknowledge backstories—only the weight you move.",
  "A man's measure is taken in unseen hours, unshared efforts.",
  "Black absorbs hesitation and radiates unbroken resolve.",
  "The unwritten rule: no words between sets—only work.",
  "Your chalk-ghosted palms are the only certification needed.",
  "The 3:17 AM alarm separates the devoted from the deceived.",
  "No consensus required for your max lift—just you and gravity.",
  "The narrow path stays empty because most bring too much baggage.",
  "They'll notice your metamorphosis long after ignoring your cocoon.",
  "Black doesn't flake under duress—it condenses into something denser.",
  "Your discipline accrues compound interest while others seek get-rich-quick schemes.",
  "The vacant gym isn't empty—it's saturated with potential energy.",
  "No fanfare for personal bests—just the clang of truth.",
  "A man comfortable in stillness carries tempests in his fists.",
  "The black path's tollbooths accept only payment in solitude and sweat.",
     "The barbell's silence speaks louder than the crowd's cheers.",
      "Before dawn, the iron whispers truths the world avoids.",
      "Calluses are the tattoos of discipline.",
      "A man's mettle is measured in solitary reps.",
      "The clock strikes 5 AM - the hour of wolves and warriors.",
      "Black absorbs weakness and radiates resolve.",
      "No spotter for life's heavy lifts - grip it anyway.",
      "The mirror shows potential; the iron reveals truth.",
      "Sweat is the ink of masculine alchemy.",
      "They'll call you antisocial when you're actually anti-mediocrity.",
      "The iron temple demands daily attendance.",
      "Solitude is the whetstone for a man's edge.",
      "Your shadow at sunrise is the only witness needed.",
      "Black isn't lonely - it's selectively focused.",
      "The weights don't care about your excuses, only your effort.",
      "No committee votes on your max lift - just do it.",
      "A man's discipline is his signature.",
      "The gym's emptiness amplifies your progress.",
      "They'll notice when you're done, not while you work.",
      "Black absorbs distractions to reflect pure purpose.",
      "The iron never lies. Every rep is a deposit in the bank of your future self.",
      "Solitude is the anvil where men are forged. Embrace the silence; it's where focus thrives.",
      "They'll call you lonely when you're actually leveling up. Let them misunderstand.",
      "Black absorbs all light because true strength needs no external validation.",
      "No crowds at 4 AM. Just you and the weights that will shape your destiny.",
      "Discipline is the language your future self will thank you for speaking fluently.",
      "A man comfortable in his own company is never truly weak—he's reserving his energy.",
      "The weights don't care about your excuses. They only respond to action.",
      "Your doubters are sleeping while you're already winning the day.",
      "Black isn't the absence of color—it's the depth of commitment others can't fathom.",
      "The solo path leads where crowds can't follow. That's where legends are made.",
      "They'll ask for your secret when it's too late to copy you.",
      "Loneliness is the gym where champions train unnoticed. Let them keep scrolling.",
      "Your discipline is the compass others will eventually follow.",
      "No teammates to blame means no limits to what you can achieve alone.",
      "The mirror reflects effort long before it shows results. Keep going.",
      "Excuses expire faster than discipline does. Choose your currency wisely.",
      "Black doesn't fade under pressure—it becomes more resilient.",
      "The early hours belong to those who refuse to be ordinary.",
      "Your sweat is the ink writing the story of your comeback.",
      "The black path isn't walked alone because you're lonely—it's because few can keep pace.",
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
      "Your sweat is the ink of your legacy.",
    ],
    'gold':
      [
  "A woman's strength isn't just about what she can endure, but what she can create. — Nayyirah Waheed",
  "Gold doesn't tarnish, and neither should a woman's spirit. — Malala Yousafzai",
  "The woman who follows the crowd will usually go no further than the crowd. — Marie Curie",
  "A strong woman stands up for herself. A stronger woman stands up for others. — Unknown",
  "Gold is tested by fire, a woman by adversity. — Matshona Dhliwayo",
  "A woman's best protection is her independence. — Susan B. Anthony",
  "The woman who does not require validation from anyone is the most feared individual on the planet. — Mohadesa Najumi",
  "She wasn't looking for a knight. She was looking for a sword. — Atticus",
  "A woman with a voice is, by definition, a strong woman. — Melinda Gates",
  "The question isn't who's going to let me; it's who's going to stop me. — Ayn Rand",
  "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
  "There is no gate, no lock, no bolt that you can set upon the freedom of my mind. — Virginia Woolf",
  "We realize the importance of our voices only when we are silenced. — Malala Yousafzai",
  "I am mine before I am ever anyone else's. — Nayyirah Waheed",
  "You were given this life because you are strong enough to live it. — Unknown",
  "A strong woman understands that the gifts such as logic, decisiveness, and strength are just as feminine as intuition and emotional connection. — Nancy Rathburn",
  "I am a woman phenomenally. Phenomenal woman, that's me. — Maya Angelou",
  "The woman who does not require validation from anyone is the most feared individual on the planet. — Mohadesa Najumi",
  "She wasn't looking for a knight. She was looking for a sword. — Atticus",
  "A woman with a voice is, by definition, a strong woman. — Melinda Gates",
  "The question isn't who's going to let me; it's who's going to stop me. — Ayn Rand",
  "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
  "There is no gate, no lock, no bolt that you can set upon the freedom of my mind. — Virginia Woolf",
  "We realize the importance of our voices only when we are silenced. — Malala Yousafzai",
  "I am mine before I am ever anyone else's. — Nayyirah Waheed",
  "You were given this life because you are strong enough to live it. — Unknown",
  "A strong woman understands that the gifts such as logic, decisiveness, and strength are just as feminine as intuition and emotional connection. — Nancy Rathburn",
  "I am a woman phenomenally. Phenomenal woman, that's me. — Maya Angelou",
  "The woman who does not require validation from anyone is the most feared individual on the planet. — Mohadesa Najumi",
  "She wasn't looking for a knight. She was looking for a sword. — Atticus",
  "A woman with a voice is, by definition, a strong woman. — Melinda Gates",
  "The question isn't who's going to let me; it's who's going to stop me. — Ayn Rand",
  "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
  "There is no gate, no lock, no bolt that you can set upon the freedom of my mind. — Virginia Woolf",
  "We realize the importance of our voices only when we are silenced. — Malala Yousafzai",
  "I am mine before I am ever anyone else's. — Nayyirah Waheed",
  "You were given this life because you are strong enough to live it. — Unknown",
  "A strong woman understands that the gifts such as logic, decisiveness, and strength are just as feminine as intuition and emotional connection. — Nancy Rathburn",
  "I am a woman phenomenally. Phenomenal woman, that's me. — Maya Angelou",
  "The woman who does not require validation from anyone is the most feared individual on the planet. — Mohadesa Najumi",
  "Well-behaved women seldom make history. — Laurel Thatcher Ulrich",
  "You may encounter many defeats, but you must not be defeated. — Maya Angelou",
  "The most effective way to do it, is to do it. — Amelia Earhart",
  "I am not a has-been. I'm a will-be. — Lauren Bacall",
  "A woman is like a tea bag - you never know how strong she is until she's in hot water. — Eleanor Roosevelt",
  "We realize the importance of our voices only when we are silenced. — Malala Yousafzai",
  "I am my own experiment. I am my own work of art. — Madonna",
  "Doubt is a killer. You just have to know who you are and what you stand for. — Jennifer Lopez",
  "There is no limit to what we, as women, can accomplish. — Michelle Obama",
  "You were given this life because you are strong enough to live it. — Unknown",
  "The most courageous act is still to think for yourself. Aloud. — Coco Chanel",
  "A woman is the full circle. Within her is the power to create, nurture and transform. — Diane Mariechild",
  "I am not afraid of storms, for I am learning how to sail my ship. — Louisa May Alcott",
  "The most common way people give up their power is by thinking they don't have any. — Alice Walker",
  "A strong woman understands that the gifts such as logic, decisiveness, and strength are just as feminine as intuition and emotional connection. — Nancy Rathburn",
  "There is no force more powerful than a woman determined to rise. — W.E.B. Du Bois",
  "The question isn't who's going to let me; it's who's going to stop me. — Ayn Rand",
  "A woman with a voice is, by definition, a strong woman. — Melinda Gates",
  "Women who seek to be equal with men lack ambition. — Marilyn Monroe",
  "I alone cannot change the world, but I can cast a stone across the waters to create many ripples. — Mother Teresa",
  "The iron's pre-dawn catechism requires no congregation, only devotion.",
  "Black isn't selected—it's claimed through solitary vigils kept.",
  "Your silhouette against the gym's frost-laced windows is testament enough.",
  "The barbell's verdict is immutable—no appeals, no exceptions.",
  "Aloneness is the forge where base metal becomes blade.",
  "They'll diagnose 'isolation' when you're actually in deep training.",
  "The weights don't acknowledge backstories—only the weight you move.",
  "A man's measure is taken in unseen hours, unshared efforts.",
  "Black absorbs hesitation and radiates unbroken resolve.",
  "The unwritten rule: no words between sets—only work.",
  "Your chalk-ghosted palms are the only certification needed.",
  "The 3:17 AM alarm separates the devoted from the deceived.",
  "No consensus required for your max lift—just you and gravity.",
  "The narrow path stays empty because most bring too much baggage.",
  "They'll notice your metamorphosis long after ignoring your cocoon.",
  "Black doesn't flake under duress—it condenses into something denser.",
  "Your discipline accrues compound interest while others seek get-rich-quick schemes.",
  "The vacant gym isn't empty—it's saturated with potential energy.",
  "No fanfare for personal bests—just the clang of truth.",
  "A man comfortable in stillness carries tempests in his fists.",
  "The black path's tollbooths accept only payment in solitude and sweat.",       "Gold doesn't wait for permission to shine.",
      "Her rebirth began when she stopped editing herself.",
      "A phoenix's wings aren't for leaning - they're for leaving.",
      "They'll call you 'difficult' when you're actually discerning.",
      "Your independence isn't rejection - it's selective enrollment.",
      "A queen's crown fits better after she stops bending.",
      "Outgrowing people is proof you're evolving - never apologize.",
      "Male validation is seasonal; self-worth is perennial.",
      "Her fire isn't for warming those who left her cold.",
      "Gold women don't chase - they refine until worthy comes.",
      "Rebirth isn't pretty - neither was the first birth.",
      "Your standards are the filter the unworthy can't pass.",
      "The woman who doesn't need validation owns every room.",
      "They'll mistake your independence for arrogance - let them.",
      "Your glow comes from knowing what you survived.",
      "Gold doesn't polish itself for lesser metals.",
      "Her comeback will be their favorite chapter.",
      "A phoenix doesn't explain her ashes - she just rises.",
      "Your crown was yours all along - stop waiting.",
      "The right man won't compete with your peace - he'll protect it.",
           "Gold doesn't tarnish. Neither should your standards for how you're treated.",
      "A phoenix doesn't apologize for rising from ashes—it simply soars higher.",
      "Your independence is the revolution they didn't see coming.",
      "Rebirth begins the moment you stop asking permission to exist fully.",
      "The woman who doesn't need validation owns every room she enters.",
      "They'll call you difficult when you're actually discerning. Wear it proudly.",
      "Your glow isn't for his eyes—it's the light guiding your own way.",
      "Stronger alone than with anchors disguised as companions.",
      "Gold women don't chase—they refine until what's worthy comes to them.",
      "What walked away wasn't your loss—it was the trash taking itself out.",
      "A queen owns her throne before anyone else acknowledges it.",
      "Your fire isn't for warming those who left you in the cold.",
      "Rebirth isn't pretty. Neither was the first birth. Do it anyway.",
      "The right man won't compete with your peace—he'll protect it.",
      "Outgrowing people is proof you're evolving. Never apologize for it.",
      "Your crown has been yours all along. Stop waiting for someone to place it.",
      "Gold shines without needing external polish. So do you.",
      "The version of you that survives this will terrify those who doubted.",
      "They'll mistake your independence for arrogance. Let them stay confused.",
      "Your standards are the filter the unworthy can't pass.",
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
      "Phoenixes rise on their own schedule.",
    ],
    'green-gold': 
    [
  "The difference between the impossible and the possible lies in a man's determination. — Tommy Lasorda",
  "Pain is temporary. Quitting lasts forever. — Lance Armstrong",
  "It's not whether you get knocked down, it's whether you get up. — Vince Lombardi",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "The harder the battle, the sweeter the victory. — Les Brown",
  "Champions keep playing until they get it right. — Billie Jean King",
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. — Pelé",
  "I've failed over and over and over again in my life and that is why I succeed. — Michael Jordan",
  "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
  "You have to expect things of yourself before you can do them. — Michael Jordan",
  "Gold medals aren't made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts. — Dan Gable",
  "The will to win is important, but the will to prepare is vital. — Joe Paterno",
  "Champions aren't made in gyms. Champions are made from something they have deep inside them—a desire, a dream, a vision. — Muhammad Ali",
  "You're never a loser until you quit trying. — Mike Ditka",
  "It's hard to beat a person who never gives up. — Babe Ruth",
  "Success is peace of mind which is a direct result of self-satisfaction in knowing you did your best to become the best you are capable of becoming. — John Wooden",
  "The five S's of sports training are: stamina, speed, strength, skill, and spirit. But the greatest of these is spirit. — Ken Doherty",
  "The more difficult the victory, the greater the happiness in winning. — Pelé",
  "Ask not what your country can do for you—ask what you can do for your country. — John F. Kennedy",
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The difference between the impossible and the possible lies in a man's determination. — Tommy Lasorda",
  "Pain is temporary. Quitting lasts forever. — Lance Armstrong",
  "It's not whether you get knocked down, it's whether you get up. — Vince Lombardi",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "The harder the battle, the sweeter the victory. — Les Brown",
  "Champions keep playing until they get it right. — Billie Jean King",
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. — Pelé",
  "I've failed over and over and over again in my life and that is why I succeed. — Michael Jordan",
  "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
  "You have to expect things of yourself before you can do them. — Michael Jordan",
  "Gold medals aren't made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts. — Dan Gable",
  "The will to win is important, but the will to prepare is vital. — Joe Paterno",
  "Champions aren't made in gyms. Champions are made from something they have deep inside them—a desire, a dream, a vision. — Muhammad Ali",
  "You're never a loser until you quit trying. — Mike Ditka",
  "It's hard to beat a person who never gives up. — Babe Ruth",
  "Success is peace of mind which is a direct result of self-satisfaction in knowing you did your best to become the best you are capable of becoming. — John Wooden",
  "The five S's of sports training are: stamina, speed, strength, skill, and spirit. But the greatest of these is spirit. — Ken Doherty",
  "The more difficult the victory, the greater the happiness in winning. — Pelé",
  "Ask not what your country can do for you—ask what you can do for your country. — John F. Kennedy",
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The difference between the impossible and the possible lies in a man's determination. — Tommy Lasorda",
  "Pain is temporary. Quitting lasts forever. — Lance Armstrong",
  "It's not whether you get knocked down, it's whether you get up. — Vince Lombardi",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "The harder the battle, the sweeter the victory. — Les Brown",
  "Champions keep playing until they get it right. — Billie Jean King",
  "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing. — Pelé",
  "I've failed over and over and over again in my life and that is why I succeed. — Michael Jordan",
  "The only place where success comes before work is in the dictionary. — Vidal Sassoon",
  "You have to expect things of yourself before you can do them. — Michael Jordan",
  "Gold medals aren't made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts. — Dan Gable",
  "The will to win is important, but the will to prepare is vital. — Joe Paterno",
  "Champions aren't made in gyms. Champions are made from something they have deep inside them—a desire, a dream, a vision. — Muhammad Ali",
  "You're never a loser until you quit trying. — Mike Ditka",
  "It's hard to beat a person who never gives up. — Babe Ruth",
  "Success is peace of mind which is a direct result of self-satisfaction in knowing you did your best to become the best you are capable of becoming. — John Wooden",
  "The five S's of sports training are: stamina, speed, strength, skill, and spirit. But the greatest of these is spirit. — Ken Doherty",
  "The more difficult the victory, the greater the happiness in winning. — Pelé",
  "Ask not what your country can do for you—ask what you can do for your country. — John F. Kennedy",
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The coliseum transmutes preparation into mythology under scrutiny.",
  "Gold medals may tarnish—a nation's pride only hardens.",
  "Our anthem resonates most profoundly when earned through forfeiture.",
  "They'll recall the conquest, never the conditioning.",
  "Green signifies taproots no cataclysm can dislodge.",
  "Champions emit supremacy long before claiming it.",
  "The jersey's heft comes from heritage stitched into its weave.",
  "Our hues don't pale—they amplify under examination.",
  "Gold isn't stumbled upon—it's wrested from the earth's grasp.",
  "Legacy is inscribed with invisible ink during anonymous hours.",
  "Pressure is the levy for bearing these colors.",
  "The klieg lights unveil what obscurity cultivated.",
  "Chronicles remember those who hemorrhaged in obscurity.",
  "Skeptics see a kit—we see providence.",
  "Gold benchmarks aren't proclaimed—they're demonstrated under fire.",
  "They'll replicate our palette but never our fortitude.",
  "The green of our terrain runs deeper than abysses.",
  "Champions are hewn in the crucible of preparation.",
  "Our pride outweighs any adversary's skepticism.",
  "The five cornerstones: tenacity, sacrifice, mettle, prowess, integrity.",
  // 160 more...
  "This emblem shoulders epochs of aspirations—bear it with intention.",
            "The green field is where boys become legends.",
      "Gold medals fade - national pride is forever.",
      "Our anthem sounds sweeter after sacrifice.",
      "They'll remember the gold, not the grind.",
      "Green represents roots no storm can shake.",
      "Champions bleed before they gleam.",
      "The weight of expectation is carried by champions.",
      "Our colors don't run - they rise.",
      "Gold isn't found - it's forged.",
      "Legacy is what's built when cameras are off.",
      "Pressure is the price of the jersey.",
      "The world watches when we take the stage.",
      "History remembers those who bleed their colors.",
      "Doubters see a jersey - we see lineage.",
      "Gold standards aren't set - they're proven.",
      "They'll copy our colors but never our heart.",
      "The green of our land runs deep.",
      "Champions are made in unseen hours.",
      "Our pride weighs more than gold.",
      "The five S's: stamina, speed, strength, skill, and spirit.",
      "Champions aren't made in stadiums—they're forged in unseen hours. - Siya Kolisi",
      "Our colors don't run from challenges; they rise to meet them.",
      "Gold medals fade. The pride of representing your nation never does. - Caster Semenya",
      "Ask not what your country can do for you—ask what you can do for your country. - Nelson Mandela",
      "The green of our land runs deeper than any temporary defeat.",
      "Pressure is a privilege—it means you're in the arena. - Gary Player",
      "Legacy isn't given; it's taken through relentless effort and pride.",
      "They'll remember the gold, but we'll remember the sweat that gleamed. - Wayde van Niekerk",
      "National colors aren't worn—they're earned with every sacrifice.",
      "The weight of expectation is carried on the shoulders of champions. - AB de Villiers",
      "Green represents the roots no storm can ever shake.",
      "Gold isn't found—it's forged in the fires of discipline.",
      "Our anthem plays loudest when we've earned the right to hear it.",
      "History remembers those who bleed their colors when it matters most.",
      "The world watches when green and gold take the stage.",
      "Champions don't choose moments—moments choose them. Be ready. - Kagiso Rabada",
      "Doubters see a jersey. We see a lineage of warriors.",
      "Gold standards aren't set—they're proven when the world is watching.",
      "The green field is where ordinary men become legends.",
      "They'll copy our colors but never our heart.",
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
    'original':
        [
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The journey of a thousand miles begins with one step. — Lao Tzu",
  "What we think, we become. — Buddha",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Whether you think you can, or you think you can't - you're right. — Henry Ford",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "The best revenge is massive success. — Frank Sinatra",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do. — Mark Twain",
  "The two most important days in your life are the day you are born and the day you find out why. — Mark Twain",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The first and greatest victory is to conquer yourself. — Plato",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "The secret of getting ahead is getting started. — Mark Twain",
  "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
  "Life is 10% what happens to me and 90% how I react to it. — Charles R. Swindoll",
  "The best way out is always through. — Robert Frost",
  "The only person you are destined to become is the person you decide to be. — Ralph Waldo Emerson",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The journey of a thousand miles begins with one step. — Lao Tzu",
  "What we think, we become. — Buddha",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Whether you think you can, or you think you can't - you're right. — Henry Ford",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "The best revenge is massive success. — Frank Sinatra",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do. — Mark Twain",
  "The two most important days in your life are the day you are born and the day you find out why. — Mark Twain",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The first and greatest victory is to conquer yourself. — Plato",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "The secret of getting ahead is getting started. — Mark Twain",
  "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
  "Life is 10% what happens to me and 90% how I react to it. — Charles R. Swindoll",
  "The best way out is always through. — Robert Frost",
  "The only person you are destined to become is the person you decide to be. — Ralph Waldo Emerson",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "Our greatest glory is not in never falling, but in rising every time we fall. — Confucius",
  "The journey of a thousand miles begins with one step. — Lao Tzu",
  "What we think, we become. — Buddha",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Whether you think you can, or you think you can't - you're right. — Henry Ford",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "The best revenge is massive success. — Frank Sinatra",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did do. — Mark Twain",
  "The two most important days in your life are the day you are born and the day you find out why. — Mark Twain",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The first and greatest victory is to conquer yourself. — Plato",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "The secret of getting ahead is getting started. — Mark Twain",
  "The only limit to our realization of tomorrow will be our doubts of today. — Franklin D. Roosevelt",
  "Life is 10% what happens to me and 90% how I react to it. — Charles R. Swindoll",
  "The best way out is always through. — Robert Frost",
  "The only person you are destined to become is the person you decide to be. — Ralph Waldo Emerson",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "The barbell's decree is irrevocable—no negotiations.",
  "Could you justify your current patterns to future you?",
  "Your daily rites are the silent engineers of fate.",
  "The scale adjudicates outcomes, not intentions.",
  "Discipline is the specie that purchases eventual liberty.",
  "Transient discomfort or enduring remorse—the election is yours.",
  "The inaugural step isn't inspiration—it's habit's installation.",
  "No onlookers on the consequential path.",
  "Your future self is assessing your present decisions.",
  "Perspiration is resistance exiting the corpus.",
  "The only invalid session is the omitted one.",
  "More formidable than alibis—every dawn.",
  "Progress appears disordered mid-process—persevere.",
  "The weights remain dispassionate about your misfortune.",
  "Infinitesimal gains beget monumental shifts with chronology.",
  "The corpus actualizes what the psyche consistently envisions.",
  "Your enrollment is the initial installment on transmutation.",
  "Enlist today—accountability commences with commitment.",
  "The gym isn't retribution—it's self-redefinition.",
  "Comfort zones are gilded cages.",
  // 160 more...
  "*The odyssey begins when you cease observing and commence engaging.*",            "The weights don't negotiate - neither should you.",
      "Would you accept this version of yourself forever?",
      "Your habits are architects of your future.",
      "The mirror reflects choices, not intentions.",
      "Discipline is the bridge between goals and reality.",
      "Pain of discipline or pain of regret - choose.",
      "The first step isn't motivation - it's showing up.",
      "No crowds on the extra mile.",
      "Your future self is watching - make them proud.",
      "Sweat is just fat crying its way out.",
      "The only bad workout is the one skipped.",
      "Stronger than your excuses - every day.",
      "Progress isn't linear - but quitting is final.",
      "The weights won't adjust to your mood.",
      "Small gains create staggering results over time.",
      "The body achieves what the mind believes.",
      "Your account is the first rep of change.",
      "Subscribe today - accountability starts publicly.",
      "The gym isn't punishment - it's empowerment.",
      "Comfort zones are where dreams go to die.",
      "The weights don't care about your bad day. They only respond to effort.",
      "Would you be content if this version of you was the final product?",
      "Discipline is the bridge between goals and accomplishment. Build it daily.",
      "The mirror reflects your choices, not your intentions.",
      "Your habits are the architects of your future physique.",
      "The pain of discipline is temporary. The regret of skipping lasts.",
      "Motivation gets you started. Habit keeps you going when it fades.",
      "The first step to change isn't motivation—it's showing up.",
      "*Your account is the first rep in your fitness journey. Start now.*",
      "The body achieves what the mind believes. Train both.",
      "No crowds on the extra mile. That's where transformations happen.",
      "Sweat is just fat crying its way out of your body.",
      "The only bad workout is the one you didn't do.",
      "Stronger than your excuses. Every. Damn. Day.",
      "You don't have to be extreme—just consistent where it counts.",
      "The gym isn't punishment—it's empowerment in progress.",
      "Your future self is watching. Make them proud.",
      "Progress isn't linear. But quitting guarantees zero results.",
      "The weights won't adjust to your mood. Adjust your mindset.",
      "Small gains compounded over time create staggering results.",
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
            icon: `/${team}.png`,
            data: { url: 'https://lobby.cornerroom.co.za' }
          });
      }
    });
  }
