import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`\n🚀 StudyBuddy API running at http://localhost:${env.port}`);
  console.log('🏗️ Architecture: routes → controllers → Prisma → PostgreSQL');
  console.log('📦 Modules: auth, profile, catalog, courses, materials, quiz, notes, resources, community, progress, analytics, gamification, admin\n');
});
