/**
 * AI Training Module
 * Integrates 700 Cybersecurity Skills and Pentest Swarm AI for GPT model training
 */

import fs from 'fs';
import path from 'path';

export interface TrainingData {
  skill: string;
  category: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface TrainingConfig {
  model: 'kali-gpt' | 'dark-gpt' | 'zero-day-gpt' | 'onion-gpt' | 'red-team-operator';
  trainingDataPath: string;
  outputPath: string;
  epochs: number;
  batchSize: number;
}

/**
 * Load cybersecurity skills from 700-Cybersecurity-Skills repository
 */
export async function loadCybersecuritySkills(skillsPath: string): Promise<TrainingData[]> {
  const trainingData: TrainingData[] = [];
  
  try {
    const skillsDir = path.join(skillsPath, 'skills');
    
    if (!fs.existsSync(skillsDir)) {
      console.warn(`Skills directory not found: ${skillsDir}`);
      return trainingData;
    }

    const skillFolders = fs.readdirSync(skillsDir);

    for (const folder of skillFolders) {
      const skillPath = path.join(skillsDir, folder);
      const readmePath = path.join(skillPath, 'README.md');

      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        
        trainingData.push({
          skill: folder,
          category: extractCategory(folder),
          content,
          difficulty: extractDifficulty(content),
          tags: extractTags(folder),
        });
      }
    }
  } catch (error) {
    console.error('Error loading cybersecurity skills:', error);
  }

  return trainingData;
}

/**
 * Load Pentest Swarm AI training data
 */
export async function loadPentestSwarmData(swarmPath: string): Promise<TrainingData[]> {
  const trainingData: TrainingData[] = [];

  try {
    const dataDir = path.join(swarmPath, 'data');
    
    if (!fs.existsSync(dataDir)) {
      console.warn(`Data directory not found: ${dataDir}`);
      return trainingData;
    }

    // Load playbooks and configurations
    const files = fs.readdirSync(dataDir, { recursive: true });

    for (const file of files) {
      if (typeof file === 'string' && (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.md'))) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        trainingData.push({
          skill: path.basename(file),
          category: 'pentest-swarm',
          content,
          difficulty: 'advanced',
          tags: ['pentest', 'swarm-ai', 'automation'],
        });
      }
    }
  } catch (error) {
    console.error('Error loading Pentest Swarm data:', error);
  }

  return trainingData;
}

/**
 * Combine and prepare training data for model training
 */
export async function prepareTrainingDataset(
  cybersecSkills: TrainingData[],
  pentestSwarmData: TrainingData[]
): Promise<string> {
  const combinedData = [...cybersecSkills, ...pentestSwarmData];

  // Format data for GPT training
  const trainingText = combinedData
    .map((item) => {
      return `
# ${item.skill}
Category: ${item.category}
Difficulty: ${item.difficulty}
Tags: ${item.tags.join(', ')}

${item.content}
---
`;
    })
    .join('\n');

  return trainingText;
}

/**
 * Train a custom GPT model with the combined dataset
 */
export async function trainCustomModel(config: TrainingConfig, trainingData: string): Promise<void> {
  console.log(`Starting training for model: ${config.model}`);
  console.log(`Epochs: ${config.epochs}, Batch Size: ${config.batchSize}`);

  // Simulate training process
  // In production, this would integrate with OpenAI's fine-tuning API or similar
  const trainingFile = path.join(config.outputPath, `${config.model}-training-data.txt`);

  if (!fs.existsSync(config.outputPath)) {
    fs.mkdirSync(config.outputPath, { recursive: true });
  }

  fs.writeFileSync(trainingFile, trainingData);
  console.log(`Training data saved to: ${trainingFile}`);

  // Log training metadata
  const metadata = {
    model: config.model,
    trainingDate: new Date().toISOString(),
    dataSize: trainingData.length,
    epochs: config.epochs,
    batchSize: config.batchSize,
  };

  fs.writeFileSync(
    path.join(config.outputPath, `${config.model}-metadata.json`),
    JSON.stringify(metadata, null, 2)
  );
}

/**
 * Helper functions
 */
function extractCategory(skillName: string): string {
  const parts = skillName.split('-');
  return parts[0] || 'general';
}

function extractDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
  if (content.toLowerCase().includes('advanced')) return 'advanced';
  if (content.toLowerCase().includes('intermediate')) return 'intermediate';
  return 'beginner';
}

function extractTags(skillName: string): string[] {
  return skillName.split('-').filter((tag) => tag.length > 2);
}

/**
 * Initialize training pipeline
 */
export async function initializeTrainingPipeline(
  cybersecSkillsPath: string,
  pentestSwarmPath: string,
  outputPath: string
): Promise<void> {
  console.log('Initializing AI training pipeline...');

  // Load data from both sources
  const cybersecSkills = await loadCybersecuritySkills(cybersecSkillsPath);
  const pentestSwarmData = await loadPentestSwarmData(pentestSwarmPath);

  console.log(`Loaded ${cybersecSkills.length} cybersecurity skills`);
  console.log(`Loaded ${pentestSwarmData.length} Pentest Swarm data items`);

  // Prepare combined dataset
  const trainingDataset = await prepareTrainingDataset(cybersecSkills, pentestSwarmData);

  // Train models
  const models: TrainingConfig['model'][] = [
    'kali-gpt',
    'dark-gpt',
    'zero-day-gpt',
    'onion-gpt',
    'red-team-operator',
  ];

  for (const model of models) {
    const config: TrainingConfig = {
      model,
      trainingDataPath: cybersecSkillsPath,
      outputPath: path.join(outputPath, model),
      epochs: 3,
      batchSize: 32,
    };

    await trainCustomModel(config, trainingDataset);
  }

  console.log('Training pipeline completed!');
}
