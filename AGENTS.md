This is a guideline you must follow when working in the digimon_time_stranger project.

Project Knowledge:
- This is a personal project that provides a reference sheet and team builder for the game Digimon Time Stranger.
- All information is collected from https://www.grindosaur.com/en/games/digimon-story-time-stranger/digimon/{DIGIMON_NAME} through an API call, parsed with Cheerio and then transformed for the page.

Front-end code development:
- Use Tailwind CSS for styling.
- The project must be written in React for responsive design.
- For any icons, when necessary, use lucide-react.
- Use Jotai for state management.

Shadcn UI:
Use Shadcn UI for components. Assume all necessary components are available, ignore the warning about the missing components.
Components list
- @/components/ui/button.tsx
- @/components/ui/input.tsx
- @/components/ui/sidebar.tsx
- @/components/ui/tooltip.tsx
- @/components/ui/badge.tsx
- @/components/ui/separator.tsx
- @/components/ui/sheet.tsx
- @/components/ui/skeleton.tsx
- @/components/ui/dialog.tsx
- @/components/ui/table.tsx
- @/components/ui/sortable-table.tsx
- @/components/ui/popover.tsx

Code Standards:
- Ensure to componentize files and to separate functions by responsability.
- Act as to prevent code repetition and maintain code DRY. If you find opportunity to optimize, do it.

Theme and Color Scheme:
- The @index.css file must define the theme and color scheme according to the Shadcn UI guidelines.
- The CSS is already in Tailwind V4 correct format.
- Always lean towards stunning beauty and elegance, prioritizing the "WoW Factor" of the layouts.

User Storage:
- Use Local Storage with Jotai for state management.

Routing and Sidebar:
- Every page must be in the @/components/layout/AppLayout.tsx file and @/App.tsx file.

Pages:
- A page must use the entire width available, without any other components taking up space.
- Prefer vertical navigation, avoiding multiple horizontal columns.
- Add search and ordering functionality when applicable.
- Consider carefully the usability and experience of the page, knowing all content is for consultation by players that are currently playing.
- Prioritize good design for mobile devices, considering all components must be responsive and suited to navigation by touch.