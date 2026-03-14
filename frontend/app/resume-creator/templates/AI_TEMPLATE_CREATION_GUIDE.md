# 🤖 AI Template Creation Guide: The Fast Workflow

This guide outlines the most efficient way to add new, professional templates to Resumy using AI. By leveraging **Claude 4.6 Sonnet** (or the latest available version), you can convert a visual design into a fully-functional, paginated React template in minutes.

---

## 🚀 Step 1: Register and Configure the Template
Setting up the boilerplate ensures the system can find and render your new template.

### 1. Create the Folder Structure
Navigate to `frontend/app/resume-creator/templates/`.
- Create a new folder (e.g., `ModernSleek`).
- Inside it, create `ModernSleek.jsx`. Start with a basic "Hello World" component or an empty shell.

### 2. Register in `TemplateRegistry.js`
This file handles the dynamic loading of the component.
1. Use `dynamic` to import your component (prevents SSR issues):
   ```javascript
   const ModernSleek = dynamic(() => import("./ModernSleek/ModernSleek"), { ssr: false });
   ```
2. Add it to the `TEMPLATE_COMPONENTS` object:
   ```javascript
   const TEMPLATE_COMPONENTS = {
       "modern-sleek": ModernSleek,
       // ... existing templates
   };
   ```

### 3. Configure in `TemplateManager.js`
This file acts as the single source of truth for template metadata (sidebar layout, default colors, etc.).
Add a new object to the `templatesConfig` array:
```javascript
{
  id: "modern-sleek",
  name: "Modern Sleek",
  thumbnail: "/templates/placeholder.png",
  description: "A clean, modern description...",
  tags: ["1-Column", "Modern"],
  defaultColor: "#1e293b",
  defaultFont: "Inter",
  recommendedColors: ["#1e293b", "#2563eb"],
  theme: { background: "#ffffff", text: "#1e293b" },
  layout: {
    main: ["summary", "experience", "education", "skills", "custom"]
    // if 2-column, use main: [...] and sidebar: [...]
  },
  defaults: { 
    fontSize: 1, 
    fontFamily: "Inter", 
    sectionSpacing: 1, 
    paragraphSpacing: 1, 
    lineHeight: 1.5, 
    pageMargin: 40 
  },
  useRootPadding: false
}
```

#### What each field means:
- **`id`**: Unique identifier. Must match the key used in `TemplateRegistry.js`.
- **`name`**: The display name shown in the template picker.
- **`thumbnail`**: Path to the preview image (e.g., `"/templates/your-template.png"`).
- **`colors & fonts`**:
    - **`defaultColor`**: The primary accent color used when the template first loads.
    - **`defaultFont`**: The primary font family (e.g., `"Inter"` or `"Georgia"`).
    - **`recommendedColors`**: A palette of 3-4 colors that look particularly good with this design.
- **`theme`**:
    - **`background`**: The page color (usually `#ffffff`).
    - **`text`**: The main body text color (usually a dark gray or black).
- **`layout`**: Defines the "slots" for your content:
    - **1-Column**: Use `main: [...]`.
    - **2-Column**: Use `main: [...]` and `sidebar: [...]` (or `left`/`right`).
- **`defaults` (Initial Slider Positions)**:
    - **`fontSize`**: Base size (default is `1`).
    - **`lineHeight`**: Spacing between lines (usually `1.4` to `1.6`).
    - **`sectionSpacing`**: Vertical gap between major sections.
    - **`paragraphSpacing`**: Vertical gap between bullet points/entries.
    - **`pageMargin`**: The white space around the edge of the page (usually `40`).
- **`useRootPadding`**: If `true`, the system applies base padding to the entire container; if `false`, the template handles its own internal spacing.

---

## 🧠 Step 2: AI Prompting Strategy
For the best results, use **Claude.ai** (Web Interface). It excels at maintaining logic across large React components.

### What to Prepare:
1.  **Visual Reference**: An image of the template you want to build.
2.  **Logic Reference**: Copy the code of an existing template that has a similar structure.
    *   *If you want a 1-column template*, copy `ClassicExecutive.jsx`.
    *   *If you want a 2-column sidebar template*, copy `AzureModern.jsx`.

### The Master Prompt:
Upload the **image** and attach the **reference code**, then use this prompt for the best results:

> "Act as a Senior React Developer specializing in high-fidelity PDF/Web rendering. Your task is to build a new resume template named **[YourTemplateName]** that **looks exactly like the attached image** but **functions exactly like the attached reference code**.
> 
> **1. STRUCTURE & LOGIC:**
> - Use the **exact same logic** for pagination, section breaking, and continuation as the reference code. 
> - Maintain the `PaginatedCanvas` and section mapping architecture.
> - Ensure the layout (One-column or Two-column) mirrors the logic of the reference (e.g., how sections are distributed between main and sidebar).
> 
> **2. STYLING & DESIGN SETTINGS:**
> - Implement the visual aesthetics from the image using clean, scoped CSS.
> - **REQUIRED DYNAMIC STYLES**: You must use the `style` prop for:
>   - `style.primaryColor` (Headers, accents, icons)
>   - `style.textColor` (Body text)
>   - `style.sectionSpacing` (Margin/padding between major sections)
>   - `style.paraSpacing` (Margin/padding between list items/paragraphs)
>   - `style.fontFamily` (Apply to the root of the template)
> 
> **3. ROBUSTNESS & CONTENT:**
> - Handle empty sections gracefully (if `data.experience` is empty, don't render the header).
> - Ensure `page-break-inside: avoid` is applied correctly to entries within sections to prevent cut-off text.
> - Support every section: Personal Info, Summary, Experience, Education, Skills, Projects, Languages, and Certifications.
> 
> **4. OUTPUT:**
> Provide the **complete, sanitized code** in a single file ready to be pasted into the JSX file. Do not omit any boilerplate or imports."

---

## 🛠️ Step 3: Copy and Implement
Once Claude generates the code:
1.  Copy the code.
2.  Paste it into the empty JSX file you created in Step 1.
3.  Check for any missing imports or obvious syntax errors.

---

## 🧪 Step 4: Sanitize & Polish (Auditing)
Every template must follow strict rendering rules. Run the built-in audit scripts to ensure your template won't break on export or multi-page resumes.

Go to the `frontend` directory and run:

### 1. Render Audit
Checks if the template breaks across pages correctly.
```bash
node scripts/render_audit.js --template=YourTemplateName
```

### 2. Field Audit
Ensures all data fields are mapped correctly and no data is lost.
```bash
node scripts/field_audit.js --template=YourTemplateName
```

---

## 🎨 Best Practices
*   **Recommended AI**: Claude 3.5 Sonnet (or higher) is highly recommended over other models for its superior understanding of React component logic and layouts.
*   **Consistency**: Always use the reference code from an existing *working* template. This ensures you don't have to "reinvent the wheel" for the complex pagination logic.
*   **Variable Support**: Ensure your styles use the `style` prop passed to the component (e.g., `style.primaryColor`) so users can customize it in the editor.
