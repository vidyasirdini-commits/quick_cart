## QuickCart Pull Request

### Summary of Changes
<!-- Describe the specific features, bug fixes, or optimizations introduced in this PR. -->

### Related Roles & Scope
- [ ] Customer Storefront & Cart (`/stores`, `/cart`, `/checkout`, `/orders`)
- [ ] Store Partner Portal (`/partner/dashboard`, `/partner/inventory`, `/partner/orders`)
- [ ] Central Platform Admin (`/admin/dashboard`, `/admin/transactions`, `/admin/zones`, `/admin/users`)
- [ ] Delivery Courier Dispatches (`/delivery/tasks`)
- [ ] Core Backend API, State Machine, or DB Schema

### Verification & Quality Checklist
- [ ] Single-Store Cart Rule strictly enforced (modal warning on multi-store conflict)
- [ ] Server-enforced Order State Machine transitions validated:
  - `placed -> accepted | rejected` (partner)
  - `accepted -> packed` (partner)
  - `packed -> out_for_delivery` (partner/courier handover)
  - `out_for_delivery -> delivered` (courier)
  - `placed -> cancelled` (customer allowed only while placed)
- [ ] Transactional stock decrement on accept & stock restoration on cancel verified
- [ ] WCAG AA Accessibility tested (keyboard focus rings, aria labels, reduced motion)
- [ ] Automated tests pass cleanly (`npm test` in `/server`)
- [ ] Vite client builds with zero warnings (`npm run build` in `/client`)
