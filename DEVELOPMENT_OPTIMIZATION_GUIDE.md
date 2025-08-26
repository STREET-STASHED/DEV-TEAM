# 🚀 StreetStashed Development Optimization Guide

## Essential Cursor Extensions

### **1. Code Quality & Performance**
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Better import management
- **Auto Rename Tag** - JSX/TSX tag renaming
- **Bracket Pair Colorizer** - Better code readability

### **2. React & Next.js Specific**
- **ES7+ React/Redux/React-Native snippets** - Faster component creation
- **React Developer Tools** - React debugging
- **Next.js Snippets** - Next.js specific snippets

### **3. Tailwind CSS Optimization**
- **Tailwind CSS IntelliSense** - Essential for Tailwind development
- **Tailwind CSS Sorter** - Automatically sort Tailwind classes
- **CSS Peek** - Navigate to CSS definitions

### **4. Performance & Bundle Analysis**
- **Import Cost** - Shows bundle impact of imports
- **Bundle Size** - Monitor bundle sizes
- **Web Vitals** - Performance monitoring

## Performance Optimization Features

### **Bundle Analysis**
```bash
# Analyze bundle size
pnpm build:analyze

# This will generate a bundle report at:
# .next/analyze/bundle-report.html
```

### **Performance Monitoring**
```bash
# Run Lighthouse performance audit
pnpm performance

# This generates a report at:
# lighthouse-report.html
```

### **Build Optimizations**
- **Gzip compression** for production builds
- **Bundle splitting** for better caching
- **Tree shaking** for unused code removal
- **Image optimization** with WebP/AVIF support

## Development Scripts

### **Available Commands**
```bash
# Development
pnpm dev              # Start development server
pnpm dev:https        # Start with HTTPS

# Building
pnpm build            # Production build
pnpm build:analyze    # Build with bundle analysis
pnpm start            # Start production server
pnpm start:prod       # Start with production env

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report

# Performance
pnpm performance      # Lighthouse audit
pnpm bundle-size      # Bundle analysis
```

## Performance Best Practices

### **1. Code Splitting**
- Use dynamic imports for route-based splitting
- Implement component-level lazy loading
- Utilize Next.js automatic code splitting

### **2. Image Optimization**
- Use Next.js Image component
- Implement responsive images
- Optimize image formats (WebP, AVIF)

### **3. Bundle Optimization**
- Monitor bundle sizes with `pnpm build:analyze`
- Use tree shaking effectively
- Implement proper chunk splitting

### **4. Core Web Vitals**
- Monitor CLS, FID, FCP, LCP, TTFB
- Use the performance monitoring utilities
- Implement performance budgets

## Development Workflow

### **1. Pre-commit Hooks**
- ESLint checking
- TypeScript type checking
- Prettier formatting

### **2. Performance Monitoring**
- Real-time Core Web Vitals tracking
- Bundle size monitoring
- Memory usage tracking

### **3. Testing Strategy**
- Unit tests with Jest
- Component testing with React Testing Library
- E2E testing with Playwright

## Environment Configuration

### **Development Environment**
```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### **Production Environment**
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Performance Monitoring

### **Web Vitals Thresholds**
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **FID**: < 100ms (First Input Delay)
- **FCP**: < 1800ms (First Contentful Paint)
- **LCP**: < 2500ms (Largest Contentful Paint)
- **TTFB**: < 800ms (Time to First Byte)

### **Bundle Size Targets**
- **Initial JS**: < 200KB
- **Total JS**: < 500KB
- **CSS**: < 50KB
- **Images**: < 100KB per image

## Troubleshooting

### **Common Issues**
1. **Bundle size too large**: Use `pnpm build:analyze` to identify large packages
2. **Performance issues**: Run `pnpm performance` for Lighthouse audit
3. **Type errors**: Use `pnpm type-check` to identify TypeScript issues
4. **Linting errors**: Use `pnpm lint:fix` to auto-fix issues

### **Performance Debugging**
- Use Chrome DevTools Performance tab
- Monitor Network tab for bundle sizes
- Check Console for performance warnings
- Use React DevTools Profiler

## Continuous Integration

### **GitHub Actions Workflow**
- Automated testing on push
- Bundle size monitoring
- Performance regression detection
- Type checking and linting

### **Pre-deployment Checks**
- Run all tests
- Check bundle sizes
- Verify performance metrics
- Type safety validation

## Resources

### **Documentation**
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

### **Tools**
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://github.com/GoogleChrome/web-vitals)

---

**Remember**: Performance is a feature, not an afterthought. Monitor, measure, and optimize continuously!
