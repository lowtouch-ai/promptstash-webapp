# PromptStash Permalinks Documentation

PromptStash supports powerful permalink functionality that allows you to create shareable URLs for specific templates, filters, and searches. All permalink parameters can be combined to create precise, shareable views of the template library.

## Overview

Permalinks enable you to:
- Share direct links to specific templates
- Share filtered views by category, tags, or search
- Bookmark frequently used filter combinations
- Create curated collections for teams or documentation

## URL Parameters

### Template Permalink: `?y=<relative_yaml_path>`

Opens a specific template directly in the editing workspace.

**Example:**
```
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml
```

**Behavior:**
- Loads the template in the editing workspace
- Adds template to "Recently Used" list
- Updates social sharing meta tags
- Shows success toast notification

**Error Handling:**
- If template is not found, shows error toast and removes invalid parameter

---

### Category Filter: `?c=<category_name>`

Filters templates by a specific category.

**Example:**
```
https://promptstash.io/?c=Marketing
```

**Behavior:**
- Automatically selects the specified category in the sidebar
- Filters template list to show only templates in that category
- Deselects quick filters (Recent/Favorites)
- Shows success toast notification

**Error Handling:**
- If category doesn't exist, shows error toast and removes invalid parameter
- Category names are case-sensitive

---

### Tag Filter: `?t=<tag1,tag2,tag3>`

Filters templates by one or more tags (comma-separated).

**Examples:**
```
Single tag:
https://promptstash.io/?t=SEO

Multiple tags:
https://promptstash.io/?t=SEO,Marketing,Content Creation
```

**Behavior:**
- Selects all specified tags in the sidebar
- Filters templates to show only those matching ALL selected tags (AND logic)
- Deselects quick filters (Recent/Favorites)
- Shows success toast notification

**Error Handling:**
- Valid tags are selected, invalid tags are ignored
- If some tags are invalid, shows warning toast with list of ignored tags
- If all tags are invalid, shows error toast and removes parameter
- URL is updated to remove invalid tags
- Tag names are case-sensitive

---

### Search Filter: `?q=<search_query>`

Applies a search query to filter templates.

**Example:**
```
https://promptstash.io/?q=blog
```

**Behavior:**
- Populates the search box with the query
- Filters templates by name, description, and tags
- Search is case-insensitive
- Shows success toast notification

**Error Handling:**
- No validation required - any search term is accepted
- Empty search parameter is automatically removed from URL

---

## Combined Permalinks

All permalink parameters can be combined for powerful filtering and sharing capabilities.

### Combining Multiple Filters

**Category + Tags:**
```
https://promptstash.io/?c=Marketing&t=SEO,Content Creation
```
Shows Marketing templates that have both SEO and Content Creation tags.

**Category + Search:**
```
https://promptstash.io/?c=Development&q=react
```
Shows Development templates matching the search term "react".

**Tags + Search:**
```
https://promptstash.io/?t=SEO,Analytics&q=optimization
```
Shows templates with both SEO and Analytics tags that match "optimization".

**All Filters:**
```
https://promptstash.io/?c=Marketing&t=SEO,Social Media&q=campaign
```
Shows Marketing templates with both SEO and Social Media tags, matching "campaign".

### Opening a Template with Context

**Template + Category:**
```
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml&c=Marketing
```
Opens the specific template, and when closed, shows the Marketing category filtered view.

**Template + Tags:**
```
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml&t=SEO,Content Creation
```
Opens the specific template, and when closed, shows templates filtered by those tags.

**Template + Search:**
```
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml&q=blog
```
Opens the specific template, and when closed, shows templates matching "blog" search.

**Full Context:**
```
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml&c=Marketing&t=SEO&q=blog
```
Opens the specific template with all filters pre-applied for when the user closes the template.

---

## Use Cases

