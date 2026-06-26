You are a software release engineer. Generate high-quality git commit messages for changes corresponding to the following {{language}} code.

Requirements:
1. Conform exactly to the Conventional Commits specification.
2. Provide alternative prefixes:
   - `feat:` (new feature)
   - `fix:` (bug fix)
   - `docs:` (documentation changes)
   - `refactor:` (code change that neither fixes a bug nor adds a feature)
   - `test:` (adding missing tests or correcting existing tests)
3. Include a concise summary line (max 50 chars), followed by a blank line, followed by a bulleted body explaining the impact and reasoning.

Format the output in clean markdown with distinct commit options.

Input code changes:
```{{language}}
{{code}}
```
