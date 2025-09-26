# Implementation Plan: ND index trend screen

## Summary

- Build a reusable React Native component to render the trend of an index on one exchange.
- Assemble a screen that displays ND index trends for three major exchanges using the component.
- Use mock data for now; API integration will come later.

## Steps

1. Create `src/components/NDIndexTrend.tsx` exporting a component that shows index name, exchange, value and percentage change with basic styling.
2. Create `src/screens/NDIndexTrendScreen.tsx` rendering three `NDIndexTrend` components for Nikkei 225, Dow Jones and Nasdaq Composite using placeholder values.
3. Format code with Prettier.
4. Attempt to run lint and test commands.

## Testing

- `npx prettier . --check`
- `npm test` (expected to show no tests yet)
