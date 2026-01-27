// Zen Scan - Risk Analysis API Route

import type { Route } from "./+types/app.api.analyze";
import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ============================================
// Types
// ============================================

interface ContractData {
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

interface RiskAssessment {
  score: number;
  level: "safe" | "low" | "medium" | "high" | "critical";
  zenWarning: string;
  technicalExplanation: string;
  redFlags: string[];
  recommendation: string;
}

// ============================================
// Bedrock Configuration
// ============================================

const BEDROCK_REGION = process.env.AWS_REGION || "us-east-1";
// Use Amazon Nova Lite model
const BEDROCK_MODEL = process.env.BEDROCK_MODEL || "us.amazon.nova-2-lite-v1:0";

// ============================================
// Prompt Template
// ============================================

const RISK_ANALYSIS_PROMPT = `
You are a blockchain security expert with a Zen philosophy approach.
Analyze this TON contract/address for security risks based on its transaction history.

Contract Address: {address}
Account Status: {status}
Balance: {balance} TON
Contract Type: {interfaces}

Recent Transactions (last 30):
{transactions}

CRITICAL RISK FACTORS - Increase score significantly if present:
- Uninitialized contract state (no code deployed) - MAJOR RED FLAG, add 30-40 points
- Unknown contract type (cannot verify functionality) - MAJOR RED FLAG, add 25-35 points
- No transaction history or very recent creation - add 15-20 points
- Suspicious transaction patterns (draining, honeypot, rug pull indicators) - add 20-30 points
- Interaction with known scam addresses - add 25-35 points
- Unusual fee patterns or anomalies - add 10-15 points

Analyze for:
- Contract initialization status and code deployment
- Verifiable contract type and functionality
- Transaction patterns and age
- Fee anomalies
- Red flags in transaction flow

Respond ONLY with valid JSON (no markdown, no code blocks, no explanation):
{
  "score": <0-100 integer>,
  "level": "<safe|low|medium|high|critical>",
  "zenWarning": "<calming but clear warning in Zen style, max 5 words>",
  "technicalExplanation": "<brief technical analysis, max 50 words>",
  "redFlags": ["<short flag, max 5 words>", "<short flag, max 5 words>"],
  "recommendation": "<actionable advice, max 30 words>"
}
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

function validateRiskAssessment(response: unknown): RiskAssessment {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response: expected an object");
  }

  const data = response as Record<string, unknown>;
  const validLevels = ["safe", "low", "medium", "high", "critical"];

  let score: number;
  if (typeof data.score === "number") {
    score = Math.max(0, Math.min(100, Math.round(data.score)));
  } else if (typeof data.score === "string") {
    score = Math.max(0, Math.min(100, Math.round(parseInt(data.score, 10))));
  } else {
    score = 100;
  }

  let level: RiskAssessment["level"];
  if (typeof data.level === "string" && validLevels.includes(data.level)) {
    level = data.level as RiskAssessment["level"];
  } else {
    if (score <= 20) level = "safe";
    else if (score <= 40) level = "low";
    else if (score <= 60) level = "medium";
    else if (score <= 80) level = "high";
    else level = "critical";
  }

  return {
    score,
    level,
    zenWarning:
      typeof data.zenWarning === "string" && data.zenWarning.trim()
        ? data.zenWarning.trim().slice(0, 100)
        : "Proceed with caution.",
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

function getDefaultAssessment(): RiskAssessment {
  return {
    score: 100,
    level: "critical",
    zenWarning: "The path is unclear. Proceed with extreme caution.",
    technicalExplanation:
      "Unable to complete analysis. Defaulting to maximum risk level for safety.",
    redFlags: ["Analysis failed - treating as high risk"],
    recommendation: "Wait and try again, or avoid this contract entirely.",
  };
}

// ============================================
// Main Analysis Function
// ============================================

async function analyzeContract(data: ContractData): Promise<RiskAssessment> {
  const client = new BedrockRuntimeClient({ region: BEDROCK_REGION });
  const prompt = buildPrompt(data);

  console.log("Analyzing contract:", data.address);

  const message = {
    role: ConversationRole.USER,
    content: [{ text: prompt }],
  };

  const request = {
    modelId: BEDROCK_MODEL,
    messages: [message],
    inferenceConfig: {
      maxTokens: 1024,
      topP: 0.9,
    },
  };

  const cmd = new ConverseCommand(request);

  try {
    const response = await client.send(cmd);
    console.log("Bedrock response received:", response.stopReason);

    const responseText = response.output?.message?.content
      ?.map((item) => item.text)
      .join("\n");

    if (!responseText) {
      throw new Error("Empty response from Bedrock");
    }

    const parsed = parseAIResponse(responseText);
    const assessment = validateRiskAssessment(parsed);

    console.log("Risk assessment complete:", {
      address: data.address,
      score: assessment.score,
      level: assessment.level,
    });

    return assessment;
  } catch (error) {
    console.error("Risk analysis failed:", error);
    return getDefaultAssessment();
  }
}

// ============================================
// API Route Handler
// ============================================

export async function action({ request }: Route.ActionArgs) {
  try {
    const data = await request.json();

    if (!data || !data.address) {
      return Response.json(
        { error: "Missing required field: address" },
        { status: 400 }
      );
    }

    const assessment = await analyzeContract(data);
    return Response.json({ data: assessment });
  } catch (error) {
    console.error("Risk analysis API error:", error);

    return Response.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
