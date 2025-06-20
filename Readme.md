# Secret Key Generator

## Overview

A secure application for generating cryptographic secret keys with AI assistance. The tool provides:

- Secure secret key generation
- AI-powered guidance and recommendations
- Multiple interface modes (Form, Terminal, Chat)
- Key management history
- Enterprise-grade security features

## Key Features

### Core Security Features

- **Cryptographic Key Generation**:

  - Generate secure random keys (128-bit to 4096-bit)
  - Multiple algorithm support (AES, RSA, ECC)
  - Configurable key formats (Base64, Hex, PEM)

- **AI Security Assistant**:
  - Get recommendations for key strength
  - Understand proper key usage
  - Learn about cryptographic best practices
  - Interactive troubleshooting

### Interface Components

- **Three Work Modes**:

  - **Form Mode**: Structured key generation with parameters
  - **Terminal Mode**: Command-line style interface
  - **Chat Mode**: Natural language interaction with AI

- **Key Vault**:
  - Secure history of generated keys
  - Encrypted local storage
  - Usage tracking

## Security Architecture

- All key generation happens client-side
- No keys are transmitted over network
- Memory is cleared after operations
- Uses Web Crypto API for cryptographic operations

## Installation

```bash
# Clone repository
git clone https://github.com/digitalterrene/secretmanager.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage Guide

### Generating Secret Keys

1. Select your preferred interface mode. Options are Form, Terminal and AI
2. These modes are intuitive. To generate the secret in terminal, use this command: generate secret.

## Development

### Environment Variables

Create `.env.local` with:

```
UPSTASH_REDIS_REST_URL=your_redis_service_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
SECRET=your_secret_key
```

<!-- ### Testing

Run the test suite:
```bash
npm test
```

Security audits:
```bash
npm run security-check
``` -->

## Security Reporting

Please report any security concerns to security@vertueal.com

> **Warning**: This is security-critical software. Always verify checksums and audit the code before use in production environments.
