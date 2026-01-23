# YAML Parsing Error Fixes

## Error in `social media/marketing/promotion/career_master_resume_coach.yaml`

**Error Message:**
```
YAMLException: bad indentation of a mapping entry (12:14)
```

**Location:** Line 12, Column 14

**Problem:**
The `contributor` field has incorrect indentation. It appears to be starting at column 0 (no indentation), but the error is detected at column 14, which suggests there might be mixed spaces/tabs or the line is indented when it shouldn't be, or vice versa.

**Current (Incorrect):**
```yaml
tags:
  - cover-letter
  - linkedin
  - career-transition
contributor: @cjmccarthy65  # ← This line has bad indentation
prompt:
  system: |
```

**Expected Fix:**
The `contributor` field should be at the same indentation level as other root-level keys like `tags` and `prompt` (which means NO indentation):

```yaml
tags:
  - cover-letter
  - linkedin
  - career-transition
contributor: @cjmccarthy65  # ← No spaces before this line
prompt:
  system: |
```

**OR** if the line has extra spaces at the beginning, remove them:

```yaml
tags:
  - cover-letter
  - linkedin
  - career-transition
contributor: @cjmccarthy65  # ← Remove any leading spaces
prompt:
  system: |
```

## Common YAML Indentation Rules

1. **Use spaces, not tabs** - YAML does not allow tabs for indentation
2. **Consistent spacing** - Use the same number of spaces (typically 2) for each indentation level
3. **Root-level keys** should have no indentation
4. **List items** use `- ` (dash followed by space)
5. **Nested keys** should be indented consistently under their parent

## How to Fix in the GitHub Repository

1. Navigate to: `https://github.com/lowtouch-ai/promptstash-templates/blob/main/social%20media/marketing/promotion/career_master_resume_coach.yaml`
2. Click the "Edit" button (pencil icon)
3. Go to line 12
4. Ensure `contributor: @cjmccarthy65` has NO leading spaces (starts at column 0)
5. Commit the changes

## Additional Note

The app now has enhanced error reporting that will log these YAML parsing errors to the console with more details to help debug similar issues in the future.
