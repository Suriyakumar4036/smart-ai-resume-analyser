import { NextRequest, NextResponse } from "next/server";

// Polyfill for PDF parsing environment stability
if (typeof global.DOMMatrix === "undefined") { (global as any).DOMMatrix = class {}; }
if (typeof global.ImageData === "undefined") { (global as any).ImageData = class {}; }
if (typeof global.Path2D === "undefined") { (global as any).Path2D = class {}; }

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use pdf-parse-fork which fixes the ENOENT bug
    const pdf = require("pdf-parse-fork");
    const data = await pdf(buffer);
    const text = data.text;

    if (!text) {
      throw new Error("Could not extract text from PDF");
    }

    // Analysis Logic
    const analysis = analyzeResume(text);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}

function analyzeResume(text: string) {
  const lowercaseText = text.toLowerCase();
  
  // 1. Detect Skills
  const techKeywords = [
    "react", "next.js", "typescript", "javascript", "node.js", "python", "java", "c++", "c#",
    "docker", "kubernetes", "aws", "azure", "gcp", "sql", "mongodb", "postgresql", "mysql",
    "graphql", "rest api", "git", "ci/cd", "machine learning", "tensorflow", "agile", "scrum",
    "pytorch", "data science", "nlp", "rust", "go", "tailwind", "figma", "linux", "bash"
  ];
  
  const foundSkills = techKeywords.filter(skill => lowercaseText.includes(skill));
  
  // 2. Section Detection (More strict)
  const hasEducation = /(education|academic background|coursework)/i.test(text);
  const hasProjects = /(projects|portfolio|personal work)/i.test(text);
  const hasExperience = /(experience|employment|work history|career|professional experience)/i.test(text);
  const hasSummary = /(summary|profile|objective|about me)/i.test(text);
  const hasSkillsSection = /(skills|technologies|technical skills|core competencies)/i.test(text);

  // 3. Quantifiable Impact & Action Verbs
  // Count numbers and percentages as a proxy for quantified impact
  const numbersRegex = /\b\d+(\.\d+)?%?|\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
  const quantifiedMatches = text.match(numbersRegex) || [];
  const impactScoreRaw = quantifiedMatches.length;

  const actionVerbs = ["led", "managed", "developed", "created", "designed", "improved", "increased", "decreased", "saved", "implemented", "launched", "achieved", "orchestrated"];
  const foundVerbs = actionVerbs.filter(verb => lowercaseText.includes(verb));

  // 4. HR Red Flags (Personal Pronouns)
  const pronounsRegex = /\b(I|me|my|mine|we|our|ours)\b/g;
  // Case sensitive for "I", lowercase text for others is tricky. Let's do a basic check.
  const personalPronounMatches = text.match(/\b(I|me|my|we)\b/gi) || [];
  
  // 5. Length and Parse Rate
  const wordCount = text.split(/\s+/).length;
  
  // --- STRICT ATS SCORING ALGORITHM ---
  // Start with a base score of 20 (it's hard to get a zero, but hard to get a 100)
  let score = 20;
  
  // 1. Section Score (max 20)
  // Getting all sections only gives 20 points. Missing one hurts.
  let sectionScore = 0;
  if (hasEducation) sectionScore += 4;
  if (hasExperience) sectionScore += 8;
  if (hasSkillsSection) sectionScore += 4;
  if (hasSummary) sectionScore += 2;
  if (hasProjects) sectionScore += 2;
  score += sectionScore;

  // 2. Keyword Match (max 20)
  // Now requires 16 keywords to max out (1.25 pts each), instead of 10.
  let keywordScore = Math.min(foundSkills.length * 1.25, 20);
  score += keywordScore;

  // 3. Impact & Action Verbs (max 40)
  // This is where most people fail. You need A LOT of metrics and verbs to score high.
  // Require at least 12 numbers/metrics to get 20 points (1.66 pts each)
  let metricsScore = Math.min(impactScoreRaw * 1.66, 20);
  // Require at least 15 unique action verbs to get 20 points (1.33 pts each)
  let verbsScore = Math.min(foundVerbs.length * 1.33, 20);
  let impactScore = metricsScore + verbsScore;
  score += impactScore;

  // 4. Formatting & Penalties (subtracts from the total)
  let formatScore = 0; // Starts at 0, goes negative
  let hrRedFlags = 0;

  if (personalPronounMatches.length > 0) {
    let penalty = Math.min(personalPronounMatches.length * 3, 15); // Stricter penalty
    formatScore -= penalty;
    hrRedFlags += penalty;
  }
  
  if (wordCount < 350) {
    formatScore -= 15; // Heavy penalty for too short
    hrRedFlags += 10;
  } else if (wordCount > 900) {
    formatScore -= 10; // Penalty for rambling
    hrRedFlags += 5;
  }

  score += formatScore;

  // Final cap
  score = Math.floor(Math.max(0, Math.min(score, 100)));

  // --- GENERATE STRICT SUGGESTIONS ---
  const suggestions = [];

  // Impact Suggestions
  if (metricsScore < 15) {
    suggestions.push({
      type: "suggestion",
      title: "Critically Low on Metrics",
      description: `Only found ${impactScoreRaw} numbers/metrics. Top resumes quantify almost every bullet point. Add percentages, dollar amounts, or team sizes.`
    });
  } else {
    suggestions.push({
      type: "positive",
      title: "Strong Quantifiable Impact",
      description: "You've successfully backed up your claims with hard numbers."
    });
  }

  if (verbsScore < 15) {
    suggestions.push({
      type: "suggestion",
      title: "Weak Action Verbs",
      description: `We detected only ${foundVerbs.length} strong action verbs. Start every bullet point with a powerful verb (e.g., Orchestrated, Spearheaded, Optimized).`
    });
  }

  // Red Flags
  if (personalPronounMatches.length > 0) {
    suggestions.push({
      type: "suggestion",
      title: "HR Red Flag: Personal Pronouns",
      description: `Found ${personalPronounMatches.length} personal pronouns (I, me, my). Remove all of these immediately to sound more professional.`
    });
  }

  // Section Suggestions
  const missingSections = [];
  if (!hasExperience) missingSections.push("Experience");
  if (!hasSummary) missingSections.push("Summary");
  if (!hasEducation) missingSections.push("Education");
  if (!hasSkillsSection) missingSections.push("Skills");
  
  if (missingSections.length > 0) {
    suggestions.push({
      type: "suggestion",
      title: "Missing Core Sections",
      description: `Missing standard sections: ${missingSections.join(", ")}. ATS parsers may fail to categorize your data properly.`
    });
  } else {
    suggestions.push({
      type: "positive",
      title: "Perfect Section Structure",
      description: "Your resume contains all the essential sections an ATS looks for."
    });
  }

  // Keyword Suggestions
  if (foundSkills.length < 12) {
    suggestions.push({
      type: "suggestion",
      title: "Low Keyword Density",
      description: `Only ${foundSkills.length} hard skills detected. Aim for 12-15 relevant keywords matched directly to the job description.`
    });
  }

  // Length
  if (wordCount < 350) {
    suggestions.push({
      type: "suggestion",
      title: "Resume Too Short",
      description: `Word count is ${wordCount}. This lacks the necessary depth to trigger ATS relevancy algorithms. Aim for 450-800 words.`
    });
  } else if (wordCount > 900) {
    suggestions.push({
      type: "suggestion",
      title: "Resume Too Long",
      description: `Word count is ${wordCount}. Recruiters spend 6 seconds per resume. Trim the fluff and keep it under 800 words.`
    });
  }

  // Calculate percentages for the UI
  // UI expects values between 0 and 100 for the progress bars
  const contentScorePercent = Math.floor((sectionScore / 20) * 100);
  const impactScorePercent = Math.floor((impactScore / 40) * 100);
  // Inverse the red flags so lower is better, but represented as a warning level
  const redFlagsPercent = Math.min(hrRedFlags * 5, 100); 

  return {
    score,
    percentile: Math.max(1, score - 12), // Percentile is usually slightly lower than the score
    metrics: [
      { label: "Content Structure", value: contentScorePercent, color: "bg-blue-500" },
      { label: "Quantified Impact", value: impactScorePercent, color: "bg-amber-500" },
      { label: "HR Red Flags (Lower is Better)", value: redFlagsPercent, color: "bg-rose-500" },
    ],
    skills: foundSkills.map(s => s.toUpperCase()),
    suggestions: suggestions
  };
}
