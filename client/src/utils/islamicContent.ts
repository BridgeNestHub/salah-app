// Islamic content utilities for daily updates

interface DailyDhikr {
  arabic: string;
  transliteration: string;
  translation: string;
  benefit: string;
}

interface DailyReminder {
  verse: string;
  reference: string;
  context?: string;
}

// Daily Dhikr collection (7 different ones for each day of week)
const dailyDhikrCollection: DailyDhikr[] = [
  {
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translation: "Glory be to Allah and praise Him",
    benefit: "Recite 100 times daily for immense reward"
  },
  {
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illa Allah",
    translation: "There is no god but Allah",
    benefit: "The best dhikr according to Prophet Muhammad (PBUH)"
  },
  {
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad",
    translation: "O Allah, send blessings upon Muhammad",
    benefit: "Brings you closer to the Prophet (PBUH)"
  },
  {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    benefit: "Opens doors of mercy and provision"
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    benefit: "Fills the scales of good deeds"
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    benefit: "Reminds us of Allah's supreme greatness"
  },
  {
    arabic: "سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "SubhanAllahi'l-'Azeem",
    translation: "Glory be to Allah, the Magnificent",
    benefit: "Light on the tongue, heavy on the scales"
  }
];

// Daily reminders collection (30 different verses for each day of month)
const dailyReminders: DailyReminder[] = [
  {
    verse: "And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    reference: "Quran 65:3"
  },
  {
    verse: "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth.",
    reference: "Quran 6:73"
  },
  {
    verse: "And Allah is the best of planners.",
    reference: "Quran 8:30"
  },
  {
    verse: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    reference: "Quran 2:152"
  },
  {
    verse: "And whoever fears Allah - He will make for him a way out.",
    reference: "Quran 65:2"
  },
  {
    verse: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6"
  },
  {
    verse: "And Allah would not punish them while they seek forgiveness.",
    reference: "Quran 8:33"
  },
  {
    verse: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
    reference: "Quran 2:155-156"
  },
  {
    verse: "And whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life.",
    reference: "Quran 16:97"
  },
  {
    verse: "Say, 'Nothing will happen to us except what Allah has decreed for us; He is our protector.' And upon Allah let the believers rely.",
    reference: "Quran 9:51"
  },
  {
    verse: "And Allah is Forgiving and Merciful.",
    reference: "Quran 4:96"
  },
  {
    verse: "And it is Allah who sends down the rain after [people] had despaired and spreads His mercy.",
    reference: "Quran 42:28"
  },
  {
    verse: "And whoever submits his face to Allah while he is a doer of good - then he has grasped the most trustworthy handhold.",
    reference: "Quran 31:22"
  },
  {
    verse: "And Allah loves the doers of good.",
    reference: "Quran 3:134"
  },
  {
    verse: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah].",
    reference: "Quran 2:45"
  },
  {
    verse: "And whoever believes in Allah and does righteousness - He will admit him into gardens beneath which rivers flow.",
    reference: "Quran 64:9"
  },
  {
    verse: "And Allah is sufficient as a Disposer of affairs.",
    reference: "Quran 4:81"
  },
  {
    verse: "And whoever purifies himself does so for the benefit of his own soul. And to Allah is the [final] destination.",
    reference: "Quran 35:18"
  },
  {
    verse: "And Allah invites to the Home of Peace and guides whom He wills to a straight path.",
    reference: "Quran 10:25"
  },
  {
    verse: "And whoever holds firmly to Allah has [indeed] been guided to a straight path.",
    reference: "Quran 3:101"
  },
  {
    verse: "And Allah is ever Knowing and Wise.",
    reference: "Quran 4:26"
  },
  {
    verse: "And whoever believes in Allah - He will guide his heart.",
    reference: "Quran 64:11"
  },
  {
    verse: "And Allah is the best of providers.",
    reference: "Quran 62:11"
  },
  {
    verse: "And whoever is grateful - his gratitude is only for [the benefit of] himself.",
    reference: "Quran 31:12"
  },
  {
    verse: "And Allah sees what you do.",
    reference: "Quran 2:110"
  },
  {
    verse: "And whoever does good - it is for his own soul.",
    reference: "Quran 41:46"
  },
  {
    verse: "And Allah is ever Hearing and Seeing.",
    reference: "Quran 4:58"
  },
  {
    verse: "And whoever repents and does righteousness does indeed turn to Allah with [accepted] repentance.",
    reference: "Quran 25:71"
  },
  {
    verse: "And Allah is Exalted in Might and Wise.",
    reference: "Quran 2:220"
  },
  {
    verse: "And whoever trusts in Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
    reference: "Quran 65:3"
  }
];

