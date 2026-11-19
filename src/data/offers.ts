export interface Offer {
  id: string;
  title: string;
  titlebn: string;
  description: string;
  descriptionbn: string;
  discount: string;
  discountbn: string;
  validUntil: string;
  category: string;
  featured: boolean;
  image: string;
}

export const offers: Offer[] = [
  {
    id: 'offer-001',
    title: 'Kharif Season Special: Bulk Fertilizer Savings',
    titlebn: 'খরিফ মরসুম স্পেশাল: সারে বিশেষ সাশ্রয় অফার',
    description:
      'Prepare your field for the upcoming Aman sowing. Buy balanced fertilizer combinations (NPK + Zinc + Potash) and enjoy bundle savings on certified brands.',
    descriptionbn:
      'আসন্ন আমন চাষের জমি তৈরির জন্য সুষম সার প্যাকেজে (এনপিকে + জিঙ্ক + পটাশ) বিশেষ ছাড় ও উপহার।',
    discount: 'Up to 10% Off on Nutrients',
    discountbn: 'অনুখাদ্য ও অনুসার প্যাকেজে ১০% পর্যন্ত ছাড়',
    validUntil: '31 July 2026',
    category: 'fertilizers',
    featured: true,
    image: '/images/offers/kharif-special.jpg',
  },
  {
    id: 'offer-002',
    title: 'Paddy Protection Package Deal',
    titlebn: 'ধান সুরক্ষা প্যাকেজ ডিল',
    description:
      'Complete safety combo for transplanted paddy: Pretilachlor weedicide + Carbendazim seed dressing + Tricyclazole blast protection at an exclusive combo price.',
    descriptionbn:
      'রোয়া ধানের সর্বাত্মক সুরক্ষা প্যাকেজ: আগাছানাশক + বীজ শোধনকারী + ব্লাস্ট নাশক একসঙ্গে কিনলে বিশেষ মূল্যছাড়।',
    discount: 'Save ₹250 on Complete Kit',
    discountbn: 'সম্পূর্ণ কিটে ২৫০ টাকা সাশ্রয়',
    validUntil: '15 August 2026',
    category: 'pesticides',
    featured: true,
    image: '/images/offers/paddy-package.jpg',
  },
  {
    id: 'offer-003',
    title: 'Spray Season Discount on Insecticides & Equipment',
    titlebn: 'স্প্রে মরসুম ছাড়: কীটনাশক ও স্প্রেয়ার যন্ত্র',
    description:
      'Purchase any 16L Heavy Duty Knapsack Sprayer and receive an immediate flat discount on select crop protection insecticides like Imidacloprid and Cypermethrin.',
    descriptionbn:
      'যেকোনো ১৬ লিটার ন্যাপস্যাক স্প্রে মেশিনের সাথে প্রয়োজনীয় কীটনাশক ক্রয় করলে আকর্ষক ক্যাশব্যাক বা ডিসকাউন্ট।',
    discount: 'Flat 12% Off on Tools & Sprayers',
    discountbn: 'কৃষি যন্ত্রপাতি ও স্প্রেয়ারের ওপর সরাসরি ১২% ছাড়',
    validUntil: '30 September 2026',
    category: 'tools',
    featured: false,
    image: '/images/offers/sprayer-discount.jpg',
  },
  {
    id: 'offer-004',
    title: 'Mustard Season Combo: Certified Seeds + SSP',
    titlebn: 'সর্ষে মরসুম কম্বো: উন্নত বীজ ও এসএসপি সার',
    description:
      'Kickstart your winter Rabi farming. Get high-germination certified mustard seeds bundled with Single Super Phosphate and Boron 20% for superior oil recovery.',
    descriptionbn:
      'শীতের রবি চাষের সেরা প্রস্তুতি: সার্টিফাইড সর্ষে বীজ, সালফারযুক্ত এসএসপি এবং বোরন ২০% একসাথে সাশ্রয়ী মূল্যে।',
    discount: 'Bundle Price ₹1,199 Only',
    discountbn: 'কম্বো প্যাকেজ মাত্র ১,১৯৯ টাকায়',
    validUntil: '30 November 2026',
    category: 'seeds',
    featured: false,
    image: '/images/offers/mustard-combo.jpg',
  },
];
