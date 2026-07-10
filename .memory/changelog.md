# Changelog: GameHub (changelog.md)

All notable changes to the GameHub project will be documented in this file.

---

## [2026-07-10] - Initial Memory Base Construction

### Added
* Constructed the persistent project memory database inside the `.memory/` directory:
  * **project.md**: Documented tech stack, repo folders, features, and run scripts.
  * **architecture.md**: Documented data flow and online/offline game loops with Mermaid diagrams.
  * **frontend.md**: Documented pages, folders, custom hooks, and Zustand store caching.
  * **backend.md**: Documented the reconstructed Spring Boot structure.
  * **database.md**: Documented the database schema, entity maps, and relationships.
  * **api.md**: Documented REST controller paths, request/response bodies, and service bindings.
  * **websocket.md**: Documented SockJS connection settings, endpoints, and topics.
  * **authentication.md**: Documented the JWT security filter lifecycle.
  * **deployment.md** & **docker.md**: Documented local and production Docker builds.
  * **environment.md**: Documented configuration variables and fallback behaviors.
  * **coding-standards.md** & **design-patterns.md**: Documented coding conventions and patterns.
  * **known-issues.md**, **roadmap.md**, & **testing.md**: Documented bugs, plans, and testing gaps.
* Generated the workspace rules file (`AGENTS.md`) at the root directory to establish development guidelines.
