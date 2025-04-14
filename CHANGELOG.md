# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0-rc.3](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.2...v0.5.0-rc.3) (2025-04-14)

### 🐛 Bug Fixes

* Correct chart name in Chart.yaml to match application name ([f7f799d](https://github.com/inference-gateway/ui/commit/f7f799d692e42fba9f313aeb0e098f12adbe87d1))

## [0.5.0-rc.2](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.1...v0.5.0-rc.2) (2025-04-14)

### ♻️ Improvements

* Add Inference Gateway UI Helm chart with deployment, service, and ingress configurations ([9e7a58e](https://github.com/inference-gateway/ui/commit/9e7a58ef7f46808d940c281c638e57d60022ae0e))

### 🔧 Miscellaneous

* Update release configuration to use inference-gateway-ui Chart.yaml ([576461c](https://github.com/inference-gateway/ui/commit/576461c90282f81386449447412c04bf4af6d368))

## [0.5.0-rc.1](https://github.com/inference-gateway/ui/compare/v0.4.0...v0.5.0-rc.1) (2025-04-14)

### ✨ Features

* Add Chart.lock for inference-gateway dependency and update .gitignore for chart dependencies ([18bd761](https://github.com/inference-gateway/ui/commit/18bd761be6cb0e01229287ae390f4d5dfa7fa8dc))
* Add GitHub Copilot instructions for Inference Gateway UI ([cb7d7ba](https://github.com/inference-gateway/ui/commit/cb7d7bae2e394e0d9ba4ec85e7430906cab5a3da))
* Add health check endpoint for service status verification ([83b1185](https://github.com/inference-gateway/ui/commit/83b118565af5e136ecc779a3d14d8b3bcf203a10))
* Add Helm chart for Inference Gateway UI with deployment, service, and ingress configurations ([0849f9d](https://github.com/inference-gateway/ui/commit/0849f9dd02f8b6560673f9f62cbc69d1e3637c89))
* Add related repositories section to GitHub Copilot instructions ([4ce5854](https://github.com/inference-gateway/ui/commit/4ce5854d79703c046d78f6d7752baf1d3c270671))
* Update ingress configuration with Nginx settings and CORS support ([3603f50](https://github.com/inference-gateway/ui/commit/3603f507143bd7156d2e30ad48163f2859a0044c))

### 🐛 Bug Fixes

* Update helm commands to use --set-string for environment variables ([f132a52](https://github.com/inference-gateway/ui/commit/f132a52491b588e8c2c140ef44285e35d2c2cbda))

### 📚 Documentation

* Add fullnameOverride for gateway and improve helm command formatting ([63b22c9](https://github.com/inference-gateway/ui/commit/63b22c97d2eb890c3b19bc11126179772bc9918e))
* Add https port ([3eab9a5](https://github.com/inference-gateway/ui/commit/3eab9a5fa9756c4f6cb43bd42f355b88636504e5))
* **examples:** Add kubernetes example ([9bebe3f](https://github.com/inference-gateway/ui/commit/9bebe3f567a397bf0c4c66c877083d6b5c89e1af))
* Update helm command to use unquoted set parameters for ingress configuration ([06fefda](https://github.com/inference-gateway/ui/commit/06fefda5eff77624fda0fd1d4b64194619ad970e))

### 🔧 Miscellaneous

* Add runArgs to devcontainer configuration for local host resolution ([c09251e](https://github.com/inference-gateway/ui/commit/c09251ebf90433b242d94bfdbb2e50ae8d9b9fdb))
* Move exec plugin to the correct position in the release configuration for clarity ([c8eb8ea](https://github.com/inference-gateway/ui/commit/c8eb8ea11714570f0d0b2f69f345d972e4b0fc91))
* Update UI release name and add namespace creation to helm commands ([afb6520](https://github.com/inference-gateway/ui/commit/afb6520693fb6aba0d6f7035c120f5d2d42ee9b9))

### 📦 Miscellaneous

* Add Helm autocompletion to Zsh configuration in Dockerfile ([bb9035e](https://github.com/inference-gateway/ui/commit/bb9035e494769791739162076bb6eb619ec9f54b))
* Update Dockerfile to install kubectl, k3d, and ctlptl with autocompletion support ([8385dfc](https://github.com/inference-gateway/ui/commit/8385dfc66ad5ee1d86442fd3af41f8735f8e1fab))

### 🔒 Security

* Update security context to set runAsUser to 1001 which is nextjs user ([51205cc](https://github.com/inference-gateway/ui/commit/51205cceabc9f14169e77e45ca000f7464342e60))

## [0.4.0](https://github.com/inference-gateway/ui/compare/v0.3.0...v0.4.0) (2025-04-06)

### ✨ Features

* Add authentication support with NextAuth and Keycloak integration ([#14](https://github.com/inference-gateway/ui/issues/14)) ([2db6754](https://github.com/inference-gateway/ui/commit/2db675439e3800eb13afeb60c4341248038619cf)), closes [#15](https://github.com/inference-gateway/ui/issues/15)
* Add Structured Logging ([#16](https://github.com/inference-gateway/ui/issues/16)) ([371b4fe](https://github.com/inference-gateway/ui/commit/371b4fef58011bd93a5a55c60f9f00807bfc8831))

### ♻️ Improvements

* Rename callback props in ChatInterface and MessageInput components ([c3687a7](https://github.com/inference-gateway/ui/commit/c3687a7cf9b9548e72738aedc97065cb64a89702))

### 🔧 Miscellaneous

* Add TODO for additional storage type implementation ([a1aa88a](https://github.com/inference-gateway/ui/commit/a1aa88a9f0edb28d4fe7939504181c6564db7f89))

## [0.4.0-rc.8](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.7...v0.4.0-rc.8) (2025-04-06)

### ♻️ Improvements

* Update hooks and components for client-side rendering and improve session handling ([b59b570](https://github.com/inference-gateway/ui/commit/b59b57028567772b9134987ceaa9e06efc5c415e))

## [0.4.0-rc.7](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.6...v0.4.0-rc.7) (2025-04-06)

### ♻️ Improvements

* Modularize sign-in logic by creating SigninClient component and streamline provider handling ([cebe9b0](https://github.com/inference-gateway/ui/commit/cebe9b04e18cef0528246fe12f36a469c1cc571e))
* Remove logger.debug statements to clean up client logs ([7d4cbb5](https://github.com/inference-gateway/ui/commit/7d4cbb559346c276bd918b3c7fff3a336dd56db2))

## [0.4.0-rc.6](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.5...v0.4.0-rc.6) (2025-04-06)

### ♻️ Improvements

* Enhance authentication handling and session management ([2214c54](https://github.com/inference-gateway/ui/commit/2214c54694c6c7c0c1d63d7db40f23ab55edfa2f))
* Simplify authentication handling by replacing custom AuthProvider with SessionProvider and enhance session logging ([3307d54](https://github.com/inference-gateway/ui/commit/3307d548136f611d423c74d6b64d996875d9c6f9))

### 🔧 Miscellaneous

* Update UI image version to 0.4.0-rc.5 in Docker Compose ([58aefc9](https://github.com/inference-gateway/ui/commit/58aefc9e04a9ed1bbd11094bb960ed54dafadd26))

## [0.4.0-rc.5](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.4...v0.4.0-rc.5) (2025-04-05)

### ♻️ Improvements

* Refactor logger, use standard logger for both server and client side code ([618ada2](https://github.com/inference-gateway/ui/commit/618ada2692d364d84c5aed530a926a12881dc0db))

### 🔧 Miscellaneous

* Update UI image version to 0.4.0-rc.4 in Docker Compose ([1330bcd](https://github.com/inference-gateway/ui/commit/1330bcda2d1618fc85b91145fbf95e714bd94bd0))

## [0.4.0-rc.4](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.3...v0.4.0-rc.4) (2025-04-05)

### ♻️ Improvements

* Implement a new logging system with Winston and a simple logger for browser and Edge runtime ([3df26fb](https://github.com/inference-gateway/ui/commit/3df26fb65d86bd019a663de80f969ed4ad96aee0))

## [0.4.0-rc.3](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.2...v0.4.0-rc.3) (2025-04-05)

### ✨ Features

* Add authentication support with NextAuth and Keycloak integration ([a143e7e](https://github.com/inference-gateway/ui/commit/a143e7e29dd122257d03f78509b0bcb9c22cbb52))
* Add Structured Logging ([#16](https://github.com/inference-gateway/ui/issues/16)) ([371b4fe](https://github.com/inference-gateway/ui/commit/371b4fef58011bd93a5a55c60f9f00807bfc8831))
* Upgrade NextAuth to v5 and refactor authentication handling ([6e5f93b](https://github.com/inference-gateway/ui/commit/6e5f93bedbfe0813f7a69177858f2b105842202a))

### ♻️ Improvements

* Change environment variable for authentication from NEXT_PUBLIC_AUTH_ENABLED to AUTH_ENABLED since it's only running on the server ([501a3f3](https://github.com/inference-gateway/ui/commit/501a3f3346911970f6739cb4e4b88daa4ba09347))
* Remove commented code for session handling in useChat hook ([a50ef76](https://github.com/inference-gateway/ui/commit/a50ef761dbf660844842e942cede4ade92b2d15a))
* Remove Keycloak test route implementation ([d603c65](https://github.com/inference-gateway/ui/commit/d603c65cccfdf83869de5b327f96c7da611956e1))
* Update import path for Home component in page tests ([c530090](https://github.com/inference-gateway/ui/commit/c53009014a14a1661a66cf5254ffe23bba35953b))

### 🔧 Miscellaneous

* Add logging for session data in Home component ([ff07fb6](https://github.com/inference-gateway/ui/commit/ff07fb6d362ec688a00152f01477d6a4da256950))
* Update @auth/core and related dependencies to latest versions ([44b654e](https://github.com/inference-gateway/ui/commit/44b654ed7bb9f807d9a51ccb1486e695de8f2e5f))

### ✅ Miscellaneous

* Mock NextAuth session in Jest setup for testing ([6837bdf](https://github.com/inference-gateway/ui/commit/6837bdfa5fe4f556249e118e5a00cf3ed0d37f42))

## [0.4.0-rc.2](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.1...v0.4.0-rc.2) (2025-04-04)

### ✨ Features

* Add trustHost option to NextAuth configuration ([baf4a0f](https://github.com/inference-gateway/ui/commit/baf4a0fdfc710c2d820703e2e08999dfd5591edc))

### 🔧 Miscellaneous

* Update Docker Compose to use pre-built UI image instead of local build ([44e1503](https://github.com/inference-gateway/ui/commit/44e150397c764a52efe00bdc9f57b133bf584a6a))

## [0.4.0-rc.1](https://github.com/inference-gateway/ui/compare/v0.3.0...v0.4.0-rc.1) (2025-04-04)

### ✨ Features

* Add authentication support with NextAuth and Keycloak integration ([71b1910](https://github.com/inference-gateway/ui/commit/71b19100b81238de1e6fde562eab8c3b3b430fc8))
* Upgrade NextAuth to v5 and refactor authentication handling ([6102266](https://github.com/inference-gateway/ui/commit/61022660369e1bfa28df3e451b223519f944a63b))

### ♻️ Improvements

* Change environment variable for authentication from NEXT_PUBLIC_AUTH_ENABLED to AUTH_ENABLED since it's only running on the server ([c52d477](https://github.com/inference-gateway/ui/commit/c52d4778e66fcf7ceb46dd45b3bbb5cc9a8906b5))
* Cleanup - remove redundant error logging in model fetching ([ba62749](https://github.com/inference-gateway/ui/commit/ba627499cd6465a46463764cb2585fade3cff7ca))
* Remove commented code for session handling in useChat hook ([d7dd99e](https://github.com/inference-gateway/ui/commit/d7dd99e93c86ccdb9003c855b8f3d7f1e7fc9be4))
* Remove Keycloak test route implementation ([03db017](https://github.com/inference-gateway/ui/commit/03db017bd06915d8e38387157570ddc42458efeb))
* Rename callback props in ChatInterface and MessageInput components ([c3687a7](https://github.com/inference-gateway/ui/commit/c3687a7cf9b9548e72738aedc97065cb64a89702))

### 🔧 Miscellaneous

* Add TODO for additional storage type implementation ([a1aa88a](https://github.com/inference-gateway/ui/commit/a1aa88a9f0edb28d4fe7939504181c6564db7f89))
* Update @auth/core and related dependencies to latest versions ([f3da2fa](https://github.com/inference-gateway/ui/commit/f3da2fabd44324c2514adc7bbcd89bfbebefe43f))

### ✅ Miscellaneous

* Mock NextAuth session in Jest setup for testing ([dc3a0a4](https://github.com/inference-gateway/ui/commit/dc3a0a435e4b5197d6ee15ed30859e540a7113d2))

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
