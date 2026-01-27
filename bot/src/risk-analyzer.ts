// Zen Scan - Risk Analysis Lambda Handler

import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Logger } from "@aws-lambda-powertools/logger";
import $ from "@core/constants";

const client = new BedrockRuntimeClient({ region: $.aws.bedrock.region });
const log = new Logger({ serviceName: "zen-scan-risk-analyzer" });

// ============================================
// Types
// ============================================

export interface ContractData {
  address: string;
  accountInfo: {
    address: string;
    balance: string;
    status: string;
    interfaces?: string[];
  };
  transactions: Array<{
    hash: string;
    success: boolean;
    utime: number;
    in_msg?: { value?: string } | null;
    out_msgs?: Array<{ value?: string }>;
    total_fees: string;
  }>;
}

export interface RiskAssessment {
  score: number;
  level: "safe" | "low" | "medium" | "high" | "critical";
  zenWarning: {
    jp: string;
    en: string;
  };
  technicalExplanation: string;
  redFlags: string[];
  recommendation: string;
}

// ============================================
// Prompt Template
// ============================================

const RISK_ANALYSIS_PROMPT = `You are a blockchain security expert with a Zen philosophy approach.
Analyze this TON contract/address for security risks.

Contract Address: {address}
Account Status: {status}
Balance: {balance} TON
Contract Type: {interfaces}

Recent Transactions (last 30):
{transactions}

Analyze for suspicious patterns, contract age, unusual fees, and red flags.

RESPOND WITH VALID JSON ONLY - NO MARKDOWN, NO CODE BLOCKS, NO EXTRA TEXT.

Example response format:
{
  "score": 45,
  "level": "medium",
  "zenWarning": {
    "jp": "警戒",
    "en": "The path narrows, walk mindfully"
  },
  "technicalExplanation": "Your analysis here",
  "redFlags": ["flag1", "flag2"],
  "recommendation": "Your recommendation here"
}

CRITICAL RULES:
1. score: 0-100 integer (higher = more risky)
2. level: "safe" | "low" | "medium" | "high" | "critical"
3. zenWarning: MUST be object with "jp" (2-4 kanji) and "en" (poetic phrase, max 50 chars)
4. zenWarning CANNOT be a string - it MUST be {"jp": "...", "en": "..."}

Zen warning style: Use nature metaphors (water, paths, mountains). Be poetic and calm.
`;

// ============================================
// Helper Functions
// ============================================

function formatTransactionsForPrompt(
  transactions: ContractData["transactions"]
): string {
  if (!transactions || transactions.length === 0) {
    return "No transactions found";
  }

  return transactions
    .slice(0, 30)
    .map((tx, index) => {
      const date = new Date(tx.utime * 1000).toISOString();
      const inValue = tx.in_msg?.value
        ? `${Number(tx.in_msg.value) / 1e9} TON`
        : "0 TON";
      const outCount = tx.out_msgs?.length || 0;
      const success = tx.success ? "✓" : "✗";

      return `${index + 1}. [${date}] ${success} In: ${inValue}, Out msgs: ${outCount}, Fees: ${Number(tx.total_fees) / 1e9} TON`;
    })
    .join("\n");
}

function buildPrompt(data: ContractData): string {
  const balance = (Number(data.accountInfo.balance) / 1e9).toFixed(4);
  const interfaces = data.accountInfo.interfaces?.join(", ") || "Unknown";
  const transactions = formatTransactionsForPrompt(data.transactions);

  return RISK_ANALYSIS_PROMPT.replace("{address}", data.address)
    .replace("{status}", data.accountInfo.status)
    .replace("{balance}", balance)
    .replace("{interfaces}", interfaces)
    .replace("{transactions}", transactions);
}

function parseAIResponse(responseText: string): unknown {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }

  cleaned = cleaned.trim();

  return JSON.parse(cleaned);
}

function getZenWarningByLevel(level: RiskAssessment["level"]): { jp: string; en: string } {
  const warnings = {
    safe: [
      { jp: "清流", en: "Waters run clear and true" },
      { jp: "静寂", en: "Stillness reveals no shadows" },
      { jp: "明鏡", en: "The mirror reflects without distortion" },
    ],
    low: [
      { jp: "微風", en: "A gentle breeze stirs the surface" },
      { jp: "薄霧", en: "Thin mist obscures the distant path" },
      { jp: "観察", en: "Watch the ripples before stepping" },
    ],
    medium: [
      { jp: "警戒", en: "The path narrows, walk mindfully" },
      { jp: "濁流", en: "Currents swirl beneath calm waters" },
      { jp: "岐路", en: "Many paths diverge in shadow" },
    ],
    high: [
      { jp: "危険", en: "Storm clouds gather on the horizon" },
      { jp: "深淵", en: "The abyss gazes back" },
      { jp: "迷霧", en: "Dense fog conceals the way forward" },
    ],
    critical: [
      { jp: "断崖", en: "The cliff edge crumbles beneath" },
      { jp: "暗闇", en: "Darkness swallows the path ahead" },
      { jp: "虚無", en: "The void beckons, turn back" },
    ],
  };

  const options = warnings[level];
  return options[Math.floor(Math.random() * options.length)];
}

