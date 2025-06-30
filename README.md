# Frontend Take-Home Assignment

## How to run the project

```bash
bun install
bun run dev:server
```

and in a separate terminal

```bash
bun run dev:client
```

## Tech Stack

### Bun (package manager)

I wanted to import the types directly from the `server` package, and `npm` workspaces were being very buggy, so I converted the repo to use `bun`, the package manager I'm most familiar with and has great workspaces support.

### Shadcn UI

I wanted to use a purely presentation UI component library that I could customize, and treat as the internal design system. At first, I considered using `radix-ui/themes`, given that's what the team prefers, however, given the time constraints I decided to use ShadCN which has a lot of thoughtful interaction styles and animations, and is a breeze to customize.

### Tanstack Table w/ React Query

Given the `api` surfaces pagination functionality and mutations, I decided to use `react-query` which handles error and loading states out of the box, as well as support for server-side pagination. It works beautifully with the TanStack table and was easy to integrate with ShadCN.

## Design Decisions

- I added toasts and error banners for surfacing success/failure states when making mutations.
- I also added empty states for the tables, and skeletons for loading states.
- The UI is fully responsive and keyboard navigable.

## What I'd Improve or do Differently

- add debouncing to the filter input
- prefetching for pagination or a virtualized table
- support multiple filters, with dismissable chips for selected filters
- improve the layout to reduce CLS when changing tabs, or paginating through a table.
