# 2026-08-27: pulled from the ECR Public Gallery mirror instead of Docker
# Hub directly -- CodeBuild's shared NAT IPs hit Docker Hub's anonymous
# pull rate limit (429 Too Many Requests) on back-to-back builds. Same
# image, no rate limit on this registry.
FROM public.ecr.aws/docker/library/python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
