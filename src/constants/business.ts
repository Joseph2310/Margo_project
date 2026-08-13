import type {
  BeneficiaryEvent,
  BeneficiaryProfile,
  Conversation,
  DailyReading,
  KnowMeQuestion,
  QuestionAnswer,
  QuestionCategory,
  ReflectionLesson,
  SpiritualActivity,
} from '../types/business';
import { colors } from '../theme/tokens';

export const profileFixture: BeneficiaryProfile = {
  id: 'beneficiary-design-fixture',
  name: 'جوي بركات',
  birthDate: '15 أكتوبر 1998',
  stage: 'الثانوية',
  address: '16 شارع داود عمارة صديق هنداوي',
  phone: '01140268334',
  whatsapp: '01140268334',
  school: 'السلام الإعدادية الثانوية المشتركة',
  classSaintName: 'القديس أثناسيوس الرسولي',
  confessionFather: 'الثانوية',
  talents: ['السباحة', 'السباحة', 'السباحة'],
  email: 'joy.barakat@hotmail.com',
  points: 20000,
  attendanceQrValue: 'beneficiary-design-fixture:sunday-school-attendance',
};

export const eventsFixture: BeneficiaryEvent[] = [
  {
    id: 'sports-day',
    name: 'اليوم الرياضي',
    dateLabel: '27 يونيو 2026',
    timeLabel: '9 صباحا - 5 مساءا',
    location: 'مدرسة السلام الحديثة بأسيوط',
    icon: 'fitness-outline',
  },
  {
    id: 'cross-retreat',
    name: 'خلوة الصليب',
    dateLabel: '27 - 30 يونيو 2026',
    timeLabel: '9 صباحا - 5 مساءا',
    location: 'دير العذراء مريم بدرنكة',
    icon: 'sparkles-outline',
  },
  {
    id: 'annual-conference',
    name: 'المؤتمر السنوي',
    dateLabel: '27 - 30 يونيو 2026',
    timeLabel: '9 صباحا - 5 مساءا',
    location: 'بيت سان مارك بالخطاطبة',
    icon: 'people-outline',
  },
  {
    id: 'fountain-trip',
    name: 'رحلة النافورة',
    dateLabel: '30 يونيو 2026',
    timeLabel: '9 صباحا - 5 مساءا',
    location: 'دير النافورة بوادي النطرون',
    icon: 'bus-outline',
  },
];

export const dailyReadingFixture: DailyReading = {
  id: 'reading-2026-03-04',
  date: 'الخميس، 4 مارس 2026',
  reference: 'مزمور 32',
  title: 'قراءة اليوم',
};

export const spiritualActivitiesFixture: SpiritualActivity[] = [
  {
    id: 'daily-reading',
    title: 'القراءة اليومية',
    points: 50,
    description:
      'الشاهد الكتابي\nمزمور 23\n• غير يا رب وجه تعبي كل أيام حياتي\n• ربنا معايا في أي مكان\n• ربنا بيرعاني لا يعوزني شيء في حياتي\n• يرد نفسي لمياه المحبة كل يوم',
  },
  { id: 'mass', title: 'حضور القداس', points: 50 },
  { id: 'sunday-school', title: 'حضور مدارس الاحد', points: 50 },
  { id: 'confession', title: 'الاعتراف' },
  { id: 'communion', title: 'التناول' },
];

export const reflectionFixture: ReflectionLesson = {
  id: 'reflection-2026-04-17',
  date: 'درس مدارس الاحد الجمعة 17 / 4 / 2026',
  title: 'من هو قريبي ؟',
  points: [
    'المحبة الحقيقية بالفعل مش بالكلام',
    'ساعد أي إنسان بغض النظر عن اختلافه',
    'ما تتجاهلش احتياج اللي قدامك',
    'العطاء الحقيقي فيه تضحية',
  ],
  exercise:
    'من خلال قصة السامري الصالح دور في دواير حياتك على من هو بالفعل قريبك وكيف قدمت له الحب أو العطاء أو الاستماع',
  exercisePoints: 50,
};

export const questionCategoriesFixture: QuestionCategory[] = [
  { id: 'prayer', title: 'الصلاة', icon: 'body-outline', color: colors.cream },
  {
    id: 'relationships',
    title: 'العلاقات',
    icon: 'people-outline',
    color: colors.rose,
  },
  { id: 'love', title: 'المحبة', icon: 'heart-outline', color: colors.blush },
  { id: 'retreat', title: 'الخلوة', icon: 'book-outline', color: colors.sky },
  { id: 'service', title: 'الخدمة', icon: 'leaf-outline', color: colors.cream },
  {
    id: 'evangelism',
    title: 'الكرازة',
    icon: 'megaphone-outline',
    color: colors.mint,
  },
  {
    id: 'confession-sacrament',
    title: 'سر اعترافي',
    icon: 'sunny-outline',
    color: colors.sky,
  },
  {
    id: 'eucharist',
    title: 'سر الافخارستيا',
    icon: 'wine-outline',
    color: colors.aqua,
  },
  {
    id: 'forgiveness',
    title: 'الغفران',
    icon: 'heart-half-outline',
    color: colors.taupe,
  },
];

export const questionsFixture: QuestionAnswer[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `question-${index + 1}`,
    categoryId: index % 2 === 0 ? 'prayer' : 'relationships',
    question: 'لماذا نصلي ؟',
    answer: 'الصلاة هى اتحاد مع الله',
  }),
);

export const knowMeQuestionsFixture: KnowMeQuestion[] = [
  {
    id: 'today',
    label: 'سؤال اليوم : هرم الفلسطينيين',
    askedAt: '',
    isToday: true,
  },
  { id: 'second', label: 'السؤال الثاني : آخر العنقود', askedAt: 'منذ يوم' },
  { id: 'first', label: 'السؤال الاول : راعي غنم', askedAt: 'منذ يومين' },
];

export const conversationsFixture: Conversation[] = [
  {
    id: 'miss-marina',
    servantName: 'مس مارينا',
    preview: 'انت : ازيك يا مس مارينا عاملة ايه ؟؟',
    messages: [
      {
        id: 'm1',
        sender: 'beneficiary',
        senderName: 'جوي بركات',
        kind: 'text',
        content: 'الخلوة واقعة مني و مش عارفة اعمل ايه',
      },
      {
        id: 'm2',
        sender: 'servant',
        senderName: 'مس مارينا',
        kind: 'text',
        content: 'الخلوة واقعة مني و مش عارفة اعمل ايه',
      },
    ],
  },
];

export const passwordRules = [
  { key: 'length', label: '8 حروف' },
  { key: 'number', label: 'رمز' },
  { key: 'uppercase', label: 'حرف كبير' },
] as const;
