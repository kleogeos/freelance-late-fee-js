# freelance-late-fee-js

[![test](https://github.com/kleogeos/freelance-late-fee-js/actions/workflows/test.yml/badge.svg)](https://github.com/kleogeos/freelance-late-fee-js/actions/workflows/test.yml)

Compute the late fee owed on an overdue freelance invoice, and which
reminder stage to send (friendly → firm → notice → final). Zero
dependencies — a direct Node.js port of
[freelance-late-fee-cli](https://github.com/kleogeos/freelance-late-fee-cli)
(Python), for people who reach for `npx` instead of `pip`.

Output is cross-checked byte-for-byte against the Python version (same
input → identical text and JSON) — see `test.js`.

## Run without installing

```bash
npx github:kleogeos/freelance-late-fee-js compute 1000 --due-date 2026-09-01 --today 2026-10-17
```

No npm account, no registry publish, no global install — `npx` clones the
repo and runs it directly.

```
Invoice amount:   1000.00
Due date:         2026-09-01
Today:             2026-10-17
Days overdue:      46 (after 0-day grace period)
Late fee (1.5%/mo): 23.00
Total due:         1023.00
Stage:             final — Final notice — state next step (pause work / collections).
```

## Install locally (optional)

```bash
git clone https://github.com/kleogeos/freelance-late-fee-js.git
cd freelance-late-fee-js
npm link   # makes `freelance-latefee` available globally
```

### Commands

| Command | What it does |
|---|---|
| `compute AMOUNT --due-date YYYY-MM-DD [--today DATE] [--rate PCT] [--grace-days N] [--json]` | Late fee + total due + which reminder stage applies |
| `stages` | List the 4 reminder stages and their day-overdue thresholds |

`--rate` is the late fee rate in percent **per month**, prorated by days
overdue (default 1.5%/mo). `--grace-days` is a grace period before the fee
starts accruing (default 0).

## Tests

```bash
npm test
```

## Where this fits

Prefer Python, or need it as a library import? [freelance-late-fee-cli](https://github.com/kleogeos/freelance-late-fee-cli) has the same math. Other `npx`-runnable ports: [freelance-rate-js](https://github.com/kleogeos/freelance-rate-js) · [freelance-invoice-js](https://github.com/kleogeos/freelance-invoice-js) · [contract-checklist-js](https://github.com/kleogeos/contract-checklist-js).

Same math, browser version, no install: [late-fee-calculator](https://kleogeos.github.io/freelancer-tools/late-fee-calculator.html). 4 late-payment email templates (free excerpt from the [Freelancer Starter Kit](https://kleogeos.github.io/freelancer-tools/kit.html?src=cli-latefee-js)): https://gist.github.com/kleogeos/845669cc43509b012a0ac2aecac00d0a

Free and will stay free. If it saved you time: [tip with crypto](https://kleogeos.github.io/freelancer-tools/donate.html).

## License

MIT — do whatever you want with it.
