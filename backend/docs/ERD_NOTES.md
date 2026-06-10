# ERD Notes

Recommended ERD entities from `prisma/schema.prisma`:

- User
- Major
- CatalogCourse
- Enrollment
- Material
- QuizBank
- QuizAttempt
- Resource
- Note
- ProgressLog
- CommunityPost
- CommunityComment
- Achievement
- UserAchievement
- Event
- Notification
- AiConversation
- AiMessage
- Room
- Invite
- ChatMessage

Important relationships:
- Major 1 → many CatalogCourse
- User 1 → many Enrollment
- CatalogCourse 1 → many Material, QuizBank, Resource, Note, ProgressLog
- User 1 → many QuizAttempt, Note, ProgressLog
- CommunityPost 1 → many CommunityComment
- User many ↔ many Achievement through UserAchievement
