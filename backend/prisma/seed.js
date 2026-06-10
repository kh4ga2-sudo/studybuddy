import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coursesPath = path.join(__dirname, 'seed-data', 'uqu_courses.json');
const courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

const colors = ['--accent','--info','--success','--warning','--danger'];
const icons = ['cpu','layers','bar-chart','git-branch','wifi','zap','book-open','pen-tool','database','globe'];
const teachers = ['Dr. Sarah Mitchell','Prof. Ahmad Karimi','Dr. Nour Khalil','Prof. James Chen','Dr. Lena Fischer','Dr. Mohammed Noor'];

function majorId(index) { return `major_${index + 1}`; }
function splitMajors(records) {
  const map = new Map();
  for (const c of records) {
    const key = `${c.college}|${c.department}|${c.major}`;
    if (!map.has(key)) map.set(key, { key, college: c.college, department: c.department, major: c.major, courses: 0, credits: 0 });
    const m = map.get(key);
    m.courses += 1; m.credits += Number(c.credits || 0);
  }
  return Array.from(map.values()).map((m, i) => ({
    id: majorId(i),
    icon: icons[i % icons.length],
    name_en: m.major,
    name_ar: m.major,
    desc_en: `${m.department} - ${m.college}`,
    desc_ar: `${m.department} - ${m.college}`,
    courses: m.courses,
    credits: m.credits,
    students: 250 + ((i * 37) % 600),
    key: m.key,
  }));
}

function json(v) { return JSON.stringify(v); }
function future(days, h = 10, m = 0) {
  const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, m, 0, 0); return d;
}

