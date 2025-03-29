# Changelog

All notable changes to this project will be documented in this file.

## [0.1.6](https://github.com/inference-gateway/ui/compare/v0.1.5...v0.1.6) (2025-03-29)

### 👷 CI

* **workflow:** Remove unnecessary release event types from artifacts workflow ([7a85ca4](https://github.com/inference-gateway/ui/commit/7a85ca4c05d161284f335be518fc959a1b372ba4))
* **workflow:** Update container build job to support multiple OS platforms ([4d62474](https://github.com/inference-gateway/ui/commit/4d624743e615836de8c5da251ecff3b830f67c23))

## [0.1.5](https://github.com/inference-gateway/ui/compare/v0.1.4...v0.1.5) (2025-03-29)

### 👷 CI

* **workflow:** Add GITHUB_TOKEN to release workflow for authentication ([77a0271](https://github.com/inference-gateway/ui/commit/77a0271315fa3a303f76787c73913a49a73fe79e))
* **workflow:** Add support for multiple platforms in artifacts workflow ([cc39e0d](https://github.com/inference-gateway/ui/commit/cc39e0d62e9525866c7e5c6d2c5cd9166afaf636))
* **workflow:** Disable GPG signing for commits in release workflow ([09fb7c6](https://github.com/inference-gateway/ui/commit/09fb7c6e89aa3c5bd9ffcfb907ccc1f28a8e67b7))
* **workflow:** Set Git author and committer information for GitHub Actions ([0cf3cdc](https://github.com/inference-gateway/ui/commit/0cf3cdcb1155da4a2d32c6093dda00a1e0e3b7c4))
* **workflow:** Specify owner and repositories for GitHub App authentication ([1227dc3](https://github.com/inference-gateway/ui/commit/1227dc363166597c2e0dc51f1829bc45a7b76692))
* **workflow:** Update container build environment to Ubuntu 24.04 ([acbef78](https://github.com/inference-gateway/ui/commit/acbef78118d81eb7afa58e1a426c72aa39c52bce))
* **workflow:** Update release workflow to use GitHub App for authentication ([7b05671](https://github.com/inference-gateway/ui/commit/7b056711b6711e444e7411cb308be7b3714e728d))

### 📦 Miscellaneous

* **devcontainer:** Add GitHub Actions extension to development container ([8ba9b3d](https://github.com/inference-gateway/ui/commit/8ba9b3d11a0e900ee97c76fc9f50bed0e3c5dda4))

## [0.1.4](https://github.com/inference-gateway/ui/compare/v0.1.3...v0.1.4) (2025-03-29)

### 👷 CI

* **workflow:** Add 'released' event type to artifacts workflow ([b9dd210](https://github.com/inference-gateway/ui/commit/b9dd210ac49de43f067d0ed4e6c65d683f1569da))

### 🎨 Miscellaneous

* **workflow:** Rename sign-containers job to sign_containers for consistency ([813bd6a](https://github.com/inference-gateway/ui/commit/813bd6a0f2110ee45051ddecf6a9bfa3e9656970))

## [0.1.3](https://github.com/inference-gateway/ui/compare/v0.1.2...v0.1.3) (2025-03-28)

### 👷 CI

* **artifacts:** Update Docker image signing process and add latest tag support ([f868f8b](https://github.com/inference-gateway/ui/commit/f868f8b3780151cd7f71da763782448b5b66b469))

## [0.1.2](https://github.com/inference-gateway/ui/compare/v0.1.1...v0.1.2) (2025-03-28)

### 🐛 Bug Fixes

* **workflow:** Add 'created' event type for release and enable manual workflow dispatch ([c4d754b](https://github.com/inference-gateway/ui/commit/c4d754b0de7ea4a90576bafe485a7ce232c18663))

## [0.1.1](https://github.com/inference-gateway/ui/compare/v0.1.0...v0.1.1) (2025-03-28)

### 🐛 Bug Fixes

* **workflow:** Change release event type from 'publish' to 'published' ([e9d7044](https://github.com/inference-gateway/ui/commit/e9d704482a4320312230f4a1ce8518453414ed0d))
