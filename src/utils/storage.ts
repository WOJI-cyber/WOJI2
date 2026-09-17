import { PaperNote, ResearchProject, ResearchTopicProposal, ResearchGapItem } from '../types';
import { SAMPLE_PAPERS } from '../data/samplePapers';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';

const PAPERS_STORAGE_KEY = 'papernote_health_policy_v3';
const PROJECTS_STORAGE_KEY = 'papernote_projects_v1';

export function loadPapers(): PaperNote[] {
  try {
    const raw = localStorage.getItem(PAPERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(SAMPLE_PAPERS));
      return SAMPLE_PAPERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Check if sample papers lack structuredAnalysis and backfill if necessary
      const enriched = parsed.map((p: PaperNote) => {
        if (!p.structuredAnalysis) {
          const matched = SAMPLE_PAPERS.find(sp => sp.id === p.id);
          if (matched && matched.structuredAnalysis) {
            return {
              ...p,
              structuredAnalysis: matched.structuredAnalysis,
              origin: p.origin || matched.origin,
              isOpenAccess: p.isOpenAccess !== undefined ? p.isOpenAccess : matched.isOpenAccess,
              studyType: p.studyType || matched.studyType,
              projectId: p.projectId || matched.projectId
            };
          }
        }
        return p;
      });
      return enriched;
    }
    return SAMPLE_PAPERS;
  } catch (err) {
    console.error('Error loading papers from localStorage:', err);
    return SAMPLE_PAPERS;
  }
}

export function savePapers(papers: PaperNote[]): void {
  try {
    localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(papers));
  } catch (err) {
    console.error('Error saving papers to localStorage:', err);
  }
}

export function loadProjects(): ResearchProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SAMPLE_PROJECTS;
  } catch (err) {
    console.error('Error loading projects from localStorage:', err);
    return SAMPLE_PROJECTS;
  }
}

export function saveProjects(projects: ResearchProject[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
}

export function saveTopicToProject(projectId: string, topic: ResearchTopicProposal): void {
  const projects = loadProjects();
  const updated = projects.map(proj => {
    if (proj.id === projectId) {
      const existingTopics = proj.topicProposals || [];
      const filtered = existingTopics.filter(t => t.id !== topic.id);
      return {
        ...proj,
        topicProposals: [topic, ...filtered],
        updatedAt: new Date().toISOString(),
      };
    }
    return proj;
  });
  saveProjects(updated);
}

export function saveGapToProject(projectId: string, gap: ResearchGapItem): void {
  const projects = loadProjects();
  const updated = projects.map(proj => {
    if (proj.id === projectId) {
      const existingGaps = proj.researchGaps || [];
      const filtered = existingGaps.filter(g => g.id !== gap.id);
      return {
        ...proj,
        researchGaps: [gap, ...filtered],
        updatedAt: new Date().toISOString(),
      };
    }
    return proj;
  });
  saveProjects(updated);
}

export function exportBackupJson(papers: PaperNote[], projects?: ResearchProject[]): void {
  const dataStr = JSON.stringify({ papers, projects: projects || [] }, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PaperNote_Research_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJson(jsonString: string): { papers: PaperNote[]; projects?: ResearchProject[] } {
  const parsed = JSON.parse(jsonString);
  let papers: PaperNote[] = [];
  let projects: ResearchProject[] | undefined = undefined;

  if (Array.isArray(parsed)) {
    // Legacy array backup
    papers = parsed;
  } else if (parsed && Array.isArray(parsed.papers)) {
    papers = parsed.papers;
    if (Array.isArray(parsed.projects)) {
      projects = parsed.projects;
    }
  } else {
    throw new Error('올바른 백업 파일 형식이 아닙니다.');
  }

  savePapers(papers);
  if (projects) {
    saveProjects(projects);
  }
  return { papers, projects };
}

export function resetToSamples(): { papers: PaperNote[]; projects: ResearchProject[] } {
  savePapers(SAMPLE_PAPERS);
  saveProjects(SAMPLE_PROJECTS);
  return { papers: SAMPLE_PAPERS, projects: SAMPLE_PROJECTS };
}
