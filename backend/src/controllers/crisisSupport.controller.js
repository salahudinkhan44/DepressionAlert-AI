// Crisis-support controller.
// Serves helplines, emergency contacts, calming exercises and
// educational resources (UC-8, FR-12; SDD 8.1.4).
import { CRISIS_RESOURCES } from '../data/crisisResources.js';

// GET /api/crisis-support
export async function getCrisisResources(req, res) {
  res.json(CRISIS_RESOURCES);
}
