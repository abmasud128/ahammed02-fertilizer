export interface Testimonial {
  id: string;
  name: string;
  namebn: string;
  village: string;
  villagebn: string;
  crop: string;
  cropbn: string;
  message: string;
  messagebn: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-001',
    name: '[Sample] Ramesh Mondal',
    namebn: '[নমুনা] রমেশ মন্ডল',
    village: 'Chakdaha, Nadia',
    villagebn: 'চাকদহ, নদিয়া',
    crop: 'Paddy (Swarna)',
    cropbn: 'ধান (স্বর্ণা)',
    message:
      'I have been purchasing fertilizers and seeds from Ahammed Fertilizer for the last 4 seasons. Their advice on proper dosage of urea and zinc saved my crop from Khaira disease and reduced my unnecessary pesticide costs.',
    messagebn:
      'গত ৪ মরসুম ধরে আমি আহাম্মেদ ফার্টিলাইজার থেকে সার ও বীজ নিচ্ছি। ইউরিয়া ও জিঙ্কের সঠিক মাত্রা সম্পর্কে ওদের পরামর্শে আমার ধান ক্ষেতের খায়রা রোগ দূর হয়েছে এবং অপ্রয়োজনীয় খরচ অনেক বেঁচেছে।',
    rating: 5,
  },
  {
    id: 'test-002',
    name: '[Sample] Bipul Roy',
    namebn: '[নমুনা] বিপুল রায়',
    village: 'Habra, North 24 Parganas',
    villagebn: 'হাবড়া, উত্তর ২৪ পরগনা',
    crop: 'Pointed Gourd & Vegetables',
    cropbn: 'পটল ও অন্যান্য সবজি',
    message:
      'Authentic products at honest MRP rates. When whitefly attacked my vegetable field, they guided me to use Imidacloprid at the right dilution. The result was visible within 3 days.',
    messagebn:
      'ন্যায্য দামে খাঁটি আসল ওষুধ পাওয়া যায়। সবজির জমিতে সাদা মাছির উপদ্রব হলে ওনারা সঠিক নিয়মে ইমিডাক্লোপ্রিড ব্যবহারের পরামর্শ দেন, মাত্র ৩ দিনের মধ্যে খুব ভালো ফল পাই।',
    rating: 5,
  },
  {
    id: 'test-003',
    name: '[Sample] Anowar Hossain',
    namebn: '[নমুনা] আনোয়ার হোসেন',
    village: 'Barasat, North 24 Parganas',
    villagebn: 'বারাসাত, উত্তর ২৪ পরগনা',
    crop: 'Potato (Jyoti)',
    cropbn: 'আলু (জ্যোতি)',
    message:
      'Last winter, late blight threatened all potato fields in our area. Ahammed Fertilizer arranged Mancozeb and quality fungicides on short notice with clear instructions on spraying. My entire yield was protected.',
    messagebn:
      'গত শীতে আমাদের এলাকায় নাভিধসা রোগের প্রকোপ দেখা দিলে আহাম্মেদ ফার্টিলাইজার সঙ্গে সঙ্গে উপযুক্ত ছত্রাকনাশক ব্যবস্থা করে দেয় এবং কীভাবে স্প্রে করতে হবে বুঝিয়ে বলে। ফলে আমার পুরো আলুর ফলন বেঁচে যায়।',
    rating: 5,
  },
  {
    id: 'test-004',
    name: '[Sample] Sanjoy Das',
    namebn: '[নমুনা] সঞ্জয় দাস',
    village: 'Ranaghat, Nadia',
    villagebn: 'রানাঘাট, নদিয়া',
    crop: 'Mustard & Jute',
    cropbn: 'সর্ষে ও পাট',
    message:
      'Their recommendation to add Single Super Phosphate and Boron to mustard gave me bumper pod filling with noticeably higher oil yield. Reliable and farmer-friendly store.',
    messagebn:
      'সর্ষে চাষে সিঙ্গেল সুপার ফসফেট ও বোরন ব্যবহারের পরামর্শে আমার ফসলে দানার আকার খুব সুন্দর হয়েছে এবং তেলের ফলনও বেশি এসেছে। চাষীদের জন্য অত্যন্ত ভরসাযোগ্য দোকান।',
    rating: 4.8,
  },
  {
    id: 'test-005',
    name: '[Sample] Subhash Chandra Ghosh',
    namebn: '[নমুনা] সুভাষ চন্দ্র ঘোষ',
    village: 'Deganga, North 24 Parganas',
    villagebn: 'দেগঙ্গা, উত্তর ২৪ পরগনা',
    crop: 'Boro Paddy',
    cropbn: 'বোরো ধান',
    message:
      'Good availability of certified seeds and micro-nutrients. What sets them apart is that they do not push unnecessary costly chemicals; they suggest what is actually needed for the crop stage.',
    messagebn:
      'উন্নত জাতের বীজ ও অনুখাদ্য সবসময় পাওয়া যায়। সবচেয়ে ভালো বিষয় হলো ওনারা অযথা বেশি দামের ওষুধ গছিয়ে দেন না, ফসলের অবস্থা বুঝে যতটুকু প্রয়োজন ঠিক ততটুকুই দেন।',
    rating: 5,
  },
  {
    id: 'test-006',
    name: '[Sample] Tapan Biswas',
    namebn: '[নমুনা] তপন বিশ্বাস',
    village: 'Baduria, North 24 Parganas',
    villagebn: 'বাদুড়িয়া, উত্তর ২৪ পরগনা',
    crop: 'Mango Orchard & Banana',
    cropbn: 'আম বাগান ও কলা',
    message:
      'I bought a 16L knapsack sprayer and orchard nutrients here. Sturdy equipment and high-purity water-soluble fertilizers helped my orchard achieve uniform flowering.',
    messagebn:
      'আমি এখান থেকে একটি ১৬ লিটারের স্প্রে মেশিন ও অনুখাদ্য কিনেছিলাম। মজবুত যন্ত্রপাতি ও খাঁটি দ্রবণীয় সারের কারণে আমার বাগানে মুকুলের ফলন খুব ভালো হয়েছে।',
    rating: 4.9,
  },
];
