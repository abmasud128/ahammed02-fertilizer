export interface CropStage {
  stage: string;
  stagebn: string;
  description: string;
  descriptionbn: string;
  recommendedProducts: string[]; // product IDs
}

export interface Crop {
  id: string;
  slug: string;
  name: string;
  namebn: string;
  image: string;
  description: string;
  descriptionbn: string;
  season: string;
  seasonbn: string;
  growthStages: CropStage[];
}

export const crops: Crop[] = [
  {
    id: 'crop-paddy',
    slug: 'paddy',
    name: 'Paddy / Rice',
    namebn: 'ধান',
    image: '/images/crops/paddy.jpg',
    description:
      'The staple grain crop of Bengal cultivated across Kharif (Aman), Boro (winter-summer), and Aus seasons with precise water and nutrient management.',
    descriptionbn:
      'বাংলার প্রধান খাদ্যশস্য যা আমন ও বোরো মরসুমে নিবিড় সার ও উপযুক্ত সেচ ব্যবস্থাপনায় প্রচুর ফলন দেয়।',
    season: 'Kharif & Boro',
    seasonbn: 'খরিফ (আমন) ও রবি/বোরো মরসুম',
    growthStages: [
      {
        stage: 'Land Preparation & Seed Treatment',
        stagebn: 'জমি তৈরি ও বীজ শোধন',
        description:
          'Deep ploughing, puddling, and basal fertilization with DAP/SSP and MOP. Seed dressing with systemic fungicide to guard against seedling blight.',
        descriptionbn:
          'কাদাময় জমি তৈরির শেষ চাষে ডিএপি ও পটাশ সার প্রয়োগ। বীজ শোধন করে চারার গোড়া পচা রোগ রোধ।',
        recommendedProducts: ['prod-003', 'prod-004', 'prod-013', 'prod-018'],
      },
      {
        stage: 'Nursery Raising',
        stagebn: 'বীজতলা পরিচর্যা',
        description:
          'Maintaining 21-25 day healthy nursery seedlings with balanced water and protective spray against insect vector pests.',
        descriptionbn:
          '২১-২৫ দিনের সতেজ চারা তৈরির জন্য পরিমিত জল ও চোষক পোকা থেকে রক্ষা করতে হালকা স্প্রে।',
        recommendedProducts: ['prod-010', 'prod-001'],
      },
      {
        stage: 'Transplanting & Weed Control',
        stagebn: 'চারা রোয়া ও আগাছা দমন',
        description:
          'Transplant 2-3 seedlings per hill. Apply selective pre-emergence herbicide within 3 days in standing water.',
        descriptionbn:
          'প্রতি গুছিতে ২-৩টি চারা রোয়া। রোয়ার ৩ দিনের মধ্যে জমিতে জল থাকাকালীন আগাছানাশক প্রয়োগ।',
        recommendedProducts: ['prod-016', 'prod-020'],
      },
      {
        stage: 'Active Tillering',
        stagebn: 'কুশি ও ডালপালা বৃদ্ধি',
        description:
          'First top dressing of Neem Coated Urea combined with Zinc Sulphate. Control stem borers and leaf folders.',
        descriptionbn:
          'ইউরিয়ার প্রথম কিস্তির সাথে জিঙ্ক সালফেট উপরিপ্রয়োগ। মাজরা ও পাতা মোড়ানো পোকার নিয়ন্ত্রণ।',
        recommendedProducts: ['prod-002', 'prod-006', 'prod-009'],
      },
      {
        stage: 'Panicle Initiation & Flowering',
        stagebn: 'থোড় ও ফুল আসার অবস্থা',
        description:
          'Second top dressing of potash and urea. Prophylactic protection against rice blast and brown plant hoppers (BPH).',
        descriptionbn:
          'পটাশ সারের দ্বিতীয় কিস্তি প্রয়োগ। ব্লাস্ট রোগ ও বাদামী গাছফড়িং (কারেন্ট পোকা) প্রতিরোধ।',
        recommendedProducts: ['prod-004', 'prod-014', 'prod-010'],
      },
      {
        stage: 'Grain Filling (Milking stage)',
        stagebn: 'দানা গঠন ও পুষ্ট হওয়া',
        description:
          'Foliar spray of 19:19:19 and Boron for complete grain filling, lustrous golden husk, and minimal chaffy grains.',
        descriptionbn:
          'চিটা ধান কমাতে এবং দানার ওজন ও চকচকে ভাব আনতে জলে দ্রবণীয় সার ও বোরন স্প্রে।',
        recommendedProducts: ['prod-001', 'prod-007'],
      },
      {
        stage: 'Maturity & Harvest',
        stagebn: 'পাকা ও ফসল তোলা',
        description:
          'Drain remaining field water 10-12 days prior to harvest when 85% of panicles turn golden yellow.',
        descriptionbn:
          'শীষের ৮৫% ধান সোনালী রঙ ধারণ করলে মাঠের জল নিষ্কাশন করে শুকনো অবস্থায় ফসল সংগ্রহ।',
        recommendedProducts: [],
      },
    ],
  },
  {
    id: 'crop-jute',
    slug: 'jute',
    name: 'Jute (Golden Fibre)',
    namebn: 'পাট (সোনালী আঁশ)',
    image: '/images/crops/jute.jpg',
    description:
      'Major commercial fibre crop thriving in alluvial warm, humid plains. Requires adequate basal phosphorus and nitrogen boost.',
    descriptionbn:
      'উষ্ণ ও আর্দ্র আবহাওয়ায় উৎকৃষ্ট অর্থকরী ফসল। শক্ত কান্ড ও মানসম্মত আঁশের জন্য সঠিক নাইট্রোজেন ও ফসফরাস জরুরি।',
    season: 'Kharif (Pre-monsoon)',
    seasonbn: 'খরিফ মরসুম (বৈশাখ-জ্যৈষ্ঠ)',
    growthStages: [
      {
        stage: 'Sowing & Thinning',
        stagebn: 'বপন ও চারা পাতলাকরণ',
        description:
          'Line sowing with basal SSP and MOP. Seed treatment with carbendazim to avoid stem rot. Thinning seedlings at 15-20 days.',
        descriptionbn:
          'এসএসপি ও পটাশ সহ জমিতে লাইন বপন। কার্বেনডাজিম দিয়ে বীজ শোধন এবং ১৫-২০ দিনে অতিরিক্ত চারা তোলা।',
        recommendedProducts: ['prod-005', 'prod-004', 'prod-013'],
      },
      {
        stage: 'Vegetative Growth & Pest Management',
        stagebn: 'শাখা বৃদ্ধি ও পোকা দমন',
        description:
          'Split urea application for stem elongation. Spray against semilooper caterpillars, yellow mites, and hairy caterpillars.',
        descriptionbn:
          'গাছের দ্রুত বৃদ্ধির জন্য ইউরিয়া উপরিপ্রয়োগ। পাট ঘোড়া পোকা (সেমিলুপার) ও বিছাপোকা দমন।',
        recommendedProducts: ['prod-002', 'prod-011', 'prod-020'],
      },
      {
        stage: 'Harvesting & Retting',
        stagebn: 'কর্তন ও পাট জাগ দেওয়া',
        description:
          'Harvest at small pod stage (110-120 days) for optimum fibre strength, color, and smooth retting.',
        descriptionbn:
          '১১০-১২০ দিনে ছোট শুঁটি আসার সময় কেটে পরিষ্কার জলে সঠিক পচনের (জাগ) ব্যবস্থা করা।',
        recommendedProducts: [],
      },
    ],
  },
  {
    id: 'crop-potato',
    slug: 'potato',
    name: 'Potato',
    namebn: 'আলু',
    image: '/images/crops/potato.jpg',
    description:
      'High investment Rabi cash crop requiring well-drained loamy soil, intense nutrition, and rigorous late blight protection.',
    descriptionbn:
      'পশ্চিমবঙ্গের প্রধান অর্থকরী রবি ফসল। আলুর আকার ও ফলন বৃদ্ধির জন্য সুষম সার ও নাভিধসা রোগ নিয়ন্ত্রণ অত্যন্ত জরুরি।',
    season: 'Rabi (Winter)',
    seasonbn: 'রবি মরসুম (শীতকাল)',
    growthStages: [
      {
        stage: 'Seed Tuber Planting & Basal Dose',
        stagebn: 'বীজ আলু রোপণ ও তলদেশ সার',
        description:
          'Cut tuber treatment with Mancozeb fungicide. Heavy basal application of DAP, MOP, SSP, and Zinc.',
        descriptionbn:
          'কাটা বীজ আলু ম্যানকোজেব দিয়ে শোধন। জমিতে প্রচুর পরিমাণে ডিএপি, পটাশ, এসএসপি ও জিঙ্ক প্রয়োগ।',
        recommendedProducts: ['prod-012', 'prod-003', 'prod-004', 'prod-005', 'prod-006'],
      },
      {
        stage: 'Vegetative Growth & Earthing Up',
        stagebn: 'গাছের বৃদ্ধি ও গোড়ায় মাটি তোলা',
        description:
          'Top dress with urea before first irrigation. Earth up loose soil around plants to support tuber development.',
        descriptionbn:
          'প্রথম সেচের আগে ইউরিয়া উপরিপ্রয়োগ এবং গাছ বৃদ্ধির সাথে সাথে গোড়ায় ভেলি তুলে মাটি দেওয়া।',
        recommendedProducts: ['prod-002', 'prod-001'],
      },
      {
        stage: 'Tuber Initiation & Blight Watch',
        stagebn: 'আলু ধরা ও ব্লাইট রোগ প্রতিরোধ',
        description:
          'Crucial stage 40-60 days. Regular prophylactic Mancozeb spray against late blight. Apply Boron for hollow-heart prevention.',
        descriptionbn:
          '৪০-৬০ দিনের মাথায় কুয়াশা ও মেঘলা আবহাওয়ায় ম্যানকোজেব দিয়ে আগাম স্প্রে ও আলু ফাটা রোধে বোরন প্রয়োগ।',
        recommendedProducts: ['prod-012', 'prod-007', 'prod-020'],
      },
      {
        stage: 'Tuber Bulking & Maturity',
        stagebn: 'আলু পুষ্ট হওয়া ও তোলা',
        description:
          'Stop irrigation 10-12 days before dehaulming. Allow potato skin to harden before harvest.',
        descriptionbn:
          'গাছের ডাল কাটার (ডিহলমিং) ১০ দিন আগে জল বন্ধ করে খোসা শক্ত করে আলু তোলার প্রস্তুতি।',
        recommendedProducts: ['prod-004'],
      },
    ],
  },
  {
    id: 'crop-mustard',
    slug: 'mustard',
    name: 'Mustard / Rapeseed',
    namebn: 'সর্ষে',
    image: '/images/crops/mustard.jpg',
    description:
      'Major oilseed crop in Bengal responding remarkably to sulphur nutrition, light irrigation, and aphid management.',
    descriptionbn:
      'শীতকালীন প্রধান তেলবীজ ফসল। সালফার/গন্ধক সার ব্যবহারে তেলের পরিমাণ ও দানার ওজন নাটকীয়ভাবে বৃদ্ধি পায়।',
    season: 'Rabi (Winter)',
    seasonbn: 'রবি মরসুম (কার্তিক-অগ্রহায়ণ)',
    growthStages: [
      {
        stage: 'Land Preparation & Sowing',
        stagebn: 'জমি তৈরি ও বীজ বপন',
        description:
          'Incorporate SSP for crucial sulphur content, along with DAP and Potash. Sow in rows in residual soil moisture.',
        descriptionbn:
          'তেলের মান বাড়াতে পর্যাপ্ত এসএসপি (সালফারযুক্ত সার), ডিএপি ও পটাশ প্রয়োগ করে জো অবস্থায় বপন।',
        recommendedProducts: ['prod-005', 'prod-003', 'prod-004'],
      },
      {
        stage: 'Vegetative & First Irrigation',
        stagebn: 'গাছ বৃদ্ধি ও প্রথম সেচ',
        description:
          'Provide light irrigation at 25-30 days followed by light urea top dressing. Weed out competing plants.',
        descriptionbn:
          '২৫-৩০ দিনে প্রথম হালকা সেচ এবং ইউরিয়া উপরিপ্রয়োগ করে আগাছা পরিষ্কার করা।',
        recommendedProducts: ['prod-002', 'prod-001'],
      },
      {
        stage: 'Flowering & Aphid (Mahu) Control',
        stagebn: 'ফুল আসা ও জাবপোকা দমন',
        description:
          'Critical monitoring for mustard aphids (Mahu). Spray Imidacloprid immediately if aphid colonies appear.',
        descriptionbn:
          'হলুদ ফুলে জাবপোকা বা মোহা পোকার আক্রমণ দেখা দিলে দ্রুত ইমিডাক্লোপ্রিড স্প্রে করা।',
        recommendedProducts: ['prod-010', 'prod-020'],
      },
      {
        stage: 'Pod Formation & Seed Filling',
        stagebn: 'শুঁটি গঠন ও দানা পাকা',
        description:
          'Foliar spray of Boron 20% to prevent empty pods and enhance oil synthesis. Harvest when pods turn yellowish brown.',
        descriptionbn:
          'শুঁটি পুষ্ট করতে এবং চিটা কমাতে বোরন স্প্রে। শুঁটি ৭৫% হলদেটে হলে ফসল তোলা।',
        recommendedProducts: ['prod-007'],
      },
    ],
  },
  {
    id: 'crop-wheat',
    slug: 'wheat',
    name: 'Wheat',
    namebn: 'গম',
    image: '/images/crops/wheat.jpg',
    description:
      'Cool-season cereal crop performing best in well-drained loamy soils with timely crown root irrigation and balanced NPK.',
    descriptionbn:
      'শীতকালীন পুষ্টিকর দানাশস্য। মুকুট শিকড় তৈরি (CRI) পর্যায়ে সঠিক সেচ ও সুষম সার ফলনের জন্য মূল চাবিকাঠি।',
    season: 'Rabi (Winter)',
    seasonbn: 'রবি মরসুম (অগ্রহায়ণ-পৌষ)',
    growthStages: [
      {
        stage: 'Sowing & Basal Fertilization',
        stagebn: 'বপন ও তলদেশ সার',
        description:
          'Seed treatment with Carbendazim. Basal application of full dose DAP, half MOP, and Zinc Sulphate.',
        descriptionbn:
          'কার্বেনডাজিম দ্বারা বীজ শোধন এবং জমি তৈরিতে সম্পূর্ণ ডিএপি, অর্ধেক পটাশ ও জিঙ্ক প্রয়োগ।',
        recommendedProducts: ['prod-013', 'prod-003', 'prod-004', 'prod-006'],
      },
      {
        stage: 'Crown Root Initiation (Tillering)',
        stagebn: 'মুকুট শিকড় ও কুশি বের হওয়া',
        description:
          'Apply first vital irrigation at 21 days accompanied by first split dose of Neem Coated Urea.',
        descriptionbn:
          '২১ দিনে প্রথম প্রধান সেচ প্রদান এবং ইউরিয়ার প্রথম কিস্তি জমিতে উপরিপ্রয়োগ।',
        recommendedProducts: ['prod-002'],
      },
      {
        stage: 'Heading & Booting',
        stagebn: 'শীষ বের হওয়া ও ফুল অবস্থা',
        description:
          'Selective herbicide spray for broadleaf weeds if present. Apply remaining potash and water-soluble foliar spray.',
        descriptionbn:
          'চওড়া পাতার আগাছা থাকলে ২,৪-ডি প্রয়োগ। বাকি পটাশ ও এনপিকে ১৯:১৯:১৯ স্প্রে।',
        recommendedProducts: ['prod-017', 'prod-001', 'prod-004'],
      },
      {
        stage: 'Grain Filling & Maturity',
        stagebn: 'দানা গঠন ও ফসল কর্তন',
        description:
          'Protect crop from terminal heat by maintaining soil moisture during milk-to-dough stage. Harvest dry golden cobs.',
        descriptionbn:
          'দানা পুষ্ট হওয়ার সময় জমিতে রস বজায় রাখা এবং গাছ সম্পূর্ণ সোনালী হলে শুকিয়ে কাটা।',
        recommendedProducts: [],
      },
    ],
  },
  {
    id: 'crop-maize',
    slug: 'maize',
    name: 'Hybrid Maize / Corn',
    namebn: 'ভুট্টা',
    image: '/images/crops/maize.jpg',
    description:
      'Heavy nutrient feeder with high yield potential. Widely cultivated in Rabi and Kharif for poultry feed and grain industries.',
    descriptionbn:
      'উচ্চ ফলনশীল অর্থকরী দানাশস্য। পোল্ট্রি ও খাদ্য শিল্পের জন্য ব্যাপক চাহিদাযুক্ত এবং উচ্চ পুষ্টি গ্রহণকারী ফসল।',
    season: 'Kharif & Rabi',
    seasonbn: 'খরিফ ও রবি উভয় মরসুম',
    growthStages: [
      {
        stage: 'Sowing & Field Establishment',
        stagebn: 'বপন ও চারা প্রতিষ্ঠা',
        description:
          'Sow certified hybrid seeds at 60cm x 20cm spacing. Basal placement of DAP and MOP in rows.',
        descriptionbn:
          'উচ্চফলনশীল হাইব্রিড বীজ সারিবদ্ধভাবে বপন এবং সারিতে ডিএপি ও পটাশ সার প্রয়োগ।',
        recommendedProducts: ['prod-019', 'prod-003', 'prod-004'],
      },
      {
        stage: 'Knee-High Vegetative Stage',
        stagebn: 'হাঁটু সমান উচ্চতা ও বৃদ্ধি',
        description:
          'First split dose of urea. Rigorous vigilance against Fall Armyworm; spray Cypermethrin or Chlorpyrifos if defoliation occurs.',
        descriptionbn:
          'ইউরিয়া উপরিপ্রয়োগ এবং ক্ষতিকর ফল আর্মিওয়ার্ম বা পাতাখেকো পোকা দমনে কীটনাশক স্প্রে।',
        recommendedProducts: ['prod-002', 'prod-011', 'prod-009'],
      },
      {
        stage: 'Tasseling & Silking',
        stagebn: 'চামর ও মোচায় চুল আসা',
        description:
          'Most moisture-sensitive period. Supply adequate irrigation and foliar booster 19:19:19 for even cob setting.',
        descriptionbn:
          'মোচা গঠনের সবচেয়ে স্পর্শকাতর পর্যায়। পর্যাপ্ত সেচ ও দানা বাঁধার জন্য এনপিকে স্প্রে।',
        recommendedProducts: ['prod-001', 'prod-020'],
      },
      {
        stage: 'Grain Fill & Cob Maturity',
        stagebn: 'মোচায় দানা পুষ্ট ও উত্তোলন',
        description:
          'Cob husk turns light straw yellow. Harvest when grain moisture drops below 20%.',
        descriptionbn:
          'মোচার খোসা খড়ের মতো শুকিয়ে গেলে এবং দানা শক্ত হলে মোচা সংগ্রহ ও মাড়াই।',
        recommendedProducts: [],
      },
    ],
  },
  {
    id: 'crop-vegetables',
    slug: 'vegetables',
    name: 'Vegetables (Chilli, Brinjal, Tomato, Gourd)',
    namebn: 'সবজি চাষ (লঙ্কা, বেগুন, টমেটো, পটল)',
    image: '/images/crops/vegetables.jpg',
    description:
      'Intensive round-the-year horticulture requiring meticulous pest control against sucking insects, fruit borers, and wilt diseases.',
    descriptionbn:
      'সারা বছর চাষযোগ্য লাভজনক উদ্যানপালন ফসল। সাদা মাছি, ফল ছিদ্রকারী পোকা ও ছত্রাক দমনে সার্বক্ষণিক যত্ন আবশ্যক।',
    season: 'All Seasons (Round the Year)',
    seasonbn: 'সারা বছর (গ্রীষ্ম, বর্ষা ও শীতকালীন)',
    growthStages: [
      {
        stage: 'Nursery & Seed Bed',
        stagebn: 'বীজতলা তৈরি ও বীজ শোধন',
        description:
          'Sterilize nursery soil and treat seeds with Carbendazim. Maintain shade net cover against rain wash.',
        descriptionbn:
          'কার্বেনডাজিম দিয়ে বীজ শোধন এবং রোগমুক্ত সুস্থ চারা তৈরির জন্য উঁচু বীজতলা তৈরি।',
        recommendedProducts: ['prod-013'],
      },
      {
        stage: 'Transplanting & Root Establishment',
        stagebn: 'চারা রোপণ ও শিকড় বৃদ্ধি',
        description:
          'Drench root zone with copper or systemic fungicide. Basal application of balanced NPK and organic manures.',
        descriptionbn:
          'চারা রোপণের পর গোড়ায় ছত্রাকনাশক দ্রবণ প্রয়োগ এবং প্রাথমিক সুষম সার প্রদান।',
        recommendedProducts: ['prod-003', 'prod-012', 'prod-001'],
      },
      {
        stage: 'Vegetative Growth & Sucking Pest Defense',
        stagebn: 'গাছ বৃদ্ধি ও পোকা প্রতিরোধ',
        description:
          'Prevent leaf curl virus by spraying Imidacloprid against whiteflies and thrips. Foliar spray of micronutrients.',
        descriptionbn:
          'পাতা কোঁকড়ানো রোধে সাদা মাছি ও থ্রিপসের বিরুদ্ধে ইমিডাক্লোপ্রিড ও অনুখাদ্য স্প্রে।',
        recommendedProducts: ['prod-010', 'prod-008', 'prod-020'],
      },
      {
        stage: 'Flowering & Continuous Fruiting',
        stagebn: 'ফুল-ফল ধারণ ও নিয়মিত সংগ্রহ',
        description:
          'Apply Boron 20% to prevent flower drop and fruit cracking. Alternate sprays of Cypermethrin for fruit borer caterpillars.',
        descriptionbn:
          'ফুল ঝরা ও ফল ফাটা রোধে বোরন প্রয়োগ এবং ডগা ও ফল ছিদ্রকারী পোকা দমনে নিয়ন্ত্রিত স্প্রে।',
        recommendedProducts: ['prod-007', 'prod-011', 'prod-001'],
      },
    ],
  },
  {
    id: 'crop-mango',
    slug: 'mango',
    name: 'Mango Orchard Care',
    namebn: 'আম বাগান পরিচর্যা',
    image: '/images/crops/mango.jpg',
    description:
      'Premier fruit crop of West Bengal (Malda, Murshidabad). Success hinges on timely hopper control and powdery mildew sprays during flowering.',
    descriptionbn:
      'বাংলার ঐতিহ্যবাহী প্রধান ফল। মুকুলে শোষক হপার পোকা এবং পাউডারি মিলডিউ রোগ প্রতিরোধই বাম্পার ফলনের মূল চাবিকাঠি।',
    season: 'Perennial (Flowering Dec-Feb)',
    seasonbn: 'বারোমাসি (মুকুল আসার মরসুম পৌষ-মাঘ)',
    growthStages: [
      {
        stage: 'Post-Monsoon Orchard Cleaning & Pre-Flowering',
        stagebn: 'বর্ষা পরবর্তী পরিচর্যা ও মুকুল আসার পূর্বপ্রস্তুতি',
        description:
          'Prune dead diseased branches. Clear weeds using non-selective herbicide under canopy bunds. Basal ring fertilizer dose.',
        descriptionbn:
          'মরা ডাল ছাঁটাই, গাছের গোড়ার আগাছা পরিষ্কার এবং গাছের চারপাশের রিং নালায় সুষম সার প্রয়োগ।',
        recommendedProducts: ['prod-015', 'prod-003', 'prod-004'],
      },
      {
        stage: 'Flowering & Inflorescence Protection',
        stagebn: 'মুকুল আসা ও হপার পোকা নিয়ন্ত্রণ',
        description:
          'First spray at tight bud stage with Imidacloprid + Mancozeb. Second spray after pea-size fruit set to avoid disturbing pollinator bees.',
        descriptionbn:
          'মুকুল বের হওয়ার সময় এবং গুটি বাঁধার পর ইমিডাক্লোপ্রিড ও ম্যানকোজেব মিশ্রণ স্প্রে। পরাগায়নের সময় স্প্রে স্থগিত রাখা।',
        recommendedProducts: ['prod-010', 'prod-012', 'prod-020'],
      },
      {
        stage: 'Fruit Setting & Pea-to-Marble Stage',
        stagebn: 'গুটি বাঁধা ও মটরদানা অবস্থা',
        description:
          'Foliar spray of Boron 20% and NPK 19:19:19 to prevent excessive fruitlet drop and promote fast sizing.',
        descriptionbn:
          'আমের গুটি ঝরে যাওয়া কমাতে এবং আকার দ্রুত বড় করতে বোরন ও ১৯:১৯:১৯ স্প্রে।',
        recommendedProducts: ['prod-007', 'prod-001'],
      },
      {
        stage: 'Fruit Maturity & Harvest',
        stagebn: 'ফল পরিপক্ক ও সংগ্রহ',
        description:
          'Harvest fruits with 1-2 cm pedicel attached during morning hours to prevent sap burn on the skin.',
        descriptionbn:
          'কষ লাগা রোধে বোঁটা সহ সাবধানে আম পেড়ে ছায়ায় গ্রেডিং ও প্যাকিং করা।',
        recommendedProducts: [],
      },
    ],
  },
  {
    id: 'crop-banana',
    slug: 'banana',
    name: 'Banana (Commercial Cultivation)',
    namebn: 'কলা চাষ',
    image: '/images/crops/banana.jpg',
    description:
      'High-potash feeding heavy crop requiring frequent irrigation, desuckering, and bunch nutrition for export-quality hands.',
    descriptionbn:
      'প্রচুর পটাশ প্রিয় দ্রুত বর্ধনশীল ফল। ভালো কাঁদি ও পুষ্ট কলার জন্য নিয়মিত জলসেচ ও অনুখাদ্য প্রয়োজন।',
    season: 'Perennial (Year-round planting)',
    seasonbn: 'বারোমাসি ফল',
    growthStages: [
      {
        stage: 'Pit Preparation & Sucker Planting',
        stagebn: 'মাদাল তৈরি ও চারা রোপণ',
        description:
          'Dip sword suckers in Carbendazim solution before planting. Fill pit with organic manure and basal DAP/SSP.',
        descriptionbn:
          'তেজি চারা কার্বেনডাজিমে ডুবিয়ে শোধন এবং গর্তে গোবর সার ও প্রাথমিক ফসফেট সার দিয়ে রোপণ।',
        recommendedProducts: ['prod-013', 'prod-003', 'prod-005'],
      },
      {
        stage: 'Vegetative Growth & Split Nutrition',
        stagebn: 'গাছের বৃদ্ধি ও নিয়মিত সার প্রয়োগ',
        description:
          'Apply monthly split doses of Urea and high Muriate of Potash (MOP). Keep pits weed-free using directed sprays.',
        descriptionbn:
          'প্রতি মাসে নিয়মিত ইউরিয়া ও উচ্চ মাত্রায় পটাশ সার উপরিপ্রয়োগ এবং গোড়ার আগাছা দমন।',
        recommendedProducts: ['prod-002', 'prod-004', 'prod-015'],
      },
      {
        stage: 'Shooting & Flower Bunch Emergence',
        stagebn: 'মোচা বা থোড় বের হওয়া',
        description:
          'Foliar spray of Boron and 19:19:19 over developing bunch to eliminate tip rot and enhance finger size.',
        descriptionbn:
          'মোচা বের হলে কলার আঙ্গুল সুন্দর ও লম্বা করতে বোরন এবং জলে দ্রবণীয় সার স্প্রে।',
        recommendedProducts: ['prod-007', 'prod-001'],
      },
      {
        stage: 'Bunch Development & Harvest',
        stagebn: 'কাঁদি পুষ্ট হওয়া ও কর্তন',
        description:
          'Remove male bud (denavelling) and cover bunch with polypropylene sleeve. Harvest when ridges on fingers become rounded.',
        descriptionbn:
          'মোচার শেষ মাথা ভেঙে ফেলা এবং কাঁদি পুষ্ট হয়ে কোণ বা খাঁজ মিলিয়ে গোল হলে কাটা।',
        recommendedProducts: [],
      },
    ],
  },
];
