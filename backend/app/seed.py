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
                datetime(2026, 9, 27, 9, tzinfo=timezone.utc),
                datetime(2026, 9, 27, 17, tzinfo=timezone.utc),
                "27 سبتمبر 2026",
                "9 صباحا - 5 مساءا",
                "مدرسة السلام الحديثة بأسيوط",
                "fitness-outline",
            ),
            (
                "cross-retreat",
                "خلوة الصليب",
                datetime(2026, 10, 2, 9, tzinfo=timezone.utc),
                datetime(2026, 10, 5, 17, tzinfo=timezone.utc),
                "2 - 5 أكتوبر 2026",
                "9 صباحا - 5 مساءا",
                "دير العذراء مريم بدرنكة",
                "sparkles-outline",
            ),
            (
                "annual-conference",
                "المؤتمر السنوي",
                datetime(2026, 10, 20, 9, tzinfo=timezone.utc),
                datetime(2026, 10, 23, 17, tzinfo=timezone.utc),
                "20 - 23 أكتوبر 2026",
                "9 صباحا - 5 مساءا",
                "بيت سان مارك بالخطاطبة",
                "people-outline",
            ),
            (
                "fountain-trip",
                "رحلة النافورة",
                datetime(2026, 11, 6, 9, tzinfo=timezone.utc),
                datetime(2026, 11, 6, 17, tzinfo=timezone.utc),
                "6 نوفمبر 2026",
                "9 صباحا - 5 مساءا",
                "دير النافورة بوادي النطرون",
                "bus-outline",
            ),
        ]
        for row in event_rows:
            if not db.get(Event, row[0]):
                db.add(
                    Event(
                        id=row[0],
                        name=row[1],
                        starts_at=row[2],
                        ends_at=row[3],
                        date_label=row[4],
                        time_label=row[5],
                        location=row[6],
                        icon=row[7],
                    )
                )

        reading_id = f"reading-{date.today().isoformat()}"
        if not db.get(DailyReading, reading_id):
            db.add(
                DailyReading(
                    id=reading_id,
                    reading_date=date.today(),
                    date_label="قراءة اليوم",
                    reference="مزمور 32",
                    title="قراءة اليوم",
                    content="بالرب تبتهج نفوسنا لأنه هو عوننا وترسنا.",
                )
            )

        activities = [
            (
                "daily-reading",
                "القراءة اليومية",
                50,
                "الشاهد الكتابي\nمزمور 23\n• ربنا معايا في أي مكان\n• ربنا بيرعاني لا يعوزني شيء",
            ),
            ("mass", "حضور القداس", 50, None),
            ("sunday-school", "حضور مدارس الاحد", 50, None),
            ("confession", "الاعتراف", None, None),
            ("communion", "التناول", None, None),
        ]
        for order, (identifier, title, points, description) in enumerate(activities):
            if not db.get(SpiritualActivity, identifier):
                db.add(
                    SpiritualActivity(
                        id=identifier,
                        title=title,
                        points=points,
                        description=description,
                        sort_order=order,
                    )
                )

        if not db.get(ReflectionLesson, "reflection-2026-04-17"):
            db.add(
                ReflectionLesson(
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
            )

        categories = [
            ("prayer", "الصلاة", "body-outline", "#F9EAD8"),
            ("relationships", "العلاقات", "people-outline", "#F3CED6"),
            ("love", "المحبة", "heart-outline", "#F7DDE4"),
            ("retreat", "الخلوة", "book-outline", "#DDECF5"),
            ("service", "الخدمة", "leaf-outline", "#F9EAD8"),
            ("evangelism", "الكرازة", "megaphone-outline", "#DDEEE4"),
            ("confession-sacrament", "سر اعترافي", "sunny-outline", "#DDECF5"),
            ("eucharist", "سر الافخارستيا", "wine-outline", "#D7EFEC"),
            ("forgiveness", "الغفران", "heart-half-outline", "#D8CCC4"),
        ]
        for order, (identifier, title, icon, color) in enumerate(categories):
            if not db.get(QuestionCategory, identifier):
                db.add(
                    QuestionCategory(
                        id=identifier,
                        title=title,
                        icon=icon,
                        color=color,
                        sort_order=order,
                    )
                )
        db.flush()
        question_rows = [
            ("question-1", "prayer", "لماذا نصلي ؟", "الصلاة هى اتحاد مع الله"),
            (
                "question-2",
                "relationships",
                "كيف أحب الآخرين ؟",
                "بالمحبة العملية والاستماع والمساندة",
            ),
            ("question-3", "prayer", "متى نصلي ؟", "في كل وقت وبقلب حاضر"),
            (
                "question-4",
                "relationships",
                "كيف أسامح ؟",
                "أطلب معونة الله وأبدأ بخطوة صادقة نحو الآخر",
            ),
            ("question-5", "prayer", "ما معنى الصلاة ؟", "حديث صادق مع الله"),
        ]
        for identifier, category_id, question_text, answer in question_rows:
            if not db.get(Question, identifier):
                db.add(
                    Question(
                        id=identifier,
                        category_id=category_id,
                        question=question_text,
                        answer=answer,
                    )
                )

        know_me_rows = [
            ("today", "سؤال اليوم : هرم الفلسطينيين", date.today(), 50),
            ("second", "السؤال الثاني : آخر العنقود", date.today() - timedelta(days=1), 0),
            ("first", "السؤال الاول : راعي غنم", date.today() - timedelta(days=2), 0),
        ]
        for identifier, label, asked_at, points in know_me_rows:
            if not db.get(KnowMeQuestion, identifier):
                db.add(
                    KnowMeQuestion(
                        id=identifier,
                        label=label,
                        asked_at=asked_at,
                        points=points,
                    )
                )

        servant = db.get(Servant, "miss-marina")
        if not servant:
            servant = Servant(id="miss-marina", name="مس مارينا")
            db.add(servant)
            db.flush()
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
