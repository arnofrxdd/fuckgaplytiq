import { Router, Request, Response } from 'express';
import * as resumeBuilderService from '../services/resumeBuilder.service';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

router.post('/generate-descriptions', optionalAuth, async (req: Request, res: Response): Promise<any> => {
  const { jobTitle } = req.body;
  if (!jobTitle) {
    return res.status(400).json({ error: "Job title is required" });
  }

  try {
    const user = req.user ? { id: req.user.id, email: req.user.email } : undefined;
    const result = await resumeBuilderService.generateDescriptions(jobTitle, user);
    res.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate descriptions" });
  }
});

router.post('/generate-skills', optionalAuth, async (req: Request, res: Response): Promise<any> => {
  const { jobTitle } = req.body;
  if (!jobTitle) {
    return res.status(400).json({ error: "Job title is required" });
  }

  try {
    const user = req.user ? { id: req.user.id, email: req.user.email } : undefined;
    const result = await resumeBuilderService.generateSkills(jobTitle, user);
    res.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate skills" });
  }
});

router.post('/enhance-skill', optionalAuth, async (req: Request, res: Response): Promise<any> => {
  const { skillText } = req.body;
  if (!skillText) {
    return res.status(400).json({ error: "Skill text is required" });
  }

  try {
    const user = req.user ? { id: req.user.id, email: req.user.email } : undefined;
    const result = await resumeBuilderService.enhanceSkill(skillText, user);
    res.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to enhance skill" });
  }
});

router.post('/generate-summary', optionalAuth, async (req: Request, res: Response): Promise<any> => {
  const { jobTitle, existingSummary, type } = req.body;
  
  if (type !== 'improve' && !jobTitle) {
    return res.status(400).json({ error: "Job title is required for creation." });
  }

  try {
    const user = req.user ? { id: req.user.id, email: req.user.email } : undefined;
    const result = await resumeBuilderService.generateSummary(jobTitle, existingSummary, type, user);
    res.json(result);
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate summaries" });
  }
});

export default router;