### 1. Documentation & Training
Create curated links for onboarding or documentation:
```
For new marketers, start here:
https://promptstash.io/?c=Marketing&t=Beginner

For SEO specialists:
https://promptstash.io/?c=Marketing&t=SEO,Analytics

For content writers:
https://promptstash.io/?t=Content Creation,Writing
```

### 2. Team Collaboration
Share specific template collections:
```
Q4 Campaign templates:
https://promptstash.io/?t=Campaign,Social Media,Email

Product launch materials:
https://promptstash.io/?q=launch&c=Marketing
```

### 3. Social Sharing
Share specific templates on social media:
```
Check out this amazing SEO prompt template:
https://promptstash.io/?y=prompts/marketing/seo-blog-post.yaml
```

### 4. Personal Bookmarks
Save frequently used views:
```
My favorite SEO tools:
https://promptstash.io/?t=SEO&c=Marketing

Templates I'm currently working with:
https://promptstash.io/?q=analysis
```

---

## Technical Details

### URL Parameter Processing

**Load Order:**
1. Template (`?y=`) - Processed first, opens template immediately
2. Category (`?c=`) - Applied after templates load
3. Tags (`?t=`) - Applied after templates load
4. Search (`?q=`) - Applied after templates load

**Validation:**
- All parameters are validated against available data
- Invalid parameters trigger error/warning toasts
- Invalid parameters are removed from URL
- Partial validity is handled gracefully (e.g., some valid tags, some invalid)

**URL Synchronization:**
- URL updates automatically when filters change
- Only active filters are included in URL
- Empty/default states remove parameters
- URL changes use `pushState` to preserve browser history

### State Management

**Permalink Processing:**
- Permalinks are processed once on page load
- `permalinkProcessed` flag prevents re-processing
- URL updates are disabled during initial permalink load
- After initial load, all filter changes update the URL automatically

**Filter Interactions:**
- Selecting category/tags deselects Quick Filters (Recent/Favorites)
- Opening a template from permalink adds it to Recently Used
- Closing a template preserves filter state
- Filters from permalink persist until manually changed

### SEO Considerations

**Meta Tags:**
- Opening a template via `?y=` updates OpenGraph and Twitter Card meta tags
- Template name, description, and category are included
- Closing the template resets meta tags to defaults
- Social sharing works seamlessly with permalinks

**Analytics:**
- All permalink interactions are tracked via Google Analytics
- Template opens, filter usage, and search queries are logged
- Permalink source can be tracked in analytics data

---

## Best Practices

### Creating Shareable Links

**DO:**
- ✅ Use descriptive tag combinations: `?t=SEO,Content Creation,Analytics`
- ✅ Combine filters for precise results: `?c=Marketing&t=SEO&q=blog`
- ✅ Test links before sharing to ensure templates exist
- ✅ Use URL encoding for special characters in search queries

**DON'T:**
- ❌ Include too many tags (keep it focused)
- ❌ Mix Quick Filters (Recent/Favorites) with permalinks - they're not URL-based
- ❌ Assume category/tag names won't change - verify periodically
- ❌ Use overly long search queries

### URL Encoding

Special characters in search queries should be URL-encoded:
```
Space → %20 or +
Comma in search → %2C (commas in ?t= are separators, not encoded)
Quote → %22
Ampersand → %26
```

**Example:**
```
Search for "social media":
https://promptstash.io/?q=social%20media

or

https://promptstash.io/?q=social+media
```

---

## Future Enhancements

Potential future permalink features:
- View mode preference (`?view=list` or `?view=card`)
- Sort order (`?sort=name` or `?sort=recent`)
- Preset filter combinations (`?preset=my-favorites`)
- User-specific permalinks (authenticated)
- QR code generation for permalinks
- Short URL service integration

---

## Support

For issues or questions about permalinks:
- Check that template paths match exactly (case-sensitive)
- Verify category and tag names exist in the current template library
- Test URL encoding for special characters
- Review browser console for detailed error messages

---

**Last Updated:** January 2026
**Version:** 1.0
