from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal
from app.models import (
    BeneficiaryProfile,
    Conversation,
    ConversationKind,
    ConversationMessage,
    DailyReading,
    Event,
    KnowMeQuestion,
    MessageKind,
    Question,
    QuestionCategory,
    ReflectionLesson,
    SenderKind,
    Servant,
    SpiritualActivity,
    User,
)
from app.security import hash_secret, normalize_email


def seed_database() -> None:
    db = SessionLocal()
    try:
        email = normalize_email(settings.demo_user_email)
        user = db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(
                id="beneficiary-design-fixture",
                email=email,
                password_hash=hash_secret(settings.demo_user_password),
                is_verified=True,
                is_active=True,
            )
            db.add(user)
            db.flush()
            db.add(
                BeneficiaryProfile(
                    user_id=user.id,
                    name="جوي بركات",
                    birth_date="15 أكتوبر 1998",
                    stage="الثانوية",
                    address="16 شارع داود عمارة صديق هنداوي",
                    phone="01140268334",
                    whatsapp="01140268334",
                    school="السلام الإعدادية الثانوية المشتركة",
                    class_saint_name="القديس أثناسيوس الرسولي",
                    confession_father="الثانوية",
                    talents=["السباحة", "الترانيم"],
                    points=20000,
                    attendance_qr_value=(
                        "beneficiary-design-fixture:sunday-school-attendance"
                    ),
                )
            )

        event_rows = [
            (
                "sports-day",
                "اليوم الرياضي",
                "Sports Day",
                datetime(2026, 9, 27, 9, tzinfo=timezone.utc),
                datetime(2026, 9, 27, 17, tzinfo=timezone.utc),
                "27 سبتمبر 2026",
                "September 27, 2026",
                "9 صباحا - 5 مساءا",
                "9:00 AM - 5:00 PM",
                "مدرسة السلام الحديثة بأسيوط",
                "Al Salam Modern School, Assiut",
                "fitness-outline",
            ),
            (
                "cross-retreat",
                "خلوة الصليب",
                "The Cross Retreat",
                datetime(2026, 10, 2, 9, tzinfo=timezone.utc),
                datetime(2026, 10, 5, 17, tzinfo=timezone.utc),
                "2 - 5 أكتوبر 2026",
                "October 2-5, 2026",
                "9 صباحا - 5 مساءا",
                "9:00 AM - 5:00 PM",
                "دير العذراء مريم بدرنكة",
                "Monastery of the Virgin Mary, Dronka",
                "sparkles-outline",
            ),
            (
                "annual-conference",
                "المؤتمر السنوي",
                "Annual Conference",
                datetime(2026, 10, 20, 9, tzinfo=timezone.utc),
                datetime(2026, 10, 23, 17, tzinfo=timezone.utc),
                "20 - 23 أكتوبر 2026",
                "October 20-23, 2026",
                "9 صباحا - 5 مساءا",
                "9:00 AM - 5:00 PM",
                "بيت سان مارك بالخطاطبة",
                "St. Mark House, El-Khatatba",
                "people-outline",
            ),
            (
                "fountain-trip",
                "رحلة النافورة",
                "El-Nafoura Trip",
                datetime(2026, 11, 6, 9, tzinfo=timezone.utc),
                datetime(2026, 11, 6, 17, tzinfo=timezone.utc),
                "6 نوفمبر 2026",
                "November 6, 2026",
                "9 صباحا - 5 مساءا",
                "9:00 AM - 5:00 PM",
                "دير النافورة بوادي النطرون",
                "El-Nafoura Monastery, Wadi El Natrun",
                "bus-outline",
            ),
        ]
        for (
            identifier,
            name,
            name_en,
            starts_at,
            ends_at,
            date_label,
            date_label_en,
            time_label,
            time_label_en,
            location,
            location_en,
            icon,
        ) in event_rows:
            event = db.get(Event, identifier)
            if not event:
                event = Event(
                    id=identifier,
                    name=name,
                    starts_at=starts_at,
                    ends_at=ends_at,
                    date_label=date_label,
                    time_label=time_label,
                    location=location,
                    icon=icon,
                )
                db.add(event)
            event.name_en = name_en
            event.date_label_en = date_label_en
            event.time_label_en = time_label_en
            event.location_en = location_en

        reading_id = f"reading-{date.today().isoformat()}"
        reading = db.get(DailyReading, reading_id)
        if not reading:
            reading = DailyReading(
                id=reading_id,
                reading_date=date.today(),
                date_label="قراءة اليوم",
                reference="مزمور 32",
                title="قراءة اليوم",
                content="بالرب تبتهج نفوسنا لأنه هو عوننا وترسنا.",
            )
            db.add(reading)
        reading.date_label_en = "Daily reading"
        reading.reference_en = "Psalm 32"
        reading.title_en = "Daily reading"
        reading.content_en = "Our hearts rejoice in the Lord, for he is our help and shield."

        activities = [
            (
                "daily-reading",
                "القراءة اليومية",
                "Daily reading",
                50,
                "الشاهد الكتابي\nمزمور 23\n• ربنا معايا في أي مكان\n• ربنا بيرعاني لا يعوزني شيء",
                (
                    "Bible passage\nPsalm 23\n• God is with me everywhere\n"
                    "• The Lord is my shepherd; I lack nothing"
                ),
            ),
            ("mass", "حضور القداس", "Attend Mass", 50, None, None),
            (
                "sunday-school",
                "حضور مدارس الاحد",
                "Attend Sunday School",
                50,
                None,
                None,
            ),
            ("confession", "الاعتراف", "Confession", None, None, None),
            ("communion", "التناول", "Communion", None, None, None),
        ]
        for order, (
            identifier,
            title,
            title_en,
            points,
            description,
            description_en,
        ) in enumerate(activities):
            activity = db.get(SpiritualActivity, identifier)
            if not activity:
                activity = SpiritualActivity(
                    id=identifier,
                    title=title,
                    points=points,
                    description=description,
                    sort_order=order,
                )
                db.add(activity)
            activity.title_en = title_en
            activity.description_en = description_en

        lesson = db.get(ReflectionLesson, "reflection-2026-04-17")
        if not lesson:
            lesson = ReflectionLesson(
                id="reflection-2026-04-17",
                date_label="درس مدارس الاحد الجمعة 17 / 4 / 2026",
                title="من هو قريبي ؟",
                points=[
                    "المحبة الحقيقية بالفعل مش بالكلام",
                    "ساعد أي إنسان بغض النظر عن اختلافه",
                    "ما تتجاهلش احتياج اللي قدامك",
                    "العطاء الحقيقي فيه تضحية",
                ],
                exercise=(
                    "من خلال قصة السامري الصالح دور في دواير حياتك على من "
                    "هو بالفعل قريبك وكيف قدمت له الحب أو العطاء أو الاستماع"
                ),
                exercise_points=50,
                published_at=datetime.now(timezone.utc),
            )
            db.add(lesson)
        lesson.date_label_en = "Sunday School lesson — Friday, April 17, 2026"
        lesson.title_en = "Who is my neighbor?"
        lesson.points_en = [
            "True love is shown through actions, not only words",
            "Help every person regardless of their differences",
            "Do not ignore the needs of those around you",
            "True giving involves sacrifice",
        ]
        lesson.exercise_en = (
            "Through the story of the Good Samaritan, look through the circles "
            "of your life for who is truly your neighbor and how you offered "
            "them love, giving, or a listening ear."
        )

        categories = [
            ("prayer", "الصلاة", "Prayer", "body-outline", "#F9EAD8"),
            (
                "relationships",
                "العلاقات",
                "Relationships",
                "people-outline",
                "#F3CED6",
            ),
            ("love", "المحبة", "Love", "heart-outline", "#F7DDE4"),
            ("retreat", "الخلوة", "Retreat", "book-outline", "#DDECF5"),
            ("service", "الخدمة", "Service", "leaf-outline", "#F9EAD8"),
            (
                "evangelism",
                "الكرازة",
                "Evangelism",
                "megaphone-outline",
                "#DDEEE4",
            ),
            (
                "confession-sacrament",
                "سر اعترافي",
                "Confession",
                "sunny-outline",
                "#DDECF5",
            ),
            (
                "eucharist",
                "سر الافخارستيا",
                "Eucharist",
                "wine-outline",
                "#D7EFEC",
            ),
            (
                "forgiveness",
                "الغفران",
                "Forgiveness",
                "heart-half-outline",
                "#D8CCC4",
            ),
        ]
        for order, (identifier, title, title_en, icon, color) in enumerate(categories):
            category = db.get(QuestionCategory, identifier)
            if not category:
                category = QuestionCategory(
                    id=identifier,
                    title=title,
                    icon=icon,
                    color=color,
                    sort_order=order,
                )
                db.add(category)
            category.title_en = title_en
        db.flush()
        question_rows = [
            (
                "question-1",
                "prayer",
                "لماذا نصلي ؟",
                "Why do we pray?",
                "الصلاة هى اتحاد مع الله",
                "Prayer is union with God.",
            ),
            (
                "question-2",
                "relationships",
                "كيف أحب الآخرين ؟",
                "How do I love others?",
                "بالمحبة العملية والاستماع والمساندة",
                "Through practical love, listening, and support.",
            ),
            (
                "question-3",
                "prayer",
                "متى نصلي ؟",
                "When do we pray?",
                "في كل وقت وبقلب حاضر",
                "At all times, with an attentive heart.",
            ),
            (
                "question-4",
                "relationships",
                "كيف أسامح ؟",
                "How do I forgive?",
                "أطلب معونة الله وأبدأ بخطوة صادقة نحو الآخر",
                "Ask for God's help and take an honest step toward the other person.",
            ),
            (
                "question-5",
                "prayer",
                "ما معنى الصلاة ؟",
                "What does prayer mean?",
                "حديث صادق مع الله",
                "An honest conversation with God.",
            ),
        ]
        for (
            identifier,
            category_id,
            question_text,
            question_en,
            answer,
            answer_en,
        ) in question_rows:
            question = db.get(Question, identifier)
            if not question:
                question = Question(
                    id=identifier,
                    category_id=category_id,
                    question=question_text,
                    answer=answer,
                )
                db.add(question)
            question.question_en = question_en
            question.answer_en = answer_en

        know_me_rows = [
            (
                "today",
                "سؤال اليوم : هرم الفلسطينيين",
                "Today's question: The Philistines' pyramid",
                date.today(),
                50,
            ),
            (
                "second",
                "السؤال الثاني : آخر العنقود",
                "Second question: The youngest child",
                date.today() - timedelta(days=1),
                0,
            ),
            (
                "first",
                "السؤال الاول : راعي غنم",
                "First question: A shepherd",
                date.today() - timedelta(days=2),
                0,
            ),
        ]
        for identifier, label, label_en, asked_at, points in know_me_rows:
            know_me_question = db.get(KnowMeQuestion, identifier)
            if not know_me_question:
                know_me_question = KnowMeQuestion(
                    id=identifier,
                    label=label,
                    asked_at=asked_at,
                    points=points,
                )
                db.add(know_me_question)
            know_me_question.label_en = label_en

        servant = db.get(Servant, "miss-marina")
        if not servant:
            servant = Servant(id="miss-marina", name="مس مارينا")
            db.add(servant)
            db.flush()
        servant.name_en = "Ms. Marina"
        direct = db.get(Conversation, "miss-marina")
        if not direct:
            direct = Conversation(
                id="miss-marina",
                beneficiary_user_id=user.id,
                servant_id=servant.id,
                kind=ConversationKind.DIRECT,
            )
            db.add(direct)
            db.flush()
            db.add_all(
                [
                    ConversationMessage(
                        id="m1",
                        conversation_id=direct.id,
                        sender_user_id=user.id,
                        sender=SenderKind.BENEFICIARY,
                        sender_name="جوي بركات",
                        kind=MessageKind.TEXT,
                        content="الخلوة واقعة مني و مش عارفة اعمل ايه",
                    ),
                    ConversationMessage(
                        id="m2",
                        conversation_id=direct.id,
                        sender=SenderKind.SERVANT,
                        sender_name="مس مارينا",
                        kind=MessageKind.TEXT,
                        content="تعالي نتكلم ونرتبها مع بعض خطوة بخطوة",
                    ),
                ]
            )
        house = db.get(Conversation, "all")
        if not house:
            db.add(
                Conversation(
                    id="all",
                    beneficiary_user_id=None,
                    kind=ConversationKind.HOUSE,
                )
            )
        else:
            house.beneficiary_user_id = None
            house.kind = ConversationKind.HOUSE

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    if settings.auto_seed:
        seed_database()
