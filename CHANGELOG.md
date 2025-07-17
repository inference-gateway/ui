# Changelog

All notable changes to this project will be documented in this file.

## [0.8.1-rc.7](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.6...v0.8.1-rc.7) (2025-07-17)

### 🐛 Bug Fixes

* Refactor GitHub Actions workflow for multi-architecture container builds ([9b91eb6](https://github.com/inference-gateway/ui/commit/9b91eb66986497cf91a2bbead581870259db82df))

## [0.8.1-rc.6](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.5...v0.8.1-rc.6) (2025-07-16)

### 🐛 Bug Fixes

* Remove existing Docker manifest before creating a new one ([c490df6](https://github.com/inference-gateway/ui/commit/c490df6dc7d47bb384a0252398dc70934152b915))

## [0.8.1-rc.5](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.4...v0.8.1-rc.5) (2025-07-16)

### 🐛 Bug Fixes

* Improve Docker manifest creation process and error handling ([209afa6](https://github.com/inference-gateway/ui/commit/209afa6eb2b87848575fd6941c4cb7feec71ad6f))

## [0.8.1-rc.4](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.3...v0.8.1-rc.4) (2025-07-16)

### 🐛 Bug Fixes

* Add some debugging messages ([88b932c](https://github.com/inference-gateway/ui/commit/88b932cc6f8027905e167fe4e78ba39617a17a95))

## [0.8.1-rc.3](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.2...v0.8.1-rc.3) (2025-07-16)

### 🐛 Bug Fixes

* Correct runner name for ARM architecture in GitHub Actions workflow ([2afaf15](https://github.com/inference-gateway/ui/commit/2afaf15753b61b4a4ab1d61c625cc8896b4e7d6f))

## [0.8.1-rc.2](https://github.com/inference-gateway/ui/compare/v0.8.1-rc.1...v0.8.1-rc.2) (2025-07-16)

### 🐛 Bug Fixes

* Back to the original solution, avoid cross-compilation and emulators - use native github runners to build it natively for arm64 and amd64 ([eaf8bb1](https://github.com/inference-gateway/ui/commit/eaf8bb1c7fd0696ddf3b645eb4a584151015ce36))

## [0.8.1-rc.1](https://github.com/inference-gateway/ui/compare/v0.8.0...v0.8.1-rc.1) (2025-07-16)

### 🐛 Bug Fixes

* Simplify Docker image build process ([9f07c19](https://github.com/inference-gateway/ui/commit/9f07c192f9523709d6ee0fefb6c2db529c7e2be7))

### 👷 CI

* Add Claude GitHub Actions workflows for automated code review and assistance ([#46](https://github.com/inference-gateway/ui/issues/46)) ([ce693d4](https://github.com/inference-gateway/ui/commit/ce693d44463207b073c45187652bb3004af92d9b))

### 📚 Documentation

* Add CLAUDE.md guidance file for Claude Code development ([#45](https://github.com/inference-gateway/ui/issues/45)) ([bf0e7c2](https://github.com/inference-gateway/ui/commit/bf0e7c2a59409be4875a5c9f9d2c4589e4086454))

## [0.8.0](https://github.com/inference-gateway/ui/compare/v0.7.1...v0.8.0) (2025-06-02)

### ✨ Features

* MCP Tools Integration Complete Implementation with Examples and Documentation ([#42](https://github.com/inference-gateway/ui/issues/42)) ([a99725c](https://github.com/inference-gateway/ui/commit/a99725c9024f49bea055e63d4b49aefd80337972))

### ♻️ Improvements

* Update devcontainer and documentation for improved clarity and organization ([706fe09](https://github.com/inference-gateway/ui/commit/706fe099146d0c86c7b33efa9bfac9ee157d68ec))

### 📚 Documentation

* Update the examples and the README ([#40](https://github.com/inference-gateway/ui/issues/40)) ([af9fec3](https://github.com/inference-gateway/ui/commit/af9fec3132f5a539e65a7b3393bda123f6c67f29))

### 🔧 Miscellaneous

* Enable GitHub Copilot and configure authentication settings ([9d4af76](https://github.com/inference-gateway/ui/commit/9d4af761ee70a027f79e2397e96cabcf144a8bac))

## [0.7.1](https://github.com/inference-gateway/ui/compare/v0.7.0...v0.7.1) (2025-05-21)

### ♻️ Improvements

* Improve development experience and CD ([#39](https://github.com/inference-gateway/ui/issues/39)) ([8a32d22](https://github.com/inference-gateway/ui/commit/8a32d225eda04b4a6e70285e0ffc98bc25ae5273))

## [0.7.0](https://github.com/inference-gateway/ui/compare/v0.6.2...v0.7.0) (2025-04-30)

### ✨ Features

* Implement web search functionality and enhance message handling ([#36](https://github.com/inference-gateway/ui/issues/36)) ([2b73478](https://github.com/inference-gateway/ui/commit/2b73478ec88dc9d8fad17db23af83602290f3e55)), closes [#38](https://github.com/inference-gateway/ui/issues/38)

## [0.7.0-rc.1](https://github.com/inference-gateway/ui/compare/v0.6.2...v0.7.0-rc.1) (2025-04-29)

### ✨ Features

* Add command dropdown functionality with clear, search, and research options ([4f219a9](https://github.com/inference-gateway/ui/commit/4f219a90820a78416838ef57707587c972fea69e))
* Add message editing functionality and enhance chat interface interactions ([59b1457](https://github.com/inference-gateway/ui/commit/59b1457930216d5170b05200fd1aae42913dc761))
* add RequestBubble component to display cURL requests in ChatArea ([a18dcc0](https://github.com/inference-gateway/ui/commit/a18dcc018b9df91ca0e7cfebcc07408cb8930d05))
* conditionally render RequestBubble in ChatArea based on if we're on development environment ([87a8259](https://github.com/inference-gateway/ui/commit/87a82598f6b4b1a5a477ec445cda18f3b543daee))
* Enhance WebSearchTool with limit parameter and type annotations ([590d520](https://github.com/inference-gateway/ui/commit/590d5205ddd44f126dc51521af03e6c4837d3e98))
* implement FetchPageTool for fetching content from a URL and integrate it into useMessageHandler ([6e604e0](https://github.com/inference-gateway/ui/commit/6e604e0dfe5db3d1f1cfe11b2d89383160b7d798))
* Implement server-side web search functionality with cheerio integration ([d0545ea](https://github.com/inference-gateway/ui/commit/d0545ea323be870c9714d339478706ffacf10d4c))
* Implement web search functionality and enhance message handling ([363b1d5](https://github.com/inference-gateway/ui/commit/363b1d57f55623613e1daef106457210e2f11da4))
* integrate CodeBlock component for formatted JSON display in ToolCallBubble and ToolResponseBubble ([af770c0](https://github.com/inference-gateway/ui/commit/af770c0ac76af3f3849f65ae376dc144992ef3f2))
* pass selectedModel prop to ChatArea for dynamic model selection ([70b1a1e](https://github.com/inference-gateway/ui/commit/70b1a1e908fb27f24a56181e6c31021b80a8d4ef))
* update WebSearchTool to allow additional properties and format search results ([32f64a3](https://github.com/inference-gateway/ui/commit/32f64a39336e5ad29d8f4d5d24d048605d8f4644))

### ♻️ Improvements

* **ci:** Update message to reflect OCI image instead of Docker image in CI workflow ([a28a666](https://github.com/inference-gateway/ui/commit/a28a666b586379b0303809738b3d54237a99b544))
* enhance logger to better format object arguments and remove HTML response preview logging ([97645f0](https://github.com/inference-gateway/ui/commit/97645f0f2b811b9d48ad54da5cf57f381d2edafa))
* Improve search input handling and focus management in ModelSelector component ([a234cdf](https://github.com/inference-gateway/ui/commit/a234cdfbc106f9aca3137713708aa8838e84a896))
* integrate SYSTEM_PROMPT and tools into message handling and request bubble components ([db85bcf](https://github.com/inference-gateway/ui/commit/db85bcf74704c08d28b36c6b6d2a73f3d58cad0d))
* Move the state from page-client  to  InputArea so it can be self-contained ([2daf3e9](https://github.com/inference-gateway/ui/commit/2daf3e91a0a184fc279b80ef81e54f7de6cbe75c))
* Optimize command options definition using useMemo for performance ([fa948c9](https://github.com/inference-gateway/ui/commit/fa948c9df27f4934421f22f6f9f0bd3ec2196185))
* Optimize textarea height management in InputArea component ([0d6e7cf](https://github.com/inference-gateway/ui/commit/0d6e7cf6fb3f61091913d11a882f85aedd2c9dae))
* Remove ChatInterface component and associated logic ([d7c8626](https://github.com/inference-gateway/ui/commit/d7c86264ce14588df4a328ff9c4668829965ccdc))
* Remove deep research functionality and related tests for simplification ([76be0de](https://github.com/inference-gateway/ui/commit/76be0ded81b1ea01fdb6385d604a1abf1629e2c2))
* Remove deprecated chat-related custom hooks and components - simplify unnecessary abstraction ([4d35e5d](https://github.com/inference-gateway/ui/commit/4d35e5d8d46c2bac5f976ec76c34c2f87af253a5))
* Remove useChat hook and related mocks from tests after its deletion ([a06c236](https://github.com/inference-gateway/ui/commit/a06c23619235561503bd005eb6c9eeaa70ff8b3b))
* Rename build step to clarify purpose in CI workflow - it's not a docker image it's an OCI image, could be build with any other OCI compatible tool ([32a6be6](https://github.com/inference-gateway/ui/commit/32a6be63e7f21ec6684754db794448d6280c4960))
* Simplify chat completion request handling and remove unused dependencies ([d4c37f3](https://github.com/inference-gateway/ui/commit/d4c37f3ebcbcf92fd33bb55ec66506495ae2ec91))
* Simplify over-use of custom hooks - remove unnecessary abstractions, easier to maintain like this ([d6f8bdb](https://github.com/inference-gateway/ui/commit/d6f8bdb920a6abe56ea976c2686ea937369ee0b3))
* Update createdAt to use ISO string format in LocalStorageService tests ([ea33b65](https://github.com/inference-gateway/ui/commit/ea33b65d1e3d173e343865a830a5ebb28aa54913))

### 🐛 Bug Fixes

* Add type annotation for message in handleSendMessage test ([27df71f](https://github.com/inference-gateway/ui/commit/27df71f5dc45be3ee0381817858e4f437fde400b))
* Adjust layout in ChatArea component by modifying container width and padding ([c566d02](https://github.com/inference-gateway/ui/commit/c566d02f552a3b6a6e848f52798179c82d6fdf50))
* Import React explicitly and adjust paragraph rendering in ChatArea component, div cannot be a child of a p tag ([e92251c](https://github.com/inference-gateway/ui/commit/e92251c5ddfb15c7ec35c71e654d9c9967dce1f8))
* Remove explicit React import and adjust paragraph rendering in ChatArea component ([5fe09cb](https://github.com/inference-gateway/ui/commit/5fe09cb7ccfe1f36468f163d01fd14d3cae07ba8))
* Remove oas-download command from pre-commit hook ([14ea398](https://github.com/inference-gateway/ui/commit/14ea398ab2e4e2768d8d3f50a564e1f447488f66))
* Reset chat messages and update session title on '/reset' or '/clear' command ([efbc2aa](https://github.com/inference-gateway/ui/commit/efbc2aa886a198374b9084695af8ee11c37f76a7))
* Set default title for new chat sessions ([3049834](https://github.com/inference-gateway/ui/commit/3049834586e6c584c75afb04ea4c0fb1abd079eb))
* Simplify content rendering in ThinkingBubble component by removing unnecessary loading indicators ([cd74b14](https://github.com/inference-gateway/ui/commit/cd74b146dffcbf17e1aff3684de3a7ce4f6263e8))
* Simplify token usage state update logic in PageClient component ([28dbd58](https://github.com/inference-gateway/ui/commit/28dbd5896bafd1050072ce5f55e6d5f2eb25da40))
* Update animation classes in ChatArea and ThinkingBubble components for consistency ([1b658f0](https://github.com/inference-gateway/ui/commit/1b658f08cc43eb2bdee2fc12ed0a535aefe6402f))
* Update API request headers to accept text/event-stream for streaming responses ([ed56718](https://github.com/inference-gateway/ui/commit/ed56718e6bd7dbb5e57a46fadeaf8e3e8dc7b45a))
* Update chat session title based on message content and enhance session management ([fb0792b](https://github.com/inference-gateway/ui/commit/fb0792bc5f3b90104c1af5049671cdcf069fbd19))
* Update chat session title logic to allow longer titles and ensure state is set correctly ([1bd7ae8](https://github.com/inference-gateway/ui/commit/1bd7ae8ad723fa661ae2890b09c3452fbeb42d8b))
* Update loading indicators in ChatArea and ThinkingBubble components for improved visibility and animation ([88b30eb](https://github.com/inference-gateway/ui/commit/88b30eb8ac312727e2d67a414c75300c2f3077e9))
* Update SYSTEM_PROMPT to include the current date for context in AI interactions ([a1de30c](https://github.com/inference-gateway/ui/commit/a1de30c9080252c3613bc6752c2f9ce5534036d5))

### 🔧 Miscellaneous

* Add a TODO ([a75a989](https://github.com/inference-gateway/ui/commit/a75a989b0bfc8dca885b90e655aa7f7f4fead457))

### 🎨 Miscellaneous

* Remove unnecessary z-index from button styles in tool call and response bubbles ([290e6fb](https://github.com/inference-gateway/ui/commit/290e6fb52c2221e64af0cd223100fd5277be86ed))

### ✅ Miscellaneous

* Add comprehensive tests for runAgentLoop functionality in agent module ([44f68d8](https://github.com/inference-gateway/ui/commit/44f68d89ff9d4ce89e3fc5cb7f3b2d1e07f0ccdd))

## [0.6.2](https://github.com/inference-gateway/ui/compare/v0.6.1...v0.6.2) (2025-04-25)

### ♻️ Improvements

* Improve helm configurations tuned for production ([#34](https://github.com/inference-gateway/ui/issues/34)) ([a1db2d4](https://github.com/inference-gateway/ui/commit/a1db2d4595fb79d0dac25cdf4f9cad90c594b5cd))

### 🔧 Miscellaneous

* Enhance testing guidelines with TDD requirements and coverage goals for Copilot ([65e9c3c](https://github.com/inference-gateway/ui/commit/65e9c3cc8e9ef122bb72fcd8f276272a24f12904))

## [0.6.2-rc.2](https://github.com/inference-gateway/ui/compare/v0.6.2-rc.1...v0.6.2-rc.2) (2025-04-25)

### ♻️ Improvements

* Move provider retrieval after session handling in signin page and throw the NextAuth error so NextJS can handle the redirect ([cd27665](https://github.com/inference-gateway/ui/commit/cd27665bcc02ed01e64a3b41ee0d5b26c6dbb732))

### 📚 Documentation

* Update README and Taskfile with deployment options for Ingress and authentication ([ef047c6](https://github.com/inference-gateway/ui/commit/ef047c6c6ae27b2b15b41a6a33493fb23dd39c32))

## [0.6.2-rc.1](https://github.com/inference-gateway/ui/compare/v0.6.1...v0.6.2-rc.1) (2025-04-24)

### ♻️ Improvements

* Update authentication handling and improve configuration for inference-gateway-ui ([253d2b4](https://github.com/inference-gateway/ui/commit/253d2b45797047e46f89f0bd5f455ab49cd3a9ab))

### 🔧 Miscellaneous

* Enhance testing guidelines with TDD requirements and coverage goals for Copilot ([65e9c3c](https://github.com/inference-gateway/ui/commit/65e9c3cc8e9ef122bb72fcd8f276272a24f12904))

## [0.6.1](https://github.com/inference-gateway/ui/compare/v0.6.0...v0.6.1) (2025-04-24)

### 🐛 Bug Fixes

* Update environment variable from AUTH_ENABLED to ENABLE_AUTH for consistency with the backend ([#32](https://github.com/inference-gateway/ui/issues/32)) ([7eee497](https://github.com/inference-gateway/ui/commit/7eee4973f80e2f9e0b8775dd7c70c3d1f3688f46)), closes [#33](https://github.com/inference-gateway/ui/issues/33)

## [0.6.1-rc.1](https://github.com/inference-gateway/ui/compare/v0.6.0...v0.6.1-rc.1) (2025-04-24)

### 🐛 Bug Fixes

* Update environment variable from AUTH_ENABLED to ENABLE_AUTH for consistency with the backend ([19bbd5c](https://github.com/inference-gateway/ui/commit/19bbd5c9448d5dccaf94037473cd3023328e7765))

### 🔧 Miscellaneous

* Update comment in Session interface for clarity on ENABLE_AUTH usage ([8d177f3](https://github.com/inference-gateway/ui/commit/8d177f3033ee16886e4757360967fbbdcca54fd7))

## [0.6.0](https://github.com/inference-gateway/ui/compare/v0.5.0...v0.6.0) (2025-04-24)

### ✨ Features

* Redesign the chat interface ([#31](https://github.com/inference-gateway/ui/issues/31)) ([e09c906](https://github.com/inference-gateway/ui/commit/e09c906749b401627129c0b08105ced2887351c7))

### 🐛 Bug Fixes

* **release:** Update package-lock.json version to 0.5.0 and add it via git automatically ([8b343ba](https://github.com/inference-gateway/ui/commit/8b343ba12211a653fc7eb0eded8f390431c1f5c8))

### 📚 Documentation

* Add acceptance criteria section to feature request template ([c78ef06](https://github.com/inference-gateway/ui/commit/c78ef067922a9fa6e09450a3e48bf0a77e8f39fe))
* **kubernetes:** Update Helm chart version to 0.5.0 in deployment examples ([34d2856](https://github.com/inference-gateway/ui/commit/34d2856320f99a6c75c1a04e58f60e6c5400bee2))

### 🔧 Miscellaneous

* Add feature request template ([71463cb](https://github.com/inference-gateway/ui/commit/71463cb74e3807fac149afb72fdb38664c944347))

### 📦 Miscellaneous

* Add pre-commit hook with common tasks to run locally before commiting ([#19](https://github.com/inference-gateway/ui/issues/19)) ([8787ae4](https://github.com/inference-gateway/ui/commit/8787ae45aa0f7f59c9dad0d3107a81d3edb9d2d2))
* **devcontainer:** Enable GitHub Pull Requests features in VSCode settings ([8e985c2](https://github.com/inference-gateway/ui/commit/8e985c2e8639e42dd33bb3a27d85fac5d07d580c))

## [0.5.0](https://github.com/inference-gateway/ui/compare/v0.4.0...v0.5.0) (2025-04-15)

### ✨ Features

- Implement an Helm Chart ([#17](https://github.com/inference-gateway/ui/issues/17)) ([28a311d](https://github.com/inference-gateway/ui/commit/28a311d76edd66963fe49fa4d96a52e7f503ae8f)), closes [#18](https://github.com/inference-gateway/ui/issues/18)

## [0.5.0-rc.7](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.6...v0.5.0-rc.7) (2025-04-15)

### ♻️ Improvements

- Add INFERENCE_GATEWAY_URL environment variable for production deployment ([2055ec4](https://github.com/inference-gateway/ui/commit/2055ec4b4e0c5d2dc357abe3b9f8a81162c0cc6e))

### 🐛 Bug Fixes

- Format helm upgrade command for better readability in README ([ac9e40d](https://github.com/inference-gateway/ui/commit/ac9e40dac7bcf36177362f90a208695763d2c9e9))
- Remove default parameters ([3e3c460](https://github.com/inference-gateway/ui/commit/3e3c46094778a414956e5a548fdca9c23c7c4720))

### 📚 Documentation

- Update helm upgrade command to work on different terminals ([1a11526](https://github.com/inference-gateway/ui/commit/1a11526ceef60f889a3359a4d28ad65c09ea6f9a))

### 🔧 Miscellaneous

- Add ctlptl installation requirement for local Kubernetes cluster management ([544c735](https://github.com/inference-gateway/ui/commit/544c73526f87914ec859ea47ebd33267a62f5217))
- update CHART_VERSION to 0.5.0-rc.6 ([4496534](https://github.com/inference-gateway/ui/commit/4496534e77f31ae5db371322051ffc9d31fa5645))
- update helm command syntax for UI deployment for consistency ([417e424](https://github.com/inference-gateway/ui/commit/417e424cfc1db03bd6d1111e4fbc55cfe9b1ac35))
- Update inference-gateway dependency version to 0.5.4 ([e47b790](https://github.com/inference-gateway/ui/commit/e47b7908923749f798c2b5168276f87f501213f8))
- Update README and Taskfile for improved deployment instructions and clarity ([1b14159](https://github.com/inference-gateway/ui/commit/1b14159f2d3854b290dfa641bc574c0a026fe1a2))

## [0.5.0-rc.6](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.5...v0.5.0-rc.6) (2025-04-14)

### 🐛 Bug Fixes

- update CHART_VERSION and change chart source to OCI registry ([ee1f09d](https://github.com/inference-gateway/ui/commit/ee1f09dd052d3f403a227c15f1eb4ddae814c8c8))
- update liveness and readiness probe paths to /api/health ([1b99555](https://github.com/inference-gateway/ui/commit/1b995555ceadd4558584252b5250081cc499f8d0))

## [0.5.0-rc.5](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.4...v0.5.0-rc.5) (2025-04-14)

### 👷 CI

- Add @semantic-release/npm to verifyConditions and plugins for npm integration ([d632e3f](https://github.com/inference-gateway/ui/commit/d632e3fea5a97c601cb49823a819d866ec09cc13))

### 🔧 Miscellaneous

- Remove obsolete inference-gateway-0.5.0.tgz chart file ([27ba18f](https://github.com/inference-gateway/ui/commit/27ba18f05a916b08b6f150aea01166baaf7f4d76))

## [0.5.0-rc.4](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.3...v0.5.0-rc.4) (2025-04-14)

### 🐛 Bug Fixes

- **ci:** Move permissions to the top level in GitHub Actions workflow ([a2a9e8d](https://github.com/inference-gateway/ui/commit/a2a9e8d3346c111de9a3f28193b2f28dca2fdc7b))

## [0.5.0-rc.3](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.2...v0.5.0-rc.3) (2025-04-14)

### 🐛 Bug Fixes

- Correct chart name in Chart.yaml to match application name ([f7f799d](https://github.com/inference-gateway/ui/commit/f7f799d692e42fba9f313aeb0e098f12adbe87d1))

## [0.5.0-rc.2](https://github.com/inference-gateway/ui/compare/v0.5.0-rc.1...v0.5.0-rc.2) (2025-04-14)

### ♻️ Improvements

- Add Inference Gateway UI Helm chart with deployment, service, and ingress configurations ([9e7a58e](https://github.com/inference-gateway/ui/commit/9e7a58ef7f46808d940c281c638e57d60022ae0e))

### 🔧 Miscellaneous

- Update release configuration to use inference-gateway-ui Chart.yaml ([576461c](https://github.com/inference-gateway/ui/commit/576461c90282f81386449447412c04bf4af6d368))

## [0.5.0-rc.1](https://github.com/inference-gateway/ui/compare/v0.4.0...v0.5.0-rc.1) (2025-04-14)

### ✨ Features

- Add Chart.lock for inference-gateway dependency and update .gitignore for chart dependencies ([18bd761](https://github.com/inference-gateway/ui/commit/18bd761be6cb0e01229287ae390f4d5dfa7fa8dc))
- Add GitHub Copilot instructions for Inference Gateway UI ([cb7d7ba](https://github.com/inference-gateway/ui/commit/cb7d7bae2e394e0d9ba4ec85e7430906cab5a3da))
- Add health check endpoint for service status verification ([83b1185](https://github.com/inference-gateway/ui/commit/83b118565af5e136ecc779a3d14d8b3bcf203a10))
- Add Helm chart for Inference Gateway UI with deployment, service, and ingress configurations ([0849f9d](https://github.com/inference-gateway/ui/commit/0849f9dd02f8b6560673f9f62cbc69d1e3637c89))
- Add related repositories section to GitHub Copilot instructions ([4ce5854](https://github.com/inference-gateway/ui/commit/4ce5854d79703c046d78f6d7752baf1d3c270671))
- Update ingress configuration with Nginx settings and CORS support ([3603f50](https://github.com/inference-gateway/ui/commit/3603f507143bd7156d2e30ad48163f2859a0044c))

### 🐛 Bug Fixes

- Update helm commands to use --set-string for environment variables ([f132a52](https://github.com/inference-gateway/ui/commit/f132a52491b588e8c2c140ef44285e35d2c2cbda))

### 📚 Documentation

- Add fullnameOverride for gateway and improve helm command formatting ([63b22c9](https://github.com/inference-gateway/ui/commit/63b22c97d2eb890c3b19bc11126179772bc9918e))
- Add https port ([3eab9a5](https://github.com/inference-gateway/ui/commit/3eab9a5fa9756c4f6cb43bd42f355b88636504e5))
- **examples:** Add kubernetes example ([9bebe3f](https://github.com/inference-gateway/ui/commit/9bebe3f567a397bf0c4c66c877083d6b5c89e1af))
- Update helm command to use unquoted set parameters for ingress configuration ([06fefda](https://github.com/inference-gateway/ui/commit/06fefda5eff77624fda0fd1d4b64194619ad970e))

### 🔧 Miscellaneous

- Add runArgs to devcontainer configuration for local host resolution ([c09251e](https://github.com/inference-gateway/ui/commit/c09251ebf90433b242d94bfdbb2e50ae8d9b9fdb))
- Move exec plugin to the correct position in the release configuration for clarity ([c8eb8ea](https://github.com/inference-gateway/ui/commit/c8eb8ea11714570f0d0b2f69f345d972e4b0fc91))
- Update UI release name and add namespace creation to helm commands ([afb6520](https://github.com/inference-gateway/ui/commit/afb6520693fb6aba0d6f7035c120f5d2d42ee9b9))

### 📦 Miscellaneous

- Add Helm autocompletion to Zsh configuration in Dockerfile ([bb9035e](https://github.com/inference-gateway/ui/commit/bb9035e494769791739162076bb6eb619ec9f54b))
- Update Dockerfile to install kubectl, k3d, and ctlptl with autocompletion support ([8385dfc](https://github.com/inference-gateway/ui/commit/8385dfc66ad5ee1d86442fd3af41f8735f8e1fab))

### 🔒 Security

- Update security context to set runAsUser to 1001 which is nextjs user ([51205cc](https://github.com/inference-gateway/ui/commit/51205cceabc9f14169e77e45ca000f7464342e60))

## [0.4.0](https://github.com/inference-gateway/ui/compare/v0.3.0...v0.4.0) (2025-04-06)

### ✨ Features

- Add authentication support with NextAuth and Keycloak integration ([#14](https://github.com/inference-gateway/ui/issues/14)) ([2db6754](https://github.com/inference-gateway/ui/commit/2db675439e3800eb13afeb60c4341248038619cf)), closes [#15](https://github.com/inference-gateway/ui/issues/15)
- Add Structured Logging ([#16](https://github.com/inference-gateway/ui/issues/16)) ([371b4fe](https://github.com/inference-gateway/ui/commit/371b4fef58011bd93a5a55c60f9f00807bfc8831))

### ♻️ Improvements

- Rename callback props in ChatInterface and MessageInput components ([c3687a7](https://github.com/inference-gateway/ui/commit/c3687a7cf9b9548e72738aedc97065cb64a89702))

### 🔧 Miscellaneous

- Add TODO for additional storage type implementation ([a1aa88a](https://github.com/inference-gateway/ui/commit/a1aa88a9f0edb28d4fe7939504181c6564db7f89))

## [0.4.0-rc.8](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.7...v0.4.0-rc.8) (2025-04-06)

### ♻️ Improvements

- Update hooks and components for client-side rendering and improve session handling ([b59b570](https://github.com/inference-gateway/ui/commit/b59b57028567772b9134987ceaa9e06efc5c415e))

## [0.4.0-rc.7](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.6...v0.4.0-rc.7) (2025-04-06)

### ♻️ Improvements

- Modularize sign-in logic by creating SigninClient component and streamline provider handling ([cebe9b0](https://github.com/inference-gateway/ui/commit/cebe9b04e18cef0528246fe12f36a469c1cc571e))
- Remove logger.debug statements to clean up client logs ([7d4cbb5](https://github.com/inference-gateway/ui/commit/7d4cbb559346c276bd918b3c7fff3a336dd56db2))

## [0.4.0-rc.6](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.5...v0.4.0-rc.6) (2025-04-06)

### ♻️ Improvements

- Enhance authentication handling and session management ([2214c54](https://github.com/inference-gateway/ui/commit/2214c54694c6c7c0c1d63d7db40f23ab55edfa2f))
- Simplify authentication handling by replacing custom AuthProvider with SessionProvider and enhance session logging ([3307d54](https://github.com/inference-gateway/ui/commit/3307d548136f611d423c74d6b64d996875d9c6f9))

### 🔧 Miscellaneous

- Update UI image version to 0.4.0-rc.5 in Docker Compose ([58aefc9](https://github.com/inference-gateway/ui/commit/58aefc9e04a9ed1bbd11094bb960ed54dafadd26))

## [0.4.0-rc.5](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.4...v0.4.0-rc.5) (2025-04-05)

### ♻️ Improvements

- Refactor logger, use standard logger for both server and client side code ([618ada2](https://github.com/inference-gateway/ui/commit/618ada2692d364d84c5aed530a926a12881dc0db))

### 🔧 Miscellaneous

- Update UI image version to 0.4.0-rc.4 in Docker Compose ([1330bcd](https://github.com/inference-gateway/ui/commit/1330bcda2d1618fc85b91145fbf95e714bd94bd0))

## [0.4.0-rc.4](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.3...v0.4.0-rc.4) (2025-04-05)

### ♻️ Improvements

- Implement a new logging system with Winston and a simple logger for browser and Edge runtime ([3df26fb](https://github.com/inference-gateway/ui/commit/3df26fb65d86bd019a663de80f969ed4ad96aee0))

## [0.4.0-rc.3](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.2...v0.4.0-rc.3) (2025-04-05)

### ✨ Features

- Add authentication support with NextAuth and Keycloak integration ([a143e7e](https://github.com/inference-gateway/ui/commit/a143e7e29dd122257d03f78509b0bcb9c22cbb52))
- Add Structured Logging ([#16](https://github.com/inference-gateway/ui/issues/16)) ([371b4fe](https://github.com/inference-gateway/ui/commit/371b4fef58011bd93a5a55c60f9f00807bfc8831))
- Upgrade NextAuth to v5 and refactor authentication handling ([6e5f93b](https://github.com/inference-gateway/ui/commit/6e5f93bedbfe0813f7a69177858f2b105842202a))

### ♻️ Improvements

- Change environment variable for authentication from NEXT_PUBLIC_AUTH_ENABLED to AUTH_ENABLED since it's only running on the server ([501a3f3](https://github.com/inference-gateway/ui/commit/501a3f3346911970f6739cb4e4b88daa4ba09347))
- Remove commented code for session handling in useChat hook ([a50ef76](https://github.com/inference-gateway/ui/commit/a50ef761dbf660844842e942cede4ade92b2d15a))
- Remove Keycloak test route implementation ([d603c65](https://github.com/inference-gateway/ui/commit/d603c65cccfdf83869de5b327f96c7da611956e1))
- Update import path for Home component in page tests ([c530090](https://github.com/inference-gateway/ui/commit/c53009014a14a1661a66cf5254ffe23bba35953b))

### 🔧 Miscellaneous

- Add logging for session data in Home component ([ff07fb6](https://github.com/inference-gateway/ui/commit/ff07fb6d362ec688a00152f01477d6a4da256950))
- Update @auth/core and related dependencies to latest versions ([44b654e](https://github.com/inference-gateway/ui/commit/44b654ed7bb9f807d9a51ccb1486e695de8f2e5f))

### ✅ Miscellaneous

- Mock NextAuth session in Jest setup for testing ([6837bdf](https://github.com/inference-gateway/ui/commit/6837bdfa5fe4f556249e118e5a00cf3ed0d37f42))

## [0.4.0-rc.2](https://github.com/inference-gateway/ui/compare/v0.4.0-rc.1...v0.4.0-rc.2) (2025-04-04)

### ✨ Features

- Add trustHost option to NextAuth configuration ([baf4a0f](https://github.com/inference-gateway/ui/commit/baf4a0fdfc710c2d820703e2e08999dfd5591edc))

### 🔧 Miscellaneous

- Update Docker Compose to use pre-built UI image instead of local build ([44e1503](https://github.com/inference-gateway/ui/commit/44e150397c764a52efe00bdc9f57b133bf584a6a))

## [0.4.0-rc.1](https://github.com/inference-gateway/ui/compare/v0.3.0...v0.4.0-rc.1) (2025-04-04)

### ✨ Features

- Add authentication support with NextAuth and Keycloak integration ([71b1910](https://github.com/inference-gateway/ui/commit/71b19100b81238de1e6fde562eab8c3b3b430fc8))
- Upgrade NextAuth to v5 and refactor authentication handling ([6102266](https://github.com/inference-gateway/ui/commit/61022660369e1bfa28df3e451b223519f944a63b))

### ♻️ Improvements

- Change environment variable for authentication from NEXT_PUBLIC_AUTH_ENABLED to AUTH_ENABLED since it's only running on the server ([c52d477](https://github.com/inference-gateway/ui/commit/c52d4778e66fcf7ceb46dd45b3bbb5cc9a8906b5))
- Cleanup - remove redundant error logging in model fetching ([ba62749](https://github.com/inference-gateway/ui/commit/ba627499cd6465a46463764cb2585fade3cff7ca))
- Remove commented code for session handling in useChat hook ([d7dd99e](https://github.com/inference-gateway/ui/commit/d7dd99e93c86ccdb9003c855b8f3d7f1e7fc9be4))
- Remove Keycloak test route implementation ([03db017](https://github.com/inference-gateway/ui/commit/03db017bd06915d8e38387157570ddc42458efeb))
- Rename callback props in ChatInterface and MessageInput components ([c3687a7](https://github.com/inference-gateway/ui/commit/c3687a7cf9b9548e72738aedc97065cb64a89702))

### 🔧 Miscellaneous

- Add TODO for additional storage type implementation ([a1aa88a](https://github.com/inference-gateway/ui/commit/a1aa88a9f0edb28d4fe7939504181c6564db7f89))
- Update @auth/core and related dependencies to latest versions ([f3da2fa](https://github.com/inference-gateway/ui/commit/f3da2fabd44324c2514adc7bbcd89bfbebefe43f))

### ✅ Miscellaneous

- Mock NextAuth session in Jest setup for testing ([dc3a0a4](https://github.com/inference-gateway/ui/commit/dc3a0a435e4b5197d6ee15ed30859e540a7113d2))

## [0.3.0](https://github.com/inference-gateway/ui/compare/v0.2.1...v0.3.0) (2025-04-03)

### ✨ Features

- Add reasoning content to chunk message in OpenAPI specification ([c40067e](https://github.com/inference-gateway/ui/commit/c40067ecaa32823c7ce208cdba197f5ad295913d))
- Implement local storage for chat history ([#13](https://github.com/inference-gateway/ui/issues/13)) ([0ea4e9f](https://github.com/inference-gateway/ui/commit/0ea4e9f1e20f308c330965cc3aead1b5ff2523d5))

## [0.2.1](https://github.com/inference-gateway/ui/compare/v0.2.0...v0.2.1) (2025-03-31)

### ♻️ Improvements

- Use Inference-Gateway TypeScript SDK ([#12](https://github.com/inference-gateway/ui/issues/12)) ([e5c93b3](https://github.com/inference-gateway/ui/commit/e5c93b3376c73c9afebc22df05de6afa57a9c1d3))

## [0.2.0](https://github.com/inference-gateway/ui/compare/v0.1.8...v0.2.0) (2025-03-30)

### ✨ Features

- Implement Streaming Responses ([#10](https://github.com/inference-gateway/ui/issues/10)) ([bf04a6b](https://github.com/inference-gateway/ui/commit/bf04a6baf69c8c7a7c36ffb579caff594d3a4867))

## [0.1.8](https://github.com/inference-gateway/ui/compare/v0.1.7...v0.1.8) (2025-03-30)

### ♻️ Improvements

- Remove default model selection and disable the input text field when no model is selected ([#8](https://github.com/inference-gateway/ui/issues/8)) ([4e40536](https://github.com/inference-gateway/ui/commit/4e40536e49285780a666916b6ba1f8956a342240))

### 📚 Documentation

- Update README to include additional badges for release and artifacts status ([#9](https://github.com/inference-gateway/ui/issues/9)) ([0e38600](https://github.com/inference-gateway/ui/commit/0e3860025d67ada57ac8879e76b567733fa86bff))

## [0.1.7](https://github.com/inference-gateway/ui/compare/v0.1.6...v0.1.7) (2025-03-29)

### ♻️ Improvements

- Optimize Container Image Size ([#5](https://github.com/inference-gateway/ui/issues/5)) ([5c7a898](https://github.com/inference-gateway/ui/commit/5c7a89839c9cd0aef79b35fb30bfe0c841104bd5))

## [0.1.7-rc.2](https://github.com/inference-gateway/ui/compare/v0.1.7-rc.1...v0.1.7-rc.2) (2025-03-29)

### 👷 CI

- **workflow:** update artifacts.yml to conditionally enable latest version for non-rc tags ([66611e7](https://github.com/inference-gateway/ui/commit/66611e7aa2a17f9846450fc022959665ccb7416d))

## [0.1.7-rc.1](https://github.com/inference-gateway/ui/compare/v0.1.6...v0.1.7-rc.1) (2025-03-29)

### 🔧 Miscellaneous

- **devcontainer:** update Dockerfile to install GitHub CLI and improve package installation ([65b37ab](https://github.com/inference-gateway/ui/commit/65b37abac8a0ae135b2c2cdaaf70df7e6d6ce37d))
- **docker-compose:** set pull_policy to always for services ([6a2230a](https://github.com/inference-gateway/ui/commit/6a2230a597fd316e0687d249801e551072c63bc0))

### 📦 Miscellaneous

- **docker:** optimize Dockerfile and update .dockerignore for improved production build process ([21bcab7](https://github.com/inference-gateway/ui/commit/21bcab7c1c447a3e416ac520f3c6a87b26205c58))

## [0.1.6](https://github.com/inference-gateway/ui/compare/v0.1.5...v0.1.6) (2025-03-29)

### 👷 CI

- **workflow:** Remove unnecessary release event types from artifacts workflow ([7a85ca4](https://github.com/inference-gateway/ui/commit/7a85ca4c05d161284f335be518fc959a1b372ba4))
- **workflow:** Update container build job to support multiple OS platforms ([4d62474](https://github.com/inference-gateway/ui/commit/4d624743e615836de8c5da251ecff3b830f67c23))

## [0.1.5](https://github.com/inference-gateway/ui/compare/v0.1.4...v0.1.5) (2025-03-29)

### 👷 CI

- **workflow:** Add GITHUB_TOKEN to release workflow for authentication ([77a0271](https://github.com/inference-gateway/ui/commit/77a0271315fa3a303f76787c73913a49a73fe79e))
- **workflow:** Add support for multiple platforms in artifacts workflow ([cc39e0d](https://github.com/inference-gateway/ui/commit/cc39e0d62e9525866c7e5c6d2c5cd9166afaf636))
- **workflow:** Disable GPG signing for commits in release workflow ([09fb7c6](https://github.com/inference-gateway/ui/commit/09fb7c6e89aa3c5bd9ffcfb907ccc1f28a8e67b7))
- **workflow:** Set Git author and committer information for GitHub Actions ([0cf3cdc](https://github.com/inference-gateway/ui/commit/0cf3cdcb1155da4a2d32c6093dda00a1e0e3b7c4))
- **workflow:** Specify owner and repositories for GitHub App authentication ([1227dc3](https://github.com/inference-gateway/ui/commit/1227dc363166597c2e0dc51f1829bc45a7b76692))
- **workflow:** Update container build environment to Ubuntu 24.04 ([acbef78](https://github.com/inference-gateway/ui/commit/acbef78118d81eb7afa58e1a426c72aa39c52bce))
- **workflow:** Update release workflow to use GitHub App for authentication ([7b05671](https://github.com/inference-gateway/ui/commit/7b056711b6711e444e7411cb308be7b3714e728d))

### 📦 Miscellaneous

- **devcontainer:** Add GitHub Actions extension to development container ([8ba9b3d](https://github.com/inference-gateway/ui/commit/8ba9b3d11a0e900ee97c76fc9f50bed0e3c5dda4))

## [0.1.4](https://github.com/inference-gateway/ui/compare/v0.1.3...v0.1.4) (2025-03-29)

### 👷 CI

- **workflow:** Add 'released' event type to artifacts workflow ([b9dd210](https://github.com/inference-gateway/ui/commit/b9dd210ac49de43f067d0ed4e6c65d683f1569da))

### 🎨 Miscellaneous

- **workflow:** Rename sign-containers job to sign_containers for consistency ([813bd6a](https://github.com/inference-gateway/ui/commit/813bd6a0f2110ee45051ddecf6a9bfa3e9656970))

## [0.1.3](https://github.com/inference-gateway/ui/compare/v0.1.2...v0.1.3) (2025-03-28)

### 👷 CI

- **artifacts:** Update Docker image signing process and add latest tag support ([f868f8b](https://github.com/inference-gateway/ui/commit/f868f8b3780151cd7f71da763782448b5b66b469))

## [0.1.2](https://github.com/inference-gateway/ui/compare/v0.1.1...v0.1.2) (2025-03-28)

### 🐛 Bug Fixes

- **workflow:** Add 'created' event type for release and enable manual workflow dispatch ([c4d754b](https://github.com/inference-gateway/ui/commit/c4d754b0de7ea4a90576bafe485a7ce232c18663))

## [0.1.1](https://github.com/inference-gateway/ui/compare/v0.1.0...v0.1.1) (2025-03-28)

### 🐛 Bug Fixes

- **workflow:** Change release event type from 'publish' to 'published' ([e9d7044](https://github.com/inference-gateway/ui/commit/e9d704482a4320312230f4a1ce8518453414ed0d))
