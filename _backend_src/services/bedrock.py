"""
PTAH Realty -- Bedrock text generation with model-chain fallback.

Model chain verified live against this AWS account's bedrock:list-foundation-models
on 2026-08-13 (all four IDs below are enabled and on-demand). Mirrors the
"try best available, fall back within catalogue" resilience pattern already
used elsewhere in the constellation (see Ptah's own bedrockClient.ts) so this
mini-app behaves consistently rather than inventing a new retry policy.
"""

from __future__ import annotations

import json
import logging

import boto3
from botocore.exceptions import ClientError

from config import settings

logger = logging.getLogger(__name__)

MODEL_CHAIN = [
    "moonshotai.kimi-k2.5",
    "deepseek.v3.2",
    "qwen.qwen3-32b-v1:0",
    "amazon.nova-lite-v1:0",
]

RETRYABLE_ERROR_CODES = {
    "ThrottlingException",
    "ServiceUnavailableException",
    "ModelTimeoutException",
    "ModelNotReadyException",
}


def generate_text(prompt: str, system_prompt: str | None = None, max_tokens: int = 1024) -> str:
    client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
    messages = [{"role": "user", "content": [{"text": prompt}]}]
    last_error: Exception | None = None

    for i, model_id in enumerate(MODEL_CHAIN):
        try:
            kwargs = {
                "modelId": model_id,
                "messages": messages,
                "inferenceConfig": {"maxTokens": max_tokens, "temperature": 0.4},
            }
            if system_prompt:
                kwargs["system"] = [{"text": system_prompt}]
            response = client.converse(**kwargs)
            return response["output"]["message"]["content"][0]["text"]
        except ClientError as err:
            last_error = err
            code = err.response.get("Error", {}).get("Code", "")
            is_last = i == len(MODEL_CHAIN) - 1
            if code not in RETRYABLE_ERROR_CODES or is_last:
                raise
            logger.warning("[realty_bedrock] %s failed (%s); trying next candidate", model_id, code)

    raise last_error  # pragma: no cover


def generate_json(prompt: str, system_prompt: str | None = None, max_tokens: int = 1024) -> dict:
    text = generate_text(prompt, system_prompt=system_prompt, max_tokens=max_tokens)
    cleaned = text.replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)
