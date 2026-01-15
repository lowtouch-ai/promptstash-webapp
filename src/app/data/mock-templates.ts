export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  template: string;
  placeholders: {
    name: string;
    description?: string;
    required: boolean;
    type?: string;
  }[];
  source: 'github' | 'local';
  lastUpdated: string;
  githubCommit?: string;
  githubUrl?: string;
  isFavorite?: boolean;
  isModified?: boolean;
}

export const mockTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: 'Technical Blog Post Generator',
    description: 'Generate comprehensive technical blog posts with proper structure and depth',
    category: 'Content Creation',
    tags: ['writing', 'technical', 'blog', 'documentation'],
    template: `Create a detailed technical blog post about {{topic}}.

Target audience: {{audience}}
Writing tone: {{tone_style}}
Prior knowledge level: {{prior_knowledge}}

The post should include:
- Clear introduction with hook
- Technical deep-dive with code examples
- Practical use cases
- Best practices and gotchas
- Conclusion with next steps

Make it engaging and accessible while maintaining technical accuracy.`,
    placeholders: [
      { name: 'topic', description: 'The main technical topic to write about', required: true },
      { name: 'audience', description: 'Target reader demographic (e.g., beginners, intermediate developers)', required: true },
      { name: 'tone_style', description: 'Writing style (e.g., formal, casual, conversational)', required: false },
      { name: 'prior_knowledge', description: 'Assumed knowledge level', required: false },
    ],
    source: 'github',
    lastUpdated: '10 Jan, 2026',
    githubCommit: 'abc1234',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/content-creation/technical-blog-post.yaml',
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    description: 'Get detailed code review feedback with security and performance insights',
    category: 'Development',
    tags: ['code-review', 'programming', 'best-practices'],
    template: `Review the following {{language}} code and provide detailed feedback:

{{code}}

Focus areas:
- Code quality and maintainability
- Performance optimizations
- Security vulnerabilities
- Best practices for {{language}}
- Potential bugs or edge cases

Provide specific, actionable suggestions with examples.`,
    placeholders: [
      { name: 'language', description: 'Programming language of the code', required: true },
      { name: 'code', description: 'The code to review', required: true },
    ],
    source: 'github',
    lastUpdated: '12 Jan, 2026',
    githubCommit: 'def5678',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/development/code-review.yaml',
  },
  {
    id: '3',
    name: 'API Documentation Generator',
    description: 'Create comprehensive API documentation from endpoint specifications',
    category: 'Documentation',
    tags: ['api', 'documentation', 'technical-writing'],
    template: `Generate comprehensive API documentation for the following endpoint:

Endpoint: {{endpoint}}
Method: {{method}}
Purpose: {{purpose}}

Include:
- Endpoint description
- Request parameters (path, query, body)
- Request examples (curl, JavaScript, Python)
- Response schema
- Status codes and error handling
- Usage examples
- Rate limiting and authentication requirements`,
    placeholders: [
      { name: 'endpoint', description: 'API endpoint path', required: true },
      { name: 'method', description: 'HTTP method (GET, POST, etc.)', required: true },
      { name: 'purpose', description: 'What this endpoint does', required: true },
    ],
    source: 'github',
    lastUpdated: '8 Jan, 2026',
    githubCommit: 'ghi9012',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/documentation/api-documentation.yaml',
  },
  {
    id: '4',
    name: 'Research Paper Summarizer',
    description: 'Summarize academic papers with key findings and methodology',
    category: 'Research',
    tags: ['research', 'academic', 'summary', 'analysis'],
    template: `Summarize the following research paper:

Title: {{title}}
Field: {{field}}

Provide:
1. Main research question and hypothesis
2. Methodology overview
3. Key findings and results
4. Significance and implications
5. Limitations and future work
6. Practical applications

Target audience: {{audience}}
Summary length: {{length}}`,
    placeholders: [
      { name: 'title', description: 'Paper title', required: true },
      { name: 'field', description: 'Research field or domain', required: true },
      { name: 'audience', description: 'Who will read this summary', required: false },
      { name: 'length', description: 'Desired summary length', required: false },
    ],
    source: 'github',
    lastUpdated: '11 Jan, 2026',
    githubCommit: 'jkl3456',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/research/paper-summarizer.yaml',
  },
  {
    id: '5',
    name: 'Learning Path Creator',
    description: 'Design structured learning paths for mastering new technologies',
    category: 'Education',
    tags: ['learning', 'education', 'curriculum', 'planning'],
    template: `Create a comprehensive learning path for mastering {{technology}}.

Learner profile:
- Current skill level: {{current_level}}
- Time commitment: {{time_commitment}}
- Learning goal: {{goal}}
- Preferred learning style: {{learning_style}}

Design a structured path with:
- Prerequisite knowledge
- Module breakdown (beginner to advanced)
- Recommended resources (docs, tutorials, projects)
- Hands-on projects for each level
- Time estimates
- Milestone checkpoints`,
    placeholders: [
      { name: 'technology', description: 'Technology or skill to learn', required: true },
      { name: 'current_level', description: 'Starting skill level', required: true },
      { name: 'time_commitment', description: 'Available time per week', required: false },
      { name: 'goal', description: 'Specific learning objective', required: false },
      { name: 'learning_style', description: 'Preferred way of learning', required: false },
    ],
    source: 'github',
    lastUpdated: '9 Jan, 2026',
    githubCommit: 'mno7890',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/education/learning-path-creator.yaml',
  },
  {
    id: '6',
    name: 'Bug Report Generator',
    description: 'Create detailed bug reports with reproduction steps',
    category: 'Development',
    tags: ['debugging', 'bug-tracking', 'qa', 'testing'],
    template: `Generate a detailed bug report for:

Issue: {{issue}}
Environment: {{environment}}
Severity: {{severity}}

Include:
- Clear issue description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs (if applicable)
- Potential impact
- Suggested priority level`,
    placeholders: [
      { name: 'issue', description: 'Description of the bug', required: true },
      { name: 'environment', description: 'Where the bug occurs', required: true },
      { name: 'severity', description: 'How critical is this bug', required: false },
    ],
    source: 'github',
    lastUpdated: '13 Jan, 2026',
    githubCommit: 'pqr4567',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/development/bug-report-generator.yaml',
  },
  {
    id: '7',
    name: 'Social Media Content Planner',
    description: 'Plan and create social media content with platform-specific optimization',
    category: 'Content Creation',
    tags: ['social-media', 'marketing', 'content-strategy'],
    template: `Create a social media content plan for:

Topic: {{topic}}
Platform: {{platform}}
Brand voice: {{brand_voice}}
Target audience: {{target_audience}}
Campaign goal: {{goal}}

Generate:
- 5-7 post ideas with captions
- Optimal posting times
- Hashtag strategy
- Engagement hooks
- Call-to-action recommendations
- Content calendar suggestions`,
    placeholders: [
      { name: 'topic', description: 'Content theme or topic', required: true },
      { name: 'platform', description: 'Social media platform', required: true },
      { name: 'brand_voice', description: 'Brand tone and personality', required: false },
      { name: 'target_audience', description: 'Who you want to reach', required: false },
      { name: 'goal', description: 'Campaign objective', required: false },
    ],
    source: 'local',
    lastUpdated: '14 Jan, 2026',
    isModified: true,
  },
  {
    id: '8',
    name: 'Database Schema Designer',
    description: 'Design normalized database schemas with relationships',
    category: 'Development',
    tags: ['database', 'sql', 'architecture', 'design'],
    template: `Design a database schema for: {{application}}

Requirements:
{{requirements}}

Database type: {{db_type}}

Provide:
- Entity relationship diagram (textual)
- Table definitions with columns and types
- Primary and foreign keys
- Indexes for optimization
- Constraints and validations
- Sample queries
- Migration considerations`,
    placeholders: [
      { name: 'application', description: 'Application or feature name', required: true },
      { name: 'requirements', description: 'Data requirements and relationships', required: true },
      { name: 'db_type', description: 'Database system (PostgreSQL, MySQL, etc.)', required: false },
    ],
    source: 'github',
    lastUpdated: '7 Jan, 2026',
    githubCommit: 'stu8901',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/development/database-schema-designer.yaml',
  },
  {
    id: '9',
    name: 'Interview Question Generator',
    description: 'Generate technical interview questions with model answers',
    category: 'Education',
    tags: ['interview', 'hiring', 'technical', 'assessment'],
    template: `Generate interview questions for a {{role}} position.

Experience level: {{experience_level}}
Focus areas: {{focus_areas}}
Interview type: {{interview_type}}

Create:
- 10 technical questions (mix of easy/medium/hard)
- Model answers with explanations
- Follow-up questions
- Coding challenges (if applicable)
- Evaluation criteria
- Red flags to watch for`,
    placeholders: [
      { name: 'role', description: 'Job role or position', required: true },
      { name: 'experience_level', description: 'Junior, mid, senior, etc.', required: true },
      { name: 'focus_areas', description: 'Specific skills or topics', required: false },
      { name: 'interview_type', description: 'Phone screen, technical deep-dive, etc.', required: false },
    ],
    source: 'github',
    lastUpdated: '15 Jan, 2026',
    githubCommit: 'vwx2345',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/education/interview-question-generator.yaml',
  },
  {
    id: '10',
    name: 'Email Campaign Writer',
    description: 'Craft compelling email campaigns with A/B testing variations',
    category: 'Content Creation',
    tags: ['email', 'marketing', 'copywriting', 'campaigns'],
    template: `Create an email campaign for:

Campaign goal: {{goal}}
Target segment: {{segment}}
Product/Service: {{product}}
Key benefit: {{benefit}}

Deliver:
- Subject line (3 variations)
- Preview text
- Email body (HTML-friendly)
- Call-to-action
- A/B testing suggestions
- Follow-up sequence ideas`,
    placeholders: [
      { name: 'goal', description: 'Campaign objective', required: true },
      { name: 'segment', description: 'Audience segment', required: true },
      { name: 'product', description: 'What you\'re promoting', required: true },
      { name: 'benefit', description: 'Main value proposition', required: false },
    ],
    source: 'github',
    lastUpdated: '6 Jan, 2026',
    githubCommit: 'yz12345',
    githubUrl: 'https://github.com/yourusername/prompt-templates/blob/main/content-creation/email-campaign-writer.yaml',
  },
];

export const categories = Array.from(new Set(mockTemplates.map(t => t.category)));
export const allTags = Array.from(new Set(mockTemplates.flatMap(t => t.tags))).sort();