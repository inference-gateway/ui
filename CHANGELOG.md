# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0](https://github.com/inference-gateway/ui/compare/v0.2.1...v0.3.0) (2025-04-03)

### ✨ Features

* Add reasoning content to chunk message in OpenAPI specification ([c40067e](https://github.com/inference-gateway/ui/commit/c40067ecaa32823c7ce208cdba197f5ad295913d))
* Implement local storage for chat history ([#13](https://github.com/inference-gateway/ui/issues/13)) ([0ea4e9f](https://github.com/inference-gateway/ui/commit/0ea4e9f1e20f308c330965cc3aead1b5ff2523d5))

## [0.2.1](https://github.com/inference-gateway/ui/compare/v0.2.0...v0.2.1) (2025-03-31)

### ♻️ Improvements

* Use Inference-Gateway TypeScript SDK ([#12](https://github.com/inference-gateway/ui/issues/12)) ([e5c93b3](https://github.com/inference-gateway/ui/commit/e5c93b3376c73c9afebc22df05de6afa57a9c1d3))

## [0.2.0](https://github.com/inference-gateway/ui/compare/v0.1.8...v0.2.0) (2025-03-30)

### ✨ Features

* Implement Streaming Responses ([#10](https://github.com/inference-gateway/ui/issues/10)) ([bf04a6b](https://github.com/inference-gateway/ui/commit/bf04a6baf69c8c7a7c36ffb579caff594d3a4867))

## [0.1.8](https://github.com/inference-gateway/ui/compare/v0.1.7...v0.1.8) (2025-03-30)

### ♻️ Improvements

* Remove default model selection and disable the input text field when no model is selected ([#8](https://github.com/inference-gateway/ui/issues/8)) ([4e40536](https://github.com/inference-gateway/ui/commit/4e40536e49285780a666916b6ba1f8956a342240))

### 📚 Documentation

* Update README to include additional badges for release and artifacts status ([#9](https://github.com/inference-gateway/ui/issues/9)) ([0e38600](https://github.com/inference-gateway/ui/commit/0e3860025d67ada57ac8879e76b567733fa86bff))

## [0.1.7](https://github.com/inference-gateway/ui/compare/v0.1.6...v0.1.7) (2025-03-29)

### ♻️ Improvements

* Optimize Container Image Size ([#5](https://github.com/inference-gateway/ui/issues/5)) ([5c7a898](https://github.com/inference-gateway/ui/commit/5c7a89839c9cd0aef79b35fb30bfe0c841104bd5))

## [0.1.7-rc.2](https://github.com/inference-gateway/ui/compare/v0.1.7-rc.1...v0.1.7-rc.2) (2025-03-29)

### 👷 CI

* **workflow:** update artifacts.yml to conditionally enable latest version for non-rc tags ([66611e7](https://github.com/inference-gateway/ui/commit/66611e7aa2a17f9846450fc022959665ccb7416d))

## [0.1.7-rc.1](https://github.com/inference-gateway/ui/compare/v0.1.6...v0.1.7-rc.1) (2025-03-29)

### 🔧 Miscellaneous

* **devcontainer:** update Dockerfile to install GitHub CLI and improve package installation ([65b37ab](https://github.com/inference-gateway/ui/commit/65b37abac8a0ae135b2c2cdaaf70df7e6d6ce37d))
* **docker-compose:** set pull_policy to always for services ([6a2230a](https://github.com/inference-gateway/ui/commit/6a2230a597fd316e0687d249801e551072c63bc0))

### 📦 Miscellaneous

* **docker:** optimize Dockerfile and update .dockerignore for improved production build process ([21bcab7](https://github.com/inference-gateway/ui/commit/21bcab7c1c447a3e416ac520f3c6a87b26205c58))

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