function validateRiskAssessment(response: unknown): RiskAssessment {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response: expected an object");
  }

  const data = response as Record<string, unknown>;
  const validLevels = ["safe", "low", "medium", "high", "critical"];

  // Validate score
  let score: number;
  if (typeof data.score === "number") {
    score = Math.max(0, Math.min(100, Math.round(data.score)));
  } else if (typeof data.score === "string") {
    score = Math.max(0, Math.min(100, Math.round(parseInt(data.score, 10))));
  } else {
    score = 100; // Default to max risk
  }

  // Validate level
  let level: RiskAssessment["level"];
  if (
    typeof data.level === "string" &&
    validLevels.includes(data.level)
  ) {
    level = data.level as RiskAssessment["level"];
  } else {
    // Derive from score
    if (score <= 20) level = "safe";
    else if (score <= 40) level = "low";
    else if (score <= 60) level = "medium";
    else if (score <= 80) level = "high";
    else level = "critical";
  }

  // Validate zenWarning - handle both object and string formats
  let zenWarning: { jp: string; en: string };
  
  if (
    typeof data.zenWarning === "object" &&
    data.zenWarning !== null &&
    typeof (data.zenWarning as Record<string, unknown>).jp === "string" &&
    typeof (data.zenWarning as Record<string, unknown>).en === "string"
  ) {
    // Valid object format
    zenWarning = {
      jp: ((data.zenWarning as Record<string, unknown>).jp as string).trim().slice(0, 10),
      en: ((data.zenWarning as Record<string, unknown>).en as string).trim().slice(0, 100),
    };
    log.info("✅ Valid zenWarning format received", { zenWarning });
  } else if (typeof data.zenWarning === "string" && data.zenWarning.trim()) {
    // AI returned a string - use it as English, generate Japanese from level
    const enMessage = data.zenWarning.trim().slice(0, 50);
    const jpByLevel: Record<string, string> = {
      safe: "清流",
      low: "微風", 
      medium: "警戒",
      high: "危険",
      critical: "断崖",
    };
    zenWarning = {
      jp: jpByLevel[level] || "警戒",
      en: enMessage,
    };
    log.info("⚠️ Converted string zenWarning to object", { original: data.zenWarning, converted: zenWarning });
  } else {
    // Invalid format - use level-appropriate fallback
    log.warn("⚠️ Invalid zenWarning format, using level-based fallback", {
      received: data.zenWarning,
      level,
    });
    zenWarning = getZenWarningByLevel(level);
  }

  return {
    score,
    level,
    zenWarning,
    technicalExplanation:
      typeof data.technicalExplanation === "string" &&
      data.technicalExplanation.trim()
        ? data.technicalExplanation.trim()
        : "Unable to provide detailed analysis.",
    redFlags: Array.isArray(data.redFlags)
      ? data.redFlags.filter(
          (f): f is string => typeof f === "string" && f.trim().length > 0
        )
      : [],
    recommendation:
      typeof data.recommendation === "string" && data.recommendation.trim()
        ? data.recommendation.trim()
        : "Exercise caution before proceeding.",
  };
}

// ============================================
// Main Analysis Function
// ============================================

export async function analyzeContract(
  data: ContractData
): Promise<RiskAssessment> {
  const prompt = buildPrompt(data);

  log.info("Analyzing contract", { address: data.address });

  const message = {
    role: ConversationRole.USER,
    content: [{ text: prompt }],
  };

  const request = {
    modelId: $.aws.bedrock.model,
    messages: [message],
    inferenceConfig: {
      maxTokens: $.aws.bedrock.max_tokens,
      topP: $.aws.bedrock.top_p,
    },
  };

  const cmd = new ConverseCommand(request);

  try {
    const response = await client.send(cmd);
    log.info("Bedrock response received", { stopReason: response.stopReason });

    const responseText = response.output?.message?.content
      ?.map((i) => i.text)
      .join("\n");

    if (!responseText) {
      throw new Error("Empty response from Bedrock");
    }

    const parsed = parseAIResponse(responseText);
    const assessment = validateRiskAssessment(parsed);

    log.info("Risk assessment complete", {
      address: data.address,
      score: assessment.score,
      level: assessment.level,
    });

    return assessment;
  } catch (error) {
    log.error("Risk analysis failed", { error, address: data.address });

    // Return default high-risk assessment on error
    return {
      score: 100,
      level: "critical",
      zenWarning: { jp: "不明", en: "The path is unclear. Proceed with extreme caution." },
      technicalExplanation:
        "Unable to complete analysis. Defaulting to maximum risk level for safety.",
      redFlags: ["Analysis failed - treating as high risk"],
      recommendation: "Wait and try again, or avoid this contract entirely.",
    };
  }
}