// Hijri months in Arabic and English
const hijriMonths = [
  { arabic: "مُحَرَّم", english: "Muharram" },
  { arabic: "صَفَر", english: "Safar" },
  { arabic: "رَبِيع الأَوَّل", english: "Rabi' al-Awwal" },
  { arabic: "رَبِيع الآخِر", english: "Rabi' al-Thani" },
  { arabic: "جُمَادَى الأُولَى", english: "Jumada al-Awwal" },
  { arabic: "جُمَادَى الآخِرَة", english: "Jumada al-Thani" },
  { arabic: "رَجَب", english: "Rajab" },
  { arabic: "شَعْبَان", english: "Sha'ban" },
  { arabic: "رَمَضَان", english: "Ramadan" },
  { arabic: "شَوَّال", english: "Shawwal" },
  { arabic: "ذُو القَعْدَة", english: "Dhu al-Qi'dah" },
  { arabic: "ذُو الحِجَّة", english: "Dhu al-Hijjah" }
];

// Convert Gregorian to Hijri using accurate calculation
export const getHijriDate = (): { day: number; month: string; year: number; arabic: string } => {
  const today = new Date();
  
  // More accurate Hijri conversion algorithm
  const gregorianYear = today.getFullYear();
  const gregorianMonth = today.getMonth() + 1;
  const gregorianDay = today.getDate();
  
  // Julian day calculation
  let a = Math.floor((14 - gregorianMonth) / 12);
  let y = gregorianYear - a;
  let m = gregorianMonth + 12 * a - 3;
  
  let jd = gregorianDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
  
  // Convert Julian day to Hijri
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  
  const hijriMonth = Math.floor((24 * l) / 709);
  const hijriDay = l - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;
  
  const monthIndex = (hijriMonth - 1) % 12;
  const month = hijriMonths[monthIndex];
  
  return {
    day: hijriDay,
    month: month.english,
    year: hijriYear,
    arabic: `${hijriDay} ${month.arabic} ${hijriYear} هـ`
  };
};

// Alternative: Use Islamic calendar API for accurate date
export const getHijriDateFromAPI = async (): Promise<{ day: number; month: string; year: number; arabic: string }> => {
  try {
    const today = new Date();
    const response = await fetch(`https://api.aladhan.com/v1/gToH/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`);
    const data = await response.json();
    
    if (data.code === 200) {
      const hijri = data.data.hijri;
      const monthName = hijri.month.en;
      
      return {
        day: parseInt(hijri.day),
        month: monthName,
        year: parseInt(hijri.year),
        arabic: `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`
      };
    }
  } catch (error) {
    console.error('Failed to fetch Hijri date from API:', error);
  }
  
  // Fallback to calculation if API fails
  return getHijriDate();
};

// Get daily dhikr based on day of week
export const getDailyDhikr = (): DailyDhikr => {
  const dayOfWeek = new Date().getDay();
  return dailyDhikrCollection[dayOfWeek];
};

// Get daily reminder based on day of month
export const getDailyReminder = (): DailyReminder => {
  const dayOfMonth = new Date().getDate();
  return dailyReminders[(dayOfMonth - 1) % dailyReminders.length];
};