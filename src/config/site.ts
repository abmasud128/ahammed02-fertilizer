/**
 * Site Configuration - Single source of truth for all business details
 * Update this file to change business information across the entire website
 */

export const siteConfig = {
  // Business Identity
  name: 'Ahammed Fertilizer',
  namebn: 'আহাম্মেদ ফার্টিলাইজার',
  tagline: 'Your Trusted Partner in Agriculture',
  taglinebn: 'কৃষিতে আপনার বিশ্বস্ত সঙ্গী',
  description: 'Ahammed Fertilizer is a leading retail shop for fertilizers, pesticides, insecticides, fungicides, herbicides, micronutrients, seeds and farm inputs in Dakshin Dinajpur, West Bengal.',
  descriptionbn: 'আহাম্মেদ ফার্টিলাইজার দক্ষিণ দিনাজপুরের একটি নেতৃস্থানীয় সার, কীটনাশক, ছত্রাকনাশক, আগাছানাশক, অণুখাদ্য, বীজ ও কৃষি উপকরণের খুচরা দোকান।',

  // Contact Information
  phone: '9091017035',
  phoneFormatted: '+91 90910 17035',
  whatsapp: '919091017035',
  email: 'abmasud128@gmail.com',

  // Address
  address: {
    line1: 'Nandair, Puliyapara',
    line2: 'Chapmatali, Dakshin Dinajpur',
    state: 'West Bengal',
    pin: '733124',
    country: 'India',
    full: 'Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur, 733124, West Bengal, India',
  },
  addressbn: {
    line1: 'নান্দাইর, পুলিয়াপাড়া',
    line2: 'চাপমাটালি, দক্ষিণ দিনাজপুর',
    state: 'পশ্চিমবঙ্গ',
    pin: '৭৩৩১২৪',
    country: 'ভারত',
    full: 'নান্দাইর, পুলিয়াপাড়া, চাপমাটালি, দক্ষিণ দিনাজপুর, ৭৩৩১২৪, পশ্চিমবঙ্গ, ভারত',
  },

  // Operating Hours
  hours: 'Every Day: 7:00 AM – 9:00 PM',
  hoursbn: 'প্রতিদিন: সকাল ৭:০০ – রাত ৯:০০',

  // Licence Information
  licences: [
    'Licence No: XXXXXXXXXXXXXX',
    'Registration No: XXXXXXXXXXXXXXX',
  ],

  // Maps
  mapEmbedUrl: 'https://maps.google.com/maps?q=Chapmatali,Dakshin+Dinajpur,West+Bengal,733124&t=&z=13&ie=UTF8&iwloc=&output=embed',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Chapmatali+Dakshin+Dinajpur+West+Bengal+733124',

  // WhatsApp Pre-filled Messages
  whatsappMessage: 'Hello! I am interested in your products at Ahammed Fertilizer. Please share more details.',
  whatsappMessagebn: 'নমস্কার! আমি আহাম্মেদ ফার্টিলাইজারের পণ্যে আগ্রহী। অনুগ্রহ করে আরও তথ্য জানান।',

  // Social Media
  social: {
    facebook: '#',
    instagram: '#',
  },

  // Safety Notice (required for pesticide retail)
  safetyNotice: 'Read the label carefully before use. Use protective gear. Keep out of reach of children.',
  safetyNoticebn: 'ব্যবহারের আগে লেবেল ভালো করে পড়ুন। সুরক্ষামূলক সরঞ্জাম ব্যবহার করুন। শিশুদের নাগালের বাইরে রাখুন।',

  // Stats
  founded: 2015,
  stats: {
    yearsOfService: new Date().getFullYear() - 2015,
    happyFarmers: 5000,
    productsAvailable: 500,
  },

  // SEO Keywords
  seoKeywords: [
    'fertilizer shop in Chapmatali',
    'fertilizer shop Dakshin Dinajpur',
    'pesticide shop Dakshin Dinajpur',
    'agricultural inputs West Bengal',
    'Ahammed Fertilizer',
    'সার দোকান দক্ষিণ দিনাজপুর',
    'কীটনাশক দোকান চাপমাটালি',
    'NPK fertilizer Dakshin Dinajpur',
    'farm inputs near me',
    'seeds shop Dakshin Dinajpur',
  ],

} as const;

export type SiteConfig = typeof siteConfig;
