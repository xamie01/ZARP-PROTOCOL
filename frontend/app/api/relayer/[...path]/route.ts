/**
 * @file app/api/relayer/[...path]/route.ts
 * @description Server-side proxy to the Zama relayer.
 *
 * The browser SDK is pointed at this route (NEXT_PUBLIC_RELAYER_PROXY_URL) so
 * the mainnet relayer API key never reaches the client. The first path segment
 * is the chainId; the remainder is forwarded upstream verbatim.
 *
 * Required behaviours (per Zama SDK auth guide):
 *   - attach `x-api-key` server-side
 *   - forward `zama-sdk-version` / `zama-sdk-name` from the client
 *   - strip `content-encoding` / `content-length` from the upstream response
 *     (Node fetch already decoded the body; forwarding the header breaks the
 *     browser with ERR_CONTENT_DECODING_FAILED)
 */

import { NextRequest } from "next/server";
import { MainnetConfig, SepoliaConfig } from "@zama-fhe/sdk";

/** Relayer base URL keyed by chain id. */
const RELAYER_CONFIGS: Record<string, { relayerUrl: string }> = {
  [String(MainnetConfig.chainId)]: MainnetConfig,
  [String(SepoliaConfig.chainId)]: SepoliaConfig,
};

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, TokenBucket>();
const LIMIT = 60; // Max 60 requests per minute
const REFILL_RATE = LIMIT / 60000; // Refill tokens per millisecond

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimitMap.get(ip);
  if (!bucket) {
    bucket = { tokens: LIMIT, lastRefill: now };
    rateLimitMap.set(ip, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(LIMIT, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false;
  }
  return true;
}

/** CORS preflight: advertise the headers the SDK sends. */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "content-type, zama-sdk-version, zama-sdk-name, x-api-key",
    },
  });
}

async function proxy(req: NextRequest, segments: string[]): Promise<Response> {
  /* 1. Origin/Referer check to reject hotlinking of the proxy */
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return new Response("Unauthorized origin", { status: 403 });
      }
    } catch {
      return new Response("Invalid origin header", { status: 400 });
    }
  } else if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return new Response("Unauthorized referer", { status: 403 });
      }
    } catch {
      return new Response("Invalid referer header", { status: 400 });
    }
  }

  /* 2. Rate limiting by IP address */
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.ip || "127.0.0.1";
  if (isRateLimited(ip)) {
    return new Response("Too many requests. Please try again later.", { status: 429 });
  }

  const [chainId, ...rest] = segments;
  const config = RELAYER_CONFIGS[chainId];
  if (!config) {
    return new Response(`Unsupported chain: ${chainId}`, { status: 400 });
  }

  /* Mainnet is keyed; Sepolia's relayer is open. Only require a key off Sepolia. */
  const apiKey = process.env.RELAYER_API_KEY?.trim();
  if (chainId === String(MainnetConfig.chainId) && !apiKey) {
    return new Response(
      "RELAYER_API_KEY is not configured on the server (required for mainnet).",
      { status: 503 }
    );
  }

  const upstream = `${config.relayerUrl.replace(/\/$/, "")}/${rest.join("/")}${req.nextUrl.search}`;

  const headers: Record<string, string> = { "content-type": "application/json" };
  const sdkVersion = req.headers.get("zama-sdk-version");
  const sdkName = req.headers.get("zama-sdk-name");
  if (sdkVersion) headers["zama-sdk-version"] = sdkVersion;
  if (sdkName) headers["zama-sdk-name"] = sdkName;
  if (apiKey) headers["x-api-key"] = apiKey;

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

  const response = await fetch(upstream, {
    method: req.method,
    headers,
    body,
    /* @ts-expect-error duplex is required by undici for streaming bodies */
    duplex: "half",
  });

  /* Strip hop-by-hop / encoding headers; Node fetch already decoded the body. */
  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-encoding");
  outHeaders.delete("content-length");
  outHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: outHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params.path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(req, params.path);
}
