## Commit Message Header

See https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: components|hooks|pages|providers|utils|common
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```
The `<type>` and `<summary>` fields are mandatory, the (`<scope>`) field is optional.

## Type 

Must be one of the following:

| Type         | Description                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------------|
| **build**    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| **ci**       | Changes to our CI configuration files and scripts (examples: Github Actions, SauceLabs)             |
| **docs**     | Documentation only changes                                                                          |
| **feat**     | A new feature                                                                                       |
| **fix**      | A bug fix                                                                                           |
| **perf**     | A code change that improves performance                                                             |
| **refactor** | A code change that neither fixes a bug nor adds a feature                                           |
| **test**     | Adding missing tests or correcting existing tests                                                   |

## What triggers a **major** bump

| Version bump | Triggered by                              | Example                          |
| ------------ | ----------------------------------------- | -------------------------------- |
| **Major**    | `!` or `BREAKING CHANGE:`                 | `feat!: drop Node 14 support`    |
| **Minor**    | `feat`                                    | `feat: add new OAuth login`      |
| **Patch**    | `fix`, `perf`                             | `fix: handle empty input`        |
| **None**     | `docs`, `build`, `ci`, `refactor`, `test` | `docs: update API usage section` |