async function main() {
  console.log(`🌱 Seeding ${courses.length} UQU courses from Excel-derived JSON...`);
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.progressLog.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.note.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.room.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.quizBank.deleteMany();
  await prisma.material.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.catalogCourse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.major.deleteMany();

  const majors = splitMajors(courses);
  const majorKeyToId = new Map(majors.map(m => [m.key, m.id]));
  await prisma.major.createMany({ data: majors.map(({ key, ...m }) => m), skipDuplicates: true });

  const catalogData = courses.map((c, i) => ({
    id: `cat_${c.code.replace(/[^A-Za-z0-9]/g, '_')}`,
    code: c.code,
    name_en: c.name_en || c.name_ar,
    name_ar: c.name_ar || c.name_en,
    major_id: majorKeyToId.get(`${c.college}|${c.department}|${c.major}`) || majors[0].id,
    credits: Number(c.credits || 3),
    level: Number(c.level || 100),
    instructor: teachers[i % teachers.length],
    students: 30 + (i % 180),
  }));
  await prisma.catalogCourse.createMany({ data: catalogData, skipDuplicates: true });

  const adminHash = bcrypt.hashSync('admin123', 10);
  const studentHash = bcrypt.hashSync('password123', 10);
  const admin = await prisma.user.create({ data: {
    name: 'System Admin', email: 'admin@studybuddy.edu', password: adminHash, phone: '+966 50 111 2222', initials: 'SA', major_id: majors[0].id,
    university: 'Umm Al-Qura University', year: '4', gpa: '4.00', role: 'admin', bio: 'System administrator account.', bio_ar: 'حساب مدير النظام.'
  }});
  const student = await prisma.user.create({ data: {
    name: 'Study Buddy Student', email: 'student@studybuddy.edu', password: studentHash, phone: '+966 50 000 0000', initials: 'SB', major_id: majors[0].id,
    university: 'Umm Al-Qura University', year: '3', gpa: '3.78', role: 'student', bio: 'Student account for initial system setup.', bio_ar: 'حساب طالب للإعداد الأولي للنظام.'
  }});

  const firstCourses = catalogData.slice(0, 8);
  await prisma.enrollment.createMany({ data: firstCourses.map((c, i) => ({
    user_id: student.id, course_id: c.id, progress: [68,82,45,100,30,12,55,0][i] ?? 0, grade: ['A-','B+','A', 'A+', 'B', null, 'B-', null][i] ?? null, status: i === 3 ? 'completed' : i === 7 ? 'upcoming' : 'inprogress', next_class: i < 6 ? `Sun ${8 + i}:00` : null, color_var: colors[i % colors.length]
  }))});

  const materialRows = [];
  const resourceRows = [];
  const quizRows = [];
  for (const c of catalogData) {
    materialRows.push(
      { id: `${c.id}_exam_mid`, course_id: c.id, category: 'exams', title: 'Midterm Exam', title_ar: 'اختبار منتصف الفصل', date: '2026-03-15', extra: json({ score: null, maxScore: 100, status: 'upcoming', duration: 90 }) },
      { id: `${c.id}_summary`, course_id: c.id, category: 'summaries', title: `${c.name_en} Summary`, title_ar: `ملخص ${c.name_ar}`, date: '2026-02-01', extra: json({ pages: 8, size: '1.2 MB' }) },
      { id: `${c.id}_slides_1`, course_id: c.id, category: 'slides', title: 'Lecture 1: Introduction', title_ar: 'محاضرة 1: مقدمة', date: '2026-01-10', extra: json({ slideCount: 32 }) },
      { id: `${c.id}_assignment_1`, course_id: c.id, category: 'assignments', title: 'Assignment 1', title_ar: 'واجب 1', date: '2026-02-12', extra: json({ status: 'pending', grade: null }) }
    );
    resourceRows.push(
      { id: `${c.id}_website`, course_id: c.id, type: 'link', title_en: `${c.code} Course Website`, title_ar: `موقع مادة ${c.code}`, url: 'https://uquelearning.uqu.edu.sa/', source: 'UQU eLearning' },
      { id: `${c.id}_book`, course_id: c.id, type: 'book', title_en: 'Recommended Textbook Search', title_ar: 'البحث عن الكتاب الموصى به', url: `https://scholar.google.com/scholar?q=${encodeURIComponent(c.name_en || c.name_ar)}`, source: 'Google Scholar' }
    );
    quizRows.push(
      { id: `${c.id}_q1`, course_id: c.id, text_en: `What is a key topic in ${c.name_en}?`, text_ar: `ما هو أحد المواضيع الرئيسية في ${c.name_ar}؟`, options: json(['Core concepts','Random topic','Unrelated tool','None of the above']), correct: 'A', explain_en: 'The course quiz is linked to the selected course.', explain_ar: 'السؤال مرتبط بالمادة المختارة.', difficulty: 'easy' },
      { id: `${c.id}_q2`, course_id: c.id, text_en: `Which code belongs to ${c.name_en}?`, text_ar: `ما هو رمز مادة ${c.name_ar}؟`, options: json([c.code,'ABC000','XYZ999','TEST101']), correct: 'A', explain_en: 'The code is imported from the UQU Excel file.', explain_ar: 'الرمز مستورد من ملف مواد جامعة أم القرى.', difficulty: 'medium' }
    );
  }
  await prisma.material.createMany({ data: materialRows, skipDuplicates: true });
  await prisma.resource.createMany({ data: resourceRows, skipDuplicates: true });
  await prisma.quizBank.createMany({ data: quizRows, skipDuplicates: true });

  await prisma.room.createMany({ data: [
    { id: 'r1', code: 'A-101', name_en: 'Alpha Room', name_ar: 'غرفة ألفا', status: 'available', capacity: 8, current: 0 },
    { id: 'r2', code: 'B-205', name_en: 'Beta Hub', name_ar: 'مركز بيتا', status: 'busy', capacity: 12, current: 7 },
    { id: 'r3', code: 'C-310', name_en: 'Gamma Space', name_ar: 'فضاء غاما', status: 'available', capacity: 6, current: 0 }
  ]});

  await prisma.event.createMany({ data: [
    { id: 'ev_lecture_1', type: 'lecture', course_id: firstCourses[0].id, title_ar: 'محاضرة مباشرة', title_en: 'Live Lecture', start_time: future(0,10,0), end_time: future(0,11,30), link: 'https://meet.studybuddy.app/live', host: firstCourses[0].instructor, host_en: firstCourses[0].instructor, attendees: json(['SA','SB']), attendees_count: 24, created_by: admin.id },
    { id: 'ev_deadline_1', type: 'deadline', course_id: firstCourses[1].id, title_ar: 'موعد تسليم واجب', title_en: 'Assignment Deadline', start_time: future(3,23,59), end_time: future(3,23,59), attendees: json([]), attendees_count: 0, created_by: admin.id }
  ]});

  await prisma.notification.createMany({ data: [
    { id: 'n1', user_id: student.id, kind: 'deadline', title_en: 'Assignment Due Soon', title_ar: 'واجب مستحق قريبًا', text_en: 'You have an assignment due in 3 days.', text_ar: 'لديك واجب مستحق خلال 3 أيام.', time_en: '2h ago', time_ar: 'منذ ساعتين', unread: 1, view: 'courses' },
    { id: 'n2', user_id: student.id, kind: 'material', title_en: 'Materials Available', title_ar: 'مواد جديدة متاحة', text_en: 'Course summaries and quizzes are now linked.', text_ar: 'تم ربط الملخصات والاختبارات بالمادة.', time_en: '1d ago', time_ar: 'منذ يوم', unread: 1, view: 'courses' }
  ]});

  await prisma.note.createMany({ data: [
    { id: 'note_1', user_id: student.id, course_id: firstCourses[0].id, title: 'Exam focus', body: 'Review lecture slides and quiz bank.', pinned: true },
    { id: 'note_2', user_id: student.id, course_id: firstCourses[1].id, title: 'Group work', body: 'Prepare summary before next meeting.', pinned: false }
  ]});

  await prisma.communityPost.create({ data: { id: 'post_1', user_id: student.id, course_id: firstCourses[0].id, title: 'Study group for midterm', body: 'Who wants to review the first chapters together?', likes: 3 } });
  const ach = await prisma.achievement.createMany({ data: [
    { id: 'ach_first_login', code: 'FIRST_LOGIN', title_en: 'First Login', title_ar: 'أول دخول', points: 10, icon: 'star' },
    { id: 'ach_quiz_ready', code: 'QUIZ_READY', title_en: 'Quiz Ready', title_ar: 'جاهز للاختبار', points: 25, icon: 'edit-2' },
    { id: 'ach_progress', code: 'PROGRESS_TRACKER', title_en: 'Progress Tracker', title_ar: 'متابع التقدم', points: 30, icon: 'bar-chart' }
  ], skipDuplicates: true });
  await prisma.userAchievement.create({ data: { id: 'ua_1', user_id: student.id, achievement_id: 'ach_first_login' } });

  await prisma.chatMessage.createMany({ data: [
    { course_id: firstCourses[0].id, user_id: student.id, author_name: student.name, author_initials: student.initials, text: 'Hi everyone!' },
    { course_id: firstCourses[0].id, user_id: admin.id, author_name: admin.name, author_initials: admin.initials, text: 'Welcome to the course group.' }
  ]});

  console.log('✅ Seed completed:');
  console.log(`   Majors: ${majors.length}`);
  console.log(`   Courses: ${catalogData.length}`);
  console.log(`   Materials: ${materialRows.length}`);
  console.log(`   Quiz questions: ${quizRows.length}`);
  console.log('🔐 Demo accounts:');
  console.log('   admin@studybuddy.edu / admin123');
  console.log('   student@studybuddy.edu / password123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
